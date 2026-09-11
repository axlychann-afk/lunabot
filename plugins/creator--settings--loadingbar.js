import "../settings.js";

export default {
  command: ["loading-bar", "loading"],
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
      `Contoh penggunaan:\n${prefix + command} on\n${prefix + command} off\n\nStatus Loading Bar: *${global.BarLoad}*`
    );
  }

  if (text.toLowerCase() === "on") {
    global.BarLoad = true;
    reply(`✅ Loading Bar diaktifkan\nStatus Loading Bar sekarang ${global.BarLoad}`);
  } else if (text.toLowerCase() === "off") {
    global.BarLoad = false;
    reply(`✅ Loading Bar dimatikan\nStatus Loading Bar sekarang ${global.BarLoad}`);
  } else {
    reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix + command} on\n${prefix + command} off`
    );
  }

  }
};
