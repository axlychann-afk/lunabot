import { ssWeb } from "../lib/scrape.js";

export default {
    command: ["ssweb"],
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
            return reply(`⚠️ *Format Salah!*\n\nContoh:\n*${prefix + command} https://example.com*`);
        }

        let url = text.trim().split(/\s+/).pop();
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

        try {
            new URL(url);
        } catch (_) {
            return reply("⚠️ URL tidak valid!");
        }

        await RyuuBotz.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        try {
            const shot = await ssWeb(url);

            await RyuuBotz.sendMessage(m.chat, {
                image: { url: shot },
                caption: `🖥️ *WEB SCREENSHOT*\n\n🌐 URL: ${url}`
            }, { quoted: m });

            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

        } catch (err) {
            console.error("SSWEB Error:", err);
            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            reply(`❌ Gagal mengambil screenshot.\n\nError: ${err.message}`);
        }
    }
};
