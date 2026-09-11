import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Jimp } from 'jimp';
import jsQR from 'jsqr';
import { downloadContentFromMessage } from '@ryuu-reinzz/baileys';
import { qrisdynamicgenerator, qrisimagegenerator } from '@misterdevs/qris-static-to-dynamic';

const dbPath = path.resolve('./database/store.json');
const tmpPath = path.resolve('./database/tmp');
const mediaPath = path.resolve('./database/media');

export const initStore = () => {
    if (!fs.existsSync('./database')) fs.mkdirSync('./database');
    if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);
    if (!fs.existsSync(mediaPath)) fs.mkdirSync(mediaPath);
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ products: [] }, null, 2));
};

export const getProducts = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8')).products;
export const saveProducts = (products) => fs.writeFileSync(dbPath, JSON.stringify({ products }, null, 2));
export const generateProductId = () => {
    const products = getProducts();
    const lastId = products.length > 0 ? parseInt(products[products.length - 1].id.replace('P', '')) : 0;
    return `P${String(lastId + 1).padStart(3, '0')}`;
};

export const getTransaction = (id) => {
    const file = path.join(tmpPath, `transaction-${id}.json`);
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : null;
};
export const saveTransaction = (tx) => {
    fs.writeFileSync(path.join(tmpPath, `transaction-${tx.id}.json`), JSON.stringify(tx, null, 2));
};
export const generateTxId = () => Math.floor(1000 + Math.random() * 9000).toString();
export const getAllPendingTransactions = () => {
    return fs.readdirSync(tmpPath)
        .filter(f => f.startsWith('transaction-') && f.endsWith('.json'))
        .map(f => JSON.parse(fs.readFileSync(path.join(tmpPath, f), 'utf-8')));
};

export const extractQrisString = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const image = await Jimp.read(response.data);
        const qrCode = jsQR(new Uint8ClampedArray(image.bitmap.data), image.bitmap.width, image.bitmap.height);
        if (!qrCode) throw new Error("Gagal membaca QR dari gambar. Pastikan gambar QRIS jelas.");
        return qrCode.data;
    } catch (e) {
        throw new Error(e.message);
    }
};
export const generateDynamicQris = async (qrisStatic, nominal) => {
    try {
        const qrisDynamicStr = qrisdynamicgenerator(qrisStatic, parseInt(nominal));
        const qrDataUrl = await qrisimagegenerator(qrisDynamicStr, 2, 6);
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
        return Buffer.from(base64Data, 'base64');
    } catch (e) {
        throw new Error("Gagal memproses generator QRIS: " + e.message);
    }
};

export const downloadMedia = async (message, type) => {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
};
const sewaPath = path.resolve('./database/sewa.json');

export const initSewa = () => {
    if (!fs.existsSync(sewaPath)) {
        fs.writeFileSync(sewaPath, JSON.stringify({ active: [] }, null, 2));
    }
};

export const getSewaDb = () => JSON.parse(fs.readFileSync(sewaPath, 'utf-8'));
export const saveSewaDb = (data) => fs.writeFileSync(sewaPath, JSON.stringify(data, null, 2));

export const parseInviteLink = (link) => {
    const regex = /chat\.whatsapp\.com\/([a-zA-Z0-9]{22})/;
    const match = link.match(regex);
    return match ? match[1] : null;
};

export const checkExpiredSewa = async (RyuuBotz) => {
    const db = getSewaDb();
    const now = Date.now();
    const remaining = [];

    for (const group of db.active) {
        if (now > group.expiredAt) {
            try {
                await RyuuBotz.sendMessage(group.id, { text: "🚨 Masa sewa bot di grup ini telah habis. Bot akan keluar otomatis. Terima kasih!" });
                await RyuuBotz.groupLeave(group.id);
            } catch (e) {
                console.error(`Gagal keluar dari grup ${group.id}:`, e);
            }
        } else {
            remaining.push(group);
        }
    }
    db.active = remaining;
    saveSewaDb(db);
};

initSewa();
initStore();
