import {
    getSewaDb
} from '../lib/store-manage.js';

export default {
    command: ["ceksewa"],
    group: true,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (m, {
        reply
    }) => {
        const db = getSewaDb();
        const group = db.active.find(g => g.id === m.chat);

        if (!group) return reply("🤖 Bot di grup ini tidak berstatus sewa aktif / dimasukkan secara manual oleh owner.");

        const remainingMs = group.expiredAt - Date.now();
        if (remainingMs <= 0) return reply("⌛ Masa sewa grup ini sudah berakhir.");

        const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

        reply(`*📊 STATUS SEWA GRUP*\n\n⏳ *Sisa Waktu:* ${days} Hari ${hours} Jam\n📅 *Expired Pada:* ${new Date(group.expiredAt).toLocaleString('id-ID')}`);
    }
};