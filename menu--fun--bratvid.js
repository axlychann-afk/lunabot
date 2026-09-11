import { bratPng, bratWebp } from "../lib/canvas.js";

export default {
    command: ["bratvid", "bratv3"],
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
        reply
    }) => {

        if (!text) return reply('❌ Masukkan teks untuk membuat stiker.');

        await RyuuBotz.sendMessage(m.chat, {
            react: { text: "⏱️", key: m.key }
        });

        try {
            const png = await bratPng(text.slice(0, 120));
            const webp = await bratWebp(png);
            await RyuuBotz.sendSticker(m.chat, {
                sticker: webp,
                packname: global.packname,
                author: global.author
            });
            await RyuuBotz.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            });
        } catch (err) {
            console.error("❌ Error:", err);
            reply("Terjadi kesalahan saat membuat stiker.");
        }
    }
};
