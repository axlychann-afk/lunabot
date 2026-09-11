import fs from 'fs';

export default {
    command: ["tugas"],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, { RyuuBotz, text, reply, command, usedPrefix }) => {
        const path = './database/notepad.js';
        if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ jadwal: {}, tugas: {} }, null, 2));

        let db = JSON.parse(fs.readFileSync(path));
        let args = text.split(' ');
        let action = args[0]?.toLowerCase();
        
        // Mengambil nama tugas dari argumen pertama setelah action, sisanya konten
        let taskName = text.split('|')[0].replace(action, '').trim();
        let content = text.split('|')[1]?.trim();

        switch (action) {
            case 'add':
                if (!taskName || !content) return reply(`❌ Format salah! Contoh: ${usedPrefix + command} add Projek Bot | Selesaikan fitur database`);
                db.tugas[taskName] = content;
                fs.writeFileSync(path, JSON.stringify(db, null, 2));
                reply(`✅ Tugas *${taskName}* berhasil disimpan.`);
                break;

            case 'cek':
                if (!taskName) return reply(`❌ Nama tugas apa?`);
                let res = db.tugas[taskName];
                reply(res ? `📝 *TUGAS: ${taskName}*\n\n${res}` : `❌ Tugas "${taskName}" tidak ditemukan.`);
                break;

            case 'delete':
                if (!taskName) return reply(`❌ Nama tugas apa?`);
                delete db.tugas[taskName];
                fs.writeFileSync(path, JSON.stringify(db, null, 2));
                reply(`🗑️ Tugas "${taskName}" berhasil dihapus.`);
                break;

            case 'list':
                let list = Object.entries(db.tugas).map(([k, v]) => `• *${k}*`).join('\n');
                reply(list ? `📝 *DAFTAR TUGAS*\n\n${list}\n\nGunakan .tugas cek <nama> untuk detail.` : "❌ Belum ada tugas tersimpan.");
                break;

            default:
                reply(`*––– [ TUGAS ] –––*\n\n.tugas add <nama> | <isi>\n.tugas cek <nama>\n.tugas delete <nama>\n.tugas list`);
        }
    }
};
