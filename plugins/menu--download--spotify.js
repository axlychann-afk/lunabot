import axios from 'axios';
import {
    AudioToOpus
} from "@ryuu-reinzz/luna-lib";

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
            return reply(`⚠️ *Format Salah!*\n\nContoh:\n*${prefix + command} https://open.spotify.com/track/xxxxx*`);
        }
        if (!text.includes('spotify.com')) {
            return reply('⚠️ Link tidak valid! Masukkan link Spotify yang benar.');
        }

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key
            }
        });

        if (m.mtype === "templateButtonReplyMessage") {
            await m.quoted.delete()
        } else if (m.quoted && (m.quoted.mtype === 'interactiveMessage' || m.quoted.mtype === 'templateButtonReplyMessage')) {
            try {
                await RyuuBotz.sendMessage(m.chat, {
                    delete: m.quoted.fakeObj.key
                });
            } catch (err) {
                console.error("❌ Gagal menghapus pesan quoted:", err);
            }
        };

        try {
            const apiUrl = `https://api.ryuu-dev.my.id/downloader/spotify?url=${encodeURIComponent(text)}`;

            const {
                data
            } = await axios.get(apiUrl, {
                timeout: 30000,
                headers: {
                    "x-ryuu-apikey": global.ryuukey
                }
            });

            if (!data.success || data.result.error) {
                throw new Error('Gagal mendapatkan respon dari API.');
            }

            const resData = data.result.result;
            const metadata = resData.metadata;
            const downloadUrl = resData.download;

            if (!downloadUrl) throw new Error('Link download tidak ditemukan.');

            const audioRes = await axios.get(downloadUrl, {
                responseType: 'arraybuffer'
            });

            const audioBuffer = Buffer.from(audioRes.data);
            const audio = await AudioToOpus(audioBuffer);

            const title = metadata.name || 'Spotify Audio';
            const artist = metadata.artist.map(v => v.name).join(', ') || 'Unknown Artist';
            const thumbnail = metadata.album.images[0]?.url || global.thumbnail.main;
            
            const durationMs = metadata.duration_ms || 0;
            const minutes = Math.floor(durationMs / 60000);
            const seconds = ((durationMs % 60000) / 1000).toFixed(0);
            const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            await RyuuBotz.sendMessage(m.chat, {
                audio,
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                contextInfo: {
                    ...(global.adreply ? {
                        externalAdReply: {
                            title: title,
                            body: `Artist: ${artist} | Duration: ${durationStr}`,
                            thumbnailUrl: thumbnail,
                            sourceUrl: text,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    } : {})
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
            console.error('Spotify Error:', err);
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });
            reply(`❌ Gagal mengambil audio Spotify.\n\n${err.message}`);
        }
    }
};
