import fs from "fs";
import axios from "axios";
import FormData from "form-data";

export default {
  command: ["aiedit", "image-edit", "imgedit"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply, command, prefix }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!/image/.test(mime)) {
      return reply(
        `📌 Reply gambar dengan caption: *${prefix + command} [prompt]*\nContoh: *${prefix + command} add hijab*`
      );
    }

    if (!text) {
      return reply(
        `*Prompt tidak boleh kosong!*\nContoh: *${prefix + command} add hijab*`
      );
    }

    await RyuuBotz.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    });

    let mediaPath;
    try {
      mediaPath = await RyuuBotz.downloadAndSaveMediaMessage(q);

      const form = new FormData();
      form.append("file", fs.createReadStream(mediaPath));
      form.append("prompt", text);
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
          caption: `✅ *Hasil AI Edit*\n\nPrompt: _${text}_`
        },
        { quoted: m }
      );

      await RyuuBotz.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });

    } catch (err) {
      console.error(err);
      await RyuuBotz.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      
      let errorMsg = err.response?.data?.message || err.message;
      reply(`❌ Gagal memproses gambar.\n*Error:* ${errorMsg}`);
    } finally {
      if (mediaPath && fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }
  }
};
