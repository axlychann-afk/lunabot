import "../settings.js";

export default {
  command: ["tagall"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { participants, reply, q, RyuuBotz }) => {

    
  let themeemoji = global.themeemoji;
  let me = m.sender;
  let teks = `╚»˙·٠${themeemoji}●♥ Tag All ♥●${themeemoji}٠·˙«╝

 😶 *Penanda :* @${me.split("@")[0]}
 🌿 *Isi pesan :* ${q ? q : "tidak ada pesan"}\n\n`;

  for (let mem of participants) {
    teks += `${themeemoji} @${mem.id.split("@")[0]}\n`;
  }

  await RyuuBotz.sendMessage(
    m.chat,
    { text: teks, mentions: participants.map(a => a.id) },
    { quoted: m }
  );

  }
};
