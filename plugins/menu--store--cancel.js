import { getTransaction, saveTransaction } from '../lib/store-manage.js';

export default {
    command: ["cancel", "batal", "canceltrx"],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (m, { isCreator, RyuuBotz, text, reply }) => {
        try {
            if (!text) {
                return reply(`*❌ FORMAT CANCEL TRANSAKSI*\n\n` +
                             `Gunakan command ini untuk membatalkan transaksi yang sedang berjalan.\n\n` +
                             `*Format:*\n` +
                             `.cancel <transaction_id>\n\n` +
                             `*Contoh:*\n` +
                             `.cancel 4827`);
            }

            const txId = text.trim();
            const tx = getTransaction(txId);

            if (!tx) {
                return reply(`❌ Transaksi dengan ID *${txId}* tidak ditemukan.`);
            }

            if (['completed', 'success', 'rejected', 'cancelled'].includes(tx.status)) {
                return reply(`❌ Transaksi ini tidak dapat dibatalkan karena statusnya sudah *${tx.status}*.`);
            }
            const isBuyer = tx.buyer === m.sender;

            if (!isCreator && !isBuyer) {
                return reply("❌ Anda tidak memiliki akses untuk membatalkan transaksi ini.");
            }

            tx.status = 'cancelled';
            saveTransaction(tx);

            if (isCreator) {
                await RyuuBotz.sendMessage(tx.buyer, { 
                    text: `🚫 Transaksi Anda dengan ID *${txId}* (${tx.productName}) telah dibatalkan oleh Owner/Admin.` 
                });
                reply(`✅ Transaksi *${txId}* berhasil dibatalkan oleh Anda (Owner).`);
            } else {
                const ownerJid = `${global.ownernumber}@s.whatsapp.net`;
                await RyuuBotz.sendMessage(ownerJid, { 
                    text: `📢 Buyer (@${tx.buyer.split('@')[0]}) telah membatalkan transaksi ID *${txId}* (${tx.productName}).`,
                    contextInfo: { mentionedJid: [tx.buyer] }
                });
                reply(`✅ Transaksi Anda dengan ID *${txId}* (${tx.productName}) berhasil dibatalkan.`);
            }

        } catch (e) {
            reply(`❌ Terjadi kesalahan: ${e.message}`);
            console.error(e);
        }
    }
};
