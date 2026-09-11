import axios from 'axios';

export default {
    command: ["ytsearch", "yts"],
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

        if (!text) return reply("⚠️ Masukkan judul lagu/video YouTube!");

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: '⏱️',
                key: m.key
            }
        });

        if (m.mtype === "templateButtonReplyMessage") {
            await m.quoted.delete()
        };

        try {
            const apiKey = "ryuu-apis-bcb4544aeb4506961776618614240";
            const headers = {
                "x-ryuu-apikey": apiKey
            };

            const searchRes = await axios.get(`https://api.ryuu-dev.my.id/discovery/search/youtube`, {
                params: {
                    q: text
                },
                headers: headers
            });

            const response = searchRes.data;
            const videos = response?.result?.result;
            console.log(response);

            if (!response.success || !Array.isArray(videos) || videos.length === 0) {
                return reply("❌ Video tidak ditemukan atau API error.");
            }

            const selectedVideos = videos.slice(0, 15);

            const bodyPayload = {
                videos: selectedVideos.map(v => ({
                    title: v.title,
                    channel: v.channel,
                    views: v.views,
                    ago: v.ago,
                    imageUrl: v.imageUrl
                }))
            };

            const quickReplies = selectedVideos.map(v => ({
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: `➡️ Download ${v.title}`,
                    sections: [{
                        title: `Select downloader format`,
                        rows: [{
                                title: `🎥 Download Video`,
                                description: `Download video ${v.title}`,
                                id: `${prefix}ytmp4 ${v.link}`
                            },
                            {
                                title: `💽 Download Audio`,
                                description: `Download audio ${v.title}`,
                                id: `${prefix}ytmp3 ${v.link}`
                            }
                        ]
                    }]
                })
            }));

            const imgRes = await axios.post("https://api.ryuu-dev.my.id/canvas/yt-search", bodyPayload, {
                headers: headers,
                responseType: 'arraybuffer'
            });

            const imageBuffer = Buffer.from(imgRes.data);

            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            });

            await RyuuBotz.sendButton(
                m.chat, {
                    image: imageBuffer,
                    caption: `🔎 Hasil pencarian YouTube:\n"${text}"`,
                    footer: global.ownername,
                    buttons: quickReplies,
                    bottom_sheet: true,
                    bottom_name: "Select Video:"
                }, {
                    quoted: m
                }
            );

        } catch (err) {
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });

            const errorMsg = err.response?.data?.message || err.message;
            reply(`❌ Terjadi kesalahan: ${errorMsg}`);
        }
    }
};