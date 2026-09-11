import fs from "fs";
import "../settings.js";
let adminOnly = JSON.parse(fs.readFileSync('./database/adminonly.json'));

export default {
  command: ["adminonly", "onlyadmin"],
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
      if (adminOnly.includes(m.chat)) return reply("⚠️ Admin Only sudah aktif di grup ini.");
      adminOnly.push(m.chat);
      fs.writeFileSync('./database/adminonly.json', JSON.stringify(adminOnly));
      reply("✅ Fitur Admin Only telah diaktifkan.\nBot akan mengabaikan pesan selain admin.");

    } else if (set === "off") {
      if (!adminOnly.includes(m.chat)) return reply("⚠️ Admin Only belum aktif di grup ini.");
      let index = adminOnly.indexOf(m.chat);
      adminOnly.splice(index, 1);
      fs.writeFileSync('./database/adminonly.json', JSON.stringify(adminOnly));
      reply("❎ Fitur Admin Only telah dinonaktifkan.");

    } else {
      reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix}adminonly on\n${prefix}adminonly off`
    );
        }

  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan!\n*Error:* ${err.message}`);
  }

  }
};
