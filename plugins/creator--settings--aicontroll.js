import fs from "fs";
import path from "path";
import { MODEL_REGISTRY } from "../lib/mimo.js";

const settingsPath = path.resolve("./settings.js");

export default {
  command: ["aicontroll"],
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
        `Contoh:\n${prefix + command} on\n${prefix + command} off\n${prefix + command} model list\n${prefix + command} model set <ID MODEL>\n\nStatus sekarang: *${global.aicontroll}*\nModel sekarang: *${global.aicontrollmodel || "xiaomi/mimo-v2.5-pro"}*`
      );
    }

    const args = text.trim().split(/\s+/);
    const sub = args[0].toLowerCase();

    if (sub === "model") {
      const action = args[1] ? args[1].toLowerCase() : null;

      if (action === "list") {
        const list = MODEL_REGISTRY.map(
          (model, i) =>
            `${i + 1}. *${model.name}* — ${model.provider}${model.premium ? " ⭐" : ""}\n   ID: \`${model.id}\``
        ).join("\n");

        return reply(
          `📋 *Daftar Model AI (${MODEL_REGISTRY.length})*\n\n${list}\n\n💡 Gunakan:\n${prefix + command} model set <ID MODEL>`
        );
      }

      if (action === "set") {
        const modelId = args[2];

        if (!modelId) {
          return reply(
            `❌ Masukkan ID model.\nContoh: ${prefix + command} model set deepseek/deepseek-v4-flash\nCek daftar: ${prefix + command} model list`
          );
        }

        const found = MODEL_REGISTRY.find(
          (model) => model.id.toLowerCase() === modelId.toLowerCase()
        );

        if (!found) {
          return reply(
            `❌ Model *${modelId}* tidak ditemukan.\nCek daftar model: ${prefix + command} model list`
          );
        }

        let file = fs.readFileSync(settingsPath, "utf8");

        if (!/global\.aicontrollmodel\s*=/.test(file)) {
          return reply("❌ global.aicontrollmodel tidak ditemukan di settings.js");
        }

        file = file.replace(
          /global\.aicontrollmodel\s*=\s*"[^"]*"/g,
          `global.aicontrollmodel = "${found.id}"`
        );
        fs.writeFileSync(settingsPath, file);
        global.aicontrollmodel = found.id;

        return reply(`✅ Model AI diubah ke *${found.name}* (${found.id})`);
      }

      return reply(
        `❌ Subcommand tidak valid.\nGunakan:\n${prefix + command} model list\n${prefix + command} model set <ID MODEL>`
      );
    }

    if (sub === "on") {
      let file = fs.readFileSync(settingsPath, "utf8");

      if (!/global\.aicontroll\s*=/.test(file)) {
        return reply("❌ global.aicontroll tidak ditemukan di settings.js");
      }

      file = file.replace(/global\.aicontroll\s*=\s*(true|false)/g, "global.aicontroll = true");
      fs.writeFileSync(settingsPath, file);
      global.aicontroll = true;
      reply("✅ aicontroll aktif");
    } else if (sub === "off") {
      let file = fs.readFileSync(settingsPath, "utf8");

      if (!/global\.aicontroll\s*=/.test(file)) {
        return reply("❌ global.aicontroll tidak ditemukan di settings.js");
      }

      file = file.replace(/global\.aicontroll\s*=\s*(true|false)/g, "global.aicontroll = false");
      fs.writeFileSync(settingsPath, file);
      global.aicontroll = false;
      reply("✅ aicontroll dimatikan");
    } else {
      reply(
        `❌ Pilihan tidak valid.\nGunakan:\n${prefix + command} on\n${prefix + command} off\n${prefix + command} model list\n${prefix + command} model set <ID MODEL>`
      );
    }
  }
};
