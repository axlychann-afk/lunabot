import "../settings.js";

export default {
  command: ['delcmd'],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { reply, stickerDB, saveStickerDB }) => {

  if (!m.quoted) return reply('Reply ke stiker yang mau dihapus command-nya!');
  if (!m.quoted.fileSha256) return reply('SHA256 Hash Missing');

  const hash = m.quoted.fileSha256.toString('base64');
  if (!hash || !(hash in stickerDB))
    return reply('Stiker ini belum punya command.');

  if (stickerDB[hash].locked)
    return reply('Command ini terkunci, tidak bisa dihapus.');

  delete stickerDB[hash];
  saveStickerDB();
  reply(global.mess.success);

  }
};
