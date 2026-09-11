import { ytSearch } from "../lib/scrape.js";

export default {
    command: ["ytsearch", "yts"],
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

        if (!text) return reply("⚠️ Masukkan judul lagu/video YouTube!");

        await RyuuBotz.sendMessage(m.chat, {
            react: { text: '⏱️', key: m.key }
        });

        try {
            const videos = await ytSearch(text.trim(), 8);

            if (!videos.length) {
                await RyuuBotz.sendMessage(m.chat, {
                    react: { text: '❌', key: m.key }
                });
                return reply("❌ Video tidak ditemukan, coba kata kunci lain.");
            }

            let msg = `🔎 *Hasil pencarian YouTube:*\n"${text.trim()}"\n\n`;
            videos.forEach((v, i) => {
                msg += `*${i + 1}.* ${v.title}\n   👤 ${v.channel} ⏱️ ${v.duration} 👁️ ${v.views}\n   🔗 ${v.link}\n\n`;
            });
            msg += `Download: *${prefix}ytmp3 <link>* (audio) / *${prefix}ytmp4 <link>* (video)`;

            try {
                await RyuuBotz.sendMessage(m.chat, {
                    image: { url: videos[0].thumb },
                    caption: msg,
                }, { quoted: m });
            } catch (_) {
                await RyuuBotz.sendMessage(m.chat, { text: msg }, { quoted: m });
            }

            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

        } catch (err) {
            console.error("YTSEARCH Error:", err);
            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            reply(`❌ Terjadi kesalahan: ${err.message}`);
        }
    }
};
