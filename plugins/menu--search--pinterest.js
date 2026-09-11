import "../settings.js";
import axios from 'axios'

export default {
    command: ['pinterest', 'pin'],
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
        RyuuBotz,
        reply
    }) => {
        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: "⏱️",
                key: m.key
            }
        })

        try {
            if (!text) return reply("Format salah ya sayang… contoh:\n.pin Anime 💕")

            const {
                data
            } = await axios.get(
                `https://api.ryuu-dev.my.id/discovery/search/pinterest?query=${encodeURIComponent(text)}`, {
                    headers: {
                        "x-ryuu-apikey": global.ryuukey
                    }
                }
            )

            const results = data.result.result
            if (!results || results.length === 0)
                return reply("Gambarnya nggak ketemu… aku sedih 😢")

            const images = results.slice(0, 10)

            const album = images.map((v, i) => ({
                image: {
                    url: v.image
                },
                caption: `🖼️ Gambar ke-${i + 1}\n` +
                    `${v.caption || 'Tanpa caption'}\n\n` +
                    `🔗 ${v.source || v.image}`
            }))

            await RyuuBotz.sendAlbum(m.chat, album, {
                quoted: m
            })

        } catch (err) {
            console.error(err)
            m.reply(JSON.stringify(err))
        }
    }
}