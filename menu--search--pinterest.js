import "../settings.js";
import { pinImages } from "../lib/scrape.js";

export default {
    command: ['pinterest', 'pin'],
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
        RyuuBotz,
        reply
    }) => {
        await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

        try {
            if (!text) return reply("Format salah ya sayang… contoh:\n.pin Anime 💕");

            const images = await pinImages(text.trim(), 5);
            if (!images.length) return reply("Gambarnya nggak ketemu… aku sedih 😢");

            const album = images.map((img, i) => ({
                image: { url: img },
                caption: `🖼️ Gambar ke-${i + 1}\n🔗 ${img}`
            }));

            await RyuuBotz.sendAlbum(m.chat, album, { quoted: m });
            await RyuuBotz.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (err) {
            console.error('Pinterest Error:', err.message);
            await RyuuBotz.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            reply(`❌ Gagal cari gambar.\n\n${err.message}`);
        }
    }
};
