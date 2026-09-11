import "../settings.js";

export default {
  command: ['setcmd'],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply, stickerDB, saveStickerDB }) => {

  if (!m.quoted) return reply('Reply ke stiker yang mau dikasih command!');
  if (!m.quoted.fileSha256) return reply('SHA256 Hash Missing');
  if (!text) return reply(`Contoh: .setcmd menu`);

  const hash = m.quoted.fileSha256.toString('base64');
  if (stickerDB[hash] && stickerDB[hash].locked)
    return reply('Command ini terkunci dan tidak bisa diubah.');

  stickerDB[hash] = {
    text,
    mentionedJid: m.mentionedJid || [],
    creator: m.sender,
    at: +new Date(),
    locked: false,
  };

  saveStickerDB();
  reply(global.mess.success);

  }
};
