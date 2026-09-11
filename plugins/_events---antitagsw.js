import antiTagSW from '../lib/antitagsw.js';

export default {
  event: async (m, { RyuuBotz, chatUpdate }) => {
    let isMentioned = m.mtype == "groupStatusMentionMessage";
    for (let msg of chatUpdate.messages) {
      try {
        if (msg.key.remoteJid?.endsWith('@g.us')) {
          if (isMentioned && antiTagSW.isActive(msg.key.remoteJid)) {
            await RyuuBotz.sendMessage(msg.key.remoteJid, {
              delete: {
                remoteJid: msg.key.remoteJid,
                fromMe: false,
                id: msg.key.id,
                participant: msg.key.participant
              }
            });
          }
        }
      } catch (err) {
        console.error('❌ Antitagsw error:', err);
      }
    }
  }
};