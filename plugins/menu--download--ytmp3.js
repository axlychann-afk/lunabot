import { ytAudio, isYtLink, fetchBuffer } from "../lib/scrape.js";

export default {
    command: ["ytmp3"],
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

        try {
            const audio = await ytAudio(link);

            if (audio.size && audio.size > 100 * 1024 * 1024) {
                throw new Error(`Audio kebesaran (~${Math.round(audio.size / 1048576)}MB, batas 100MB).\nLink: ${link}`);
            }

            await RyuuBotz.sendMessage(m.chat, {
                audio: await fetchBuffer(audio.url),
                mimetype: audio.mimetype,
                fileName: audio.title.slice(0, 60) + '.' + audio.ext,
            }, { quoted: m });

            await RyuuBotz.sendMessage(m.chat, {
                text: `💽 *${audio.title}*\n👤 ${audio.channel} ⏱️ ${audio.duration}`,
            }, { quoted: m });

            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

        } catch (err) {
            console.error("YTMP3 Error:", err);
            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return reply(`❌ Gagal mengambil audio.\n\n${err.message}`);
        }
    }
};
