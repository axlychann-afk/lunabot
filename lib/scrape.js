import axios from 'axios';
import fs from 'fs';
import { savefrom } from './savefrom.js';

// youtube-dl-exec lazy-load: biar plugin non-yt (random/pin/dll) tetep
// ke-load walau paketnya belum di-npm-install. Error install hanya
// muncul pas fitur yt-dlp beneran dipanggil.
let _ytdlp = null;
async function ytdlp(link, args) {
    if (!_ytdlp) {
        try {
            _ytdlp = (await import('youtube-dl-exec')).default;
        } catch (_) {
            throw new Error("Paket 'youtube-dl-exec' belum diinstall. Jalankan: YOUTUBE_DL_SKIP_PYTHON_CHECK=1 npm i youtube-dl-exec");
        }
    }
    return _ytdlp(link, args);
}
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// direct https progressive only — tolak HLS/DASH manifest (m3u8/mpd)
const isDirect = (f) => f.url && f.protocol === 'https' && !/\.m3u8|\.mpd|manifest/i.test(f.url);

let ffmpegPath = 'ffmpeg';
try {
    ffmpegPath = createRequire(import.meta.url)('@ffmpeg-installer/ffmpeg').path;
} catch (_) {}

// ---- YouTube search via HTML scrape, no API key ----
// *watch for YouTube ganti markup: kalo hasil kosong terus, cek regex ytInitialData*
export async function ytSearch(query, limit = 5) {
    const { data: html } = await axios.get(
        'https://www.youtube.com/results?search_query=' + encodeURIComponent(query),
        {
            headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
            timeout: 30000,
        }
    );
    const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
    if (!m) return [];
    const out = [];
    try {
        const data = JSON.parse(m[1]);
        const sections = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents;
        for (const sec of sections) {
            for (const it of (sec.itemSectionRenderer?.contents || [])) {
                const v = it.videoRenderer;
                if (!v?.videoId) continue;
                out.push({
                    videoId: v.videoId,
                    title: v.title?.runs?.map(r => r.text).join('') || v.title?.simpleText || 'Unknown',
                    channel: v.ownerText?.runs?.map(r => r.text).join('') || v.ownerText?.simpleText || 'Unknown',
                    duration: v.lengthText?.simpleText || '-',
                    views: v.viewCountText?.simpleText || v.viewCountText?.runs?.map(r => r.text).join('') || '-',
                    thumb: v.thumbnail?.thumbnails?.slice(-1)[0]?.url || '',
                    link: 'https://www.youtube.com/watch?v=' + v.videoId,
                });
                if (out.length >= limit) return out;
            }
        }
    } catch (_) {}
    return out;
}

async function ytDump(link) {
    const args = { dumpSingleJson: true, noPlaylist: true, skipDownload: true, noWarnings: true, socketTimeout: 25 };
    const cf = cookieFile();
    if (cf) args.cookies = cf;
    try {
        return await ytdlp(link, args);
    } catch (e) {
        const msg = String(e.message || e);
        if (/ENOENT|yt-?dlp.*(not found|missing)|spawn.*ENOENT/i.test(msg)) {
            throw new Error("Binary yt-dlp hilang. Di VPS:\nYOUTUBE_DL_SKIP_PYTHON_CHECK=1 npm i youtube-dl-exec\n(jangan pake --ignore-scripts, pastikan VPS bisa buka github.com)");
        }
        if (/login|cookies|private|empty media response|rate-limit|confirm you|sign in|blocked from accessing|ip address is blocked/i.test(msg)) {
            throw new Error('Konten butuh login / kena limit IP.\n' + COOKIE_HINT);
        }
        throw e;
    }
}

// ---- test URL beneran bisa di-download (1KB), tolak yang 403 ----
async function urlAlive(url) {
    try {
        const r = await axios.get(url, {
            headers: { 'User-Agent': UA, Range: 'bytes=0-1023' },
            responseType: 'arraybuffer', timeout: 20000,
            validateStatus: () => true,
        });
        return (r.status === 206 || r.status === 200) && r.data?.length > 0;
    } catch (_) { return false; }
}

// ---- media savefrom buat 1 link (fallback IP diblokir gvs), null bila gagal ----
async function savefromMedia(link) {
    try {
        const sf = await savefrom(link);
        if (sf && sf.ok && sf.media?.length) return sf;
    } catch (_) {}
    return null;
}

// ---- Best audio stream, no API key. Prioritas m4a/mp3 (WA-friendly) ----
export async function ytAudio(link) {
    const d = await ytDump(link);
    const aud = (d.formats || []).filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none') && isDirect(f));
    if (!aud.length) throw new Error('Tidak ada stream audio untuk video ini.');
    aud.sort((a, b) => {
        const pref = (e) => (e === 'm4a' || e === 'mp3' ? 1 : 0);
        return (pref((b.ext || '').toLowerCase()) - pref((a.ext || '').toLowerCase())) || ((b.abr || 0) - (a.abr || 0));
    });
    const best = aud[0];
    const mimeOf = (ext) => ({ mp3: 'audio/mpeg', m4a: 'audio/mp4', webm: 'audio/webm', opus: 'audio/webm' }[(ext || 'm4a').toLowerCase()] || 'audio/mp4');
    // IP VPS diblokir gvs → URL 403. Tes dulu, gagal → savefrom (proxy).
    if (await urlAlive(best.url)) {
        return {
            url: best.url,
            ext: (best.ext || 'm4a').toLowerCase(),
            mimetype: mimeOf(best.ext),
            title: d.title || 'Unknown',
            channel: d.uploader || d.channel || 'Unknown',
            duration: d.duration_string || '-',
            size: best.filesize || best.filesize_approx || 0,
        };
    }
    const sf = await savefromMedia(link);
    const cand = (sf?.media || []).filter(m => /mp3|m4a|audio|opus|webm/i.test((m.ext || '') + (m.type || '') + (m.label || '')) && m.url);
    for (const c of cand) {
        if (await urlAlive(c.url)) {
            const ext = (c.ext || 'mp3').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp3';
            return {
                url: c.url,
                ext, mimetype: mimeOf(ext),
                title: sf.title || d.title || 'Unknown',
                channel: d.uploader || d.channel || 'Unknown',
                duration: sf.duration || d.duration_string || '-',
                size: 0,
            };
        }
    }
    throw new Error('Server YouTube nolak IP bot (403) dan jalur cadangan gagal.\n' + COOKIE_HINT);
}

// ---- Best video <=480p mp4, no API key ----
export async function ytVideo(link, maxHeight = 480) {
    const d = await ytDump(link);
    const vids = (d.formats || []).filter(f =>
        f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none' &&
        (f.ext || '').toLowerCase() === 'mp4' && (f.height || 0) <= maxHeight && isDirect(f));
    const pool = vids.length ? vids : (d.formats || []).filter(f =>
        f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none' && (f.height || 0) <= maxHeight && isDirect(f));
    if (!pool.length) throw new Error('Tidak ada stream video untuk link ini.');
    pool.sort((a, b) => (b.height || 0) - (a.height || 0));
    const best = pool[0];
    return {
        url: best.url,
        height: best.height || 0,
        ext: (best.ext || 'mp4').toLowerCase(),
        title: d.title || 'Unknown',
        channel: d.uploader || d.channel || 'Unknown',
        duration: d.duration_string || '-',
        thumb: d.thumbnail || '',
        size: best.filesize || best.filesize_approx || 0,
    };
}

// ---- Website screenshot via microlink, no API key ----
export async function ssWeb(url) {
    const { data } = await axios.get('https://api.microlink.io/', {
        params: { url, screenshot: true, meta: false },
        timeout: 90000,
    });
    const shot = data?.data?.screenshot?.url;
    if (data?.status !== 'success' || !shot) throw new Error('Gagal mengambil screenshot.');
    return shot;
}

// ---- Download + merge video-only & audio-only jadi mp4 (ffmpeg -c copy) ----
// Perlu karena YouTube 2026 nyajiin DASH terpisah, muxed progresif langka.
// *watch for file >100MB: kirim link aja, WA nolak*
export async function ytVideoFile(link, maxHeight = 480) {
    const d = await ytDump(link);
    const title = (d.title || 'video').replace(/[\\/:*?"<>|]/g, '').slice(0, 60) || 'video';
    const vo = (d.formats || []).filter(f =>
        f.vcodec && f.vcodec !== 'none' && (!f.acodec || f.acodec === 'none') &&
        (f.height || 0) <= maxHeight && isDirect(f)).sort((a, b) => (b.height || 0) - (a.height || 0));
    const ao = (d.formats || []).filter(f =>
        f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none') && isDirect(f))
        .sort((a, b) => (b.abr || 0) - (a.abr || 0));
    if (!vo.length || !ao.length) throw new Error('Tidak ada stream video/audio untuk link ini.');
    const est = (vo[0].filesize || vo[0].filesize_approx || 0) + (ao[0].filesize || ao[0].filesize_approx || 0);
    if (est && est > 100 * 1024 * 1024) throw new Error(`Video kebesaran (~${Math.round(est / 1048576)}MB, batas 100MB).\nLink: ${link}`);

    const dir = path.join(os.tmpdir(), 'lunabot-dl');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const stamp = Date.now();
    const vext = (vo[0].ext || 'mp4').toLowerCase();
    const aext = (ao[0].ext || 'm4a').toLowerCase();
    const vf = path.join(dir, `v-${stamp}.${vext}`);
    const af = path.join(dir, `a-${stamp}.${aext}`);
    const out = path.join(dir, `${title}-${stamp}.mp4`);

    const runFfmpeg = (args) => new Promise((res, rej) => {
        const p = spawn(ffmpegPath, args);
        let errLog = '';
        p.stderr?.on('data', (d) => { errLog += d.toString().slice(-500); });
        p.on('error', rej);
        p.on('close', (code) => code === 0 ? res() : rej(new Error('ffmpeg code ' + code + ' :: ' + errLog.slice(-200))));
    });

    const dl = async (url, dest) => {
        const r = await axios.get(url, { headers: { 'User-Agent': UA }, responseType: 'stream', timeout: 0 });
        await new Promise((res, rej) => {
            const w = fs.createWriteStream(dest);
            r.data.pipe(w); w.on('finish', res); w.on('error', rej); r.data.on('error', rej);
        });
    };
    try {
        await dl(vo[0].url, vf);
        await dl(ao[0].url, af);
        if (fs.statSync(vf).size + fs.statSync(af).size > 100 * 1024 * 1024) {
            throw new Error('Video kebesaran (>100MB), batas WhatsApp.\nLink: ' + link);
        }
        try {
            await runFfmpeg(['-y', '-i', vf, '-i', af, '-c', 'copy', '-shortest', '-movflags', '+faststart', out]);
        } catch (_) {
            await runFfmpeg(['-y', '-i', vf, '-i', af, '-c:v', 'copy', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', out]);
        }
        return {
            file: out,
            title: d.title || 'Unknown',
            channel: d.uploader || d.channel || 'Unknown',
            duration: d.duration_string || '-',
            height: vo[0].height || 0,
            cleanup: () => { for (const f of [vf, af, out]) try { fs.unlinkSync(f); } catch (_) {} },
        };
    } catch (e) {
        for (const f of [vf, af, out]) try { fs.unlinkSync(f); } catch (_) {}
        // IP diblokir gvs (403 pas download) → coba file jadi dari savefrom
        const sf = await savefromMedia(link);
        const cand = (sf?.media || []).filter(m => /mp4|video/i.test((m.ext || '') + (m.type || '') + (m.label || '')) && m.url);
        for (const c of cand) {
            try {
                const buf = await fetchBuffer(c.url);
                fs.writeFileSync(out, buf);
                return {
                    file: out,
                    title: sf.title || d.title || 'Unknown',
                    channel: d.uploader || d.channel || 'Unknown',
                    duration: sf.duration || d.duration_string || '-',
                    height: 0,
                    cleanup: () => { for (const f of [vf, af, out]) try { fs.unlinkSync(f); } catch (_) {} },
                };
            } catch (_) {}
        }
        throw e;
    }
}

export const isYtLink = (t) => /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//i.test(t || '');

// ---- cookies.txt (format Netscape) di root bot — buat situs login-wall ----
// cara bikin: extension "Get cookies.txt LOCALLY" → export → taruh di folder bot
export function cookieFile() {
    for (const p of [path.join(process.cwd(), 'cookies.txt'), path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'cookies.txt')]) {
        try { if (fs.existsSync(p)) return p; } catch (_) {}
    }
    return null;
}

export const COOKIE_HINT = 'Situsnya minta login. Export cookies.txt dari browser (extension "Get cookies.txt LOCALLY"), taruh di folder bot sejajar index.js, restart, coba lagi.';

// ---- yt-dlp dump dengan cookies bila ada ----
export async function cookieDump(link) {
    const args = { dumpSingleJson: true, noPlaylist: true, skipDownload: true, noWarnings: true, socketTimeout: 25 };
    const cf = cookieFile();
    if (cf) args.cookies = cf;
    try {
        return await ytdlp(link, args);
    } catch (e) {
        const msg = String(e.message || e);
        if (/ENOENT|yt-?dlp.*(not found|missing)|spawn.*ENOENT/i.test(msg)) {
            throw new Error("Binary yt-dlp hilang. Di VPS:\nYOUTUBE_DL_SKIP_PYTHON_CHECK=1 npm i youtube-dl-exec\n(jangan pake --ignore-scripts, pastikan VPS bisa buka github.com)");
        }
        if (/login|cookies|private|empty media response|rate-limit|confirm you|sign in|blocked from accessing|ip address is blocked/i.test(msg)) {
            throw new Error('Konten butuh login / kena limit IP.\n' + COOKIE_HINT);
        }
        throw e;
    }
}

// ---- video progresif mp4 langsung (tiktok/ig/fb/reels) ----
export async function directMp4(link, maxHeight = 720) {
    const d = await cookieDump(link);
    const pool = (d.formats || []).filter(f =>
        f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none' &&
        (f.ext || '').toLowerCase() === 'mp4' && (f.height || 0) <= maxHeight && isDirect(f))
        .sort((a, b) => (b.height || 0) - (a.height || 0));
    if (!pool.length) throw new Error('Tidak ada stream mp4 langsung untuk link ini.\n' + (!cookieFile() ? COOKIE_HINT : 'Coba link lain.'));
    const best = pool[0];
    return {
        url: best.url,
        height: best.height || 0,
        title: d.title || 'Video',
        channel: d.uploader || d.channel || 'Unknown',
        duration: d.duration_string || d.duration || '-',
        thumb: d.thumbnail || '',
    };
}

// ---- metadata tiktok via oembed resmi (best-effort, tanpa key) ----
export async function ttMeta(link) {
    try {
        const { data } = await axios.get('https://www.tiktok.com/oembed?url=' + encodeURIComponent(link), {
            headers: { 'User-Agent': UA }, timeout: 15000,
        });
        if (data && data.title) return { title: data.title, author: data.author_name || '-', thumb: data.thumbnail_url || '' };
    } catch (_) {}
    return null;
}

// ---- gambar acak safebooru, no key ----
export async function booruImage(tags = 'rating:safe', pid = null) {
    const page = pid ?? Math.floor(Math.random() * 20);
    const { data } = await axios.get('https://safebooru.org/index.php', {
        params: { page: 'dapi', s: 'post', q: 'index', json: 1, limit: 20, pid: page, tags },
        headers: { 'User-Agent': UA }, timeout: 25000,
    });
    const posts = (Array.isArray(data) ? data : []).filter(p => p.file_url && /\.(jpg|jpeg|png|webp)$/i.test(p.file_url));
    if (!posts.length) throw new Error('Tidak ada gambar, coba lagi.');
    const p = posts[Math.floor(Math.random() * posts.length)];
    const url = p.file_url.startsWith('http') ? p.file_url : 'https://safebooru.org' + p.file_url;
    return { url, tags: p.tags || '' };
}

// ---- Blue Archive acak dari SchaleDB (github, no key, permanen) ----
let baCache = null;
export async function randomBA() {
    if (!baCache) {
        const { data } = await axios.get('https://api.github.com/repos/SchaleDB/SchaleDB/contents/images/student/collection?per_page=100', {
            headers: { 'User-Agent': 'LunaBotz' }, timeout: 25000,
        });
        baCache = data.filter(f => /\.(webp|png|jpg)$/i.test(f.name)).map(f => ({
            name: f.name.replace(/\.[^.]+$/, ''),
            url: `https://raw.githubusercontent.com/SchaleDB/SchaleDB/main/images/student/collection/${f.name}`,
        }));
        if (!baCache.length) throw new Error('Daftar gambar BA kosong.');
    }
    return baCache[Math.floor(Math.random() * baCache.length)];
}

// ---- cari gambar (bing scrape, pinimg diprioritaskan), no key ----
export async function pinImages(query, limit = 5) {
    const { data: html } = await axios.get('https://www.bing.com/images/search', {
        params: { q: query }, headers: { 'User-Agent': UA }, timeout: 25000,
    });
    const imgs = [...html.matchAll(/murl&quot;:&quot;(https?:[^&]+?)&quot;/g)].map(m => m[1]);
    const uniq = [...new Set(imgs)];
    uniq.sort((a, b) => ((/pinimg\.com/.test(b) ? 1 : 0) - (/pinimg\.com/.test(a) ? 1 : 0)));
    if (!uniq.length) throw new Error('Gambar tidak ketemu, coba kata lain.');
    return uniq.slice(0, limit);
}

// ---- getmyfb fetcher (fb/ig, token app publik, no key) ----
// balasannya bervariasi per host; fungsi ini memeras semua URL mp4/gambar.
export async function getmyfb(link) {
    // *watch for link IG berekor (?stkn= dsb): wajib strip query, API-nya 422 kalo ada ekor*
    if (/instagram\.com/i.test(link)) link = link.split('?')[0];
    const { data } = await axios.post(
        'https://api.getmyfb.com/v1/fetch',
        new URLSearchParams({ url: link }).toString(),
        {
            timeout: 40000,
            headers: {
                'user-agent': 'Neo/1.0',
                'token': '6639e1d16702e8a25265c6bbcd13e6dcbd9079c3',
                'content-type': 'application/x-www-form-urlencoded',
            },
        }
    );
    if (!data || typeof data !== 'object') throw new Error('Respon getmyfb invalid.');
    if (data.status === false) throw new Error(data.message || 'getmyfb menolak link.');
    if (data.is_private) throw new Error('Konten privat / tidak bisa diakses publik.');
    const urls = [];
    const walk = (o) => {
        if (typeof o === 'string' && /^https?:\/\//.test(o) && /\.(mp4|mov)(\?|$)|video|fbcdn|cdn/i.test(o)) urls.push(o);
        else if (Array.isArray(o)) o.forEach(walk);
        else if (o && typeof o === 'object') Object.values(o).forEach(walk);
    };
    walk(data);
    const title = data.title && data.title !== '...' ? data.title : (data.description || 'Video');
    return {
        title,
        thumb: data.image || data.thumbnail || '',
        videos: [...new Set(urls)],
        hd: data.hd || null,
        sd: data.sd || null,
        raw: data,
    };
}

// ---- download URL ke buffer (bot yang fetch, bukan server WA) ----
// googlevideo/scdn suka 403 kalau yang fetch IP asing → kirim buffer, bukan URL.
export async function fetchBuffer(url, maxMB = 90) {
    const r = await axios.get(url, {
        headers: { 'User-Agent': UA },
        responseType: 'arraybuffer',
        timeout: 0,
        maxContentLength: maxMB * 1024 * 1024,
        maxBodyLength: maxMB * 1024 * 1024,
    });
    const buf = Buffer.from(r.data);
    if (!buf.length) throw new Error('Download kosong (0 byte).');
    if (buf.length > maxMB * 1024 * 1024) throw new Error(`File kebesaran (${(buf.length / 1048576).toFixed(0)}MB, batas ${maxMB}MB).`);
    return buf;
}

// ---- judul lagu dari link spotify (oembed best-effort) ----
export async function spotifyTitle(link) {
    try {
        const { data } = await axios.get('https://open.spotify.com/oembed?url=' + encodeURIComponent(link), {
            headers: { 'User-Agent': UA }, timeout: 15000,
        });
        if (data && data.title) return data.title;
    } catch (_) {}
    return null;
}
