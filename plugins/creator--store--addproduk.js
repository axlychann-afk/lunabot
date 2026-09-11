import {
    generateProductId,
    saveProducts,
    getProducts,
    downloadMedia
} from '../lib/store-manage.js';
import fs from 'fs';
import path from 'path';

export default {
    command: ["addproduk"],
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
        try {
            if (!text) return reply(`Format salah!\nContoh:\n.addproduk <thumbnail> | <judul> | <deskripsi> | <harga> | <path>\n\nAtau balas/kirim file ZIP dengan caption:\n.addproduk <thumbnail> | <judul> | <deskripsi> | <harga>`);

            const args = text.split('|').map(v => v.trim());
            if (args.length < 4) return reply("Argumen tidak lengkap! Pastikan menggunakan pemisah |");

            const [thumbnail, title, description, price, manualPath] = args;
            const numPrice = parseInt(price);
            if (isNaN(numPrice)) return reply("Harga harus berupa angka!");

            let produkPath = manualPath || null;
            const id = generateProductId();

            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || '';

            if (mime) {
                const type = mime.includes('document') ? 'document' : mime.includes('zip') ? 'document' : null;
                if (type) {
                    const mediaMsg = q.msg || q;
                    const buffer = await downloadMedia(mediaMsg, type);
                    produkPath = `database/media/item-${id}.zip`;
                    fs.writeFileSync(path.resolve(produkPath), buffer);
                }
            }

            const newProduct = {
                id,
                thumbnail,
                title,
                description,
                price: numPrice,
                path: produkPath
            };

            const products = getProducts();
            products.push(newProduct);
            saveProducts(products);

            reply(`✅ Berhasil menambahkan produk!\n\nID: ${id}\nJudul: ${title}\nHarga: Rp${numPrice}\nTipe: ${produkPath ? 'Auto Delivery (File Tersimpan)' : 'Manual Delivery'}`);
        } catch (e) {
            reply(`❌ Terjadi kesalahan: ${e.message}`);
        }
    }
};