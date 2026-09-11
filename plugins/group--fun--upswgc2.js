import { getContentType } from '@ryuu-reinzz/baileys'

export default {
    command: ["upswgc2", "swgc2", "swgrup2"],
    group: true,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, { RyuuBotz, text, reply }) => {
        if (!m.quoted) return reply("Reply pesan yang ingin dijadikan Status Grup.");

        try {
            let quotedMsg = JSON.parse(JSON.stringify(m.quoted.fakeObj.message));
            let type = getContentType(quotedMsg);
            
            if (text) {
                if (quotedMsg[type] && Object.prototype.hasOwnProperty.call(quotedMsg[type], 'caption')) {
                    quotedMsg[type].caption = text;
                } else if (type === 'conversation') {
                    quotedMsg.conversation = text;
                } else if (type === 'extendedTextMessage') {
                    quotedMsg.extendedTextMessage.text = text;
                }
            }

            let temp = {
                groupStatusMessageV2: {
                    message: quotedMsg
                }
            };

            for (let i = 0; i < 5; i++) {
                temp = {
                    groupStatusMessageV2: {
                        message: temp
                    }
                };
            }

            await RyuuBotz.relayMessage(m.chat, temp, {});
            return reply("Berhasil.");

        } catch (e) {
            console.error(e);
            reply("Gagal.");
        }
    }
}
