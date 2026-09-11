import "../settings.js";
import fs from "fs";
import path, { resolve } from "path";
import chalk from "chalk";

export default {
  command: ["reload", "refresh"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, reply }) => {

  await RyuuBotz.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key } });

  const pluginsFolder = path.resolve("./plugins");
  const handlerPath = resolve(process.cwd(), "engines/handler.js");
  let loaded = 0;

  try {
    // Reload semua plugin
    const files = fs.readdirSync(pluginsFolder).filter(f => f.endsWith(".js"));
    for (const file of files) {
      const filePath = path.join(pluginsFolder, file);
      try {
        await import(`${filePath}?update=${Date.now()}`);
        loaded++;
      } catch {
        console.log(chalk.red(`❌ Gagal reload: ${file}`));
      }
    }

    // Reload engines/handler.js
    await import(`${handlerPath}?update=${Date.now()}`);

    // Console log hasil
    console.log(chalk.greenBright(`
Reload Success ✅
🔹Reloaded plugin: ${loaded}
🔹Reloaded engines/handler.js
`));

    // Balasan ke user
    reply(`✅ *Reload Success!*
🔹Reloaded plugin: ${loaded}
🔹Reloaded engines/handler.js`);
  } catch (err) {
    console.error(chalk.redBright("❌ Gagal reload system!"), err);
    reply("❌ Gagal reload plugins!");
  }

  }
};
