import "../settings.js";
import axios from "axios";

export default {
    command: ["csc", "codeshare", "code_share"],
    group: false,
    limit: true,
    premium: true,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        text,
        reply,
        command,
        prefix
    }) => {

        if (!text) {
            return reply(`Contoh:\n\n${prefix + command} javascript | Hello World | console.log("Hello Ryuu!");`);
        }

        // Parsing input
        const [language, title, ...codeParts] = text.split("|").map(a => a.trim());
        const code = codeParts.join("|");
        const cscApi = global.cscapi

        // Daftar bahasa yang diizinkan
        const allowedLang = [
            "plaintext", "html", "css", "javascript", "typescript",
            "php", "python", "java", "c#", "c++", "c"
        ];

        if (!allowedLang.includes(language?.toLowerCase())) {
            return reply(
                `❌ Bahasa tidak didukung!\n\nBahasa yang tersedia:\n${allowedLang.map(v => "• " + v).join("\n")}`
            );
        }

        if (!title) return reply(`*Kamu belum kasih nama kodenya* 🥺`);
        if (!code) return reply(`*Kodenya mana sayang~* 🤔`);

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: "🪄",
                key: m.key
            },
        });

        try {
            const response = await axios.post(
                "https://codeshare.cloudku.click/users.php", {
                    title: title,
                    code_content: code,
                    language: language,
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${cscApi}`,
                    },
                }
            );

            const result = response.data;

            if (!["success", true].includes(result.status) || !result.share_id) {
                return reply(`❌ Gagal membuat kode!\n${JSON.stringify(result, null, 2)}`);
            }

            const shareLink = `https://codeshare.cloudku.click/view/${result.share_id}`;
            const caption = `✨ Kode berhasil dibuat!\n📜 Judul: *${title}*\n🌐 Bahasa: *${language}*\n\n🔗 ${shareLink}`;

            const buttons = {
                text: caption,
                footer: `© ${global.ownername} - 2025`,
                buttons: [{
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Copy Link",
                        copy_code: shareLink,
                    }),
                }, ],
            };

            await RyuuBotz.sendMessage(m.chat, buttons, {
                quoted: m
            });
        } catch (err) {
            console.error(err);
            reply(`❌ Error: ${err.response?.data?.message || err.message}`);
        }

    }
};