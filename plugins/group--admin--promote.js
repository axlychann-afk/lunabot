import '../settings.js';

export default {
  command: ["promote"],
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


  let users =
    m.mentionedJid[0] ||
    (m.quoted ? m.quoted.sender : null) ||
    (text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

  if (!users) return reply(`✨ Tag / reply member yang mau di-promote ya sayang 🐰`);

  try {
    await RyuuBotz.groupParticipantsUpdate(m.chat, [users], "promote");
    await reply(mess.success);
  } catch (e) {
    console.error("PROMOTE ERROR:", e);
    reply("❌ Gagal promote member, coba lagi nanti 🥺");
  }

  }
};
