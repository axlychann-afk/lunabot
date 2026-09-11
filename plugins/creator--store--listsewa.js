import {
    getSewaDb
} from '../lib/store-manage.js';

export default {
    command: ["listsewa"],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: true,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (m, { RyuuBotz, reply }) => {
        const db = getSewaDb();
        if (db.active.length === 0) return reply("🛒 Tidak ada grup yang sedang menyewa bot.");

        let txt = `*📋 DAFTAR SEWA BOT AKTIF*\n\n`;
        let count = 1;
        let mentioned = []

        for (const g of db.active) {
            let groupName = "Grup Tidak Diketahui/Bot Keluar";
            try {
                const meta = await RyuuBotz.groupMetadata(g.id);
                groupName = meta.subject;
                mentioned.push(g.buyer);
            } catch {}

            const remainingMs = g.expiredAt - Date.now();
            const days = Math.max(0, Math.floor(remainingMs / (24 * 60 * 60 * 1000)));

            txt += `${count++}. *${groupName}*\n`;
            txt += `   ▪️ ID: \`${g.id}\`\n`;
            txt += `   ▪️ Buyer: @${g.buyer.split('@')[0]}\n`;
            txt += `   ▪️ Sisa: ${days} Hari\n`;
            txt += `   ▪️ Expired: ${new Date(g.expiredAt).toLocaleDateString('id-ID')}\n`;
            txt += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
        }

        reply(txt, mentioned);
    }
};
