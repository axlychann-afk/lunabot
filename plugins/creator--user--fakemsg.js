export default {
    command: ["fakemsg"],
    group: false,
    premium: true,
    limit: true,
    admin: false,
    creator: true,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        text,
        reply
    }) => {
    if (!m.quoted) return reply("Minimal reply target sender nya dulu lah :v");
        const teksnya = text;
        const stanzaId = m.quoted.id;
        const participante = m.quoted.sender || m.quoted.participant;

        try {
            const msgTemp = await RyuuBotz.sendMessage(m.chat, {
                text: ''
            });
            const idTemp = msgTemp.key.id;

            await RyuuBotz.sendMessage(m.chat, {
                text: teksnya.trim(),
                edit: {
                    id: idTemp
                }
            }, {
                messageId: stanzaId
            });

            await Promise.all([
                RyuuBotz.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat,
                        id: idTemp,
                        fromMe: true
                    }
                }).catch(() => {}),
                RyuuBotz.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat,
                        id: stanzaId,
                        fromMe: false,
                        participant: participante
                    }
                }).catch(() => {}),
                //RyuuBotz.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: m.key.id, fromMe: false, participant: m.sender } }).catch(() => {}),
            ]);

        } catch (e) {
            console.error('[testsc]', e.message);
            m.reply('Erro: ' + e.message);
        }
    }
};