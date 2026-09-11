import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default { 
    event: async(m, { RyuuBotz }) => {
    const afkPath = path.join(__dirname, '../database/afk.json');
let afkDB = fs.existsSync(afkPath) ? JSON.parse(fs.readFileSync(afkPath)) : [];
if (!fs.existsSync(afkPath)) fs.writeFileSync(afkPath, JSON.stringify(afkDB, null, 2));

function saveAFK() {
  fs.writeFileSync(afkPath, JSON.stringify(afkDB, null, 2));
}

function clockStrink(ms) {
  let d = Math.floor(ms / 86400000);
  let h = Math.floor(ms / 3600000) % 24;
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [
    d > 0 ? `${d} hari` : "",
    h > 0 ? `${h} jam` : "",
    m > 0 ? `${m} menit` : "",
    s > 0 ? `${s} detik` : "",
  ].filter(Boolean).join(" ");
}
let senderAFK = afkDB.find(u => u.user === m.sender && u.chat === m.chat);
if (senderAFK && senderAFK.afkTime > -1) {
  await RyuuBotz.sendMessage(m.chat, {
    text: `🍥 *Heii~ @${m.sender.split("@")[0]} udah balik dari AFK loh~* ✨💬
${senderAFK.alasan ? `🍧 *Alasannya:* ${senderAFK.alasan}~` : ''}
🕒 *AFK selama:* ${clockStrink(new Date - senderAFK.afkTime)} 🍡💤`,
    contextInfo: {
            mentionedJid: [m.sender],       
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                    newsletterName: global.namabot,
                    newsletterJid: global.idSaluran
                },
            previewThumbnail: {
                title: "Dia kembali dari afk",
                desc: global.ownername,
                thumbnail: { url: global.thumbnail.mini },
                sourceUrl: "https://deuala.zone.id"
            },
            mentions: [m.sender]
        }
    }, { quoted: m });

         senderAFK.afkTime = -1;
         senderAFK.alasan = '';
         saveAFK();
       }
     }
   }