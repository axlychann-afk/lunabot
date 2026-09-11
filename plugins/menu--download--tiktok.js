import axios from "axios";
import "../settings.js";
import { directMp4, ytAudio, ttMeta, COOKIE_HINT } from "../lib/scrape.js";
import { savefrom } from "../lib/savefrom.js";

export default {
    command: ["tiktok", "tt"],
    group: false,
    premium: false,
    limit: true,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (m, {
        text,
        prefix,
        RyuuBotz,
        reply
    }) => {
        if (!text) {
            return reply(
                `*Example:*\n` +
                `${prefix}tiktok https://vt.tiktok.com/xxxxx/\n` +
                `${prefix}tiktok https://vt.tiktok.com/xxxxx/ --only-audio`
            );
        }

        const onlyAudio = /--only-audio|--no-video/i.test(text);
        const onlyVideo = /--only-video|--no-audio/i.test(text);
        const url = text.replace(/--[\w-]+/g, "").trim();

        if (!/tiktok\.com/i.test(url)) {
            return reply("Masukkan link TikTok yang valid!");
        }

        await RyuuBotz.sendMessage(m.chat, { react: { text: "🕖", key: m.key } });

        try {
            const meta = await ttMeta(url);

            // jalur 1: savefrom (tanpa key, tanpa cookies)
            try {
                const sf = await savefrom(url);
                if (sf && sf.ok && sf.media.length) {
                    const vids = sf.media.filter(m => /mp4|video/i.test((m.ext || '') + (m.type || '')) && m.url);
                    const auds = sf.media.filter(m => /mp3|audio|m4a/i.test((m.ext || '') + (m.type || '')) && m.url);
                    const caption = `🎵 *TikTok Downloader*\n\n📝 *Deskripsi:* ${sf.title || meta?.title || '-'}\n👤 *Author:* ${meta?.author || '-'}`;
                    if (!onlyAudio && vids.length) {
                        await RyuuBotz.sendMessage(m.chat, {
                            video: { url: vids[0].url }, caption, mimetype: "video/mp4"
                        }, { quoted: m });
                    }
                    if (!onlyVideo && auds.length) {
                        await RyuuBotz.sendMessage(m.chat, {
                            audio: { url: auds[0].url }, mimetype: "audio/mpeg", ptt: false
                        }, { quoted: m });
                    }
                    if ((onlyAudio && auds.length) || (!onlyAudio && vids.length)) {
                        await RyuuBotz.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                        return;
                    }
                }
            } catch (sfe) {
                console.log("TikTok savefrom fail, fallback:", sfe.message);
            }

            // jalur 2: yt-dlp (butuh cookies.txt untuk IP diblokir)

            if (onlyAudio) {
                const audio = await ytAudio(url);
                await RyuuBotz.sendMessage(m.chat, {
                    audio: { url: audio.url },
                    mimetype: audio.mimetype,
                    fileName: (meta?.title || 'tiktok') + '.' + audio.ext,
                }, { quoted: m });
            } else {
                const v = await directMp4(url, 720);
                const caption =
                    `🎵 *TikTok Downloader*\n\n` +
                    `📝 *Deskripsi:* ${meta?.title || v.title}\n` +
                    `👤 *Author:* ${meta?.author || v.channel}`;
                await RyuuBotz.sendMessage(m.chat, {
                    video: { url: v.url },
                    caption, mimetype: "video/mp4"
                }, { quoted: m });
                if (!onlyVideo) {
                    try {
                        const audio = await ytAudio(url);
                        await RyuuBotz.sendMessage(m.chat, {
                            audio: { url: audio.url },
                            mimetype: audio.mimetype, ptt: false
                        }, { quoted: m });
                    } catch (_) {}
                }
            }
            await RyuuBotz.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } catch (err) {
            console.log("TikTok Error:", err.message);
            await RyuuBotz.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            reply(`❌ Gagal mengambil TikTok.\n\n${err.message}`);
        }
    }
};
