import "../settings.js";

export default {
  command: ["msgch2"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { prefix, command, RyuuBotz, text, reply }) => {

  if (!m.quoted) return reply(`Reply media (foto/video/audio) yang ingin dikirim ke saluran.\n\nContoh: *${prefix + command} Ini caption-nya!*`);

  const idch = "120363419382206255@newsletter"
  const quoted = m.quoted;
  const mime = quoted.mimetype || '';
  const caption = text || '';
  const username = m.pushName;  

  try {
    const buffer = await quoted.download();
    let content;

    if (/image/.test(mime)) {
      content = {
        image: buffer,
        caption,        
      };
    } else if (/video/.test(mime)) {
      content = {
        video: buffer,
        caption,
        mimetype: mime,        
      };
    } else if (/audio/.test(mime)) {
      content = { 
      audio: buffer, 
      mimetype: mime, 
      ptt: true
       };
    } else {
      return reply("Jenis media tidak didukung. Reply foto, video, atau audio.");
    }

    await RyuuBotz.sendMessage(idch, content);
    reply(global.mess.success);

  } catch (err) {
    console.error(err);
    reply(`❌ Gagal meneruskan media:\n${err.message}`);
  }

  }
};
