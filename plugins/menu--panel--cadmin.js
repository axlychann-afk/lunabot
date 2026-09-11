import "../settings.js";
import axios from "axios";

export default {
    command: ["cadmin", "createadmin"],
    group: false,
    limit: false,
    premium: true,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        prefix,
        command,
        RyuuBotz,
        text,
        reply
    }) => {

        if (!text)
            return reply(
                `📦 *Usage:*\n.cadmin <nama|nomorOpsional>\n\n📌 *Example:*\n.cadmin ryuu|62xxxxxxxx`
            );

        const [name, maybeNumber] = text.split("|").map(s => s && s.trim());
        if (!name) return reply(`⚠️ Format salah!\n\nGunakan: ${prefix + command} nama|nomorOpsional`);
        const username = name.toLowerCase().replace(/\s+/g, "");
        const password = `${username}LeaPanel`;

        let target = maybeNumber ? `${maybeNumber.replace(/^0+/, "").replace(/\D+/g, "")}@s.whatsapp.net` : m.sender;

        const Domain = global.domain;
        const apikey = global.aapikey;
        if (!Domain || !apikey) return reply("❌ Domain atau API key Pterodactyl belum dikonfigurasikan pada global.");

        const host = "ryuu-dev.my.id";
        const email = `${username}@${host}`;

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: "⏱️",
                key: m.key
            },
        });

        try {
            const url = `${Domain.replace(/\/$/, "")}/api/application/users`;
            const body = {
                email,
                username,
                first_name: name,
                last_name: "Staff",
                language: "en",
                password,
                root_admin: true
            };
            const res = await axios.post(url, body, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apikey}`
                },
                timeout: 20000
            });

            const data = res.data;
            const createdUsername = (data.attributes && data.attributes.username) || username;
            const createdEmail = (data.attributes && data.attributes.email) || email;

            const caption = `✅ *Create Admin Successfully*\n\n👤 *Username:* ${createdUsername}\n🔑 *Password:* ${password}\n✉️ *Email:* ${createdEmail}\n\n🌐 *Panel:* ${Domain}`;

            await RyuuBotz.messageBuilder(m.chat)
                .setType("ButtonV2")
                .setTitle(global.ownername)
                .setSubtitle("Panel Manager")
                .setBody(caption)
                .setFooter(`© ${global.ownername} - 2025`)
                .setThumbnail("https://cdn.ornzora.eu.cc/4d2905ce-3707-4ec0-998a-68a3d851629f-FIORA.jpg")
                .addButton(
                    "📋 Salin Username",
                    `${createdUsername}`
                )
                .addButton(
                    "📋 Salin Password",
                    `${password}`
                )
                .addButton(
                    "🌐 Login Panel",
                    `${Domain}`
                )
                .send();
             reply("Done");
        } catch (err) {
            console.error("cadmin error:", err?.response?.data || err.message || err);
            const msg = err.response?.data?.errors ?
                JSON.stringify(err.response.data.errors) :
                (err.response?.data?.message || err.message || "Unknown error");
            reply(`❌ *Error membuat admin!*\n${msg}`);
        }

    }
};