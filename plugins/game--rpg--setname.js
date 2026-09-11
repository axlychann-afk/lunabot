import { getUser, save } from "../lib/rpg/database.js";

export default {
    command: ["setname", "gantinama", "changename"],
    group: false,
    limit: false,
    premium: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, { text, reply }) => {
        const { db, user } = getUser(m.sender, m.pushName);

        // 1. Validasi Input
        if (!text) return reply("❌ Masukkan nama baru kamu!\nContoh: *.setname Aether Ganz*");
        
        if (text.length > 20) return reply("❌ Nama terlalu panjang! Maksimal 20 karakter.");
        if (text.length < 3) return reply("❌ Nama terlalu pendek! Minimal 3 karakter.");

        // 2. Simpan Nama Lama (untuk notifikasi)
        const oldName = user.name;
        const newName = text.trim();

        // 3. Update ke Database
        user.name = newName;
        
        // 4. Push Permanen ke rpg.json
        const success = save(db);

        if (success) {
            reply(`✅ *NAME UPDATED!*\n\n• Old: ${oldName}\n• New: *${newName}*\n\nSekarang semua orang akan mengenalmu sebagai ${newName}!`);
        } else {
            reply("❌ Gagal menyimpan nama baru ke database. Coba lagi nanti.");
        }
    }
};
