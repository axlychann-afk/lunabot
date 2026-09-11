import fs from "fs";
import "../settings.js";

const DB_PATH = "./database/blacklist.json";

function loadBlacklist() {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"))
        .filter(v => typeof v === "string")
        .map(v => v.trim());
}

function saveBlacklist(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export default {
    command: ["blacklist", "bl"],
    group: true,
    premium: false,
    limit: false,
    admin: false,
    creator: true,
    botAdmin: true,
    privates: false,
    usePrefix: true,

    code: async (m, {
        RyuuBotz,
        args,
        reply,
        prefix
    }) => {

        let blacklist = loadBlacklist();

        if (!args[0]) {
            return reply(
                `Penggunaan:
${prefix}blacklist add (reply/nomor)
${prefix}blacklist delete nomor
${prefix}blacklist list
${prefix}blacklist clear`
            );
        }

        const subcmd = args[0].toLowerCase();
        let rawTarget;

        // ===== LIST =====
        if (subcmd === "list") {
            if (!blacklist.length) {
                return reply(`Blacklist masih kosong, sayang`);
            }

            return reply(
                `📛 *BLACKLIST*
${blacklist.map((v, i) => `${i + 1}. @${v.split("@")[0]}`).join("\n")}`
            , blacklist);
        }

        // ===== CLEAR (AMAN & SENGAJA) =====
        if (subcmd === "clear") {
            if (!blacklist.length) {
                return reply(`Blacklist sudah`);
            }

            saveBlacklist([]);
            return reply(`Blacklist berhasil dikosongkan`);
        }

        // ===== ambil target =====
        if (subcmd === "add" && m.quoted?.fakeObj?.participant) {
            rawTarget = m.quoted.fakeObj.participant;
        } else if (args[1]) {
            rawTarget = args[1].replace(/[^0-9]/g, "") + "@lid";
        } else {
            return reply(`Kamu harus reply chat atau kasih nomor yang valid, sayang~`);
        }

        let target = rawTarget.trim();

        // ===== convert PN ke LID =====
        if (/@s\.whatsapp\.net$/i.test(target)) {
            try {
                const lid = await RyuuBotz.getLidFromPN(m.chat, target);
                if (!lid) return reply(`Nomornya gak bisa dikonversi ke LID`);
                target = lid.trim();
            } catch (e) {
                return reply(`Gagal convert ke LID 😢\n${e.message}`);
            }
        }

        // ===== ADD =====
        if (subcmd === "add") {
            if (parseInt(target) === parseInt(RyuuBotz.user.lid.split(":")[0])) {
                reply("*Ga bisa blacklist aku dong*✨🎉");
                return;
            }
            if (blacklist.includes(target)) {
                return reply(`Nomor ini sudah ada di blacklist`);
            }

            blacklist.push(target);
            saveBlacklist(blacklist);

            return reply(`Berhasil ditambahkan ke blacklist 💔\n@${target.split("@")[0]}`, [target]);
        }

        // ===== DELETE =====
        if (subcmd === "delete") {
            const before = blacklist.length;

            blacklist = blacklist.filter(v => v !== target);

            if (blacklist.length === before) {
                return reply(`Nomornya tidak ditemukan di blacklist`);
            }

            saveBlacklist(blacklist);
            return reply(`Berhasil dihapus dari blacklist \n@${target.split("@")[0]}`, [target]);
        }

        return reply(`Subcommand tidak dikenal, sayang~`);
    }
};