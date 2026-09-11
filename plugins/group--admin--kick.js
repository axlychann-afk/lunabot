import fs from "fs";
import "../settings.js";

export default {
    command: ["kick", "duar", "dor"],
    group: true,
    premium: false,
    limit: false,
    admin: true,
    creator: false,
    botAdmin: true,
    privates: false,
    usePrefix: true,

    code: async (m, {
        RyuuBotz,
        text,
        reply,
        mess,
        groupAdmins,
        isCreator
    }) => {


        let users;
        if (m.mentionedJid.length > 0) {
            users = m.mentionedJid[0];
        } else if (m.quoted) {
            users = m.quoted.sender;
        } else if (text) {
            let number = text.replace(/[^0-9]/g, "");
            if (number.length < 5) return reply("Nomor tidak valid!");
            users = number + "@lid";
        } else {
            return reply("Silakan tag, reply pesan, atau masukkan nomor yang ingin dikick!");
        }
        if (users.split("@")[0] === RyuuBotz.user.lid.split(":")[0] || users.split("@")[0] === global.ownernumber || users.split("@")[0] === global.lidownernumber) {
            if (isCreator) {
                reply("*Gaboleh gitu sayang, dia admin* 💕")
            } else if (!isCreator) {
                reply("*Ga bisa wleee :P*");
            }
            return;
        }

        if (groupAdmins.includes(users)) {
            if (isCreator) {
                reply("*Gaboleh gitu sayang, dia admin* 💕")
            } else if (!isCreator) {
                reply(`*Sesama admin ga boleh gitu :P*`);
            }
            return;
        }
        const quoted = m?.quoted?.fakeObj ? m?.quoted?.fakeObj : m

        try {
            await RyuuBotz.sendMessage(
                m.chat, {
                    sticker: fs.readFileSync("./database/sticker/kick.webp"),
                }, {
                    quoted
                }
            );

            await RyuuBotz.groupParticipantsUpdate(m.chat, [users], "remove");
            await reply(`✅ Sukses mengeluarkan @${users.split("@")[0]}`, [users]);

        } catch (e) {
            console.error(e);
            reply("❌ Gagal mengeluarkan anggota. Mungkin karena bot bukan admin atau mencoba mengeluarkan sesama admin.");
        }

    }
};