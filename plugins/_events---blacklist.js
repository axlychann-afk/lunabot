import "../settings.js";
import fs from 'fs';

export default { 
   event: async(m, { RyuuBotz }) => {
   let blacklist = JSON.parse(fs.readFileSync("./database/blacklist.json"));
   if (m.isGroup) {
   if (blacklist.includes(m.sender)) {
    await RyuuBotz.sendMessage(m.key.remoteJid, {
      delete: {
        remoteJid: m.key.remoteJid,
        fromMe: m.fromMe,
        id: m.key.id,
        participant: m.key.participant
       }
      });
     }
    }
   }
 };