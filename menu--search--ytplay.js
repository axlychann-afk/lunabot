import { ytSearch, ytAudio, isYtLink, fetchBuffer } from "../lib/scrape.js";

export default {
    command: ["ytplay", "play"],
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
                `⚠️ Masukkan judul lagu/video YouTube!\n\n` +
                `Contoh:\n` +
                `*${prefix + command} midnight drive*`
            );
        }

        const query = text.trim();
        if (!query) return reply("⚠️ Query pencarian tidak boleh kosong.");

        await RyuuBotz.sendMessage(m.chat, {
            react: { text: '⏱️', key: m.key }
        });

        try {
            const linkMode = isYtLink(query);
            let video;
            if (linkMode) {
                video = { link: query, title: query, channel: '-', duration: '-', thumb: '' };
            } else {
                const results = await ytSearch(query, 1);
                if (!results.length) throw new Error('Video tidak ditemukan, coba kata kunci lain.');
                video = results[0];
            }

            const audio = await ytAudio(video.link);
            const caption = `🎵 *${audio.title}*\n👤 ${audio.channel}\n⏱️ ${audio.duration}\n🔗 ${video.link}`;

            if (video.thumb && !linkMode) {
                try {
                    await RyuuBotz.sendMessage(m.chat, { image: { url: video.thumb }, caption }, { quoted: m });
                } catch (_) {
                    await RyuuBotz.sendMessage(m.chat, { text: caption }, { quoted: m });
                }
            } else {
                await RyuuBotz.sendMessage(m.chat, { text: caption }, { quoted: m });
            }

            await RyuuBotz.sendMessage(m.chat, {
                audio: await fetchBuffer(audio.url),
                mimetype: audio.mimetype,
                fileName: audio.title.slice(0, 60) + '.' + audio.ext,
            }, { quoted: m });

            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

        } catch (err) {
            console.error("YTPLAY Error:", err);
            await RyuuBotz.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return reply(`❌ Gagal mengambil data.\n\n${err.message}`);
        }
    }
};
