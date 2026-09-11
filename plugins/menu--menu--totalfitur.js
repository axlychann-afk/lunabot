import "../settings.js";
import fs from "fs";
import path from "path";

export default {
  command: ["totalcmd", "totalfitur"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, reply }) => {

  await RyuuBotz.sendMessage(m.chat, {
    react: { text: "⏳", key: m.key },
  });

  try {
    let handlerCommands = [];
    try {
      const code = fs.readFileSync("./engines/handler.js", "utf8");
      const regex = /case\s+['"`]([^'"`]+)['"`]:/g;
      let match;
      while ((match = regex.exec(code))) {
        handlerCommands.push(match[1].toLowerCase());
      }
    } catch (err) {
      console.error("Gagal baca engines/handler.js:", err);
    }

    let pluginCommands = [];
    try {
      const pluginDir = path.join(process.cwd(), "plugins");
      const files = fs.readdirSync(pluginDir).filter(f => f.endsWith(".js"));

      for (const file of files) {
        const content = fs.readFileSync(path.join(pluginDir, file), "utf8");
        const matchArray = [
          ...content.matchAll(/command\s*:\s*(\[[^\]]+\]|["'`][^"'`]+["'`])/g),
        ];

        for (const match of matchArray) {
          let cmd = match[1];
          if (cmd.startsWith("[")) {
            try {
              const arr = eval(cmd);
              pluginCommands.push(...arr.map(v => v.toLowerCase()));
            } catch {
              pluginCommands.push(cmd.replace(/["'`\[\]]/g, "").toLowerCase());
            }
          } else {
            pluginCommands.push(cmd.replace(/["'`]/g, "").toLowerCase());
          }
        }
      }
    } catch (err) {
      console.error("Gagal ambil plugin command:", err);
    }

    const help = [...new Set([...handlerCommands, ...pluginCommands])];

    const result = `📦 *Total Fitur:*\n` +
                   `🔹 Command Case: ${handlerCommands.length}\n` +
                   `🔹 Command Plugin: ${pluginCommands.length}\n` +
                   `🔹 Total Command: ${help.length}`;

    await reply(result);

    await RyuuBotz.sendMessage(m.chat, {
      react: { text: "✅", key: m.key },
    });

  } catch (err) {
    console.error(err);
    reply(`❌ Error membaca fitur: ${err.message}`);
  }

  }
};
