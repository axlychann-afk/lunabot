import fs from "fs";
import path from "path";
import {
    Zip
} from "zip-lib";

export default {
    command: ["backup"],
    group: false,
    limit: false,
    premium: false,
    admin: false,
    creator: true,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        reply
    }) => {

        try {
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: "⏳",
                    key: m.key
                }
            });

            const timestamp = Date.now();
            const backupDir = "./database/tmp";
            const backupPath = path.join(backupDir, `backup_${timestamp}.zip`);

            if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, {
                recursive: true
            });

            const excludeFolders = [".npm", ".cache", "node_modules", "database/tmp/*", "database/jadibot"];
            const excludeFiles = ["session/store.db"];

            const baseDir = "./";

            const zip = new Zip();

            function addContent(currentPath, zipPath = "") {
                const items = fs.readdirSync(currentPath);

                for (const item of items) {
                    const fullPath = path.join(currentPath, item);
                    const insideZip = path.join(zipPath, item);
                    const stat = fs.statSync(fullPath);

                    if (stat.isDirectory()) {
                        if (!excludeFolders.includes(item)) {
                            zip.addFile(fullPath, insideZip);
                            addContent(fullPath, insideZip);
                        }
                    } else {
                        const rel = path.relative(baseDir, fullPath);
                        if (!excludeFiles.includes(rel)) {
                            zip.addFile(fullPath, insideZip);
                        }
                    }
                }
            }

            addContent(baseDir);

            await zip.archive(backupPath);

            const fileSize = (fs.statSync(backupPath).size / 1024 / 1024).toFixed(2);
            const ownerJid = `${global.ownernumber}@s.whatsapp.net`;

            await global.Client[nomorbot].socket.sendMessage(ownerJid, {
                document: {
                    url: backupPath
                },
                mimetype: "application/zip",
                fileName: `backup_${timestamp}.zip`,
                caption: `✅ *Backup Selesai!*\n\n` +
                    `📁 File: backup_${timestamp}.zip\n` +
                    `📦 Ukuran: ${fileSize} MB\n` +
                    `🕒 Waktu: ${new Date().toLocaleString("id-ID")}`,
                contextInfo: {
                    ...(global.adreply ? {
                        externalAdReply: {
                            title: 'Backup Bot File',
                            body: global.namabot,
                            thumbnailUrl: global.thumbnail.main,
                            sourceUrl: global.saluran,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    } : {})
                }
            }, { quoted: m });


            reply("✅ Backup selesai & dikirim ke owner!");

        } catch (err) {
            console.error(err);
            reply(`⚠️ Gagal backup: ${err.message}`);
        }

    }
};