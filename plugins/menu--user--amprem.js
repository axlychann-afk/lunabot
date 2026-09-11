import fs from "fs";
import path from "path";
import axios from "axios";

const API_BASE = "https://api.ryuu-dev.my.id";

const DB_DIR = "database";
const DB_FILE = path.join(DB_DIR, "amprem.json");

function ensureDB() {
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, "{}");
    }
}

function readDB() {
    ensureDB();

    try {
        return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch {
        return {};
    }
}

function writeDB(data) {
    ensureDB();

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(data, null, 2)
    );
}

async function sendLink(email) {
    const { data } = await axios.get(
        `${API_BASE}/discovery/am-prem/activate`,
        {
            params: { email },
            headers: {
                "x-ryuu-apikey": global.ryuukey
            },
            timeout: 30000
        }
    );

    return data;
}

async function verifyLink(email, link) {
    const { data } = await axios.get(
        `${API_BASE}/discovery/am-prem/verify`,
        {
            params: { email, "verify-link": link },
            headers: {
                "x-ryuu-apikey": global.ryuukey
            },
            timeout: 30000
        }
    );

    return data;
}

export default {
    command: ["amprem"],
    group: false,
    premium: true,
    limit: true,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, { text, reply, prefix }) => {
        try {
            if (!text) {
                return reply(
                    `Penggunaan:\n\n` +
                    `• ${prefix}amprem --register <email>\n` +
                    `• ${prefix}amprem --verify <link>`
                );
            }

            const registerMatch = text.match(
                /^--register\s+([^\s]+)$/i
            );

            const verifyMatch = text.match(
                /^--verify\s+(\S+)$/i
            );

            if (registerMatch) {
                const email = registerMatch[1].trim();

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    return reply(
                        "Format email tidak valid."
                    );
                }

                await reply(global.mess.wait);

                const data = await sendLink(email);

                const db = readDB();

                db[m.sender] = {
                    email,
                    registeredAt: Date.now()
                };

                writeDB(db);

                return reply(
                    `✅ *Register berhasil*\n\n` +
                    `📧 Email: ${email}\n\n` +
                    `${data.result?.message || "Silakan cek email tersebut untuk mendapatkan link verifikasi."}\n\n` +
                    `Setelah mendapatkan link, gunakan:\n` +
                    `*${prefix}amprem --verify <link>*`
                );
            }

            if (verifyMatch) {
                const link = verifyMatch[1].trim();

                const db = readDB();
                const user = db[m.sender];

                if (!user?.email) {
                    return reply(
                        `❌ Kamu belum melakukan register.\n\n` +
                        `Gunakan:\n` +
                        `*${prefix}amprem --register <email>*`
                    );
                }

                await reply(global.mess.wait);

                const data = await verifyLink(
                    user.email,
                    link
                );

                const d = data.result?.data;
                const info = d || {};

                return reply(
                    `✅ *Verify selesai*\n\n` +
                    `📧 Email: ${info.email || user.email}\n` +
                    `🆔 UID: ${info.uid || "-"}\n` +
                    `📊 Status: ${info.membershipStatus || info.status || "-"}\n` +
                    `🏷️ Plan: ${info.planName || "-"}\n` +
                    `📅 Berlaku hingga: ${info.validUntil || "-"}\n` +
                    `🧾 Order ID: ${info.orderId || "-"}\n\n` +
                    `${data.result?.message || "Verification selesai."}`
                );
            }

            return reply(
                `❌ Format command salah.\n\n` +
                `Contoh:\n` +
                `*${prefix}amprem --register email@gmail.com*\n` +
                `*${prefix}amprem --verify https://example.com/*`
            );

        } catch (err) {
            console.error("AMPREM ERROR:", err);

            const apiMsg =
                err.response?.data?.message ||
                err.response?.data?.result?.message ||
                err.message;

            return reply(
                `❌ Terjadi error:\n\n` +
                `${apiMsg}`
            );
        }
    }
};