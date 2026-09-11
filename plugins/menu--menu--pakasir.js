/**
 ╔════════════════════════════════════
      ⧉  [Pakasir] — QRIS Payment
 ╚════════════════════════════════════
  - POST create QRIS
  - Render QR from string
  - Polling status tiap 6 detik (max 5 menit)
  - Auto delete QR when completed
*/

import fetch from "node-fetch";
import QRCode from "qrcode";

export default {
  command: ["pakasir"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: true,

  code: async (m, { reply, RyuuBotz, text, prefix, command }) => {
    try {
      if (!text)
        return reply(`*Contoh:* ${prefix + command} 15000`);

      const amount = parseInt(text);
      if (isNaN(amount) || amount < 1000)
        return reply("*Nominal tidak valid. Minimal 1000.*");

      await RyuuBotz.sendMessage(m.chat, {
        react: { text: "⏳", key: m.key }
      });

      // ===== KONFIG =====
      const slug = "ryuureinzz";
      const api_key = "VZ8k84hbd3DUTayGbh9BNgY7TTGJTlis";
      const order_id = `${Date.now()}`;

      // ===== CREATE QRIS =====
      const res = await fetch(
        "https://app.pakasir.com/api/transactioncreate/qris",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project: slug,
            order_id,
            amount,
            api_key
          })
        }
      );

      const json = await res.json();
      if (!json?.payment?.payment_number)
        return reply("*Gagal membuat QRIS.*");

      const qrString = json.payment.payment_number;

      // ===== GENERATE QR IMAGE =====
      const qrBuffer = await QRCode.toBuffer(qrString, {
        type: "png",
        errorCorrectionLevel: "M",
        margin: 2,
        scale: 8
      });

      // ===== SEND QR TO USER =====
      const qrMsg = await RyuuBotz.sendMessage(
        m.chat,
        {
          image: qrBuffer,
          caption: `
🧾 *INVOICE PEMBAYARAN*

├ Nominal : Rp ${amount.toLocaleString()}
├ Order ID: ${order_id}
├ Metode  : QRIS
├ Message  : QRIS akan kadaluarsa dalam 5 menit
└ Status  : *MENUNGGU PEMBAYARAN*

Scan QR ini menggunakan e-wallet / m-banking.
          `.trim()
        },
        { quoted: m }
      );

      const qrKey = qrMsg.key;

      const ownerJid = global.ownernumber.includes("@s.whatsapp.net")
        ? global.ownernumber
        : global.ownernumber + "@s.whatsapp.net";

      const detailUrl =
        `https://app.pakasir.com/api/transactiondetail` +
        `?project=${slug}` +
        `&amount=${amount}` +
        `&order_id=${order_id}` +
        `&api_key=${api_key}`;

      await RyuuBotz.sendMessage(ownerJid, {
        text: `
📥 *PAKASIR — TRANSAKSI BARU*

Order ID : ${order_id}
Nominal  : Rp ${amount.toLocaleString()}
Project  : ${slug}

🔎 Detail:
${detailUrl}
        `.trim()
      });

      // ===== POLLING STATUS =====
      const INTERVAL = 6_000;              
      const MAX_DURATION = 5 * 60 * 1000;  
      const startTime = Date.now();

      const interval = setInterval(async () => {
        try {
          if (Date.now() - startTime >= MAX_DURATION) {
            clearInterval(interval);
            return;
          }

          const cek = await fetch(detailUrl);
          const data = await cek.json();
          const status = data?.transaction?.status;

          if (status === "completed") {
            clearInterval(interval);

            await RyuuBotz.sendMessage(m.chat, {
              delete: qrKey
            });

            await RyuuBotz.sendMessage(m.chat, {
              text: "✅ *Pembayaran berhasil. Terima kasih!*"
            });
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, INTERVAL);

    } catch (err) {
      console.error(err);
      reply("*🍂 Terjadi kesalahan saat memproses pembayaran.*");
    } finally {
      await RyuuBotz.sendMessage(m.chat, {
        react: { text: "", key: m.key }
      });
    }
  }
};