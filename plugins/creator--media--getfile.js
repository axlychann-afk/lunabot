import "../settings.js";
import fs from "fs";
import path from "path";

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default {
    command: ["getfile", "gf"],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: true,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        text,
        reply,
        example
    }) => {
        if (!text) return reply(example("path/to/file.js"));

        const filePath = path.resolve(text);

        if (!fs.existsSync(filePath)) {
            return reply("File tidak ditemukan!");
        }

        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            return reply("Path tersebut adalah folder, bukan file.");
        }

        const fileName = path.basename(filePath);
        const fileSize = formatBytes(stats.size);
        const extension = path.extname(filePath);
        const mimeType = "application/javascript";
        const caption = `*─── [ FILE ANALYSIS ] ───*

📁 *Name:* ${fileName}
⚖️ *Size:* ${fileSize}
🧩 *Extension:* ${extension}
📄 *Mimetype:* ${mimeType}
📍 *Path:* ${text}`.trim();

        try {
            const codeContent = fs.readFileSync(filePath, 'utf-8');

            await RyuuBotz.sendRichResponse(m.chat, {
                text: caption,
                code: {
                    code: codeContent,
                    language: "Punya Ryuu ._."
                }
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            reply("Gagal membaca file atau fungsi sendRichResponse tidak ditemukan.");
        }
    }
};
