import "../settings.js";

export default {
  command: ["onlygc", "gconly"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply, prefix, command }) => {

  if (!text) {
    return reply(
      `Contoh penggunaan:\n${prefix + command} off\n${prefix + command} on\n\nStatus Group Only bot: *${global.onlyGc}*`
    );
  }

  if (text.toLowerCase() === "on") {
    global.onlyGc = true;
    reply(`✅ Bot mode Group Only aktif\nStatus Group Only bot sekarang ${global.onlyGc}`);
  } else if (text.toLowerCase() === "off") {
    global.onlyGc = false;
    reply(`✅ Bot mode Group Only nonaktif\nStatus Group Only bot sekarang ${global.onlyGc}`);
  } else {
    reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix + command} on\n${prefix + command} off`
    );
  }

  }
};
