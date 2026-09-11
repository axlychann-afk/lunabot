import fs from "fs";
import "../settings.js";
let autoai = JSON.parse(fs.readFileSync('./database/autoai.json'));

export default {
  command: ["autoai"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply, pushname, prefix, command, RyuuBotz }) => {

  try {

    let set = (text || "").toLowerCase();

    if (set === "on") {
      if (autoai.includes(m.chat)) return reply("⚠️ Auto AI sudah aktif di chat ini.");
      autoai.push(m.chat);
      fs.writeFileSync('./database/autoai.json', JSON.stringify(autoai));
      reply("✅ Fitur autoai telah diaktifkan.\nBot akan otomatis merespon teks yang mereply pesannya");

    } else if (set === "off") {
      if (!autoai.includes(m.chat)) return reply("⚠️ Auto AI belum aktif di chat ini.");
      let index = autoai.indexOf(m.chat);
      autoai.splice(index, 1);
      fs.writeFileSync('./database/autoai.json', JSON.stringify(autoai));
      reply("❎ Fitur autoai telah dinonaktifkan.");

    } else {
      reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix}autoai on\n${prefix}autoai off`
    );
        }

  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan!\n*Error:* ${err.message}`);
  }

  }
};
