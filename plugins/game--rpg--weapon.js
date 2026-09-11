import { getUser } from "../lib/rpg/database.js";
import { weapons } from "../lib/rpg/weapon.js";

export default {
    command: ["weapon", "senjata", "wep"],
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
        const myWps = user.inventory.weapons;

        if (!myWps || myWps.length === 0) {
            return reply("❌ Tas senjatamu kosong.");
        }

        const weaponIcons = {
            sword: "🗡️",
            bow: "🏹",
            claymore: "⚔️",
            polearm: "🔱",
            catalyst: "📖"
        };

        let txt = `🗡️ *YOUR WEAPON LIST* 🗡️\n`;
        txt += `Total: ${myWps.length} Senjata\n`;
        txt += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        myWps.forEach((id, i) => {
            let data = null;
            let type = null;

            for (let cat in weapons) {
                if (weapons[cat][id]) {
                    data = weapons[cat][id];
                    type = cat;
                    break;
                }
            }

            if (!data) {
                txt += `${i + 1}. *${id.replace(/_/g, " ").toUpperCase()}*\n`;
                txt += `   └ ❌ Data tidak ditemukan\n\n`;
                return;
            }

            const active = user.build.weapon === id
                ? " ✅ *(Equipped)*"
                : "";

            const name = data.name || id.replace(/_/g, " ").toUpperCase();

            txt += `${i + 1}. *${name}*${active}\n`;
            txt += `   └ ${weaponIcons[type] || "❔"} Type: *${type.toUpperCase()}*\n`;
            txt += `   └ ⚔️ Base ATK: *${data.base_atk || 0}*\n`;
            txt += `   └ ⭐ Rarity: ${"⭐".repeat(data.star || 3)}\n`;

            if (data.sub_stat) {
                txt += `   └ 📊 ${data.sub_stat.toUpperCase()}: *${data.sub_value}*\n`;
            }

            txt += `\n`;
        });

        txt += `━━━━━━━━━━━━━━━━━━━━`;

        reply(txt);
    }
};