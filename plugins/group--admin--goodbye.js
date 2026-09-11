import "../settings.js";
import fs from "fs";

export default {
  command: ["goodbye"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, mime, quoted, reply, db, prefix, command, pushname }) => {


    if (!db.welcome.groups) db.welcome.groups = {};
    if (!db.welcome.groups[m.chat]) db.welcome.groups[m.chat] = { goodbye: false };

    if (!text) {
      return reply(
        `Gunakan:\n` +
        `.goodbye on\n` +
        `.goodbye off\n` +
        `.goodbye set <teks>\n\n` +
        `Format teks:\n@user = mention member\n@group = nama grup`
      );
    }

    if (text.toLowerCase() === "on") {
      db.welcome.groups[m.chat].goodbye = true;
      reply(`✅ Goodbye diaktifkan di grup ini.`);
    } else if (text.toLowerCase() === "off") {
      db.welcome.groups[m.chat].goodbye = false;
      reply(`❎ Goodbye dimatikan di grup ini.`);
    } else if (text.toLowerCase().startsWith("set ")) {
      let teks = text.slice(4).trim();
      db.welcome.groups[m.chat].goodbyeText = teks;
      reply(`✅ Pesan goodbye berhasil diatur:\n${teks}`);
    } else {
      reply(`❌ Opsi tidak dikenal!`);
    }

    fs.writeFileSync("./database/welcome.json", JSON.stringify(db.welcome, null, 2));

  }
};
