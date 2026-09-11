import { getUser } from "../lib/rpg/database.js";
import { characters } from "../lib/rpg/character.js";

export default {
  command: ["char", "character", "karakter"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,
  code: async (m, { reply }) => {
        const { user } = getUser(m.sender, m.pushName);
        const myChars = user.inventory.characters;

        if (!myChars || myChars.length === 0) return reply("❌ Kamu belum memiliki karakter. Ayo gacha!");

        let txt = `👤 *YOUR CHARACTER LIST* 👤\n`;
        txt += `Total Koleksi: ${myChars.length}\n`;
        txt += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        myChars.forEach((id, i) => {
            const data = characters[id];
            const icon = {
                pyro: "🔥", hydro: "💧", anemo: "🌀", electro: "⚡", 
                dendro: "🍀", cryo: "❄️", geo: "🔶"
            }[data?.elemental?.toLowerCase()] || "✨";

            const active = user.build.activeChar === id ? " ✅ *(Active)*" : "";
            const name = data?.name || id.replace(/_/g, ' ').toUpperCase();
            
            txt += `${i + 1}. ${icon} *${name}*\n`;
            txt += `   └ Rarity: ${"⭐".repeat(data?.star || 3)}${active}\n`;
        });

        txt += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        txt += `💡 _Gunakan *.equip [nama]* untuk mengganti._`;
        reply(txt);
    }
};
