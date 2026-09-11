import fs from "fs";

export default {
    event: async (m, {
        RyuuBotz,
        body,
        isCreator,
        isAdmins
    }) => {
        const ntlinkch = JSON.parse(fs.readFileSync('./database/antilinkch.json'))
        const Antilinkch = m.isGroup ? ntlinkch.includes(m.chat) : false

        if (!m.fromMe && Antilinkch) {
            if (body.match(`whatsapp.com/channel/`)) {

                const gclink = "https://whatsapp.com/channel/0029Vb8pI9IInlqVmWlaoO09";
                const isLinkThisGc = new RegExp(gclink, "i");
                const isgclink = isLinkThisGc.test(body);

                if (isgclink) {
                    return RyuuBotz.sendMessage(m.chat, {
                        text: global.mess.antilink.ch,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterName: global.namabot,
                                newsletterJid: global.idSaluran
                            },
                            previewThumbnail: {
                                title: "Channel Link Terdeteksi",
                                description: "😶‍🌫️",
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
                                title: "🍡 Channel Link Terdeteksi ✨",
                                description: "😶‍🌫️",
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
                                title: "🍰 Channel Link Terdeteksi ✨",
                                description: "😶‍🌫️",
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
                    text: `*@${m.sender.split("@")[0]} dilarang kirim link ch*`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.namabot,
                            newsletterJid: global.idSaluran
                        },
                        mentionedJid: [m.sender],
                        previewThumbnail: {
                            title: "Channel Link Dihapus ",
                            description: "Link terdeteksi",
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