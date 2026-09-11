import "../settings.js";

export default {
  command: ["out", "leave"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply }) => {
    try {
      if (m.isGroup) {
        await reply("*Bye bye, see you later*");
        await global.sleep(2000);
        await RyuuBotz.groupLeave(m.chat);
        return;
      }

      if (!text) {
        return reply("*Kasih link grupnya dong… aku ga bisa nebak-nebak*✨");
      }

      let match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);
      if (!match) {
        return reply("*Link grupnya ga valid… kamu salah copas ya?*");
      }

      let inviteCode = match[1];

      let info = await RyuuBotz.groupGetInviteInfo(inviteCode);
      let groupJid = info.id;

      await reply(`Keluar dari grup *${info.subject}*`);
      await global.sleep(2000);
      await RyuuBotz.groupLeave(groupJid);

    } catch (e) {
      console.error(e);
      reply("❌ Gagal keluar");
    }
  }
};