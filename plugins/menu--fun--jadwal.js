import fs from 'fs';

export default {
    command: ["jadwal"],
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
        let day = args[1]?.toLowerCase();
        let content = text.split('|')[1]?.trim();

        const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

        switch (action) {
            case 'add':
                if (!days.includes(day) || !content) return reply(`❌ Format salah! Contoh: ${usedPrefix + command} add senin | Upacara & MTK`);
                db.jadwal[day] = content;
                fs.writeFileSync(path, JSON.stringify(db, null, 2));
                reply(`✅ Jadwal hari *${day}* berhasil disimpan.`);
                break;

            case 'cek':
                if (!day) return reply(`❌ Hari apa? Contoh: ${usedPrefix + command} cek senin`);
                let info = db.jadwal[day];
                reply(info ? `📅 *Jadwal ${day.toUpperCase()}*\n\n${info}` : `❌ Jadwal untuk hari ${day} belum ada.`);
                break;

            case 'delete':
                if (!day) return reply(`❌ Hari apa?`);
                delete db.jadwal[day];
                fs.writeFileSync(path, JSON.stringify(db, null, 2));
                reply(`🗑️ Jadwal hari ${day} berhasil dihapus.`);
                break;

            case 'list':
                let list = Object.entries(db.jadwal).map(([k, v]) => `• *${k.toUpperCase()}*: ${v}`).join('\n');
                reply(list ? `📅 *DAFTAR JADWAL*\n\n${list}` : "❌ Belum ada jadwal tersimpan.");
                break;

            default:
                reply(`*––– [ JADWAL ] –––*\n\n.jadwal add <hari> | <teks>\n.jadwal cek <hari>\n.jadwal delete <hari>\n.jadwal list`);
        }
    }
};
