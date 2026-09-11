import fs from "fs";
import { smemePng, smemeMp4, smemeWebp, isAnimatedWebp } from "../lib/canvas.js";

export default {
    command: ["smeme", "stickermeme", "stickmeme"],
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
        RyuuBotz,
        text,
        quoted,
        reply,
        command,
        prefix
    }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!/image|video|webp|gif/.test(mime)) {
            return reply(`Kirim/reply gambar, video, gif, atau stiker (diam/gerak) dengan caption *${prefix + command} text1|text2*`);
        }

        if (!text) {
            return reply(`✨ Contoh: *${prefix + command} atas|bawah*`);
        }

        await RyuuBotz.sendMessage(m.chat, {
            react: { text: "🕒", key: m.key }
        });

        let media = await RyuuBotz.downloadAndSaveMediaMessage(q);
        let atas = text.split("|")[0] || " ";
        let bawah = text.split("|")[1] || " ";
        let job = null;

        try {
            const buf = fs.readFileSync(media);
            const isVideo = /video|gif/.test(mime);
            const isAnimWebp = /webp/.test(mime) && isAnimatedWebp(buf);

            if (isAnimWebp) {
                // stiker gerak (webp anim) → tempel per frame via sharp, tetep gerak
                const out = await smemeWebp(buf, atas, bawah);
                await RyuuBotz.sendSticker(m.chat, {
                    sticker: out,
                    packname: global.packname,
                    author: global.author
                }, { quoted: m });
            } else if (isVideo) {
                // video/gif → bakar teks per frame via ffmpeg, tetep gerak
                job = await smemeMp4(media, atas, bawah);
                await RyuuBotz.sendVideoAsSticker(m.chat, job.file, m, {
                    packname: global.packname,
                    author: global.author
                });
            } else {
                const out = await smemePng(buf, atas, bawah);
                await RyuuBotz.sendSticker(m.chat, {
                    sticker: out,
                    packname: global.packname,
                    author: global.author
                }, { quoted: m });
            }

            await RyuuBotz.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            });

        } catch (e) {
            console.error(e);
            reply(`❌ Gagal membuat smeme: ${e.message}`);
        } finally {
            try { job?.cleanup(); } catch (_) {}
            if (fs.existsSync(media)) fs.unlinkSync(media);
        }
    }
};
