import fs from "fs";
import path from "path";

const settingsPath = path.resolve("./settings.js");

export default {
  command: ["adreply"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply, prefix, command, isCreator }) => {
    if (!text) {
      return reply(
        `Contoh:\n${prefix + command} on\n${prefix + command} off\n\nStatus sekarang: *${global.adreply}*`
      );
    }

    let file = fs.readFileSync(settingsPath, "utf8");

    if (!/global\.adreply\s*=/.test(file)) {
      return reply("❌ global.adreply tidak ditemukan di settings.js");
    }

    if (text.toLowerCase() === "on") {
      file = file.replace(/global\.adreply\s*=\s*(true|false)/g, "global.adreply = true");
      fs.writeFileSync(settingsPath, file);
      global.adreply = true;
      reply("✅ adreply aktif");
    } else if (text.toLowerCase() === "off") {
      file = file.replace(/global\.adreply\s*=\s*(true|false)/g, "global.adreply = false");
      fs.writeFileSync(settingsPath, file);
      global.adreply = false;
      reply("✅ adreply dimatikan");
    } else {
      reply(`❌ Pilihan tidak valid.\nGunakan:\n${prefix + command} on\n${prefix + command} off`);
    }
  }
};