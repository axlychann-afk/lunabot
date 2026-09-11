import "../settings.js";
import cron from "node-cron";
import fs from 'fs';
import path from "path";

const userDBPath = "./database/user.json";
function resetClaimedDaily() {
  let data = JSON.parse(fs.readFileSync(userDBPath));
  
  data = data.map(u => ({
    ...u,
    claimed: false
  }));

  fs.writeFileSync(userDBPath, JSON.stringify(data, null, 2));
  console.log("Reset claimed selesai (00:00).");
}

const jadibotDir = path.join('database', 'jadibot');
const loggerDir = path.join('database', 'logger');

const syncLogsWithFolders = () => {
    try {
        if (!fs.existsSync(jadibotDir) || !fs.existsSync(loggerDir)) return;

        const folders = fs.readdirSync(jadibotDir);
        
        const activeNumbers = folders.map(folder => {
            const match = folder.match(/^(\d+)/);
            return match ? match[1] : null;
        }).filter(Boolean);

        const logFiles = fs.readdirSync(loggerDir).filter(file => file.endsWith('.log'));

        logFiles.forEach(file => {
            const logMatch = file.match(/bot-(\d+)\.log/);
            if (logMatch) {
                const logNumber = logMatch[1];
                if (global.nomorbot === logNumber) return;

                if (!activeNumbers.includes(logNumber)) {
                    const filePath = path.join(loggerDir, file);
                    fs.unlinkSync(filePath);
                    console.log(`[Sync] Menghapus log unsync: ${file} karena folder jadibot tidak ditemukan.`);
                }
            }
        });
    } catch (error) {
        console.error('[Sync Error]:', error.message);
    }
};

cron.schedule('* * * * * *', () => {
    syncLogsWithFolders();
});
cron.schedule("0 0 * * *", () => {
  resetClaimedDaily();
});