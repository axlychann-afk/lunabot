import "../settings.js";

export default {
  command: ["self"],
  group: false,
  premium: false,
  limit: false,
  admin: false, 
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply, prefix, command, saveClientState, isCreator }) => {
  if (!isCreator && !m.fromMe) return reply("*Kamu bukan Creator ku atau bot itu sendiri!*😡");

  if (!text) {
    return reply(
      `Contoh penggunaan:\n${prefix + command} on\n${prefix + command} off\n\nStatus self bot: *${global.Client[RyuuBotz.user.id.split(':')[0]].state.self}*`
    );
  }

  if (text.toLowerCase() === "on") {
    global.Client[RyuuBotz.user.id.split(':')[0]].state.self = true;
    saveClientState();
    reply(`✅ self aktif\nStatus self sekarang ${global.Client[RyuuBotz.user.id.split(':')[0]].state.self}`);
  } else if (text.toLowerCase() === "off") {
    global.Client[RyuuBotz.user.id.split(':')[0]].state.self = false;
    saveClientState();
    reply(`✅ self dimatikan\nStatus self sekarang ${global.Client[RyuuBotz.user.id.split(':')[0]].state.self}`);
  } else {
    reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix + command} on\n${prefix + command} off`
    );
  }

  }
};
