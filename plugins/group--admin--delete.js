import fs from "fs";
import "../settings.js";

export default {
  command: ["delete", "cuih", "piu", "del"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { isCreator, RyuuBotz, reply }) => {

  try {
    if (!m.quoted) return reply("📌 Mau hapus apa?");
    if (!isCreator && m.quoted.sender.startsWith(global.ownernumber)) return reply("*Kenapa kamu mau hapus pesan owner ku?*🥺");
       
       

    await RyuuBotz.sendMessage(
      m.chat,
      { sticker: fs.readFileSync("./database/sticker/ancam.webp") },
      { quoted: m.quoted.fakeObj }
    );

    await RyuuBotz.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.quoted.id,
        participant: m.quoted.sender,
      },
    });

  } catch (err) {
    console.error(err);
    reply(`❌ Gagal menghapus pesan!\n*Error:* ${err.message}`);
  }

  }
};
