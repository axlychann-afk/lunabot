import "../settings.js";

export default {
  command: ["add"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, quoted, reply, mess }) => {

  try {

    let users;
    if (m.quoted) {
      users = await RyuuBotz.getPNFromLid(m, m.quoted.sender)
    } else if (text) {
      let number = text.replace(/[^0-9]/g, "");
      if (number.length < 5) return reply("❌ Nomor tidak valid!");
      users = number + "@s.whatsapp.net";
    } else {
      return reply("📌 Silakan reply pesan atau ketik nomor yang ingin ditambahkan!!!");
    }

    await RyuuBotz.groupParticipantsUpdate(m.chat, [users], "add");
    reply(`✅ Berhasil menambahkan anggota @${users.split("@")[0]}!`, { mentions: [users] });
  } catch (err) {
    console.error(err);
    reply(`❌ Gagal menambahkan anggota!\n*Error:* ${err.message}`);
  }

  }
};
