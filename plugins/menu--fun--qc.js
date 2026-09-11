import axios from "axios";

export default {
    command: ["qc", "quotechat", "qc1", "qc2"],
    group: false,
    premium: false,
    limit: true,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (message, {
        text,
        RyuuBotz,
        reply,
        command,
        store,
        isCreator
    }) => {
        try {
            let targetMsg;
            const isQc2 = command === "qc2";

            if (isQc2) {
                if (!message.quoted) return reply("⚠️ Reply pesan untuk qc2");
                targetMsg = await store.loadMessage(message.chat, message.quoted.id);
            } else {
                targetMsg = await store.loadMessage(message.chat, message.key.id);
            }

            if (!targetMsg) return reply("❌ Gagal memuat data pesan.");

            let qcText = text ||
                targetMsg.message?.conversation ||
                targetMsg.message?.extendedTextMessage?.text ||
                targetMsg.message?.imageMessage?.caption ||
                targetMsg.message?.videoMessage?.caption ||
                "......";

            const senderJid = targetMsg.key.participant || targetMsg.key.remoteJid;
            const senderPN = await RyuuBotz.getPNFromLid(message, senderJid);
            const isTargetOwner = senderPN.split("@")[0] === global.ownernumber;

            const senderName = isTargetOwner ?
                global.ownername :
                (targetMsg.pushName || await RyuuBotz.getName(senderJid) || ".~");


            let profile;
            try {
                profile = await RyuuBotz.profilePictureUrl(senderJid);
            } catch {
                profile = "https://i.imgur.com/8ptnnyq.png";
            }

            let quotedData = null;
            const contextInfo = targetMsg.message?.extendedTextMessage?.contextInfo ||
                targetMsg.message?.imageMessage?.contextInfo ||
                targetMsg.message?.videoMessage?.contextInfo;

            if (contextInfo?.quotedMessage) {
                const qMsg = contextInfo.quotedMessage;
                const qSender = contextInfo.participant;
                const qSenderPN = await RyuuBotz.getPNFromLid(message, qSender);
                const qisOwner = qSenderPN.split("@")[0] === global.ownernumber;
                const qName = qisOwner ? global.ownername : (await RyuuBotz.getName(qSender) || ".~");



                quotedData = {
                    name: qName,
                    number: "-",
                    message: qMsg.conversation ||
                        qMsg.extendedTextMessage?.text ||
                        qMsg.imageMessage?.caption ||
                        "......"
                };
            }

            const payload = {
                sender_name: senderName,
                sender_number: "-",
                sender_avatar: profile,
                message: qcText,
                time: new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                }).replace(":", "."),
                background: false,
                quoted: quotedData || {},
            };

            const {
                data
            } = await axios.post(
                "https://qwa.eeq.my.id/api/generate",
                payload, {
                    responseType: "arraybuffer",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0",
                    },
                }
            );

            await RyuuBotz.sendSticker(
                message.chat, {
                    sticker: Buffer.from(data),
                    packname: global.packname,
                    author: global.author,
                }, {
                    quoted: message,
                }
            );

        } catch (err) {
            console.error(err);
            reply("❌ Gagal membuat QC.");
        }
    },
};