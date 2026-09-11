import { Jimp, loadFont, measureText, measureTextHeight } from 'jimp';
import sharp from 'sharp';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
const FONT_DIR = path.join(path.dirname(req.resolve('@jimp/plugin-print')), '..', 'fonts', 'open-sans') + path.sep;

let ffmpegPath = 'ffmpeg';
try {
    ffmpegPath = req('@ffmpeg-installer/ffmpeg').path;
} catch (_) {}

const fonts = {};
async function font(name) {
    if (!fonts[name]) fonts[name] = await loadFont(path.join(FONT_DIR, name, name + '.fnt'));
    return fonts[name];
}

function wrap(font, text, maxW) {
    const lines = [];
    let cur = '';
    for (const w of String(text).split(/\s+/)) {
        const t = cur ? cur + ' ' + w : w;
        if (measureText(font, t) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [' '];
}

function printCentered(img, font, lines, cx, yStart, lineH) {
    let y = yStart;
    for (const ln of lines) {
        const w = measureText(font, ln);
        img.print({ font, x: Math.round(cx - w / 2), y: Math.round(y), text: ln });
        y += lineH;
    }
    return y;
}

// ---- BRAT: bg lime, teks hitam tengah. hd=true → 1024px ----
export async function bratPng(text, { hd = false, bg = 0x8ace00ff, fg = 'black' } = {}) {
    const S = hd ? 1024 : 512;
    const img = new Jimp({ width: S, height: S, color: bg });
    const f = await font(hd ? `open-sans-128-${fg}` : `open-sans-64-${fg}`);
    const lines = wrap(f, text, S - 52);
    const lh = measureTextHeight(f, 'Ag', S - 52);
    printCentered(img, f, lines, S / 2, S / 2 - (lines.length * lh) / 2, lh);
    return img.getBuffer('image/png');
}

// ---- BRATVID: brat png → webp animasi zoom 3 detik (ffmpeg, tanpa font) ----
export async function bratWebp(pngBuffer) {
    const dir = path.join(os.tmpdir(), 'lunabot-canvas');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const stamp = Date.now();
    const inp = path.join(dir, `brat-${stamp}.png`);
    const out = path.join(dir, `brat-${stamp}.webp`);
    fs.writeFileSync(inp, pngBuffer);
    try {
        await new Promise((res, rej) => {
            const p = spawn(ffmpegPath, [
                '-y', '-loop', '1', '-i', inp,
                '-vf', "zoompan=z='1+0.06*on/25':d=75:s=512x512:fps=25",
                '-t', '3', '-loop', '0', out,
            ]);
            p.on('error', rej);
            p.on('close', (c) => c === 0 ? res() : rej(new Error('ffmpeg webp code ' + c)));
        });
        return fs.readFileSync(out);
    } finally {
        for (const f of [inp, out]) try { fs.unlinkSync(f); } catch (_) {}
    }
}

// ---- deteksi webp animasi via chunk VP8X (tanpa deps) ----
export function isAnimatedWebp(buf) {
    try {
        if (!buf || buf.length < 30) return false;
        if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return false;
        if (buf.toString('ascii', 12, 16) !== 'VP8X') return false;
        return (buf[16 + 4] & 0x02) !== 0;
    } catch (_) { return false; }
}

// ---- render strip teks transparan (overlay ffmpeg, tanpa butuh font TTF) ----
async function textStrip(text, width = 512) {
    const f = await font('open-sans-32-white');
    const lines = wrap(f, String(text || ' ').toUpperCase(), width - 32);
    const lh = measureTextHeight(f, 'Ag', width - 32);
    const h = lines.length * lh + 16;
    const strip = new Jimp({ width, height: h, color: 0x000000ff });
    printCentered(strip, f, lines, width / 2, 8, lh);
    return strip.getBuffer('image/png');
}

// ---- SMEME VIDEO: bakar teks atas|bawah ke video/gif/webp-anim → mp4 siap stiker ----
// *watch for input >15 detik: di-trim 10 detik biar stiker enteng*
export async function smemeMp4(inputPath, atas, bawah) {
    const dir = path.join(os.tmpdir(), 'lunabot-canvas');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const stamp = Date.now();
    const topP = path.join(dir, `top-${stamp}.png`);
    const botP = path.join(dir, `bot-${stamp}.png`);
    const out = path.join(dir, `smeme-${stamp}.mp4`);
    fs.writeFileSync(topP, await textStrip(atas || ' '));
    fs.writeFileSync(botP, await textStrip(bawah || ' '));
    const botH = (await Jimp.read(botP)).height;
    try {
        await new Promise((res, rej) => {
            const p = spawn(ffmpegPath, [
                '-y', '-i', inputPath, '-i', topP, '-i', botP,
                '-filter_complex',
                `[0:v]scale=512:512:force_original_aspect_ratio=increase,crop=512:512,setsar=1,fps=20[v];[v][1:v]overlay=0:0[v1];[v1][2:v]overlay=0:H-h`,
                '-t', '10', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                '-an', '-movflags', '+faststart', out,
            ]);
            let errLog = '';
            p.stderr?.on('data', (d) => { errLog += d.toString().slice(-300); });
            p.on('error', rej);
            p.on('close', (c) => c === 0 ? res() : rej(new Error('ffmpeg smeme code ' + c + ' :: ' + errLog.slice(-200))));
        });
        return { file: out, cleanup: () => { for (const f of [topP, botP, out]) try { fs.unlinkSync(f); } catch (_) {} } };
    } catch (e) {
        for (const f of [topP, botP, out]) try { fs.unlinkSync(f); } catch (_) {}
        throw e;
    }
}
export async function smemePng(imageBuffer, atas, bawah) {
    const base = await Jimp.read(imageBuffer);
    base.cover({ w: 512, h: 512 });
    const f = await font('open-sans-32-white');
    const paint = (txt, yStart) => {
        const lines = wrap(f, (txt || ' ').toUpperCase(), 480);
        const lh = measureTextHeight(f, 'Ag', 480);
        // bar hitam di belakang teks
        const bar = new Jimp({ width: 512, height: lines.length * lh + 16, color: 0x000000ff });
        base.composite(bar, 0, Math.max(0, Math.round(yStart)));
        printCentered(base, f, lines, 256, Math.max(8, Math.round(yStart + 8)), lh);
    };
    if ((atas || '').trim()) paint(atas, 0);
    if ((bawah || '').trim()) paint(bawah, 512 - (wrap(f, bawah.toUpperCase(), 480).length * measureTextHeight(f, 'Ag', 480) + 16));
    return base.getBuffer('image/png');
}

// ---- SMEME WEBP-ANIM: tempel teks ke semua frame, tetep gerak (sharp) ----
// ffmpeg di sini buta webp animasi, jadi jalur ini murni sharp.
export async function smemeWebp(inputBuffer, atas, bawah) {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const block = (txt, y) => {
        const words = String(txt || ' ').toUpperCase().split(/\s+/);
        const lines = [];
        let cur = '';
        for (const w of words) {
            const t = cur ? cur + ' ' + w : w;
            if (t.length > 16 && cur) { lines.push(cur); cur = w; } else cur = t;
        }
        if (cur) lines.push(cur);
        const fs_ = 38;
        const lh = 46;
        const h = lines.length * lh + 20;
        let svg = `<rect x="0" y="${y}" width="512" height="${h}" fill="black"/>`;
        lines.forEach((ln, i) => {
            svg += `<text x="256" y="${y + 38 + i * lh}" font-family="Arial, 'DejaVu Sans', sans-serif" font-weight="bold" font-size="${fs_}" fill="white" text-anchor="middle">${esc(ln)}</text>`;
        });
        return { svg, h };
    };
    const meta = await sharp(inputBuffer, { animated: true }).metadata().catch(() => ({ width: 512, height: 512 }));
    const W = meta.width || 512, H = meta.height || 512;
    const scale = W / 512;
    const top = block(atas, 0);
    const bot = block(bawah, 0);
    const botY = Math.round(H - (bot.h * scale));
    const svg =
        `<svg width="${W}" height="${H}">` +
        `<g transform="scale(${scale})">${top.svg}</g>` +
        `<g transform="translate(0,${botY}) scale(${scale})">${bot.svg}</g>` +
        `</svg>`;
    return sharp(inputBuffer, { animated: true })
        .composite([{ input: Buffer.from(svg), gravity: 'northwest' }])
        .webp({ loop: 0, quality: 80 })
        .toBuffer();
}

// ---- WELCOME/LEAVE card 800x420: bg + avatar bulat + title + desc ----
export async function welcomePng({ bgBuffer = null, avatarBuffer = null, title = '', desc = '' } = {}) {
    const W = 800, H = 420;
    let bg;
    if (bgBuffer) {
        try { bg = await Jimp.read(bgBuffer); } catch (_) { bg = null; }
    }
    if (!bg) bg = new Jimp({ width: W, height: H, color: 0x1a1d29ff });
    bg.cover({ w: W, h: H });
    bg.brightness(-0.45);
    if (avatarBuffer) {
        try {
            const av = await Jimp.read(avatarBuffer);
            av.cover({ w: 170, h: 170 });
            av.circle();
            const ring = new Jimp({ width: 182, height: 182, color: 0x8ace00ff });
            ring.circle();
            bg.composite(ring, Math.round((W - 182) / 2), 28);
            bg.composite(av, Math.round((W - 170) / 2), 34);
        } catch (_) {}
    }
    const fT = await font('open-sans-64-white');
    const fD = await font('open-sans-32-white');
    const tLines = wrap(fT, title, W - 80);
    let y = avatarBuffer ? 225 : 90;
    const lhT = measureTextHeight(fT, 'Ag', W - 80);
    y = printCentered(bg, fT, tLines.slice(0, 2), W / 2, y, lhT);
    const dLines = wrap(fD, desc, W - 100);
    printCentered(bg, fD, dLines.slice(0, 2), W / 2, y + 12, measureTextHeight(fD, 'Ag', W - 100));
    return bg.getBuffer('image/png');
}
