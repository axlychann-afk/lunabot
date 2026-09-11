import "../settings.js"

export default {
    command: ["tagadmin", "admin", "reportadmin"],
    group: true,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (m, { RyuuBotz, text, reply }) => {
        try {
            const groupMetadata = await RyuuBotz.groupMetadata(m.chat);
            const participants = groupMetadata.participants;

            const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

            if (admins.length === 0) {
                return reply("❌ Tidak dapat menemukan admin di grup ini.");
            }

            let txt = `*📢 PANGGILAN UNTUK ADMIN GRUP*\n\n`;
            if (text) {
                txt += `*Pesan dari User:* _${text}_\n\n`;
            }
            txt += `*List Admin:*\n`;

            const mentionedJid = [];
            admins.forEach((admin, index) => {
                txt += `${index + 1}. @${admin.id.split('@')[0]}\n`;
                mentionedJid.push(admin.id);
            });
            reply(txt, mentionedJid);

        } catch (e) {
            reply(`❌ Terjadi kesalahan: ${e.message}`);
            console.error(e);
        }
    }
};
