import { characters } from "../lib/rpg/character.js";
import { weapons } from "../lib/rpg/weapon.js";
import { artifacts } from "../lib/rpg/artifacts.js";
import { getUser, save } from "../lib/rpg/database.js";

export default {
  command: ["gacha", "wish"],
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

    if (user.primogems < 160) {
      return reply(`❌ Primogems tidak cukup!\n💎 Milikmu: ${user.primogems}\n🎫 Butuh: 160`);
    }

    user.primogems -= 160;

    const rate = Math.floor(Math.random() * 100) + 1;
    let type = "";
    let resultId = "";
    let resultData = null;
    let refunded = false;

    if (rate <= 50) {
      const isWeapon = Math.random() > 0.5;
      if (isWeapon) {
        type = "weapon";
        const w3 = [];
        for (let cat in weapons) {
          for (let id in weapons[cat]) {
            if (weapons[cat][id].star === 3) w3.push({ id, data: weapons[cat][id] });
          }
        }
        const pick = w3[Math.floor(Math.random() * w3.length)];
        resultId = pick.id;
        resultData = pick.data;
      } else {
        type = "artifact";
        const a3 = Object.entries(artifacts.star_3 || {});
        const [id, data] = a3[Math.floor(Math.random() * a3.length)];
        resultId = id;
        resultData = data;
      }
    } else if (rate <= 80) {
      const isWeapon = Math.random() > 0.5;
      if (isWeapon) {
        type = "weapon";
        const w4 = [];
        for (let cat in weapons) {
          for (let id in weapons[cat]) {
            if (weapons[cat][id].star === 4) w4.push({ id, data: weapons[cat][id] });
          }
        }
        const pick = w4[Math.floor(Math.random() * w4.length)];
        resultId = pick.id;
        resultData = pick.data;
      } else {
        type = "artifact";
        const a4 = Object.entries(artifacts.star_4 || {});
        const [id, data] = a4[Math.floor(Math.random() * a4.length)];
        resultId = id;
        resultData = data;
      }
    } else {
      type = "character";
      const allChars = Object.entries(characters);
      const [id, data] = allChars[Math.floor(Math.random() * allChars.length)];
      resultId = id;
      resultData = data;
    }

    if (type === "character") {
      if (!user.inventory.characters.includes(resultId)) {
        user.inventory.characters.push(resultId);
      }
    } else if (type === "weapon") {
      if (!user.inventory.weapons.includes(resultId)) {
        user.inventory.weapons.push(resultId);
      }
    } else if (type === "artifact") {
      const owned = user.inventory.artifacts.find(a => a.name === resultId);

      if (owned) {
        if (owned.set === 2) {
          owned.set = 4;
        } else if (owned.set === 4) {
          user.primogems += 160;
          refunded = true;
        }
      } else {
        user.inventory.artifacts.push({
          name: resultId,
          set: 2
        });
      }
    }

    save(db);

    let icon = type === "character" ? "👤" : type === "weapon" ? "🗡️" : "🎭";
    let teks = `💫 *GENSHIN WISH* 💫\n`;
    teks += `━━━━━━━━━━━━━━━━\n`;
    teks += `${icon} Mendapatkan: *${(resultData?.name || resultId).replace(/_/g, " ").toUpperCase()}*\n`;
    teks += `⭐ Rarity: ${"⭐".repeat(resultData?.star || 3)}\n`;
    if (type === "character") teks += `🔥 Element: ${resultData.elemental.toUpperCase()}\n`;
    teks += `📦 Kategori: ${type.toUpperCase()}\n`;

    if (refunded) {
      teks += `\n💎 Duplicate artifact! Primogems dikembalikan +160`;
    }

    teks += `\n━━━━━━━━━━━━━━━━\n`;
    teks += `💎 Sisa Primogems: ${user.primogems}`;

    reply(teks);
  }
};