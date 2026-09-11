import {
    getUser,
    save
} from "../lib/rpg/database.js";
import {
    calculateDamage
} from "../lib/rpg/battle.js";
import fs from "fs";
import "../settings.js";

export default {
    command: ["profile", "me", "myprofile"],
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
        text,
        RyuuBotz,
        reply,
        isPremium,
        checkName
    }) => {
        const regPath = "./database/registered.json";
        const userPath = "./database/user.json";

        if (!fs.existsSync("./database")) fs.mkdirSync("./database");
        if (!fs.existsSync(regPath)) fs.writeFileSync(regPath, "[]");
        if (!fs.existsSync(userPath)) fs.writeFileSync(userPath, "[]");

        let registered = JSON.parse(fs.readFileSync(regPath));
        let userDB = JSON.parse(fs.readFileSync(userPath));

        let u = registered.find(x => x.id === m.sender);
        let ud = userDB.find(x => x.userid === m.sender);

        if (!u) {
            u = {
                id: m.sender,
                name: m.pushName,
                serial: Math.floor(Math.random() * 1000000).toString(),
                limit: 20
            };
            registered.push(u);
            fs.writeFileSync(regPath, JSON.stringify(registered, null, 2));
        }

        if (!ud) {
            ud = {
                userid: m.sender,
                money: 0,
                level: 1,
                experience: 0,
                claimed: false
            };
            userDB.push(ud);
            fs.writeFileSync(userPath, JSON.stringify(userDB, null, 2));
        }

        const {
            user,
            db
        } = getUser(m.sender, m.pushName);

        if (!user.build || !user.build.activeChar || user.build.activeChar === "") {
            user.build = {
                activeChar: "amber",
                weapon: "apprentices_notes",
                artifactSet: "adventurer",
                artifactCount: 2
            };
            save(db);
        }

        const dmg = calculateDamage(user.build);

        const createBar = (current, max) => {
            let size = 10;
            let percent = Math.max(0, Math.min(1, current / (max || 1)));
            let progress = Math.round(size * percent);
            let emptyProgress = size - progress;
            return `[${"■".repeat(progress)}${"□".repeat(emptyProgress)}] ${Math.round(percent * 100)}%`;
        };

        const timeout = (ms) => new Promise(resolve => setTimeout(() => resolve(null), ms));

        let thumb = await Promise.race([
            RyuuBotz.profilePictureUrl(m.sender, "image").catch(() => null),
            timeout(5000)
        ]);

        if (!thumb) thumb = global.thumbnail.main;

        let teks = `╭───〔 *TRAVELLER PROFILE* 〕───╼
│
├─〔 👤 *USER INFO* 〕
│ Name : ${user.name}
│ Serial : ${u.serial}
│ Premium : ${isPremium ? "✅ Yes" : "❌ No"}
│
├─〔 📊 *BOT PROGRESS* 〕
│ Limit : ${u.limit}
│ Money : ${ud.money}
│ Claim : ${ud.claimed ? "✅ Done" : "❌ Ready"}
│ Exp : ${createBar(user.stats.exp % 1000, 1000)}
│
├─〔 🪙 *RESOURCES* 〕
│ Mora : 🪙 ${user.mora.toLocaleString()}
│ Primogems : ✨ ${user.primogems.toLocaleString()}
│
├─〔 ⚔️ *COMBAT STATS* 〕
│ Character : ${user.build.activeChar.replace(/_/g, ' ').toUpperCase()}
│ Weapon : ${user.build.weapon.replace(/_/g, ' ').toUpperCase()}
│ Element : ${dmg.element.toUpperCase()}
│ Final ATK : 🔥 ${dmg.total}
│ Crit Status : ${dmg.isCrit ? "YES" : "NO"}
│
├─〔 🛡️ *EQUIPMENT* 〕
│ Artifact : ${user.build.artifactSet.replace(/_/g, ' ')}
│ Pieces : ${user.build.artifactCount} Set
│
╰──────────────────╼`;

        await RyuuBotz.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                mentionedJid: [m.sender],
                previewThumbnail: {
                    title: `Genshin RPG: ${user.name}`,
                    description: `Level: ${user.stats.level} | Primogems: ${user.primogems}`,
                    thumbnail: {
                        url: thumb
                    },
                    sourceUrl: "https://api.ryuu-dev.my.id",
                    largerThumbnail: true
                }
            }
        });
    }
};