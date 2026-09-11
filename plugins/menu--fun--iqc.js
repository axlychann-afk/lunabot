import axios from 'axios';

export default {
  command: ['iqc', 'iqcard'],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, RyuuBotz, reply, command, prefix }) => {

    if (!text) {
      return reply(
        `⚠️ *Format Salah!*\n\n` +
        `Gunakan format: *${prefix + command} Pesan|JamChat|JamStatus*\n\n` +
        `📌 *Contoh:*\n` +
        `${prefix + command} deuabotz|22:11|22:20`
      );
    }

    await RyuuBotz.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    try {
      const [message, chatTime = '00:00', statusBarTime = '00:00'] =
        text.split('|').map(v => v.trim());

      const apiUrl =
        `https://api.deline.web.id/maker/iqc` +
        `?text=${encodeURIComponent(message)}` +
        `&chatTime=${encodeURIComponent(chatTime)}` +
        `&statusBarTime=${encodeURIComponent(statusBarTime)}`;

      const res = await axios.get(apiUrl, {
        responseType: 'arraybuffer',        
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://api.deline.web.id",
            "Referer": "https://api.deline.web.id/",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Sec-Ch-Ua": '"Not(A:Brand";v="24", "Chromium";v="122", "Google Chrome";v="122"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
          },
          timeout: 20000
        });

      await RyuuBotz.sendMessage(
        m.chat,
        {
          image: Buffer.from(res.data),
          caption: '✅ *IQC Card Created*'
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('Error IQC:', err);
      await RyuuBotz.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply('❌ Terjadi kesalahan saat membuat gambar.');
    }
  }
};