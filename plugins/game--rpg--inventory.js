import { getUser } from "../lib/rpg/database.js";

export default {
  command: ["inventory", "inv", "tas", "bag"],
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

        // Map Icon untuk tampilan cantik
        const icons = {
            milk: "🥛", sugar: "🍬", salt: "🧂", onion: "🧅", egg: "🥚", 
            meat: "🥩", fowl: "🍗", fish: "🐟", apple: "🍎", sunsettia: "🍊",
            flour: "🌾", pepper: "🌶️", butter: "🧈", shrimp: "🍤",
            iron: "🪨", crystal: "💎", fate: "🎫"
        };

        let teks = `🎒 *${user.name.toUpperCase()}'S BAG* 🎒\n`;
        teks += `💰 Mora: ${user.mora.toLocaleString()} | 💎 Primogems: ${user.primogems.toLocaleString()}\n`;
        teks += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Karakter & Senjata (Ringkas)
        teks += `👤 *Characters:* ${user.inventory.characters.length}\n`;
        teks += `🗡️ *Weapons:* ${user.inventory.weapons.length}\n`;
        teks += `🎭 *Artifacts:* ${user.inventory.artifacts.length}\n\n`;

        // Materials & Ingredients (Hanya tampilkan yang jumlahnya > 0)
        teks += `📦 *Materials & Ingredients:*\n`;
        const mats = Object.entries(user.inventory.materials).filter(([_, count]) => count > 0);
        
        if (mats.length > 0) {
            mats.forEach(([id, count]) => {
                const icon = icons[id] || "📦";
                const name = id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ');
                teks += `${icon} ${name}: *${count}*\n`;
            });
        } else {
            teks += `_Kosong. Ayo belanja di .shop!_\n`;
        }

        teks += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        teks += `💡 _Tip: Gunakan .build untuk cek status tempur._`;

        reply(teks);
    }
};
