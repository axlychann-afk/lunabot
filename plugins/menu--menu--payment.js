import "../settings.js";

export default {
    command: ["payment", "pay", "donate"],
    group: false,
    limit: false,
    premium: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        reply
    }) => {
        const payment = global.payment;

        if (!payment?.qris) {
            return reply("❌ QRIS belum dikonfigurasi.");
        }

        let caption = `💳 *INFORMASI PEMBAYARAN*\n`;
        caption += `Silakan scan QRIS All Payment di atas atau transfer ke salah satu rekening berikut.\n`;

        for (const [name, data] of Object.entries(payment)) {
            if (name === "qris") continue;
            if (!data || typeof data !== "object") continue;

            caption += `\n*${name.toUpperCase()}*`;
            caption += `\n• Nomor : ${data.norek || "-"}`;
            caption += `\n• Atas Nama : ${data.nama || "-"}\n`;
        }
        const button = Object.entries(global.payment)
            .filter(([name, data]) => name !== "qris" && data?.norek)
            .map(([name, data]) => ({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: `${name.toUpperCase()} • ${data.norek}`,
                    id: `copy_${name}`,
                    copy_code: data.norek
                })
            }));

        await RyuuBotz.sendMessage(
            m.chat, {
                image: {
                    url: payment.qris
                },
                caption,
                footer: '𝙍͢𝙮𝙪𝙪 𝙍͢𝙚𝙞𝙣𝙯𝙯',
                buttons: button,
                hasMediaAttachment: false,
                bottom_sheet: true,
                bottom_name: "Select payment",
            }, {
                quoted: m
            }
        );
    },
};