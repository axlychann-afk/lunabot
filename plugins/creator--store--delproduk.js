import {
    getProducts,
    saveProducts
} from '../lib/store-manage.js';
import fs from 'fs';
import path from 'path';

export default {
    command: ["delproduk"],
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
        text,
        reply
    }) => {
        if (!text) return reply("Masukkan ID produk yang ingin dihapus!\nContoh: .delproduk P001");

        let products = getProducts();
        const index = products.findIndex(p => p.id === text.trim());

        if (index === -1) return reply("❌ Produk tidak ditemukan!");

        const product = products[index];

        if (product.path && fs.existsSync(path.resolve(product.path))) {
            fs.unlinkSync(path.resolve(product.path));
        }

        products.splice(index, 1);
        saveProducts(products);

        reply(`✅ Produk ${product.id} - ${product.title} berhasil dihapus!`);
    }
};