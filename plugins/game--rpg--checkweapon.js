import { weapons } from "../lib/rpg/weapon.js";

export default {
  command: ["checkweapon"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,
  code: async (m, { text, reply }) => {
    if (!text) return reply("Contoh: .checkweapon sword mistsplitter_reforged");
    const [type, name] = text.split(" ");
    const data = weapons[type]?.[name];
    
    if (!data) return reply("Data tidak ditemukan.");
    
    reply(`⚔️ *Weapon Info* ⚔️
Name: ${data.name}
Star: ⭐${data.star}
Base ATK: ${data.base_atk}
Sub Stat: ${data.sub_stat} (${data.sub_value})`);
  }
};
