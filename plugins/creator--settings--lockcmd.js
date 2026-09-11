export default {
  command: ['lockcmd'],
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

  if (!m.quoted) return reply('Reply ke stiker yang mau dikunci!');
  if (!m.quoted.fileSha256) return reply('SHA256 Hash Missing');

  const hash = m.quoted.fileSha256.toString('base64');
  if (!(hash in stickerDB))
    return reply('Stiker ini belum punya command.');

  stickerDB[hash].locked = true;
  saveStickerDB();
  reply('Command berhasil dikunci 🔒');

  }
};
