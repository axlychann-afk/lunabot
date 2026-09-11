import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const defaultPrompt =
  "change the skin color of a character or person in a photo to black and as dark as the blackest black";

export default {
  command: ["hitamkan", "gelapkan", "irengkan"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, reply, command, prefix }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!/image/.test(mime)) {
      return reply(`📌 Reply gambar dengan caption: *${prefix + command}*`);
    }

    await RyuuBotz.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key },
    });

    let mediaPath;
    try {
      mediaPath = await RyuuBotz.downloadAndSaveMediaMessage(q);

      const form = new FormData();
      form.append("file", fs.createReadStream(mediaPath));
      form.append("prompt", defaultPrompt);
      form.append("model", "gpt-image-1.5");

      const response = await axios.post(
        "https://api.ryuu-dev.my.id/ai/gpt-img-edit",
        form,
        {
          headers: {
            ...form.getHeaders(),
            "accept": "application/json",
            "x-ryuu-apikey": global.ryuukey
          }
        }
      );

      const resultUrl = response.data?.result?.data?.link;

      if (!resultUrl) throw new Error("Gagal mendapatkan link hasil dari API.");

      await RyuuBotz.sendMessage(
        m.chat,
        {
          image: { url: resultUrl },
          caption: `*${command}* *completed 🍰*`,
        },
        { quoted: m }
      );

      await RyuuBotz.sendMessage(m.chat, {
        react: { text: "✅", key: m.key },
      });

    } catch (err) {
      console.error(err);
      await RyuuBotz.sendMessage(m.chat, {
        react: { text: "❌", key: m.key },
      });
      
      let errorMsg = err.response?.data?.message || err.message;
      reply(`❌ Gagal memproses gambar.\n*Error:* ${errorMsg}`);
    } finally {
      if (mediaPath && fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }
  },
};
