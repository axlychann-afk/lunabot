import { getUser, save } from "../lib/rpg/database.js";

const SHOP_ITEMS = {
    // --- GACHA & CURRENCY ---
    "primogems": { name: "Primogems 💎", price: 5000, amount: 160, category: "Special" },

    // --- BAHAN DAPUR (GROCERIES) ---
    "milk": { name: "Milk 🥛", price: 100, amount: 1, category: "Cooking" },
    "flour": { name: "Flour 🌾", price: 150, amount: 1, category: "Cooking" },
    "salt": { name: "Salt 🧂", price: 60, amount: 1, category: "Cooking" },
    "pepper": { name: "Pepper 🌶️", price: 80, amount: 1, category: "Cooking" },
    "onion": { name: "Onion 🧅", price: 80, amount: 1, category: "Cooking" },
    "butter": { name: "Butter 🧈", price: 270, amount: 1, category: "Cooking" },
    "sugar": { name: "Sugar 🍬", price: 450, amount: 1, category: "Cooking" },

    // --- DAGING & HASIL ALAM ---
    "meat": { name: "Raw Meat 🥩", price: 240, amount: 1, category: "Food" },
    "fowl": { name: "Fowl 🍗", price: 240, amount: 1, category: "Food" },
    "fish": { name: "Fish 🐟", price: 240, amount: 1, category: "Food" },
    "egg": { name: "Bird Egg 🥚", price: 200, amount: 1, category: "Food" },
    "shrimp": { name: "Shrimp Meat 🍤", price: 120, amount: 1, category: "Food" },
    "apple": { name: "Apple 🍎", price: 100, amount: 1, category: "Food" },
    "sunsettia": { name: "Sunsettia 🍊", price: 100, amount: 1, category: "Food" },

    // --- MATERIAL TEMPA ---
    "iron": { name: "Iron Chunk 🪨", price: 500, amount: 1, category: "Material" },
    "crystal": { name: "Crystal Chunk 💎", price: 1500, amount: 1, category: "Material" }
};

export default {
  command: ["shop", "toko", "buy", "beli"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,
    code: async (m, { text, reply, command }) => {
        const { db, user } = getUser(m.sender, m.pushName);

        if (command === "shop" || command === "toko" || !text) {
            let menu = `🏪 *MONDSTADT GENERAL GOODS* 🏪\n`;
            menu += `💰 Mora: *${user.mora.toLocaleString()}*\n`;
            menu += `━━━━━━━━━━━━━━━━━━━━\n`;

            const categories = ["Special", "Cooking", "Food", "Material"];
            categories.forEach(cat => {
                menu += `\n✨ *[ ${cat.toUpperCase()} ]*\n`;
                for (let id in SHOP_ITEMS) {
                    if (SHOP_ITEMS[id].category === cat) {
                        menu += `• ${SHOP_ITEMS[id].name} - ${SHOP_ITEMS[id].price} Mora\n  _ID: ${id}_\n`;
                    }
                }
            });

            menu += `\n━━━━━━━━━━━━━━━━━━━━\n`;
            menu += `👉 Cara beli: *.buy [id] [jumlah]*\nContoh: *.buy milk 10*`;
            return reply(menu);
        }

        const args = text.split(" ");
        const itemId = args[0].toLowerCase();
        const amount = parseInt(args[1]) || 1;
        const item = SHOP_ITEMS[itemId];

        if (!item || amount < 1) return reply("❌ Item tidak valid atau jumlah salah.");
        
        const totalCost = item.price * amount;
        if (user.mora < totalCost) return reply(`❌ Mora tidak cukup! Butuh ${totalCost.toLocaleString()} Mora.`);

        user.mora -= totalCost;

        if (itemId === "primogems") user.primogems += (item.amount * amount);
        else {
            if (!user.inventory.materials[itemId]) user.inventory.materials[itemId] = 0;
            user.inventory.materials[itemId] += (item.amount * amount);
        }

        save(db);
        reply(`✅ Berhasil membeli *${amount}x ${item.name}*\n💰 Sisa Mora: ${user.mora.toLocaleString()}`);
    }
};
