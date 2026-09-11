export default {
  command: ['listcmd'],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, stickerDB }) => {

  const teks = Object.entries(stickerDB).length
    ? `*📜 List Sticker Command*\n\n${Object.entries(stickerDB)
        .map(([key, value], i) => {
          const lockIcon = value.locked ? '🔒' : '🔓';
          return `${i + 1}. ${lockIcon} *${value.text}*\n   🧾 Hash: ${key}\n   👤 Creator: ${value.creator.split('@')[0]}\n`;
        })
        .join('\n')}`
    : 'Belum ada sticker command tersimpan~';

  RyuuBotz.sendText(
    m.chat,
    teks,
    m,
    {
      mentions: Object.values(stickerDB)
        .map(x => x.mentionedJid)
        .reduce((a, b) => [...a, ...b], []),
    }
  );

  }
};
