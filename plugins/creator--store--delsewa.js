import {
    getSewaDb,
    saveSewaDb
} from '../lib/store-manage.js';

export default {
    command: ["delsewa"],
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
        if (!text) return reply("Masukkan ID grup yang ingin dihapus dari list sewa!\nContoh: .delsewa 120363123456@g.us");

        const targetId = text.trim();
        const db = getSewaDb();
        const index = db.active.findIndex(g => g.id === targetId);

        if (index === -1) return reply("❌ ID Grup tidak terdaftar dalam database sewa.");

        db.active.splice(index, 1);
        saveSewaDb(db);

        try {
            await RyuuBotz.sendMessage(targetId, {
                text: "🚫 Masa sewa grup ini telah dihentikan secara paksa oleh owner. Bot akan keluar."
            });
            await RyuuBotz.groupLeave(targetId);
        } catch (e) {
            console.log("Bot sudah tidak ada di grup atau gagal leave.");
        }

        reply(`✅ Berhasil menghapus sewa grup ${targetId} dan bot diperintahkan keluar.`);
    }
};