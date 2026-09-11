import {
    getSewaDb,
    saveSewaDb,
    parseInviteLink
} from '../lib/store-manage.js';

export default {
    command: ["addsewa"],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: true,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        text,
        reply
    }) => {
        if (!text) {
            return reply(
                "Format salah!\nContoh: .addsewa https://chat.whatsapp.com/xxx | 30"
            );
        }

        const args = text.split('|').map(v => v.trim());
        const linkGc = args[0];
        const hari = parseInt(args[1]);

        const inviteCode = parseInviteLink(linkGc);

        if (!inviteCode || isNaN(hari) || hari <= 0) {
            return reply("❌ Pastikan link valid dan hari berupa angka lebih dari 0.");
        }

        try {
            let targetGroupId;
            try {
                const inviteInfo = await RyuuBotz.groupGetInviteInfo(inviteCode);

                if (inviteInfo?.id) {
                    targetGroupId = inviteInfo.id;
                }
            } catch {}

            if (!targetGroupId) {
                try {
                    targetGroupId = await RyuuBotz.groupAcceptInvite(inviteCode);
                } catch (e) {
                    return reply(`❌ Gagal masuk ke grup: ${e.message}`);
                }
            }

            if (!targetGroupId) {
                return reply("❌ ID grup tidak ditemukan.");
            }

            const db = getSewaDb();
            const duration = hari * 24 * 60 * 60 * 1000;

            const index = db.active.findIndex(
                g => g.id === targetGroupId
            );

            if (index !== -1) {
                db.active[index].expiredAt += duration;
            } else {
                db.active.push({
                    id: targetGroupId,
                    buyer: m.sender,
                    expiredAt: Date.now() + duration
                });
            }

            saveSewaDb(db);

            await RyuuBotz.sendMessage(targetGroupId, {
                text: `🔔 Masa sewa bot telah ditambahkan oleh Owner selama ${hari} hari.`
            });

            return reply(
                `✅ Berhasil menambahkan durasi sewa grup selama ${hari} hari.`
            );

        } catch (e) {
            console.error(e);
            return reply(`❌ Error: ${e.message}`);
        }
    }
};