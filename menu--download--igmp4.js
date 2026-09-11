import { directMp4, getmyfb } from "../lib/scrape.js";

export default {
    command: ["igmp4"],
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
            // jalur 1: fetcher getmyfb (tanpa key)
            try {
                const g = await getmyfb(link);
                const best = g.hd || g.sd || g.videos[0];
                if (best) {
                    await RyuuBotz.sendMessage(m.chat, {
                        video: { url: best },
                        mimetype: 'video/mp4',
                        caption: `🎬 *INSTAGRAM DOWNLOADER*\n\n📝 *Judul:* ${g.title}\n🔗 ${link}`
                    }, { quoted: m });
                    await RyuuBotz.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                    return;
                }
            } catch (ge) {
                console.log("IG getmyfb fail, fallback:", ge.message);
            }

            // jalur 2: yt-dlp (+cookies.txt bila ada)
            const v = await directMp4(link, 720);

            await RyuuBotz.sendMessage(m.chat, {
                video: { url: v.url },
                mimetype: 'video/mp4',
                caption: `🎬 *INSTAGRAM DOWNLOADER*\n\n📝 *Judul:* ${v.title}\n🔗 ${link}`
            }, { quoted: m });

            await RyuuBotz.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error('IGMP4 Error:', err.message);
            await RyuuBotz.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            reply(`❌ Gagal mengambil video Instagram.\n\n${err.message}`);
        }
    }
};
