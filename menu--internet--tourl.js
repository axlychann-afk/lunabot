import "../settings.js";
import FormData from "form-data";
import {
    fileTypeFromBuffer
} from "file-type";
import crypto from "crypto";
import fetch from "node-fetch";
export default {
    command: ["tourl"],
    group: false,
    limit: true,
    premium: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        quoted,
        mime,
        reply
    }) => {
        if (!quoted) return reply("Reply gambar / video nya dulu ya… aku nungguin kamu 😳");
        if (!/image/.test(mime)) return reply("Itu bukan gambar, sayang");

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: "⏳",
                key: m.key
            },
        });

        try {
            const buffer = await quoted.download();
            if (!buffer) throw new Error("Gagal download media");

            const link = await tourl(buffer);

            await RyuuBotz.sendMessage(
                m.chat, {
                    document: buffer,
                    fileName: "Upload via bot",
                    mimetype: mime,
                    caption: 
                    `✨ *Berhasil~*\n\n` +
                     `Ini link nya ya:\n` +
                     `\`\`\`${link}\`\`\`\n\n` +
                     `Aku bikinin tombol biar kamu gampang salin 🤍`,
                    footer: `© ${global.ownername}`,
                    contextInfo: {
                        ...(global.adreply ? {
                            externalAdReply: {
                                title: ownername,
                                body: namabot,
                                thumbnailUrl: thumbnail,
                                sourceUrl: link,
                                renderLargerThumbnail: true,
                            }
                        } : {})
                    },
                    buttons: [{
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: "Salin Link",
                            copy_code: link,
                        }),
                    }, ],
                }, {
                    quoted: m
                }
            );

        } catch (err) {
            console.error(err);
            reply(`❌ Upload error:\n${err.message || err}`);
        }
    },
};

async function tourl(buffer) {
    const visitorId = crypto.randomUUID();

    const {
        ext
    } = await fileTypeFromBuffer(buffer);

    // utama: aceimg (no key) — cadangan: catbox (no key)
    try {
        const formData = new FormData();
        formData.append("file", buffer, `file.${ext}`);

        const res = await fetch(
            `https://api.aceimg.com/api/upload?visitorId=${encodeURIComponent(visitorId)}`, {
                method: "POST",
                body: formData,
            }
        );

        const data = await res.json();

        if (!data || !data.link) {
            throw new Error("Upload gagal, response invalid");
        }
        let link = data.link;
        const match = link.match(/https:\/\/aceimg\.com\/upload\/\?f=(.+)/);
        if (match) {
            link = `https://cdn.aceimg.com/${match[1]}`;
        }

        return link;
    } catch (_) {
        const formData = new FormData();
        formData.append("reqtype", "fileupload");
        formData.append("fileToUpload", buffer, `file.${ext}`);
        const res = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: formData,
        });
        const link = (await res.text()).trim();
        if (!/^https?:\/\//.test(link)) throw new Error("Upload gagal di semua server.");
        return link;
    }
}