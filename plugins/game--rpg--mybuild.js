import { getUser } from "../lib/rpg/database.js";
import { calculateDamage } from "../lib/rpg/battle.js";
import { characters } from "../lib/rpg/character.js";
import { weapons } from "../lib/rpg/weapon.js";
import { artifacts } from "../lib/rpg/artifacts.js";

export default {
    command: ["mybuild", "build", "cekbuild"],
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
        const { user } = getUser(m.sender, m.pushName);
        
        const charId = user.build.activeChar;
        const char = characters[charId];
        
        const charName = char?.name || charId.replace(/_/g, ' ').toUpperCase();

        if (!char) return reply(`❌ Karakter *${charId}* tidak ditemukan.`);

        let wpData = null;
        for (let cat in weapons) {
            if (weapons[cat][user.build.weapon]) {
                wpData = weapons[cat][user.build.weapon];
                break;
            }
        }

        let artData = null;
        let artName = "Unknown Artifact";
        const targetArt = (user.build.artifactSet || "").toLowerCase();

        for (let tier in artifacts) {
            const tierData = artifacts[tier];
            const foundKey = Object.keys(tierData).find(k => k.toLowerCase() === targetArt);
            if (foundKey) {
                artData = tierData[foundKey];
                artName = artData.name || foundKey.replace(/_/g, ' ').toUpperCase();
                break;
            }
        }

        const dmg = calculateDamage(user.build);

        let teks = `🛠️ *CURRENT BUILD: ${user.name.toUpperCase()}* 🛠️\n`;
        teks += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        teks += `👤 *Character:* ${charName} (${char.elemental.toUpperCase()})\n`;
        teks += `🌟 Star: ${"⭐".repeat(char.star)}\n`;
        teks += `⚔️ Type: ${char.type.replace(/_/g, ' ').toUpperCase()}\n\n`;

        if (wpData) {
            teks += `🗡️ *Weapon:* ${wpData.name}\n`;
            teks += `🔹 Base ATK: +${wpData.base_atk}\n`;
            teks += `🔹 Sub: ${wpData.sub_stat?.toUpperCase() || "NONE"} (${wpData.sub_value || "0"})\n\n`;
        } else {
            teks += `🗡️ *Weapon:* ⚠️ ${user.build.weapon}\n\n`;
        }

        if (artData) {
            teks += `🎭 *Artifact:* ${artName}\n`;
            teks += `✨ Set: ${user.build.artifactCount || 0}/4\n`;
            teks += `🎁 2-Pc: _${artData.two_piece || "-"}_\n`;
            if ((user.build.artifactCount || 0) >= 4) {
                teks += `🎁 4-Pc: _${artData.four_piece || "-"}_\n`;
            } else {
                teks += `❌ _4-Piece bonus inactive_\n`;
            }
        } else {
            teks += `🎭 *Artifact:* ⚠️ ${user.build.artifactSet || "None"}\n`;
        }

        teks += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        teks += `📊 *FINAL CALCULATION*\n`;
        teks += `💥 Final ATK: *${dmg.total}*\n`;
        teks += `🔥 Element: *${dmg.element.toUpperCase()}*\n`;
        teks += `🎯 Crit Status: *${dmg.isCrit ? "CRITICAL 🔥" : "NORMAL"}*\n`;
        teks += `━━━━━━━━━━━━━━━━━━━━`;

        reply(teks);
    }
};