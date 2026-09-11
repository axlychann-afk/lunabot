import "../settings.js";

export default {
    command: ["dmsg", "sdel", "sdelete", "silentdel", "silentdelete", "bungkam"],
    group: true,
    premium: false,
    limit: false,
    admin: false,
    creator: true,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        reply
    }) => {
        if (!m.quoted) {
            return reply('Reply pesan yang ingin diproses.');
        }

        try {
            const chatId = m.chat;
            const stanzaId = m.quoted.id;

            const tempId = await RyuuBotz.relayMessage(
                chatId, {
                    groupStatusMessageV2: {
                        message: {
                            extendedTextMessage: {
                                text: '',
                                contextInfo: {
                                    isGroupStatus: true,
                                },
                            },
                        },
                    },
                }, {}
            );

            const tempId2 = await RyuuBotz.relayMessage(
                chatId, {
                    protocolMessage: {
                        key: {
                            jid: chatId,
                            fromMe: true,
                            id: tempId,
                        },
                        type: 14,
                        editedMessage: {
                            extendedTextMessage: {
                                text: '\0',
                                contextInfo: {
                                    isGroupStatus: false,
                                },
                            },
                        },
                    },
                }, {
                    messageId: stanzaId,
                }
            );

            await global.sleep(100);

            await Promise.allSettled([
                RyuuBotz.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        id: tempId,
                        fromMe: true,
                    },
                }),
                RyuuBotz.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        id: tempId2,
                        fromMe: true,
                    },
                }),
            ]);
            try {
                await RyuuBotz.sendMessage(chatId, {
                    delete: m.key,
                });
            } catch {};
        } catch (e) {
            console.error('[dmsg]', e);
            await reply('Error: ' + (e?.message || e));
        }
    }
};