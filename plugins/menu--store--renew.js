import {
    generateTxId,
    extractQrisString,
    generateDynamicQris,
    saveTransaction,
    getSewaDb
} from '../lib/store-manage.js';

export default {
    command: ["renew", "perpanjang"],
    group: true,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
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
            const HARGA_PER_BULAN = 10000;

            const db = getSewaDb();
            const isRegistered = db.active.find(g => g.id === m.chat);

            if (!isRegistered) {
                return reply("❌ Grup ini belum terdaftar dalam sistem sewa bot aktif. Gunakan command `.sewabot` terlebih dahulu untuk mendaftarkan grup baru.");
            }

            if (!text) {
                return reply(`*🔄 PERPANJANG SEWA BOT*\n\n` +
                    `💵 *Harga:* Rp${HARGA_PER_BULAN.toLocaleString('id-ID')} / Bulan\n\n` +
                    `*Format Command:*\n` +
                    `.renewsewa <jumlah_bulan>\n\n` +
                    `*Contoh:*\n` +
                    `.renewsewa 1`);
            }

            const bulan = parseInt(text.trim());
            if (isNaN(bulan) || bulan <= 0) return reply("❌ Jumlah bulan harus berupa angka positif!");

            if (!global.qrisurl) return reply("❌ Owner belum mengatur global.qrisurl");

            const totalPrice = HARGA_PER_BULAN * bulan;
            reply("⏳ Sedang memproses QRIS perpanjangan sewa bot, mohon tunggu...");

            const qrisStaticString = await extractQrisString(global.qrisurl);
            const qrisBuffer = await generateDynamicQris(qrisStaticString, totalPrice);
            const txId = generateTxId();

            const tx = {
                id: txId,
                status: "pending",
                buyer: m.sender,
                productId: "RENEW_SEWA",
                productName: `Perpanjang Sewa - ${bulan} Bulan`,
                price: totalPrice,
                targetGroupId: m.chat,
                durationDays: bulan * 30,
                createdAt: Date.now()
            };

            saveTransaction(tx);

            const caption = `*🧾 INVOICE PERPANJANGAN SEWA*\n\n` +
                `ID Transaksi: *${txId}*\n` +
                `Durasi Tambahan: *${bulan} Bulan*\n` +
                `Total Harga: *Rp${totalPrice.toLocaleString('id-ID')}*\n\n` +
                `Silakan scan QRIS di atas untuk membayar.\n` +
                `Jika sudah, *KIRIMKAN BUKTI PEMBAYARAN* (Foto) langsung ke bot melalui Private Chat (PC) atau di sini.`;

            await RyuuBotz.sendMessage(m.chat, {
                image: qrisBuffer,
                caption: caption
            }, {
                quoted: m
            });

        } catch (e) {
            reply(`❌ Terjadi kesalahan: ${e.message}`);
        }
    }
};