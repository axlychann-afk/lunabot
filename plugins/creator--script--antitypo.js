import "../settings.js";

export default {
  command: ["antitypo", "similitary", "didyoumean"],
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
      `Contoh penggunaan:\n${prefix + command} off\n${prefix + command} on\n\nStatus antiTypo bot: *${global.antiTypo}*`
    );
  }

  if (text.toLowerCase() === "on") {
    global.antiTypo = true;
    reply(`✅ Bot antitypo on\nStatus antiTypo bot sekarang ${global.antiTypo}`);
  } else if (text.toLowerCase() === "off") {
    global.antiTypo = false;
    reply(`✅ Bot antitypo off\nStatus antiTypo bot sekarang ${global.antiTypo}`);
  } else {
    reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix + command} on\n${prefix + command} off`
    );
  }

  }
};
