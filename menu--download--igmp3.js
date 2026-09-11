import { ytAudio, getmyfb } from "../lib/scrape.js";

export default {
    command: ["igmp3"],
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
            return reply(`⚠️ *Format Salah!*\n\nContoh:\n*${prefix + command} https://www.instagram.com/reels/xxxxx*`);
        }
        const link = text.trim().split(/\s+/)[0];
        if (!link.includes('instagram.com') && !link.includes('instagr.am')) {
            return reply('⚠️ Link tidak valid! Masukkan link Instagram yang benar.');
        }

        await RyuuBotz.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        try {
            // jalur 1: fetcher getmyfb (tanpa key) — stream mp4 dikirim sebagai audio
            try {
                const g = await getmyfb(link);
                const best = g.hd || g.sd || g.videos[0];
                if (best) {
                    await RyuuBotz.sendMessage(m.chat, {
                        audio: { url: best },
                        mimetype: 'audio/mp4',
                        fileName: (g.title || 'instagram').slice(0, 60) + '.mp4',
                    }, { quoted: m });
                    await RyuuBotz.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                    return;
                }
            } catch (ge) {
                console.log("IG getmyfb fail, fallback:", ge.message);
            }

            // jalur 2: yt-dlp langsung (+cookies.txt bila ada)
            const audio = await ytAudio(link);

            await RyuuBotz.sendMessage(m.chat, {
                audio: { url: audio.url },
                mimetype: audio.mimetype,
                fileName: audio.title.slice(0, 60) + '.' + audio.ext,
            }, { quoted: m });

            await RyuuBotz.sendMessage(m.chat, {
                text: `🎵 *${audio.title}*\n🔗 ${link}`,
            }, { quoted: m });

            await RyuuBotz.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error('IGMP3 Error:', err.message);
            await RyuuBotz.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            reply(`❌ Gagal mengambil audio Instagram.\n\n${err.message}`);
        }
    }
};
