import { getUser, save } from "../lib/rpg/database.js";
import { characters } from "../lib/rpg/character.js";
import { weapons } from "../lib/rpg/weapon.js";
import { artifacts } from "../lib/rpg/artifacts.js";

export default {
  command: ["equip", "switch"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,
  code: async (m, { text, RyuuBotz, reply }) => {
    const { db, user } = getUser(m.sender, m.pushName);
    const args = text.split(" ");
    const type = args[0]?.toLowerCase();
    const target = args.slice(1).join("_").toLowerCase();

    if (!type || !target) {
      return reply("Contoh Penggunaan:\n• *.equip char amber*\n• *.equip wep slingshot*\n• *.equip art adventurer*");
    }

    if (type === "char" || type === "character") {
      if (!user.inventory.characters.includes(target)) return reply("❌ Kamu tidak memiliki karakter tersebut!");
      user.build.activeChar = target;
      save(db);
      return reply(`✅ Karakter aktif diganti ke: *${target.toUpperCase()}*`);
    }

    if (type === "wep" || type === "weapon") {
      if (!user.inventory.weapons.includes(target)) return reply("❌ Kamu tidak memiliki senjata tersebut!");

      const charData = characters[user.build.activeChar];
      let wpData = null;
      let wpCategory = "";

      for (let cat in weapons) {
        if (weapons[cat][target]) {
          wpData = weapons[cat][target];
          wpCategory = cat; 
          break;
        }
      }

      if (!wpData) return reply("❌ Data senjata tidak ditemukan di library.");

      if (charData.type !== wpCategory) {
        return reply(`❌ *Invalid Type!*\nKarakter ${user.build.activeChar} adalah user *${charData.type.toUpperCase()}*.\nKamu tidak bisa memakaikan senjata jenis *${wpCategory.toUpperCase()}*.`);
      }

      user.build.weapon = target;
      save(db);
      return reply(`✅ Berhasil memasang senjata: *${wpData.name}*`);
    }

    if (type === "art" || type === "artifact") {
      const owned = user.inventory.artifacts.find(a => a.name.toLowerCase() === target);

      if (!owned) return reply("❌ Kamu tidak memiliki set artifact tersebut!");

      let artData = null;
      let foundKey = null;

      for (let tier in artifacts) {
        foundKey = Object.keys(artifacts[tier]).find(k => k.toLowerCase() === target);
        if (foundKey) {
          artData = artifacts[tier][foundKey];
          break;
        }
      }

      if (!artData) return reply("❌ Data artifact tidak ditemukan di library.");

      user.build.artifactSet = owned.name;
      user.build.artifactCount = owned.set;

      save(db);
      return reply(`✅ Berhasil memasang artifact: *${user.build.artifactSet}* (${user.build.artifactCount}-Pc)`);
}

    reply("❌ Tipe tidak valid! Gunakan: char, wep, atau art.");
  }
};
