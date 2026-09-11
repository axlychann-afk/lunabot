import axios from 'axios';

export default {
  command: ["bratnime"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply }) => {

  if (!text) return reply('❌ Masukkan teks untuk membuat stiker.');

  await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

  try {
    const sticker = `https://api.ryuu-dev.offc.my.id/tools/bratnime?text=${encodeURIComponent(text)}&apikey=RyuuGanteng`;

    await RyuuBotz.sendImageAsSticker(m.chat, sticker, m, {
      packname: global.packname,
      author: global.author
    });
  } catch (err) {
    console.error("❌ Error:", err);
    reply("Terjadi kesalahan saat membuat stiker.");
  }

  }
};
