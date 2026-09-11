import '../settings.js';
import fs from "fs";
import path from "path";
const sewaPath = "./database/sewa.json";

const readSewa = () => {
  if (!fs.existsSync(sewaPath)) return { active: [], jadibot: [] };
  try {
    const data = JSON.parse(fs.readFileSync(sewaPath, "utf-8"));
    if (!data.jadibot) data.jadibot = [];
    return data;
  } catch {
    return { active: [], jadibot: [] };
  }
};

const writeSewa = (data) => {
  fs.writeFileSync(sewaPath, JSON.stringify(data, null, 2), "utf-8");
};

export default {
  command: ["jadibot"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,

  code: async (m, { RyuuBotz, text, prefix, reply, command, startsesi, startJadiBot, stopJadiBot }) => {
    const args = text.trim().split(/\s+/);
    const sub = args[0]?.toLowerCase();
    const num = args[1];
    const durationInput = args[2]; // Argumen ketiga (jumlah bulan)
    const baseDir = "./database/jadibot/";

    if (!sub || !["add", "list", "delete", "trial", "stop", "run", "sisasewa"].includes(sub)) {
      return reply(
        `📌 *Cara Pakai Jadibot:*\n\n` +
        `• ${prefix}${command} add <nomor> <bulan/0>\n` +
        `• ${prefix}${command} stop <nomor>\n` +
        `• ${prefix}${command} run <nomor>\n` +
        `• ${prefix}${command} delete <nomor>\n` +
        `• ${prefix}${command} list\n` +
        `• ${prefix}${command} sisasewa`
      );
    }

    const findFolder = (number) => {
      if (!fs.existsSync(baseDir)) return null;
      const dirs = fs.readdirSync(baseDir);
      return dirs.find(d => d.startsWith(number)) || null;
    };

    switch (sub) {
      case "add":
        if (!num) return reply(`❌ Masukkan nomor.`);
        const numberAdd = num.replace(/[^0-9]/g, "");
        
        const months = durationInput ? parseInt(durationInput) : 0;
        let expiredAt = null;

        if (months > 0) {
          expiredAt = Date.now() + (months * 30 * 24 * 60 * 60 * 1000);
        }

        reply(`⏳ Menyiapkan session untuk *${numberAdd}*${months > 0 ? ` selama ${months} Bulan` : " (Unlimited)"}...`);
        
        try {
          const code = await startJadiBot(numberAdd, m, RyuuBotz, startJadiBot, stopJadiBot);
          
          const db = readSewa();
          db.jadibot = db.jadibot.filter(item => item.number !== numberAdd);
          
          db.jadibot.push({
            number: numberAdd,
            expiredAt: expiredAt
          });
          writeSewa(db);

          reply(`✨ *JadiBot Siap!*\n\nPairing Code:\n👉 *${code}*\n\n⏱️ Masa Aktif: *${months > 0 ? `${months} Bulan` : "Unlimited / Selamanya"}*`);
        } catch (e) {
          reply(`❌ Gagal: ${e.message}`);
        }
        break;

      case "sisasewa":
        try {
          const db = readSewa();
          const senderNumber = m.sender.split("@")[0];
        
          const userSewa = db.jadibot.find(item => item.number === senderNumber);
          
          if (!userSewa) {
            return reply(`❌ Nomor kamu (*${senderNumber}*) tidak terdaftar di database rental JadiBot.`);
          }

          if (userSewa.expiredAt === null) {
            return reply(`⏳ Status Sewa JadiBot (*${senderNumber}*):\n• Masa Aktif: *Unlimited / Selamanya* ♾️`);
          }

          const sisaWaktu = userSewa.expiredAt - Date.now();
          if (sisaWaktu <= 0) {
            return reply(`❌ Masa sewa JadiBot kamu telah *Expired/Habis*.`);
          }

          const days = Math.floor(sisaWaktu / (24 * 60 * 60 * 1000));
          const hours = Math.floor((sisaWaktu % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          const minutes = Math.floor((sisaWaktu % (60 * 60 * 1000)) / (60 * 1000));

          reply(
            `📊 *SISA SEWA JADIBOT*\n\n` +
            `• Nomor Bot : ${userSewa.number}\n` +
            `• Sisa Waktu: *${days} Hari, ${hours} Jam, ${minutes} Menit*\n` +
            `• Expired At: ${new Date(userSewa.expiredAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`
          );
        } catch (e) {
          reply(`❌ Gagal mengecek sisa sewa: ${e.message}`);
        }
        break;

      case "stop":
        if (!num) return reply(`❌ Masukkan nomor.`);
        const folderStop = findFolder(num);
        if (!folderStop) return reply(`❌ Nomor ${num} tidak ada di database.`);
        try {
          const newPathStop = path.join(baseDir, `${num}[stopping]`);
          if (fs.existsSync(path.join(baseDir, folderStop))) {
            fs.renameSync(path.join(baseDir, folderStop), newPathStop);
          }
          await reply(`📴 JadiBot *${num}* telah dihentikan. Refreshing dalam 5 detik`);
          process.exit(1);
        } catch (e) {
          reply(`❌ Gagal menghentikan: ${e.message}`);
        }
        break;

      case "run":
        if (!num) return reply(`❌ Masukkan nomor.`);
        const folderRun = findFolder(num);
        if (!folderRun) return reply(`❌ Data tidak ditemukan. Gunakan *add* dahulu.`);
        try {
          await reply(`🚀 Menjalankan JadiBot *${num}*... Refreshing dalam 5 detik`);
          const newPathRun = path.join(baseDir, `${num}[running]`);
          if (fs.existsSync(path.join(baseDir, folderRun))) {
            fs.renameSync(path.join(baseDir, folderRun), newPathRun);
          }
          process.exit(1);
        } catch (e) {
          reply(`❌ Gagal menjalankan: ${e.message}`);
        }
        break;

      case "list":
        try {
          const dirs = fs.readdirSync(baseDir).filter(d => fs.statSync(path.join(baseDir, d)).isDirectory());
          if (!dirs.length) return reply(`📂 Kosong.`);
          
          const db = readSewa();
          const listText = `📋 *Daftar JadiBot:*\n\n` + dirs.map((v, i) => {
            const cleanNum = v.replace(/\[.*?\]/g, "");
            const status = v.includes("[running]") ? "🟢" : "🔴";
            
            const sewaInfo = db.jadibot.find(item => item.number === cleanNum);
            let expText = " (Unlimited)";
            if (sewaInfo && sewaInfo.expiredAt) {
              const sisa = sewaInfo.expiredAt - Date.now();
              expText = sisa > 0 ? ` (${Math.ceil(sisa / (1000 * 60 * 60 * 24))} Hari Lagi)` : " (Expired)";
            }

            return `${i + 1}. ${cleanNum} ${status}${expText}`;
          }).join("\n");
          reply(listText);
        } catch (e) {
          reply(`❌ Error: ${e.message}`);
        }
        break;

      case "delete":
        if (!num) return reply(`❌ Masukkan nomor.`);
        const folderDel = findFolder(num);
        if (!folderDel) return reply(`❌ Folder tidak ditemukan.`);
        try {
          stopJadiBot(num);
          fs.rmSync(path.join(baseDir, folderDel), { recursive: true, force: true });
          
          const db = readSewa();
          db.jadibot = db.jadibot.filter(item => item.number !== num);
          writeSewa(db);

          reply(`🗑️ Berhasil menghapus session & data sewa *${num}*.`);
        } catch (e) {
          reply(`❌ Gagal: ${e.message}`);
        }
        break;

      case "trial":
        if (!num) return reply(`❌ Masukkan nomor.`);
        const tNum = num.replace(/[^0-9]/g, "");
        try {
          const codeT = await startJadiBot(tNum, m, RyuuBotz);
          reply(`🎁 *Trial Aktif (3 Jam)*\n\nCode: *${codeT}*`);
          setTimeout(async () => {
            const currentFolder = findFolder(tNum);
            if (currentFolder) {
              stopJadiBot(tNum);
              fs.rmSync(path.join(baseDir, currentFolder), { recursive: true, force: true });
            }
          }, 3 * 60 * 60 * 1000);
        } catch (e) {
          reply(`❌ Gagal: ${e.message}`);
        }
        break;
    }
  }
};
