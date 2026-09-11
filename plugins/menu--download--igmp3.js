import axios from 'axios';
import {
    AudioToOpus
} from "@ryuu-reinzz/luna-lib";

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
            const apiUrl = `https://api.ryuu-dev.my.id/downloader/instagram?url=${encodeURIComponent(text)}&format=mp3`;

            const {
                data
            } = await axios.get(apiUrl, {
                timeout: 30000,
                headers: {
                    "x-ryuu-apikey": global.ryuukey
                }

            });

            if (!data.success || !data.result || !data.result.status) {
                throw new Error('Gagal mendapatkan respon dari API.');
            }

            const resData = data.result.result;
            const mp3Url = resData.link;

            if (!mp3Url) throw new Error('Link audio tidak ditemukan.');

            const audioRes = await axios.get(mp3Url, {
                responseType: 'arraybuffer'
            });

            const audioBuffer = Buffer.from(audioRes.data);
            const audio = await AudioToOpus(audioBuffer);

            const title = resData.title || 'Instagram Audio';
            const thumbnail = resData.thumbnail || global.thumbnail.main;
            const duration = resData.duration || 'Unknown';

            await RyuuBotz.sendMessage(m.chat, {
                audio,
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: `Duration: ${duration}`,
                        thumbnailUrl: thumbnail,
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
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
            console.error('IGMP3 Error:', err);
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });
            reply(`❌ Gagal mengambil audio Instagram.\n\n${err.message}`);
        }
    }
};