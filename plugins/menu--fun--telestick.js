import "../settings.js";

export default {
  command: ["telestick"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { command, prefix, RyuuBotz, text, reply }) => {
    try {
      if (!text) {
        return reply(`Masukan Format Dengan Benar!\n\nContoh:\n${prefix + command} https://t.me/addstickers/NamaPack`);
      }

      if (!text.startsWith("https://t.me/addstickers/")) {
        return reply("❌ URL tidak valid. Gunakan link Telegram sticker pack.\nContoh: https://t.me/addstickers/NamaPack");
      }

      await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

      let url = `https://api.theresav.biz.id/download/telestick?url=${encodeURIComponent(text)}`
      
      let res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': '2gEiT'
        }
      });
      let json = await res.json();

      if (!json.status) throw new Error('Gagal mengambil data. Pastikan URL benar.');

      const pack = json.result;

      const stickerBuffers = [];
      for (const s of pack.stickers) {
        const r = await fetch(s.image_url);
        const ab = await r.arrayBuffer();
        const buf = Buffer.from(new Uint8Array(ab));
        stickerBuffers.push({
          data: buf,
          emojis: [s.emoji || '🎨']
        });
      }

      const cover = stickerBuffers[0].data;

      await RyuuBotz.sendStickerPack(
        m.chat, {
            name: pack.title,
            publisher: pack.name,
            description: `${pack.stickers.length} stickers | ${pack.sticker_type}`,
            cover,
            stickers: stickerBuffers
          
        }, {
          quoted: m
        }
      );

      await RyuuBotz.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err) {
      reply(`❌ Gagal mengambil stiker Telegram\n${err.message}`);
      console.error('❌ Error Telestick:', err);
    }
  }
};
