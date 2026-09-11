import axios from 'axios';

export default {
    command: ["igmp4", "ig"],
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
        if (!text.includes('instagram.com') && !text.includes('instagr.am')) {
            return reply('⚠️ Link tidak valid! Masukkan link Instagram yang benar.');
        }

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key
            }
        });

        if (m.mtype === "templateButtonReplyMessage") {
            await m.quoted.delete()
        };

        try {
            // Mengubah path ke downloader/instagram
            const apiUrl = `https://api.ryuu-dev.my.id/downloader/instagram?url=${encodeURIComponent(text)}&format=480`;

            const {
                data
            } = await axios.get(apiUrl, {
                timeout: 45000,
                headers: {
                    "x-ryuu-apikey": global.ryuukey
                }

            });

            if (!data.success || !data.result || !data.result.status) {
                throw new Error('Gagal mendapatkan respon dari API.');
            }

            const resData = data.result.result;
            const videoUrl = resData.link;

            if (!videoUrl) throw new Error('Link video tidak ditemukan.');

            const title = resData.title || 'Instagram Video';
            const duration = resData.duration || 'Unknown';

            const videoRes = await axios.get(videoUrl, {
                responseType: 'arraybuffer'
            });

            await RyuuBotz.sendMessage(m.chat, {
                video: Buffer.from(videoRes.data),
                caption: `🎬 *INSTAGRAM DOWNLOADER*\n\n` +
                    `📝 *Judul:* ${title}\n` +
                    `⏳ *Durasi:* ${duration}`
            }, {
                quoted: m
            });

            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            });

        } catch (err) {
            console.error('IGMP4 Error:', err);
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });
            reply(`❌ Gagal mengambil video Instagram.\n\nError: ${err.message}`);
        }
    }
};