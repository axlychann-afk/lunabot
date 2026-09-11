import "../settings.js";

export default {
    command: ["daftar", "regis", "register"],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (
        m, {
            isCreator,
            isRegistered,
            text,
            reply,
            RyuuBotz,
            deviceinfo,
            namabot,
            createSerial,
            addRegisteredUser,
            command,
            prefix,
            createUserDatabase
        }
    ) => {


        if (isRegistered) return reply("𝗸𝗮𝗺𝘂 𝘀𝘂𝗱𝗮𝗵 𝘁𝗲𝗿𝗱𝗮𝗳𝘁𝗮𝗿 𝘆𝗮𝗮 ✨");

        const nama = text.trim() || m.pushName || "User";

        if (!nama)
            return reply("𝗡𝗮𝗺𝗮 𝗵𝗮𝗿𝘂𝘀 𝗱𝗶𝗶𝘀𝗶 𝗱𝗲𝗻𝗴𝗮𝗻 𝗯𝗲𝗻𝗮𝗿 𝘆𝗮𝗮 ✨");

        const nomor = m.sender.split("@")[0];
        const serialUser = createSerial(20);
        const timeNow = Date.now();
        const limit = global.limitawal.free;

        const detectOperator = (number) => {
            const prefix = number.slice(0, 4);
            const operators = {
                Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0852", "0853", "0851"],
                Indosat: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
                XL: ["0817", "0818", "0819", "0859", "0877", "0878"],
                Tri: ["0895", "0896", "0897", "0898", "0899"],
                Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
            };

            for (const [name, prefixes] of Object.entries(operators)) {
                if (prefixes.includes(prefix)) return name;
            }
            return "Tidak Diketahui";
        };

        const operator = detectOperator(
            nomor.replace(/[^0-9]/g, "").replace(/^62/, "0").slice(0, 12)
        );

        if (!addRegisteredUser(m.sender, nama, timeNow, limit, serialUser))
            return reply("𝗸𝗮𝗺𝘂 𝘀𝘂𝗱𝗮𝗵 𝘁𝗲𝗿𝗱𝗮𝗳𝘁𝗮𝗿 𝘆𝗮𝗮 ✨");
        createUserDatabase(m.sender);

        let ppuser;
                try {
                    ppuser = await RyuuBotz.profilePictureUrl(num, "preview", 3000);
                } catch {}
                if (!ppuser) {
                    try {
                        ppuser = await RyuuBotz.profilePictureUrl(num, "image", 3000);
                    } catch {}
                }
                if (!ppuser) {
                    try {
                        ppuser = await RyuuBotz.profilePictureUrl(id, "preview", 3000);
                    } catch {}
                }
                if (!ppuser) {
                    try {
                        ppuser = await RyuuBotz.profilePictureUrl(id, "image", 3000);
                    } catch {}
                }
                if (!ppuser) {
                    try {
                        ppuser = "https://telegra.ph/file/265c672094dfa87caea19.jpg";
                    } catch {}
                }

        const Msg =
            `𝗥 𝗘 𝗚 𝗜 𝗦 𝗧 𝗘 𝗥   𝗕 𝗘 𝗥 𝗛 𝗔 𝗦 𝗜 𝗟

Hai @${nomor} 🫧  
Kamu udah resmi terdaftar yaa~ 💗✨

• 👤 𝗡𝗮𝗺𝗮: ${nama}  

• 📱 𝗢𝗽𝗲𝗿𝗮𝘁𝗼𝗿: ${operator}  
• 📦 𝗦𝗲𝗿𝗶𝗮𝗹: ${serialUser}  
• 📟 𝗗𝗲𝘃𝗶𝗰𝗲: ${deviceinfo}

Makasih sudah daftar yaa…  
Semoga betah di sini 🤍  
Aku seneng banget nerima user baru kayak kamu~ 😘`;

        await RyuuBotz.sendMessage(m.chat, {
            text: Msg,
            contextInfo: {
                mentionedJid: [m.sender],
                previewThumbnailV2: {
                    title: "𝗡𝗘𝗪 𝗨𝗦𝗘𝗥 𝗥𝗘𝗚𝗜𝗦𝗧𝗘𝗥𝗘𝗗",
                    desc: "Selamat datang~ 💗",
                    thumbnail: { url: ppuser },
                    sourceUrl: global.saluran,
                    largerThumbnail: false
                }
            },
        });
    }
};