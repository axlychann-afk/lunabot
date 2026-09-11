import fs from "fs";
import "../settings.js";
let antiimage = JSON.parse(fs.readFileSync('./database/antiimage.json'));

export default {
  command: ["antiimage"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply, pushname, prefix, command, RyuuBotz }) => {

  try {

    let set = (text || "").toLowerCase();

    if (set === "on") {
      if (antiimage.includes(m.chat)) return reply("⚠️ Anti Image sudah aktif di grup ini.");
      antiimage.push(m.chat);
      fs.writeFileSync('./database/antiimage.json', JSON.stringify(antiimage));
      reply("✅ Fitur antiimage telah diaktifkan.\nBot akan otomatis menghapus foto dan mengirim ulang fotonya 1x liat");

    } else if (set === "off") {
      if (!antiimage.includes(m.chat)) return reply("⚠️ Anti Image belum aktif di grup ini.");
      let index = antiimage.indexOf(m.chat);
      antiimage.splice(index, 1);
      fs.writeFileSync('./database/antiimage.json', JSON.stringify(antiimage));
      reply("❎ Fitur antiimage telah dinonaktifkan.");

    } else {
      reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix}antiimage on\n${prefix}antiimage off`
    );
        }

  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan!\n*Error:* ${err.message}`);
  }

  }
};
