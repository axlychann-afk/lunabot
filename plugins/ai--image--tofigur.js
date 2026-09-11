import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const defaultPrompt =
  "Using the model, create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is the modeling process of this figurine. Next to the computer screen is a RYUU-style toy packaging box printed with the original artwork. The packaging features two-dimensional flat illustrations.";

export default {
  command: ["taf", "tofigure", "tofigur"],
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
