import { ytSearch, ytAudio } from "../lib/scrape.js";
import { spotifyTitle } from "../lib/scrape.js";

export default {
    command: ["spotify", "spdl"],
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
            return reply(`⚠️ *Format Salah!*\n\nContoh:\n*${prefix + command} https://open.spotify.com/track/xxxxx*\n*${prefix + command} judul - artist*`);
        }

        await RyuuBotz.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        try {
            let query = text.trim();
            if (/spotify\.com/i.test(query)) {
                const title = await spotifyTitle(query);
                if (!title) {
                    return reply(
                        `⚠️ Judul lagu tidak kebaca dari link (Spotify nutup akses server).\n` +
                        `Kirim manual aja:\n*${prefix + command} judul - artist*\nContoh:\n*${prefix + command} blue yung kai*`
                    );
                }
                query = title;
            }

            const results = await ytSearch(query, 1);
            if (!results.length) throw new Error('Lagu tidak ketemu, coba kata lain.');
            const audio = await ytAudio(results[0].link);

            await RyuuBotz.sendMessage(m.chat, {
                audio: { url: audio.url },
                mimetype: audio.mimetype,
                fileName: audio.title.slice(0, 60) + '.' + audio.ext,
            }, { quoted: m });

            await RyuuBotz.sendMessage(m.chat, {
                text: `🎧 *${audio.title}*\n👤 ${audio.channel} ⏱️ ${audio.duration}\n🔗 ${results[0].link}`,
            }, { quoted: m });

            await RyuuBotz.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error('Spotify Error:', err.message);
            await RyuuBotz.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            reply(`❌ Gagal mengambil audio.\n\n${err.message}`);
        }
    }
};
