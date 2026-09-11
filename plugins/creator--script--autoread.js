import "../settings.js";

export default {
  command: ["autoread"],
  group: false,
  premium: false,
  limit: false,
  admin: false, 
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply, prefix, command, saveClientState }) => {

  if (!text) {
    return reply(
      `Contoh penggunaan:\n${prefix + command} on\n${prefix + command} off\n\nStatus autoread bot: *${global.Client[RyuuBotz.user.id.split(':')[0]].state.autoread}*`
    );
  }

  if (text.toLowerCase() === "on") {
    global.Client[RyuuBotz.user.id.split(':')[0]].state.autoread = true;
    saveClientState();
    reply(`✅ Autoread aktif\nStatus autoread sekarang ${global.Client[RyuuBotz.user.id.split(':')[0]].state.autoread}`);
  } else if (text.toLowerCase() === "off") {
    global.Client[RyuuBotz.user.id.split(':')[0]].state.autoread = false;
    saveClientState();
    reply(`✅ Autoread dimatikan\nStatus autoread sekarang ${global.Client[RyuuBotz.user.id.split(':')[0]].state.autoread}`);
  } else {
    reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix + command} on\n${prefix + command} off`
    );
  }

  }
};
