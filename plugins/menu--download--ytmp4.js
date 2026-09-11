import fs from 'fs';
import { ytVideo, ytVideoFile, isYtLink } from "../lib/scrape.js";

export default {
    command: ["ytmp4"],
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
        command,
        RyuuBotz,
        reply
    }) => {

        if (!text) {
            return reply(
                `⚠️ Masukkan link YouTube!\n\nContoh:\n*${prefix + command} https://www.youtube.com/watch?v=xxxxx*`
            );
        }

        const link = text.trim().split(/\s+/)[0];
        if (!isYtLink(link)) return reply("⚠️ Link YouTube tidak valid.");

        await RyuuBotz.sendMessage(m.chat, {
            react: { text: '⏱️', key: m.key }
        });

        let merged = null;
        try {
            // jalur cepat: progresif muxed <=480p, stream via URL
            try {
                const video = await ytVideo(link, 480);
                if (video.size && video.size > 100 * 1024 * 1024) {
                    throw new Error(`Video kebesaran (~${Math.round(video.size / 1048576)}MB, batas 100MB).\nLink: ${link}`);
                }
                await RyuuBotz.sendMessage(m.chat, {
                    video: { url: video.url },
                    mimetype: 'video/mp4',
                    fileName: video.title.slice(0, 60) + '.mp4',
                    caption: `📹 *${video.title}*\n👤 ${video.channel} ⏱️ ${video.duration} (${video.height}p)`,
                }, { quoted: m });
            } catch (fastErr) {
                // jalur lambat: download DASH + merge ffmpeg (agak lama, 1-3 menit)
                await RyuuBotz.sendMessage(m.chat, {
                    text: `⏳ Stream langsung ga ada, download + merge dulu ya (1-3 menit)...`,
                }, { quoted: m });
                merged = await ytVideoFile(link, 480);
                await RyuuBotz.sendMessage(m.chat, {
                    video: fs.readFileSync(merged.file),
                    mimetype: 'video/mp4',
                    fileName: merged.title.slice(0, 60) + '.mp4',
                    caption: `📹 *${merged.title}*\n👤 ${merged.channel} ⏱️ ${merged.duration} (${merged.height}p)`,
                }, { quoted: m });
            }

            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

        } catch (err) {
            console.error("YTMP4 Error:", err);
            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return reply(`❌ Gagal mengambil video.\n\n${err.message}`);
        } finally {
            try { merged?.cleanup(); } catch (_) {}
        }
    }
};
