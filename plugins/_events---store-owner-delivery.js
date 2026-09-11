import {
    getTransaction,
    saveTransaction
} from '../lib/store-manage.js';

export default {
    event: async (m, {
        RyuuBotz,
        isCreator
    }) => {
        if (!m.message || m.key.fromMe) return;
        if (!isCreator) return;

        const caption = m.body ? m.body.trim() : '';
        if (!/^\d{4}$/.test(caption)) return;

        const hasMedia = m.mtype === 'documentMessage' || m.mtype === 'imageMessage' || m.mtype === 'videoMessage' || m.mtype === 'audioMessage';
        if (!hasMedia) return;

        const txId = caption;
        const tx = getTransaction(txId);

        if (!tx) return RyuuBotz.sendMessage(m.chat, {
            text: `❌ Transaksi ${txId} tidak ditemukan.`
        }, {
            quoted: m
        });
        if (tx.status !== 'success') return RyuuBotz.sendMessage(m.chat, {
            text: `❌ Status transaksi ${txId} saat ini adalah "${tx.status}", bukan "success". Pastikan Anda sudah memvalidasi pembayaran.`
        }, {
            quoted: m
        });

        try {
            await RyuuBotz.sendMessage(tx.buyer, {
                forward: m
            });
            await RyuuBotz.sendMessage(tx.buyer, {
                text: `🎉 Terima kasih telah berbelanja! Produk ${tx.productName} telah dikirimkan.`
            });

            tx.status = 'completed';
            saveTransaction(tx);

            await RyuuBotz.sendMessage(m.chat, {
                text: `✅ Produk berhasil diteruskan secara manual ke customer.`
            }, {
                quoted: m
            });
        } catch (e) {
            RyuuBotz.sendMessage(m.chat, {
                text: `❌ Gagal mengirim produk ke customer: ${e.message}`
            }, {
                quoted: m
            });
        }
    }
};