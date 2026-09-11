import axios from 'axios';

export default {
    command: ["brat"],
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
            react: {
                text: "⏱️",
                key: m.key
            }
        });

        try {
            const sticker = `https://api.ryuu-dev.my.id/canvas/brat/v1?text=${encodeURIComponent(text)}`;

            const {
                data: buffer
            } = await axios.get(sticker, {
                responseType: "arraybuffer",
                headers: {
                    "x-ryuu-apikey": global.ryuukey
                }
            });

            await RyuuBotz.sendSticker(m.chat, {
                sticker: buffer,
                packname: global.packname,
                author: global.author
            });
        } catch (err) {
            console.error("❌ Error:", err);
            reply("Terjadi kesalahan saat membuat stiker.");
        }

    }
};