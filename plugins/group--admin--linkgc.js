import "../settings.js";

export default {
    command: ["linkgc", "gruplink", "grouplink", "invitelink"],
    group: true,
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

        try {

            let groupMetadata = await RyuuBotz.groupMetadata(m.chat);
            let response = await RyuuBotz.groupInviteCode(m.chat);

            const link = `https://chat.whatsapp.com/${response}`;
            const caption = `🌸 *Nama Grup:* \n${groupMetadata.subject}\n\n👑 *Owner:* wa.me/${groupMetadata.owner ? groupMetadata.ownerPn.split('@')[0] : 'Tidak diketahui'}\n🔗 *✨ Ini link undangan grup kamu!* \n${link}`;

            await RyuuBotz.sendMessage(m.chat, {
                caption,
                document: {
                    url: 'https://raw.githubusercontent.com/Ryuu311/Arisu-Botz/refs/heads/main/README.md'
                },
                mimetype: 'application/javascript',
                fileName: 'Group Link Info',
                buttons: [{
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Salin Link Grup',
                            copy_code: link
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Buka Link Grup',
                            url: link
                        })
                    }
                ],
                mentionedJid: [m.sender],
                contextInfo: {
                    mentionedJid: [m.sender]/*
                    externalAdReply: {
                        title: global.namabot,
                        body: global.ownername,
                        thumbnailUrl: global.thumbnail.main,
                        showAdAttribution: false,
                        sourceUrl: `https://whatsapp.com/channel/0029Vb49CCWJ93wO2dLDqx14`,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    }*/
                }
            });

        } catch (err) {
            console.error(err);
            reply(`❌ Terjadi kesalahan: ${err.message}`);
        }

    }
};