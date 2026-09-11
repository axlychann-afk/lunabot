import { bratPng } from "../lib/canvas.js";

export default {
    command: ["brathd"],
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
            const buffer = await bratPng(text.slice(0, 200), { hd: true });
            await RyuuBotz.sendSticker(m.chat, {
                sticker: buffer,
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
