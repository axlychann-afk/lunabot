import fs from "fs";

export default {
    event: async (m, {
        RyuuBotz,
        body,
        isCreator,
        isAdmins
    }) => {
        const ntlinkgc = JSON.parse(fs.readFileSync('./database/antilinkgc.json'))
        const Antilinkgc = m.isGroup ? ntlinkgc.includes(m.chat) : false

        if (!m.fromMe && Antilinkgc) {
            if (body.match(`chat.whatsapp.com`)) {

                if (isCreator) {
                    return RyuuBotz.sendMessage(m.chat, {
                        text: global.mess.antilink.owner,
                        contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.namabot,
                            newsletterJid: global.idSaluran
                        },
                            previewThumbnail: {
                                title: "🍰 Group Link Terdeteksi ✨",
                                description: "💬 Pesan diizinkan",
                                thumbnail: {
                                    url: global.thumbnail.mini
                                },
                                sourceUrl: "https://deuala.zone.id",
                                largerThumbnail: false
                            }
                        }
                    }, {
                        quoted: m
                    });
                }

                if (isAdmins) {
                    return RyuuBotz.sendMessage(m.chat, {
                        text: global.mess.antilink.admin,
                        contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.namabot,
                            newsletterJid: global.idSaluran
                        },
                            previewThumbnail: {
                                title: "🍰 Group Link Terdeteksi ✨",
                                description: "💬 Pesan diizinkan",
                                thumbnail: {
                                    url: global.thumbnail.mini
                                },
                                sourceUrl: "https://deuala.zone.id",
                                largerThumbnail: false
                            }
                        }
                    }, {
                        quoted: m
                    });
                }

                await RyuuBotz.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat,
                        fromMe: false,
                        id: m.key.id,
                        participant: m.key.participant
                    }
                });

                await RyuuBotz.sendMessage(m.chat, {
                    text: `🍧 *@${m.sender.split("@")[0]} ngirim link grup dan udah dihapus ya~* 💦`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.namabot,
                            newsletterJid: global.idSaluran
                        },
                        mentionedJid: [m.sender],
                        previewThumbnail: {
                            title: "🍡 Group Link Dihapus 💨",
                            description: "⚠️ Pesan terdeteksi dan sudah dihapus otomatis~",
                            thumbnail: {
                                url: global.thumbnail.mini
                            },
                            sourceUrl: "https://deuala.zone.id",
                            largerThumbnail: false
                        }
                    }
                }, {
                    quoted: m
                });

            }
        }
    }
};