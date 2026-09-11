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
let mentionUsers = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
for (let jid of mentionUsers) {
  if (!m.key.fromMe) {
    let afkUser = afkDB.find(u => u.user === jid && u.chat === m.chat);
    if (afkUser && afkUser.afkTime > -1) {
      RyuuBotz.sendMessage(m.chat, {
        text: `🍡 *Heii~ jangan tag dulu ya~* 💬✨
📴 *Dia lagi AFK* ${afkUser.alasan ? `\n🍰 *Karena:* ${afkUser.alasan}~` : '\n🍰 *Tanpa alasan khusus~*'}
🕒 *Udah AFK selama:* ${clockStrink(new Date - afkUser.afkTime)} 💤`,
        contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                    newsletterName: global.namabot,
                    newsletterJid: global.idSaluran
                },
                    previewThumbnail: {
                        title: "Dia pergi afk",
                        desc: global.ownername,
                        thumbnail: { url: global.thumbnail.mini },
                        sourceUrl: "https://api.ryuu-dev.my.id"
                    },
                    mentions: [jid]
                }
            }, { quoted: m });
          }
        }
      }
     }
   }