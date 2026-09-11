import "../settings.js";

export default {
  command: ["reactsw"],
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
      `Contoh penggunaan:\n${prefix + command} off\n${prefix + command} on\n\nStatus reactsw bot: *${global.reactsw}*`
    );
  }

  if (text.toLowerCase() === "on") {
    global.reactsw = true;
    reply(`✅ Bot reactsw off\nStatus reactsw bot sekarang ${global.reactsw}`);
  } else if (text.toLowerCase() === "off") {
    global.reactsw = false;
    reply(`✅ Bot reactsw on\nStatus reactsw bot sekarang ${global.reactsw}`);
  } else {
    reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix + command} on\n${prefix + command} off`
    );
  }

  }
};
