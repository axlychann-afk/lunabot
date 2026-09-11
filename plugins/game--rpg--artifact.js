import {
    getUser
} from "../lib/rpg/database.js";
import {
    artifacts
} from "../lib/rpg/artifacts.js";

export default {
    command: ["artifact", "artefak", "art"],
    group: false,
    limit: false,
    premium: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (m, {
        reply
    }) => {
        const {
            user
        } = getUser(m.sender, m.pushName);
        const myArts = user.inventory.artifacts;

        if (!myArts || myArts.length === 0) return reply("❌ Kamu tidak memiliki artifact.");

        let txt = `🎭 *YOUR ARTIFACT LIST* 🎭\n`;
        txt += `Total: ${myArts.length} Set\n`;
        txt += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        myArts.forEach((art, i) => {
            const id = art.name;
            const setCount = art.set;

            let data = null;
            for (let tier in artifacts) {
                if (artifacts[tier][id]) {
                    data = artifacts[tier][id];
                    break;
                }
            }

            const active = user.build.artifactSet === id ? " ✅ *(Equipped)*" : "";
            const name = data?.name || id.replace(/_/g, ' ').toUpperCase();

            txt += `${i + 1}. *${name}*\n`;
            txt += `   └ Bonus ${setCount}-Pc: _${data?.two_piece || "Unknown"}_${active}\n`;
        });

        txt += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        reply(txt);
    }
};