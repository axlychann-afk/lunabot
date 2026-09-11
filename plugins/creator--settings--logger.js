import fs from 'fs';
import path from 'path';

export default {
    command: ["logger"],
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
        reply,
        logger,
        args
    }) => {
        const logDir = "./database/logger/";
        const subCommand = args[0]?.toLowerCase();
        const query = args[1];

        try {
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, {
                    recursive: true
                });
            }

            switch (subCommand) {
                case 'list': {
                    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
                    if (files.length === 0) return reply("❌ Tidak ada file log.");

                    let txt = "*📁 LIST SYSTEM LOGS*\n\n";
                    files.forEach((file, i) => {
                        const stats = fs.statSync(path.join(logDir, file));
                        const size = (stats.size / 1024).toFixed(2);
                        txt += `${i + 1}. ${file} (${size} KB)\n`;
                    });
                    reply(txt);
                    break;
                }

                case 'view': {
                    if (!query) return reply("❌ Masukkan nomor/ID.");

                    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
                    let targetFile = "";
                    let userId = "";

                    if (!isNaN(query)) {
                        const index = parseInt(query) - 1;
                        if (files[index]) {
                            targetFile = files[index];
                            userId = targetFile.replace('bot-', '').replace('.log', '');
                        } else {
                            userId = query.replace(/[^0-9]/g, '');
                            targetFile = `bot-${userId}.log`;
                        }
                    } else {
                        userId = query.replace(/[^0-9]/g, '');
                        targetFile = `bot-${userId}.log`;
                    }

                    const targetPath = path.join(logDir, targetFile);
                    if (!fs.existsSync(targetPath)) return reply(`❌ File ${targetFile} tidak ada.`);

                    const jadibotDir = "./database/jadibot/";
                    if (fs.existsSync(jadibotDir)) {
                        const folders = fs.readdirSync(jadibotDir);
                        const isStopped = folders.some(f => f.startsWith(userId) && f.includes('[stopping]'));

                        if (isStopped) {
                            reply(`⚠️ *Peringatan:* Bot *${userId}* sedang dalam status *STOPPED*.\nLog mungkin tidak akan terupdate secara real-time.`);
                            return;
                        }
                    }

                    logger.view(targetPath);
                    reply(`✅ Memantau: ${targetFile}`);
                    break;
                }


                case 'delete': {
                    if (!query) return reply("❌ Masukkan nomor/ID.");

                    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
                    let targetFile = "";

                    if (!isNaN(query)) {
                        const index = parseInt(query) - 1;
                        if (files[index]) {
                            targetFile = files[index];
                        } else {
                            const cleanId = query.replace(/[^0-9]/g, '');
                            targetFile = `bot-${cleanId}.log`;
                        }
                    } else {
                        const cleanId = query.replace(/[^0-9]/g, '');
                        targetFile = `bot-${cleanId}.log`;
                    }

                    const targetPath = path.join(logDir, targetFile);
                    if (!fs.existsSync(targetPath)) return reply(`❌ File ${targetFile} tidak ada.`);

                    logger.delete(targetPath);
                    reply(`🗑️ Berhasil menghapus ${targetFile}`);
                    break;
                }
                case 'stop': {
                    logger.stop();
                    reply("✅ Monitoring terminal telah dihentikan.");
                    break;
                }


                default: {
                    reply(`*───「 LOGGER MENU 」───*

1. *.logger list*
2. *.logger view <nomor/ID>*
3. *.logger delete <nomor/ID>*
4. *.logger stop*`);
                }
            }
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    }
};