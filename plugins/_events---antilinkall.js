import fs from "fs";

export default {
    event: async (m, {
        RyuuBotz,
        body,
        isCreator,
        isAdmins
    }) => {
        const ntlinkall = JSON.parse(fs.readFileSync('./database/antilinkall.json'))
        const Antilinkall = m.isGroup ? ntlinkall.includes(m.chat) : false
        if (!m.fromMe && Antilinkall) {
            let tldList = [];
            try {
                tldList = JSON.parse(fs.readFileSync("./database/domain.json"));
            } catch (e) {
                console.error("Gagal membaca file domain.json:", e);
            }

            const whitelist = ["https://api.ryuu-dev.my.id"];

            if (tldList.length > 0) {
                const foundTLD = tldList.find(tld => {
                    const regex = new RegExp(`\\b[a-z0-9-]+\\.${tld}\\b`, "i");
                    return regex.test(body);
                });

                const isWhitelisted = whitelist.some(w =>
                    body.toLowerCase().includes(w.toLowerCase())
                );

                if (foundTLD && !isWhitelisted) {
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
                                    title: "🍰 Link Terdeteksi ✨",
                                    description: "💬 Pesan diizinkan",
                                    thumbnail: {
                                        url: global.thumbnail.mini
                                    },
                                    sourceUrl: "https://api.ryuu-dev.my.id",
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
                                    title: "🍰 Link Terdeteksi ✨",
                                    description: "💬 Pesan diizinkan",
                                    thumbnail: {
                                        url: global.thumbnail.mini
                                    },
                                    sourceUrl: "https://api.ryuu-dev.my.id",
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
                        text: `🍧 *@${m.sender.split("@")[0]} ngirim link (.${foundTLD}) dan udah dihapus ya~* 💦`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterName: global.namabot,
                                newsletterJid: global.idSaluran
                            },
                            mentionedJid: [m.sender],
                            previewThumbnail: {
                                title: "🍡 Link Dihapus 💨",
                                description: "⚠️ Link terdeteksi",
                                thumbnail: {
                                    url: global.thumbnail.mini
                                },
                                sourceUrl: "https://api.ryuu-dev.my.id",
                                largerThumbnail: false
                            }
                        }
                    }, {
                        quoted: m
                    });
                }
            }
        }
    }
};