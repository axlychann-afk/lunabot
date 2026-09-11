import "../settings.js";

export default {
  event: async (m, { RyuuBotz, stickerDB, isSticker }) => {
    if (isSticker && (m.msg.fileSha256.toString() in stickerDB)) {
      const hash = m.msg.fileSha256.toString()
      const { text, mentionedJid } = stickerDB[hash]

      const contextInfo = {
        mentionedJid
      }

      if (m.quoted) {
        contextInfo.quotedMessage = m.quoted.fakeObj.message
        contextInfo.stanzaId = m.quoted.id
        contextInfo.participant = m.sender
        contextInfo.remoteJid = m.chat
      }

      const fakeMsg = {
        key: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.sender
        },
        message: {
          conversation: text,
          contextInfo: Object.keys(contextInfo).length ? contextInfo : undefined
        },
        pushName: m.pushName
      }

      RyuuBotz.ev.emit('messages.upsert', {
        messages: [fakeMsg],
        type: 'append'
      })
    }
  }
};