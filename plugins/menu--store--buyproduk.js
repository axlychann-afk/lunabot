import "../settings.js";
import {
    getProducts,
    generateTxId,
    extractQrisString,
    generateDynamicQris,
    saveTransaction
} from '../lib/store-manage.js';

export default {
    command: ["buyproduk"],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: true,
    usePrefix: true,
    disable: false,
    code: async (m, {
        RyuuBotz,
        text,
        reply,
        prefix
    }) => {
        try {
            if (!text) return reply("Masukkan ID produk!\nContoh: .buyproduk P001");

            const product = getProducts().find(p => p.id === text.trim());
            if (!product) return reply("❌ Produk tidak ditemukan!");

            if (!global.qrisurl) return reply("❌ Owner belum mengatur global.qrisurl");

            reply("⏳ Sedang memproses QRIS pembayaran, mohon tunggu...");
            await global.sleep(2000);
            
            const qrisString = await extractQrisString(global.qrisurl);
            const qrisBuffer = await generateDynamicQris(qrisString, product.price);
            const txId = generateTxId();

            const tx = {
                id: txId,
                status: "pending",
                buyer: m.sender,
                productId: product.id,
                productName: product.title,
                price: product.price,
                createdAt: Date.now()
            };

            saveTransaction(tx);

            const caption = `*🧾 INVOICE PEMBAYARAN*\n\n` +
                `ID Transaksi: *${txId}*\n` +
                `Produk: ${product.title}\n` +
                `Harga: Rp${product.price.toLocaleString('id-ID')}\n\n` +
                `Silakan scan QRIS di atas untuk membayar.\n` +
                `Jika sudah bayar, *KIRIMKAN GAMBAR BUKTI PEMBAYARAN* langsung di chat ini.\n` +
                `Ketik \`${prefix}cancel ${txId}\` untuk membatalkan pesanan`;

            await RyuuBotz.sendMessage(m.chat, {
                image: qrisBuffer,
                caption: caption
            }, {
                quoted: m
            });

        } catch (e) {
            reply(`❌ Gagal membuat transaksi: ${e.message}`);
        }
    }
};