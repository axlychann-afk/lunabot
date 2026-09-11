import "../settings.js";
import fs from "fs";

export default {
  event: async (m, { RyuuBotz, isImage }) => {  
  const antiimage =JSON.parse(fs.readFileSync('./database/antiimage.json'))
  const AntiImage = m.isGroup ? antiimage.includes(m.chat) : false
    if (isImage && AntiImage) {
      const image = await RyuuBotz.downloadAndSaveMediaMessage(m);
      const buffer = fs.readFileSync(image);
      const text = m.text || "";

      await RyuuBotz.sendMessage(m.key.remoteJid, {
        delete: {
          remoteJid: m.key.remoteJid,
          fromMe: m.fromMe,
          id: m.key.id,
          participant: m.key.participant
        }
      });

      await RyuuBotz.sendMessage(m.chat, {
        image: buffer,
        caption: `*Caption:*\n\n${text}`,
        viewOnce: true
      });
    }
  }
};