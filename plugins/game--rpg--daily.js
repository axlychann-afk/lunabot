import fs from "fs";
import { getUser, save } from "../lib/rpg/database.js";

export default {
  command: ["claim", "daily", "klaim"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { reply, addUserLimit }) => {
    const userPath = "./database/user.json";
    let userDB = JSON.parse(fs.readFileSync(userPath));
    let u = userDB.find(v => v.userid === m.sender);

    if (!u) return reply("Data user bot belum ada.");
    if (u.claimed) return reply("❌ Kamu sudah mengambil jatah claim hari ini.");

    const { db, user } = getUser(m.sender, m.pushName);
    if (!user) return reply("Data RPG kamu belum terinisialisasi.");

    const dapatMora = Math.floor(Math.random() * 5001) + 3000; 
    const dapatPrimos = Math.floor(Math.random() * 101) + 60;   
    const limitBot = Math.floor(Math.random() * 15) + 5;

    user.mora += dapatMora;
    user.primogems += dapatPrimos;
    user.stats.exp += 150;

    u.claimed = true;
    addUserLimit(m.sender, limitBot); 

    fs.writeFileSync(userPath, JSON.stringify(userDB, null, 2));
    save(db); 

    const caption = `
🎁 *DAILY CLAIM RPG* 🎁
━━━━━━━━━━━━━━━━━━
Halo *${user.name}*, klaim berhasil!

🪙 *Mora:* +${dapatMora.toLocaleString()}
💎 *Primogems:* +${dapatPrimos}
✨ *Exp RPG:* +150
🔧 *Limit Bot:* +${limitBot}

*Saldo RPG Saat Ini:*
💰 Mora: ${user.mora.toLocaleString()}
💳 Primogems: ${user.primogems}

Gunakan *#gacha* untuk mencari karakter baru atau *#hunt* untuk melawan slime!
━━━━━━━━━━━━━━━━━━`.trim();

    reply(caption);
  }
};
