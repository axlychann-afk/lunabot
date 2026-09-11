import fs from "fs";
import "../settings.js";
let mute = JSON.parse(fs.readFileSync('./database/mute.json'));

export default {
  command: ["mute"],
  group: true,
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
      if (mute.includes(m.chat)) return reply("⚠️ Mute bot sudah aktif di grup ini.");
      mute.push(m.chat);
      fs.writeFileSync('./database/mute.json', JSON.stringify(mute));
      reply("✅ Fitur Mute bot telah diaktifkan.\nBot akan mengabaikan seluruh pesan grup ini.");

    } else if (set === "off") {
      if (!mute.includes(m.chat)) return reply("⚠️ Mute belum aktif di grup ini.");
      let index = mute.indexOf(m.chat);
      mute.splice(index, 1);
      fs.writeFileSync('./database/mute.json', JSON.stringify(mute));
      reply("❎ Fitur Mute bot telah dinonaktifkan.");

    } else {
      reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix}mute on\n${prefix}mutel off`
    );
        }

  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan!\n*Error:* ${err.message}`);
  }

  }
};
