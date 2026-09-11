import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
    constructor() {
        this.watcher = null;
    }

    add(filePath, message) {
        const fullPath = path.resolve(filePath);
        const dir = path.dirname(fullPath);
        const timestamp = new Date().toLocaleString('id-ID');
        const logEntry = `[${timestamp}] ${message}\n`;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.appendFileSync(fullPath, logEntry);
    }

    view(filePath) {
        const fullPath = path.resolve(filePath);

        if (!fs.existsSync(fullPath)) {
            console.log(`\x1b[31m[ERROR]\x1b[0m File ${filePath} tidak ditemukan.`);
            return;
        }

        if (this.watcher) {
            this.watcher.close();
        }

        console.clear();
        console.log(`\x1b[36m=== MONITORING: ${path.basename(fullPath)} ===\x1b[0m`);
        console.log(`\x1b[90m(Ketik .logger stop di WA untuk berhenti)\x1b[0m\n`);

        let fileSize = fs.statSync(fullPath).size;

        this.watcher = fs.watch(fullPath, (eventType) => {
            if (eventType === 'change') {
                const newSize = fs.statSync(fullPath).size;
                const sizeDiff = newSize - fileSize;

                if (sizeDiff > 0) {
                    const buffer = Buffer.alloc(sizeDiff);
                    const fd = fs.openSync(fullPath, 'r');
                    fs.readSync(fd, buffer, 0, sizeDiff, fileSize);
                    fs.closeSync(fd);

                    process.stdout.write(buffer.toString());
                    fileSize = newSize;
                }
            }
        });
    }

    stop() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            console.clear();
            console.log(`\x1b[33m[SYSTEM]\x1b[0m Monitoring dihentikan. Terminal kembali ke mode normal.`);
        } else {
            console.log(`\x1b[31m[ERROR]\x1b[0m Tidak ada monitoring yang sedang berjalan.`);
        }
    }

    delete(filePath) {
        const fullPath = path.resolve(filePath);

        if (fs.existsSync(fullPath)) {
            if (this.watcher) {
                this.watcher.close();
                this.watcher = null;
            }
            fs.unlinkSync(fullPath);
            console.log(`\x1b[33m[SYSTEM]\x1b[0m File ${filePath} berhasil dihapus.`);
        } else {
            console.log(`\x1b[31m[ERROR]\x1b[0m File tidak ditemukan.`);
        }
    }
}

const logger = new Logger();
export default logger;
