import fs from "fs";
import axios from "axios";

export default {
  command: ["hd", "remini"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, quoted, mime, reply, command, prefix, TempFile }) => {

    if (!quoted) {
      return reply(`📸 Reply foto/video dengan caption *${prefix + command}*`);
    }

    if (!/image|video/.test(mime)) {
      return reply(`📸 Hanya mendukung foto & video ya, sayang~`);
    }

    await RyuuBotz.sendMessage(m.chat, { react: { text: "⏳️", key: m.key } });

    try {
      const mediaPath = await RyuuBotz.downloadAndSaveMediaMessage(quoted);
      const fileSize = (fs.statSync(mediaPath).size / 1024).toFixed(2);

      const mem = await TempFile(mediaPath);
      const githubUrl = mem.url;

      if (mime.startsWith("image/")) {

        const response = await axios.get(
          `https://api-faa.my.id/faa/hdv3?image=${encodeURIComponent(githubUrl)}`,
          { 
            responseType: "arraybuffer",        
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
          }
        });

        await RyuuBotz.sendMessage(
          m.chat,
          {
            image: Buffer.from(response.data),
            caption: `✅ Foto sudah HD, sayang~ ✨\nUkuran asli: ${fileSize} KB`
          },
          { quoted: m }
        );

      } else if (mime.startsWith("video/")) {

        const res = await axios.get(
          `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(githubUrl)}`
        );

        if (!res.data?.status) {
          throw new Error("Gagal memproses HD video");
        }

        const videoBuff = Buffer.from(
          await axios.get(res.data.result.download_url, {
            responseType: "arraybuffer"
          }).then(r => r.data)
        );

        await RyuuBotz.sendMessage(
          m.chat,
          {
            video: videoBuff,
            caption: `✅ Video sudah HD, hehe~ 🎬\nUkuran asli: ${fileSize} KB`
          },
          { quoted: m }
        );
      }

      fs.unlinkSync(mediaPath);
      await RyuuBotz.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err) {
      console.error(err);
      reply(`Ups… gagal proses HD nya 🥺\nError: ${err.message}`);
    }
  }
};