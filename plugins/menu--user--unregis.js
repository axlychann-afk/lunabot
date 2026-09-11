import "../settings.js";

export default {
    command: ["unregis", "unregister"],
    group: false,
    limit: false,
    premium: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (
        m, {
            isRegistered,
            reply,
            RyuuBotz,
            removeRegisteredUser,
            deleteUserDatabase
        }
    ) => {


        if (!isRegistered)
            return reply("Ehh kamu belum terdaftar sayang… jadi belum bisa unreg dulu yaa 🥺💗");

        removeRegisteredUser(m.sender);
        deleteUserDatabase(m.sender);
        const nomor = m.sender.split("@")[0];

        const teks =
`💗✨ *U N R E G I S   B E R H A S I L* ✨💗

Kamu @${nomor}~  
Data kamu udah aku hapus yaa… 🫧

• 📌 *Status:* Tidak terdaftar lagi  
• 🗑️ *Data:* Sudah dibersihkan  

Kalau nanti kangen dan mau daftar lagi…  
ketik aja *\`.daftar nama\`* yaa~  
Aku bakal sambut kamu lagi dengan senyuman manis 😘🌸`;

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

        await RyuuBotz.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                mentionedJid: [m.sender],
                previewThumbnailV2: {
                    title: "U N R E G I S T E R",
                    desc: "Akunmu sudah dihapus yaa sayang 💗",
                    thumbnail: { url: ppuser },
                    sourceUrl: global.saluran,
                    largerThumbnail: false,
                },
            },
        });

    }
};