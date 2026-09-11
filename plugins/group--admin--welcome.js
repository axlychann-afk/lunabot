import fs from "fs";

export default {
  command: ["welcome"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply, db }) => {


    if (!db.welcome.groups) db.welcome.groups = {};
    if (!db.welcome.groups[m.chat]) db.welcome.groups[m.chat] = { welcome: false };

    if (!text) {
      return reply(
        `Gunakan:\n` +
        `.welcome on\n` +
        `.welcome off\n` +
        `.welcome set <teks>\n\n` +
        `Format teks bisa pakai:\n` +
        `@user = mention member\n` +
        `@group = nama grup`
      );
    }

    if (text.toLowerCase() === "on") {
      db.welcome.groups[m.chat].welcome = true;
      reply(`✅ Welcome diaktifkan di grup ini.`);
    } else if (text.toLowerCase() === "off") {
      db.welcome.groups[m.chat].welcome = false;
      reply(`❎ Welcome dimatikan di grup ini.`);
    } else if (text.toLowerCase().startsWith("set ")) {
      let teks = text.slice(4).trim();
      db.welcome.groups[m.chat].welcomeText = teks;
      reply(`✅ Pesan welcome berhasil diatur:\n${teks}`);
    } else {
      reply(`❌ Opsi tidak dikenal!`);
    }

    fs.writeFileSync("./database/welcome.json", JSON.stringify(db.welcome, null, 2));

  }
};
