import axios from 'axios';

export default {
  command: ['animage', 'wails', 'animegen'],
  group: false,
  premium: true,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

code: async (m, { RyuuBotz, text, reply, prefix, command }) => {

    if (!text) {
        return reply(
            `📌 Format:\n*${prefix + command} [prompt]*\n` +
            `Contoh: *${prefix + command} shiroko blue archive in the bath*`
        );
    }

    await RyuuBotz.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const resultUrl = await axios.get(`https://api.nekolabs.web.id/img.gen/wai-nsfw-illustrous/v12?prompt=${encodeURIComponent(text)}&ratio=1%3A1`);

        if (!resultUrl) throw new Error('No result returned');

        const imgBuffer = await axios
            .get(resultUrl.data.result, { responseType: 'arraybuffer' })
            .then(r => Buffer.from(r.data));

        await RyuuBotz.sendMessage(
            m.chat,
            {
                image: imgBuffer,
                caption: `✨ *Anime Image Generated*\nPrompt: ${text}`
            },
            { quoted: m }
        );

        await RyuuBotz.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        await RyuuBotz.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        reply(`❌ Error: ${err.message}`);
    }

  }
};
