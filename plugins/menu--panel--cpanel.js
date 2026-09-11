import "../settings.js";
import axios from "axios";

export default {
    command: ["cpanel"],
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
                `📦 *Usage:*\n.cpanel <diskGiB>|<ramGiB>|<cpu>|<nama>\n\n📌 *Example:*\n.cpanel 10|2|20|RyuuDev`
            );

        const [diskGiB, ramGiB, cpu, name, targets] = text.split("|");
        if (!diskGiB || !ramGiB || !cpu || !name)
            return reply(
                `⚠️ Format salah!\n\nGunakan seperti ini:\n${prefix + command} 10|2|20|Ryuu`
            );

        const disk = parseFloat(diskGiB) * 1024;
        const ram = parseFloat(ramGiB) * 1024;

        let target = targets ?
            `${targets.replace(/^0+/, "").replace(/\D+/g, "")}@s.whatsapp.net` :
            m.sender;

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: "⏱️",
                key: m.key
            },
        });
        try {
            const ptla = global.aapikey;
            const ptlc = global.capikey;
            const Domain = global.domain;
            const NestId = global.nestId;
            const node = 24;

            const res = await axios.get(
                `https://api.ryuu-dev.my.id/discovery/create-panel?capikey=${encodeURIComponent(
          ptlc
        )}&aapikey=${encodeURIComponent(ptla)}&ram=${encodeURIComponent(
          ram
        )}&disk=${encodeURIComponent(disk)}&name=${encodeURIComponent(
          name
        )}&nestID=${encodeURIComponent(NestId)}&egg=15&location=1&cpu=${encodeURIComponent(
          cpu
        )}&domain=${encodeURIComponent(Domain)}&node=${encodeURIComponent(node)}`
            );

            const data = res.data.result;
            if (!data.status)
                return reply(`❌ Gagal membuat panel!\n💬 ${data.message || "Unknown error"}`);

            const usn = data.user?.username || name;
            const pw = data.pw || `${name}001`;
            const domain = Domain || "Tidak ditemukan";

            const caption = `✅ *Create Panel Successfully*

👤 *Name:* ${usn}
🔑 *Password:* ${pw}
🌐 *Domain:* ${domain}

🧩 *CPU:* ${cpu}%
💾 *RAM:* ${ramGiB} GiB
📀 *Disk:* ${diskGiB} GiB`;

            await RyuuBotz.sendMessage(target, {
                image: {
                    url: global.thumbnail.main
                },
                caption,
                footer: `© ${global.ownername} - 2025`,
                buttons: [{
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📋 Salin Username",
                            id: usn
                        })
                    },
                    {
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📋 Salin Password",
                            id: pw
                        })
                    },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "🌐 Login Panel",
                            url: domain
                        })
                    }
                ]
            });
            reply("Done");

        } catch (err) {
            console.error(JSON.stringify(err.data, null, 2));
            reply(
                `❌ *Error membuat panel!*\n${err.response?.data?.message || err.message}`
            );
        }

    }
};