import fs from "fs";
import path from "path";

export default {
  command: ["on"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,
  code: async (m, { reply, text, prefix, RyuuBotz, appenTextMessage }) => {
    const getAntiPlugins = (dir) => {
      let results = [];
      if (!fs.existsSync(dir)) return results;
      const list = fs.readdirSync(dir);
      for (let file of list) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          results = results.concat(getAntiPlugins(fullPath));
        } else {
          const fileName = file.toLowerCase();
          if (fileName.includes("anti") && !fileName.includes("_events") && fileName.endsWith(".js")) {
            const cleanExt = file.replace(/\.js$/i, "");
            const parts = cleanExt.split("--");
            results.push(parts[parts.length - 1]);
          }
        }
      }
      return results;
    };

    const antiList = getAntiPlugins("./plugins");

    if (!text || isNaN(text)) {
      let caption = `*Daftar Fitur Anti (Aktifkan):*\n\n`;
      antiList.forEach((v, i) => {
        caption += `${i + 1}. ${v}\n`;
      });
      caption += `\nContoh: *${prefix}on 1*`;
      return reply(caption);
    }

    const index = parseInt(text) - 1;
    if (index < 0 || index >= antiList.length) return reply("Nomor tidak valid.");

    global.task[m.chat].task = false;
    await appenTextMessage(`${prefix}${antiList[index]} on`, m);
  }
};
