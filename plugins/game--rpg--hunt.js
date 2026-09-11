import { monsters } from "../lib/rpg/monsters.js";
import { calculateDamage, getReaction } from "../lib/rpg/battle.js";
import { getUser, save } from "../lib/rpg/database.js";

export default {
  command: ["hunt", "adventure", "explore"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,
  
  code: async (m, { RyuuBotz, reply }) => {
    const { db, user } = getUser(m.sender, m.pushName);
    
    // 1. Filter Monster berdasarkan Level User (Level Scaling)
    // Mencari monster yang HP-nya masuk akal buat level user saat ini
    const userLevel = user.stats.level || 1;
    let availableMonsters = monsters.filter(m => {
        const difficulty = m.hpRequired;
        if (userLevel <= 5) return difficulty <= 800; // Lawan Slime/Hilichurl
        if (userLevel <= 15) return difficulty <= 2500; // Lawan Mitachurl/Mage
        return true; // Boss & Elite muncul di level tinggi
    });

    // Jika filter kosong, ambil semua monster (safety fallback)
    if (availableMonsters.length === 0) availableMonsters = monsters;

    const monster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    
    // 2. Kalkulasi Battle
    const dmgInfo = calculateDamage(user.build);
    const reaction = getReaction(dmgInfo.element, monster.element);
    
    const finalDamage = Math.floor(dmgInfo.total * reaction.mult);
    const isWin = finalDamage >= monster.hpRequired;

    // 3. Susun Teks Battle yang Lebih Seru
    let txt = `⚔️ *BATTLE ENCOUNTER* ⚔️\n`;
    txt += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    txt += `👾 *Target:* ${monster.name} (${monster.element.toUpperCase()})\n`;
    txt += `🛡️ *HP Target:* ${monster.hpRequired.toLocaleString()}\n\n`;
    
    txt += `🛡️ *Your Build:* ${user.build.activeChar.toUpperCase()}\n`;
    txt += `💥 *Base Dmg:* ${dmgInfo.total}\n`;
    if (reaction.name) txt += `🌀 *Reaction:* ${reaction.name} (x${reaction.mult})\n`;
    txt += `🔥 *Total Damage:* ${finalDamage.toLocaleString()} ${dmgInfo.isCrit ? "💢 [CRIT]" : ""}\n\n`;

    if (isWin) {
      const rewardMora = Math.floor(monster.hpRequired / 5) + (userLevel * 50);
      const rewardExp = Math.floor(monster.hpRequired / 10);
      
      user.mora += rewardMora;
      user.stats.exp += rewardExp;

      // Logika Naik Level (Setiap 1000 EXP)
      if (user.stats.exp >= 1000) {
          user.stats.level += 1;
          user.stats.exp -= 1000;
          txt += `🎊 *LEVEL UP!* Sekarang kamu Level *${user.stats.level}*\n`;
      }

      txt += `✅ *VICTORY!*\n`;
      txt += `💰 Mora: +${rewardMora.toLocaleString()}\n`;
      txt += `🆙 EXP: +${rewardExp}\n`;
    } else {
      txt += `❌ *DEFEAT!*\n`;
      txt += `Damage kamu kurang *${(monster.hpRequired - finalDamage).toLocaleString()}* lagi.\n`;
      txt += `💡 _Saran: Upgrade weapon atau pasang artifact 4-piece!_`;
    }

    txt += `\n━━━━━━━━━━━━━━━━━━━━`;

    // 4. Simpan ke Database (Kirim variabel 'db' agar permanen)
    save(db);
    reply(txt);
  }
};
