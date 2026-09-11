import {
    getAllPendingTransactions,
    downloadMedia,
    saveTransaction
} from '../lib/store-manage.js';
export default {
    event: async (m, { RyuuBotz }) => {
        if (!m.message || m.key.fromMe) return;

        const mime = m.mtype === 'imageMessage' ? 'image' : m.mtype === 'documentMessage' ? 'document' : null;
        if (!mime) return;

        const pendingTxs = getAllPendingTransactions().filter(tx => tx.buyer === m.sender && tx.status === 'pending');
        if (pendingTxs.length === 0) return;

        const tx = pendingTxs[pendingTxs.length - 1];

        try {
            const buffer = await downloadMedia(m.message[m.mtype], mime);
            const ownerJid = `${global.ownernumber}@s.whatsapp.net`;
            
            let caption = '';

            if (tx.productId === "RENEW_SEWA" || tx.productId === "SEWABOT") {
                caption = `*🔔 BUKTI PEMBAYARAN SEWA BOT BARU*\n\n` +
                    `Status: *Menunggu Validasi Sewa*\n` +
                    `Transaction ID: *${tx.id}*\n` +
                    `Jenis Layanan: ${tx.productName}\n` +
                    `Total Tagihan: Rp${tx.price.toLocaleString('id-ID')}\n` +
                    `Durasi Sewa: ${tx.durationDays} Hari\n` +
                    `Nomor Customer: @${tx.buyer.split('@')[0]}\n\n` +
                    `*Balas dengan command berikut untuk memproses:*\n` +
                    `👉 \`.sewa ${tx.id} | valid\` (Bot otomatis masuk grup)\n` +
                    `👉 \`.sewa ${tx.id} | invalid\` (Tolak transaksi)`;
            } else {
                caption = `*🔔 BUKTI PEMBAYARAN PRODUK BARU*\n\n` +
                    `Status: *Menunggu Validasi Toko*\n` +
                    `Transaction ID: *${tx.id}*\n` +
                    `Nama Produk: ${tx.productName}\n` +
                    `Total Tagihan: Rp${tx.price.toLocaleString('id-ID')}\n` +
                    `Nomor Customer: @${tx.buyer.split('@')[0]}\n\n` +
                    `*Balas dengan command berikut untuk memproses:*\n` +
                    `👉 \`.qris ${tx.id} | valid\` (Kirim produk/buka akses)\n` +
                    `👉 \`.qris ${tx.id} | invalid\` (Tolak transaksi)`;
            }

            await RyuuBotz.sendMessage(ownerJid, {
                image: buffer,
                caption,
                contextInfo: {
                    mentionedJid: [tx.buyer]
                }
            }, {
                quoted: m
            });
            tx.status = 'verifying';
            saveTransaction(tx);

            await RyuuBotz.sendMessage(m.chat, {
                text: "✅ Bukti pembayaran Anda telah berhasil diteruskan ke Owner. Mohon tunggu beberapa saat untuk proses validasi."
            }, {
                quoted: m
            });

        } catch (e) {
            console.error("Gagal memproses bukti pembayaran:", e);
        }
    }
};
