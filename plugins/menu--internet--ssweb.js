import axios from 'axios';

export default {
    command: ["ssweb"],
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
            return reply(`⚠️ *Format Salah!*\n\nContoh:\n*${prefix + command} android https://example.com*\n\n*Device yang valid:*\n- Desktop\n- Laptop\n- Android\n- Tablet\n- iPad\n- iPhone\n- TV`);
        }

        let args = text.split(" ");
        let device = args[0]?.toLowerCase();
        let url = args[1];

        if (!url) {
            url = device;
            device = "android";
        }

        if (!url.startsWith("http")) {
            return reply("⚠️ URL tidak valid!");
        }

        const allowedDevices = ["desktop", "laptop", "android", "tablet", "ipad", "iphone", "tv"];
        if (!allowedDevices.includes(device)) {
            device = "android";
        }

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key
            }
        });

        try {
            const apiUrl = `https://api.ryuu-dev.my.id/discovery/screenshot-website?url=${encodeURIComponent(url)}&device=${device}`;

            const {
                data: res
            } = await axios.get(apiUrl, {
                headers: {
                    "x-ryuu-apikey": global.ryuukey
                }
            });

            if (!res.success || !res.result?.status) {
                console.log(res);
                throw new Error("API gagal mengambil screenshot");
            }

            const imageUrl = res.result.result.image;

            await RyuuBotz.sendMessage(m.chat, {
                image: {
                    url: imageUrl
                },
                caption: `🖥️ *WEB SCREENSHOT*\n\n` +
                    `🌐 URL: ${url}\n` +
                    `📱 Device: ${device}`
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
            console.error("SSWEB Error:", err);

            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });

            reply(`❌ Gagal mengambil screenshot.\n\nError: ${err.message}`);
        }
    }
};