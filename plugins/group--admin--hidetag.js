import "../settings.js";

export default {
  command: ["hidetag", "h", "ht"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { groupMetadata, reply, RyuuBotz, mess, text, qgrup }) => {


  let mem = m.isGroup ? groupMetadata.participants.map(a => a.id) : [];
  let teks = text ? text : (m.quoted?.text ? m.quoted.text : "");

  await RyuuBotz.sendMessage(m.chat, {
    text: `@${m.chat} ${teks}`,
    contextInfo: {
      mentionedJid: mem,
      groupMentions: [
        {
          groupJid: m.chat,
          groupSubject: "everyone"
        }
      ],
      statusAttributions: []
    },
  }, { quoted : qgrup });
  }
};
