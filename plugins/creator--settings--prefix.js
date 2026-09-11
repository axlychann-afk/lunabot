export default {
  command: ["prefix"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply, prefix }) => {
  
  if (!text) {
    return reply(
      `📌 Contoh penggunaan:\n${prefix}prefix on\n${prefix}prefix off`
    );
  }

  if (text.toLowerCase() === "on") {
    global.pref = true;
    reply(`✅ Prefix diaktifkan.\nPrefix sekarang: "${global.prefix}"`);
  } else if (text.toLowerCase() === "off") {
    global.pref = false;
    reply(`✅ Prefix dimatikan.\nSekarang command tanpa prefix.`);
  } else {
    reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix}prefix on\n${prefix}prefix off`
    );
  }

  }
};
