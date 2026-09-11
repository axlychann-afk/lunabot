import "../settings.js";
import {
    generateTxId,
    extractQrisString,
    generateDynamicQris,
    saveTransaction,
    parseInviteLink
} from '../lib/store-manage.js';

export default {
    command: ["sewabot"],
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
            const HARGA_PER_BULAN = 15000;

            if (!text) {
                return reply(`*🤖 SEWA BOT - HARUKA BOTZ*\n\n` +
                    `💵 *Harga:* Rp${HARGA_PER_BULAN.toLocaleString('id-ID')} / Bulan\n\n` +
                    `*Format Command:*\n` +
                    `.sewabot <link_grup> | <jumlah_bulan>\n\n` +
                    `*Contoh:*\n` +
                    `.sewabot https://chat.whatsapp.com/L123abc456xyz | 2`);
            }

            const args = text.split('|').map(v => v.trim());
            if (args.length < 2) return reply("❌ Argumen kurang! Gunakan pemisah |");

            const linkGc = args[0];
            const bulan = parseInt(args[1]);
            const inviteCode = parseInviteLink(linkGc);

            if (!inviteCode) return reply("❌ Link grup tidak valid! Pastikan link berupa format: chat.whatsapp.com/xxx");
            if (isNaN(bulan) || bulan <= 0) return reply("❌ Jumlah bulan harus berupa angka positif!");

            if (!global.qrisurl) return reply("❌ Owner belum mengatur global.qrisurl");

            const totalPrice = HARGA_PER_BULAN * bulan;
            reply("⏳ Sedang memproses QRIS pembayaran sewa bot, mohon tunggu...");
            await global.sleep(2000);

            const qrisStaticString = await extractQrisString(global.qrisurl);
            const qrisBuffer = await generateDynamicQris(qrisStaticString, totalPrice);
            const txId = generateTxId();

            const tx = {
                id: txId,
                status: "pending",
                buyer: m.sender,
                productId: "SEWABOT",
                productName: `Sewa Bot - ${bulan} Bulan`,
                price: totalPrice,
                inviteCode: inviteCode,
                durationDays: bulan * 30,
                createdAt: Date.now()
            };

            saveTransaction(tx);

            const caption = `*🧾 INVOICE SEWA BOT*\n\n` +
                `ID Transaksi: *${txId}*\n` +
                `Durasi Sewa: *${bulan} Bulan*\n` +
                `Total Harga: *Rp${totalPrice.toLocaleString('id-ID')}*\n\n` +
                `Silakan scan QRIS di atas untuk membayar.\n` +
                `Jika sudah, *KIRIMKAN BUKTI PEMBAYARAN* (Foto) ke chat ini.\n` +
                `Ketik \`${prefix}cancel ${txId}\` untuk membatalkan pesanan`;

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