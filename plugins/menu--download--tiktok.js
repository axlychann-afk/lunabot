import axios from "axios";
import "../settings.js";

export default {
    command: ["tiktok", "tt"],
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
        RyuuBotz,
        reply
    }) => {
        if (!text) {
            return reply(
                `*Example:*\n` +
                `${prefix}tiktok https://vt.tiktok.com/RyuuGanteng/\n` +
                `${prefix}tiktok https://vt.tiktok.com/RyuuGanteng/ --no-audio\n` +
                `${prefix}tiktok https://vt.tiktok.com/RyuuGanteng/ --only-audio\n` +
                `${prefix}tiktok https://vt.tiktok.com/RyuuGanteng/ --only-video\n` +
                `${prefix}tiktok https://vt.tiktok.com/RyuuGanteng/ --no-video`
            );
        }

        const flags = ["--no-audio", "--only-audio", "--only-video", "--no-video"];
        const usedFlags = flags.filter(flag => text.includes(flag));

        if (usedFlags.length > 1) {
            return reply("❌ Hanya boleh menggunakan satu flag.");
        }

        const flag = usedFlags[0] || null;
        const url = text.replace(flag || "", "").trim();

        if (!url) {
            return reply(`*Example:* ${prefix}tiktok https://vt.tiktok.com/RyuuGanteng/`);
        }

        if (!/tiktok\.com|vt\.tiktok\.com/i.test(url)) {
            return reply("Masukkan link TikTok yang valid!");
        }

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: "🕖",
                key: m.key
            }
        });

        try {
            const {
                data: res
            } = await axios.get(
                `https://api.ryuu-dev.my.id/downloader/tiktok?url=${encodeURIComponent(url)}`,
                {
                    headers: {
                        "x-ryuu-apikey": global.ryuukey
                    },
                    timeout: 200000
                }
            );

            if (!res?.success || !res?.result?.result?.status) {
                return reply("❌ Gagal mengambil data TikTok.");
            }

            const data = res.result.result;

            const caption =
                `🎵 *TikTok Downloader*\n\n` +
                `📝 *Deskripsi:* ${data.description || "-"}\n` +
                `👤 *Author:* ${data.author}\n` +
                `❤️ *Like:* ${data.stats?.like || 0}\n` +
                `👁️ *Views:* ${data.stats?.views || 0}\n` +
                `💬 *Komentar:* ${data.stats?.comment || 0}\n` +
                `🔁 *Share:* ${data.stats?.share || 0}`;

            const sendAudio = flag !== "--no-audio" && flag !== "--only-video";
            const sendVideo = flag !== "--no-video" && flag !== "--only-audio";

            if (data.isSlide) {
                if (sendVideo || !data.videoUrl) {
                    const album = data.imageUrls.map((url, i) => ({
                        image: {
                            url
                        },
                        caption: i === 0 ? caption : `📸 Slide ${i + 1}`
                    }));

                    await RyuuBotz.sendAlbum(m.chat, album, {
                        quoted: m
                    });
                }

                if (sendAudio && data.audioUrl) {
                    await RyuuBotz.sendMessage(
                        m.chat,
                        {
                            audio: {
                                url: data.audioUrl
                            },
                            mimetype: "audio/mpeg",
                            ptt: false
                        },
                        {
                            quoted: m
                        }
                    );
                }

                return;
            }

            if (sendVideo && data.videoUrl) {
                await RyuuBotz.sendMessage(
                    m.chat,
                    {
                        video: {
                            url: data.videoUrl
                        },
                        caption,
                        mimetype: "video/mp4"
                    },
                    {
                        quoted: m
                    }
                );
            }

            if (sendAudio && data.audioUrl) {
                await RyuuBotz.sendMessage(
                    m.chat,
                    {
                        audio: {
                            url: data.audioUrl
                        },
                        mimetype: "audio/mpeg",
                        ptt: false
                    },
                    {
                        quoted: m
                    }
                );
            }
        } catch (err) {
            console.log("TikTok Error:", err);
            reply(
                `❌ Error saat memproses:\n${
                    err?.response?.data?.message || err.message || err
                }`
            );
        }
    }
};