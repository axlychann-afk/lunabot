import fs from 'fs';
import path from 'path';

const dbpath = path.join(process.cwd(), 'database', 'rpg.json');

// Pastikan folder dan file inisialisasi awal benar sebagai Object {}
if (!fs.existsSync(path.join(process.cwd(), 'database'))) {
    fs.mkdirSync(path.join(process.cwd(), 'database'), {
        recursive: true
    });
}

if (!fs.existsSync(dbpath) || fs.readFileSync(dbpath, 'utf-8').trim() === "[]") {
    fs.writeFileSync(dbpath, JSON.stringify({}, null, 2));
}

/**
 * Fungsi untuk mendapatkan data user atau membuat baru jika belum ada
 */
export function getUser(userId, name = "Traveler") {
    const dbPath = path.join(process.cwd(), 'database', 'rpg.json');
    let data = {};
    try {
        const content = fs.readFileSync(dbPath, 'utf-8');
        data = JSON.parse(content);
        if (Array.isArray(data)) data = {};
    } catch (e) {
        data = {};
    }

    if (!data[userId]) {
        data[userId] = {
            userId: userId,
            name: name,
            mora: 1000,
            primogems: 160,
            inventory: {
                characters: ["amber"],
                weapons: ["slingshot"],
                artifacts: [{
                    name: "adventurer",
                    set: 4
                }],
                materials: {}
            },
            build: {
                activeChar: "amber",
                weapon: "slingshot",
                artifactSet: "adventurer",
                artifactCount: 2
            },
            stats: {
                level: 1,
                exp: 0,
                lastClaim: 0
            }
        };

        // Langsung tulis ke file (Push Permanen)
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        console.log(`[RPG DB] User baru berhasil dipush: ${userId}`);
    }

    return {
        db: data,
        user: data[userId]
    };
}

/**
 * Fungsi untuk menyimpan perubahan
 */
export function save(currentData) {
    const dbPath = path.join(process.cwd(), 'database', 'rpg.json');
    try {
        // Pastikan yang disimpan adalah object utuh (db), bukan hanya data satu user
        if (currentData) {
            fs.writeFileSync(dbPath, JSON.stringify(currentData, null, 2));
            return true;
        }
    } catch (e) {
        console.error("Gagal menyimpan database RPG:", e);
        return false;
    }
}