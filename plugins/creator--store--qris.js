import fs from 'fs';
import path from 'path';
import { getTransaction, saveTransaction, getProducts } from '../lib/store-manage.js';

export default {
    command: ['qris'],
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
        const args = text.split('|').map(v => v.trim());

        if (args.length < 2) {
            return reply(
                'Format salah!\n\n' +
                '.qris <transaction_id> | <valid/benar/invalid/salah>\n\n' +
                'Contoh:\n' +
                '.qris 4827 | valid'
            );
        }

        const txId = args[0];
        const status = args[1].toLowerCase();

        const statusValid = ['valid', 'benar'].includes(status);
        const statusInvalid = ['invalid', 'salah'].includes(status);

        if (!statusValid && !statusInvalid) {
            return reply('❌ Status harus valid, benar, invalid, atau salah.');
        }

        const tx = getTransaction(txId);

        if (!tx) {
            return reply(`❌ Transaksi ${txId} tidak ditemukan.`);
        }

        if (tx.status === 'completed') {
            return reply(`❌ Transaksi ${txId} sudah selesai.`);
        }

        if (tx.status === 'rejected') {
            return reply(`❌ Transaksi ${txId} sudah ditolak.`);
        }

        if (statusValid) {
            const product = getProducts().find(
                p => p.id === tx.productId
            );

            if (
                product?.path &&
                fs.existsSync(path.resolve(product.path))
            ) {
                await RyuuBotz.sendMessage(tx.buyer, {
                    text: `✅ Pembayaran berhasil diverifikasi!\n\n📦 Produk: ${tx.productName}\n🆔 Transaksi: ${txId}\n\nProduk Anda sedang dikirim otomatis.`
                });

                await RyuuBotz.sendMessage(tx.buyer, {
                    document: fs.readFileSync(path.resolve(product.path)),
                    mimetype: 'application/zip',
                    fileName: path.basename(product.path)
                });

                tx.status = 'completed';
                tx.validatedAt = Date.now();

                saveTransaction(tx);

                return reply(
                    `✅ Pembayaran valid.\n📦 Produk berhasil dikirim otomatis.\n🆔 ID: ${txId}`
                );
            }

            tx.status = 'success';
            tx.validatedAt = Date.now();

            saveTransaction(tx);

            await RyuuBotz.sendMessage(tx.buyer, {
                text:
                    `✅ Pembayaran berhasil diverifikasi!\n\n` +
                    `📦 Produk: ${tx.productName}\n` +
                    `🆔 Transaksi: ${txId}\n\n` +
                    `Mohon tunggu admin mengirimkan produk Anda.`
            });

            return reply(
                `✅ Pembayaran valid.\n` +
                `📦 Produk manual delivery.\n` +
                `Kirim file dengan caption:\n${txId}`
            );
        }

        tx.status = 'rejected';
        tx.rejectedAt = Date.now();

        saveTransaction(tx);

        await RyuuBotz.sendMessage(tx.buyer, {
            text:
                `❌ Pembayaran untuk ${tx.productName}\n` +
                `🆔 ID: ${txId}\n\n` +
                `ditolak atau tidak valid.`
        });

        return reply(`✅ Transaksi ${txId} berhasil ditolak.`);
    }
};