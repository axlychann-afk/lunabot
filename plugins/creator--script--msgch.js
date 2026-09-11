import "../settings.js";

export default {
  command: ["msgch"],
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

  if (!text) return reply(`Contoh: *${prefix + command} Halo semua channel!*`);

  const idch = '120363419382206255@newsletter';
  const username = m.pushName;
  let url;

  try {
    url = await RyuuBotz.profilePictureUrl(m.sender, 'image');
  } catch {
    url = 'https://files.catbox.moe/f61syu.jpg';
  }

  try {
    await RyuuBotz.sendMessage(idch, {
      text: text.trim(),
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: global.ownername,
          newsletterJid: idch,
        },
        externalAdReply: {
          title: `Pesan dari ${username}`,
          body: 'Broadcast dari Owner',
          thumbnailUrl: url,
          mediaType: 1,
          showAdAttribution: false,
        },
      },
    });

    reply(global.mess.success);

  } catch (err) {
    console.error(err);
    reply(`❌ Gagal mengirim pesan ke channel:\n${idch}\n\nError: ${err.message}`);
  }

  }
};
