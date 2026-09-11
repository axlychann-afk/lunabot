import fs from "fs";
import path from "path";

const settingsPath = path.resolve("./settings.js");

export default {
  command: ["autoregister", "autoregis"],
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
        `Contoh:\n${prefix + command} on\n${prefix + command} off\n\nStatus sekarang: *${global.autoregister}*`
      );
    }

    let file = fs.readFileSync(settingsPath, "utf8");

    if (!/global\.autoregister\s*=/.test(file)) {
      return reply("❌ global.autoregister tidak ditemukan di settings.js");
    }

    if (text.toLowerCase() === "on") {
      file = file.replace(/global\.autoregister\s*=\s*(true|false)/g, "global.autoregister = true");
      fs.writeFileSync(settingsPath, file);
      global.autoregister = true;
      reply("✅ autoregister aktif");
    } else if (text.toLowerCase() === "off") {
      file = file.replace(/global\.autoregister\s*=\s*(true|false)/g, "global.autoregister = false");
      fs.writeFileSync(settingsPath, file);
      global.autoregister = false;
      reply("✅ autoregister dimatikan");
    } else {
      reply(`❌ Pilihan tidak valid.\nGunakan:\n${prefix + command} on\n${prefix + command} off`);
    }
  }
};