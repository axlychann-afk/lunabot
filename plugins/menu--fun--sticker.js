import "../settings.js";

export default {
  command: ["s", "stiker", "sticker"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply }) => {

  try {
    // ambil pesan quoted atau pesan utama
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    let media = await q.download();

    // set packname & author (pakai | untuk pisah)
    let teks1 = text?.split('|')[0] ? text.split('|')[0] : global.packname;
    let teks2 = text?.split('|')[1] ? text.split('|')[1] : global.author;

    // validasi mime
    if (!/image|video|webp/.test(mime)) {
      return reply(
        `Kirim/reply gambar/video/stiker dengan caption *${m.prefix + m.command}*\nDurasi Video/GIF 1-5 Detik 🌸`
      );
    }

    // reaksi loading
    await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

    if (/video/.test(mime)) {
      // === STICKER VIDEO ===
      if ((q.msg || q).seconds > 5) return reply('Maksimal 5 detik yaa sayang 🥺🫧');
      await RyuuBotz.sendVideoAsSticker(m.chat, media, m, {
        packname: teks1,
        author: teks2,
      });

    } else if (/image|webp/.test(mime)) {
      // === STICKER FOTO ===
      await RyuuBotz.sendSticker(m.chat, {
        sticker: media,
        packname: teks1,
        author: teks2
    }, { quoted: m })
    }
  } catch (err) {
    reply(`❌ Gagal membuat stiker\n${err.message}`);
    console.error('❌ Gagal membuat stiker:', err);
  }

  }
};
