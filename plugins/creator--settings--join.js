import "../settings.js";

export default {
  command: ["join"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,

  code: async (m, { RyuuBotz, text, reply }) => {
    if (!text) {
      return reply("*Masukin link grupnya yah* ✨");
    }

    let match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);
    if (!match) {
      return reply("Link grupnya ga valid… kamu salah copas ya? aku perhatiin loh 😖");
    }

    let inviteCode = match[1];

    try {
      await RyuuBotz.groupAcceptInvite(inviteCode);
      reply(global.mess.success);
    } catch (e) {
      console.error(e);
      reply("❌ Gagal join grup… mungkin linknya udah expired atau aku udah ada di sana 😢");
    }
  }
};