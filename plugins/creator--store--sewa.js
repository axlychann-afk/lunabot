import {
    getTransaction,
    saveTransaction,
    getSewaDb,
    saveSewaDb
} from '../lib/store-manage.js';

export default {
    command: ["sewa"],
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
        if (!text) return reply("Format salah!\nContoh: .sewa 1234 | valid");

        const args = text.split('|').map(v => v.trim());
        if (args.length < 2) return reply("Gunakan pemisah |");

        const txId = args[0];
        const decision = args[1].toLowerCase();

        const tx = getTransaction(txId);
        if (!tx || !["SEWABOT", "RENEW_SEWA"].includes(tx.productId)) return reply("❌ Transaksi sewa tidak ditemukan.");

        if (['valid', 'benar'].includes(decision)) {
            const db = getSewaDb();
            const tambahanWaktuMs = tx.durationDays * 24 * 60 * 60 * 1000;

            if (tx.productId === "RENEW_SEWA") {
                // --- ALUR PERPANJANGAN (RENEW) ---
                const index = db.active.findIndex(g => g.id === tx.targetGroupId);

                if (index === -1) {
                    return reply("❌ Grup target ternyata sudah tidak ada di list sewa aktif (mungkin telah dihapus/expired manual).");
                }

                // Tambahkan waktu dari expiredAt yang sudah ada
                db.active[index].expiredAt += tambahanWaktuMs;
                saveSewaDb(db);

                tx.status = 'completed';
                saveTransaction(tx);

                const newExpiredStr = new Date(db.active[index].expiredAt).toLocaleString('id-ID');

                // Notifikasi sukses ke grup dan buyer
                await RyuuBotz.sendMessage(tx.targetGroupId, {
                    text: `🎉 *Masa Sewa Diperpanjang!*\n\n⏱️ Tambahan: +${tx.durationDays} Hari\n📅 Berakhir pada: *${newExpiredStr}*`
                });
                await RyuuBotz.sendMessage(tx.buyer, {
                    text: `✅ Perpanjangan sewa untuk grup berhasil diverifikasi!`
                });

                reply(`✅ Sukses memvalidasi perpanjangan sewa ID ${txId}.`);

            } else if (tx.productId === "SEWABOT") {
                // --- ALUR DAFTAR BARU (SEWABOT) ---
                try {
                    const res = await RyuuBotz.groupAcceptInvite(tx.inviteCode);
                    const targetGroupId = res;

                    if (!targetGroupId) throw new Error("Bot gagal masuk grup.");

                    const expiredAt = Date.now() + tambahanWaktuMs;
                    const index = db.active.findIndex(g => g.id === targetGroupId);

                    if (index !== -1) {
                        db.active[index].expiredAt += tambahanWaktuMs;
                    } else {
                        db.active.push({
                            id: targetGroupId,
                            buyer: tx.buyer,
                            expiredAt: expiredAt
                        });
                    }

                    saveSewaDb(db);

                    tx.status = 'completed';
                    saveTransaction(tx);

                    await RyuuBotz.sendMessage(targetGroupId, {
                        text: `👋 Halo semuanya! Bot berhasil masuk via sewa otomatis.\n\n📅 Bot aktif sampai: *${new Date(expiredAt).toLocaleString('id-ID')}*`
                    });
                    await RyuuBotz.sendMessage(tx.buyer, {
                        text: `🎉 Pembayaran valid! Bot telah otomatis masuk ke grup tujuan.`
                    });

                    reply(`✅ Sukses memvalidasi sewa ID ${txId}. Bot berhasil join grup.`);
                } catch (e) {
                    reply(`❌ Gagal mengeksekusi otomatis join: ${e.message}`);
                }
            }
        } else if (['invalid', 'salah'].includes(decision)) {
            tx.status = 'rejected';
            saveTransaction(tx);
            await RyuuBotz.sendMessage(tx.buyer, {
                text: `❌ Pembayaran sewa/perpanjangan bot Anda (ID: ${txId}) dinyatakan tidak valid oleh owner.`
            });
            reply(`✅ Transaksi sewa ${txId} berhasil di-reject.`);
        }
    }
};