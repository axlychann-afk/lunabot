import { getUser, save } from "../lib/rpg/database.js";

// Konfigurasi Durasi & Multiplier Hadiah
const DURATIONS = {
    "4h":  { time: 14400000,  label: "4 Jam",  mult: 1 },
    "8h":  { time: 28800000,  label: "8 Jam",  mult: 2 },
    "12h": { time: 43200000,  label: "12 Jam", mult: 3 },
    "20h": { time: 72000000,  label: "20 Jam", mult: 5 }
};

// Konfigurasi Wilayah & Spesifik Hadiah
const REGIONS = {
    "mondstadt": { name: "Mondstadt (Whispering Woods)", reward: "Ore/Mineral", icon: "🕊️" },
    "liyue":     { name: "Liyue (Guili Plains)", reward: "Mora (Gold)", icon: "⚖️" },
    "inazuma":   { name: "Inazuma (Konda Village)", reward: "Food/Gems", icon: "⚡" },
    "sumeru":    { name: "Sumeru (Avidya Forest)", reward: "Fruit/EXP", icon: "🌱" },
    "fontaine":  { name: "Fontaine (Poisson)", reward: "Components/Mora", icon: "⚖️" },
    "natlan":    { name: "Natlan (Basin of Unnumbered Flames)", reward: "Artifact/Ore", icon: "🔥" }
};

export default {
  command: ["expedition", "ekspedisi", "claimexp", "cancelexp"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,
  
    code: async (m, { text, reply, command }) => {
        const { db, user } = getUser(m.sender, m.pushName);
        const now = Date.now();

        if (!user.stats.expedition) {
            user.stats.expedition = { status: false, end: 0, type: null, region: null };
        }

        // --- FITUR CANCEL ---
        if (command === "cancelexp" || text.toLowerCase() === "cancel") {
            if (!user.stats.expedition.status) return reply("❌ Kamu tidak sedang melakukan ekspedisi.");
            user.stats.expedition.status = false;
            user.stats.expedition.end = 0;
            save(db);
            return reply("⚠️ *EKSPEDISI DIBATALKAN!* \nKaraktermu kembali dengan tangan hampa.");
        }

        // --- FITUR CLAIM ---
        if (command === "claimexp") {
            if (!user.stats.expedition.status) return reply("❌ Tidak ada ekspedisi yang bisa diklaim.");
            
            if (now < user.stats.expedition.end) {
                let rem = user.stats.expedition.end - now;
                let h = Math.floor(rem / 3600000);
                let min = Math.floor((rem % 3600000) / 60000);
                return reply(`⏳ Ekspedisi belum selesai!\nSisa waktu: *${h}j ${min}m* lagi.`);
            }

            const { type, region } = user.stats.expedition;
            const mult = DURATIONS[type].mult;
            let rewards = { mora: 0, gems: 0, items: [] };

            // Logika Hadiah Berdasarkan Region
            switch (region) {
                case "mondstadt":
                    rewards.mora = 2500 * mult;
                    rewards.items.push(`💎 Crystal Chunk x${2 * mult}`);
                    break;
                case "liyue":
                    rewards.mora = 6000 * mult; // Paling banyak Mora
                    break;
                case "inazuma":
                    rewards.mora = 2000 * mult;
                    rewards.gems = 15 * mult;
                    rewards.items.push(`🍱 Sweet Madame x${1 * mult}`);
                    break;
                case "sumeru":
                    rewards.mora = 3000 * mult;
                    rewards.items.push(`🍄 Sumeru Rose x${3 * mult}`);
                    rewards.items.push(`📔 Hero's Wit x${1 * mult}`);
                    break;
                case "fontaine":
                    rewards.mora = 4500 * mult;
                    rewards.items.push(`🔧 Clockwork Component x${2 * mult}`);
                    break;
                case "natlan":
                    rewards.mora = 3000 * mult;
                    rewards.items.push(`🌋 Ignited Stone x${2 * mult}`);
                    if (Math.random() > 0.7) rewards.items.push(`🎭 4* Artifact Piece`);
                    break;
            }

            user.mora += rewards.mora;
            user.primogems += (rewards.gems || 0);
            user.stats.expedition.status = false;

            let res = `🎊 *AD ASTRA ABOSSOQUE!* 🎊\n`;
            res += `━━━━━━━━━━━━━━━━━━━━\n`;
            res += `📍 Lokasi: ${REGIONS[region].name}\n`;
            res += `💰 Mora: +${rewards.mora.toLocaleString()}\n`;
            if (rewards.gems > 0) res += `💎 Primogems: +${rewards.gems}\n`;
            if (rewards.items.length > 0) res += `🎁 Item: ${rewards.items.join(", ")}\n`;
            res += `━━━━━━━━━━━━━━━━━━━━\n`;
            res += `Terima kasih telah membantu Adventurers' Guild!`;

            save(db);
            return reply(res);
        }

        // --- FITUR START & MENU ---
        if (user.stats.expedition.status) {
            return reply("❌ Karaktermu sedang bertugas! Gunakan *.claimexp* setelah selesai.");
        }

        const args = text.split(" ");
        const regionInput = args[0]?.toLowerCase();
        const durationInput = args[1]?.toLowerCase();

        if (!REGIONS[regionInput] || !DURATIONS[durationInput]) {
            let menu = `✨ *ADVENTURERS' GUILD EXPEDITION* ✨\n\n`;
            menu += `Pilih Wilayah dan Durasi untuk mengirim karakter!\n\n`;
            menu += `📍 *WILAYAH (Region):*\n`;
            for (let r in REGIONS) {
                menu += `• *${r}* - ${REGIONS[r].reward} ${REGIONS[r].icon}\n`;
            }
            menu += `\n🕒 *DURASI:* \n`;
            for (let d in DURATIONS) {
                menu += `• *${d}* (${DURATIONS[d].label})\n`;
            }
            menu += `\n📝 *Contoh:* \`.expedition fontaine 20h\`\n`;
            menu += `❌ *Cancel:* \`.cancelexp\`\n`;
            menu += `*Claim:* \`.claimexp\``;
            return reply(menu);
        }

        // Set Data Ekspedisi
        user.stats.expedition = {
            status: true,
            type: durationInput,
            region: regionInput,
            end: now + DURATIONS[durationInput].time
        };

        save(db);
        reply(`🚀 *Ekspedisi Dimulai!*\n\n📍 Lokasi: ${REGIONS[regionInput].name}\n🕒 Durasi: ${DURATIONS[durationInput].label}\n\nKaraktermu akan kembali pada:\n${new Date(user.stats.expedition.end).toLocaleString()}`);
    }
};
