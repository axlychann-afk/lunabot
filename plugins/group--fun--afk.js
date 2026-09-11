
export default {
  command: ["afk"],
  group: true,
  premium: false,
  limit: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, replyafk, saveAFK, afkDB }) => {

  let alasan = text ? text : "Tanpa alasan";
  let chatId = m.chat; 
  let userId = m.sender;

  let existing = afkDB.find(u => u.user === userId && u.chat === chatId);

  if (existing) {
    existing.afkTime = Date.now();
    existing.alasan = alasan;
  } else {
    afkDB.push({
      user: userId,
      chat: chatId, 
      afkTime: Date.now(),
      alasan: alasan,
    });
  }

  saveAFK();
  replyafk(
`🍡 Heii~ @${userId.split("@")[0]} lagi AFK dulu yaa~ 💭💤
🌷 *Alasannya:* ${alasan} 🫧
🕒 *Jangan diganggu dulu ya~* 🌸`
    );

  }
};
