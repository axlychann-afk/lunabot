import fs from "fs";
import path from "path";

const settingsPath = "./settings.js";

export default {
  command: ["disable", "disableplug"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply }) => {
    if (!text) {
      return reply("Format:\n.disable <namaFile>\nAtau: .disable developer_command");
    }

    if (text === "developer_command" || text === "devcmd") {
      try {
        let settingsContent = fs.readFileSync(settingsPath, "utf8");
        
        if (!settingsContent.includes("global.devCommand")) {
          return reply("Error: Variabel global.devCommand tidak ditemukan di settings.js");
        }

        const updatedSettings = settingsContent.replace(
          /global\.devCommand\s*=\s*(true|false|[^;]+)/,
          "global.devCommand = false"
        );

        fs.writeFileSync(settingsPath, updatedSettings);
        global.devCommand = false;

        return reply("✅ Global Developer Command berhasil di-disable!");
      } catch (err) {
        return reply("Gagal mengupdate settings: " + err.message);
      }
    }

    const fileName = text.endsWith(".js") ? text : `${text}.js`;
    const pluginDir = "./plugins";
    let targetFile = null;

    function walk(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          walk(full);
          if (targetFile) return;
        } else if (file === fileName) {
          targetFile = full;
          return;
        }
      }
    }

    walk(pluginDir);

    if (!targetFile) {
      return reply(`File *${fileName}* tidak ditemukan`);
    }

    try {
      let code = fs.readFileSync(targetFile, "utf8");

      if (!code.includes("disable:")) {
        return reply("Plugin ini belum punya properti disable");
      }

      const updatedCode = code.replace(
        /disable\s*:\s*(true|false)/,
        "disable: true"
      );

      fs.writeFileSync(targetFile, updatedCode);
      reply(`Plugin *${fileName}* berhasil di *disable* ⛔`);
    } catch (err) {
      reply("Terjadi kesalahan: " + err.message);
    }
  }
};
