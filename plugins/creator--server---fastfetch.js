import { execSync } from "child_process";

export default {
  command: ["fastfetch", "sysinfo", "ffetch"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { reply, RyuuBotz }) => {
    try {
      const raw = execSync("fastfetch --logo kali", {
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 10
      });

      const clean = raw
        .replace(/\x1B\[[0-9;?]*[ -/]*[@-~]/g, "")
        .replace(/\x1B\][^\x07]*(\x07|\x1B\\)/g, "")
        .replace(/\r/g, "")
        .trim();

      await RyuuBotz.messageBuilder(m.chat, {
        quoted: m
      })
        .setType("AIRich")
        .setTitle("🖥️ Fastfetch System Info")
        .setFooter("Ryuu Bot Monitoring")
        .addCode('bash', `\`${clean}\``)
        .send();

    } catch (err) {
      return reply(
        "❌ Fastfetch gagal jalan:\n" + err.message
      );
    }
  }
};