import fs from "fs";
import axios from "axios";
import FormData from "form-data";

export default {
    command: ["smeme", "stickermeme", "stickmeme"],
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
        RyuuBotz,
        text,
        quoted,
        reply,
        command,
        prefix
    }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!/image|webp/.test(mime)) {
            return reply(`Kirim/reply gambar dengan caption *${prefix + command} text1|text2*`);
        }

        if (!text) {
            return reply(`✨ Contoh: *${prefix + command} atas|bawah*`);
        }

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: "🕒",
                key: m.key
            }
        });

        let media = await RyuuBotz.downloadAndSaveMediaMessage(q);
        let atas = text.split("|")[0] || " ";
        let bawah = text.split("|")[1] || " ";

        try {
            const form = new FormData();
            form.append("file", fs.createReadStream(media));
            form.append("atas", atas);
            form.append("bawah", bawah);

            const response = await axios.post("https://api.ryuu-dev.my.id/canvas/smeme", form, {
                headers: {
                    "x-ryuu-apikey": global.ryuukey,
                    ...form.getHeaders(),
                },
                responseType: "arraybuffer",
            });

            await RyuuBotz.sendSticker(m.chat, {
                sticker: Buffer.from(response.data),
                packname: global.packname,
                author: global.author
            }, {
                quoted: m
            });

            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: "✅",
                    key: m.key
                }
            });

        } catch (e) {
            console.error(e);
            reply(`❌ Gagal membuat smeme: ${e.message}`);
        } finally {
            if (fs.existsSync(media)) fs.unlinkSync(media);
        }
    }
};