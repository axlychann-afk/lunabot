import '../settings.js';

export default {
  command: ["demote"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply }) => {


  // Ambil target user
  let users =
    m.mentionedJid[0] ||
    (m.quoted ? m.quoted.sender : null) ||
    (text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

  if (!users) return reply(`✨ Tag / reply member yang mau di-demote ya sayang 🐰`);

  try {
    await RyuuBotz.groupParticipantsUpdate(m.chat, [users], "demote");
    await reply(mess.success);
  } catch (e) {
    console.error("DEMOTE ERROR:", e);
    reply("❌ Gagal demote member, coba lagi nanti 🥺");
  }

  }
};
