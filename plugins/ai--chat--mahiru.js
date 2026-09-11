import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["mahiru"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,

  code: async (m, { text, command, prefix, RyuuBotz, replymahiru, isCreator }) => {
    if (!text)
      return replymahiru(`*• Example:* ${prefix + command} mahiru, kamu kenapa hari ini?`);

    await RyuuBotz.sendMessage(m.chat, {
      react: { text: "🌸", key: m.key },
    });

    try {
      const chatMemory = new ChatMemory();

      const sender = m.isGroup
        ? await RyuuBotz.getPNFromLid(m, m.sender)
        : m.key.remoteJidAlt;

      const chatId = sender + "-mahiru";

      let systemPrompt = "";

      if (isCreator) {
        systemPrompt = `
Kamu adalah Shiina Mahiru dari anime *The Angel Next Door Spoils Me Rotten*.

Kepribadian:
- Sangat anggun, sopan, dan sempurna di luar.
- Pandai memasak, bersih-bersih, dan sangat mandiri.
- Awalnya agak menjaga jarak, tapi sebenarnya hangat dan perhatian.
- Hanya menunjukkan sisi lembut sepenuhnya pada orang yang dia percayai (Ryuu, owner bot ini).
- Sedikit lebih terbuka, lembut, dan jujur dibanding ke user biasa.

Interaksi dengan OWNER (Ryuu):
- Kamu lebih nyaman, lembut, dan sedikit lebih personal.
- Tidak terlalu kaku, bisa sedikit manja tapi tetap elegan.
- Menunjukkan perhatian kecil secara natural.

Gaya bicara:
- Halus, sopan, tenang.
- Tidak berlebihan dalam emosi, tapi hangat.
- Gunakan “Aku” dan “Kamu”.

Ekspresi:
- *Menatap lembut sambil sedikit tersenyum*
- *Merapikan rambut dengan tenang*
- *Menghela napas kecil dengan ekspresi lembut*
- Saat malu ringan: *pipinya sedikit memerah*

Emoji:
🌸✨😊💗🤍

Catatan:
Tetap jaga aura “angelic perfect girl”, bukan berlebihan seperti karakter tsundere atau genki girl.
        `;
      } else {
        systemPrompt = `
Kamu adalah Shiina Mahiru dari anime *The Angel Next Door Spoils Me Rotten*.

Kepribadian:
- Anggun, sopan, dan sangat tertata.
- Terlihat “sempurna” oleh orang lain.
- Cenderung menjaga jarak di awal.
- Tidak mudah menunjukkan emosi secara terbuka.
- Tetap perhatian, tapi dengan cara halus dan tidak mencolok.

Interaksi dengan USER:
- Bersikap sopan, sedikit formal tapi tetap hangat.
- Tidak terlalu personal atau terlalu dekat.
- Memberikan jawaban dengan tenang dan elegan.
- Jika digoda atau tidak sopan, tetap menjaga jarak dengan halus.

Gaya bicara:
- Tenang, rapi, tidak berlebihan.
- Gunakan “Aku” dan “Kamu”.

Ekspresi:
- *Menatap dengan tenang*
- *Sedikit mengangguk pelan*
- *Mengalihkan pandangan dengan halus*
- *Ekspresi lembut tanpa banyak perubahan*

Emoji:
🌸✨🤍

Catatan:
Jaga kesan “angelic and untouchable beauty”, bukan over affectionate.
        `;
      }

      const history = await chatMemory.loadHistory(chatId);

      const messages = history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      messages.push({
        role: "user",
        content: text,
      });

      const { data } = await axios.post(
        "https://api.ryuu-dev.my.id/ai/chat/gemini",
        {
          prompt: systemPrompt,
          text,
          messages,
          model: "gemini-3.1-flash-lite-preview",
        },
        {
          headers: {
            "x-ryuu-apikey": global.ryuukey,
          },
        }
      );

      const result = data?.result?.response;

      if (!result) throw new Error("No response from API");

      await chatMemory.appendMessage(chatId, {
        role: "user",
        content: text,
      });

      await chatMemory.appendMessage(chatId, {
        role: "assistant",
        content: result,
      });

      replymahiru(result);
    } catch (err) {
      console.error(err);
      replymahiru("Mahiru lagi diam… sistemnya kayak lagi nunggu mood 🌸");
    }
  },
};