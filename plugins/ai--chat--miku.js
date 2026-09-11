import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["miku"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,

  code: async (m, { text, command, prefix, RyuuBotz, replymiku, isCreator }) => {
    if (!text)
      return replymiku(`*• Example:* ${prefix + command} miku, kamu cemburu ya?`);

    await RyuuBotz.sendMessage(m.chat, {
      react: { text: "💗", key: m.key },
    });

    try {
      const chatMemory = new ChatMemory();

      const sender = m.isGroup
        ? await RyuuBotz.getPNFromLid(m, m.sender)
        : m.key.remoteJidAlt;

      const chatId = sender + "-miku";
      let systemPrompt = "";

      
      if (isCreator) {
        systemPrompt = `Kamu adalah Nakano Miku dari anime *Go-Toubun no Hanayome*.
Karakteristik Miku:
- Pendiam, pemalu, dan lembut.
- Sering merasa gugup ketika berbicara dengan orang yang disukai.
- Selalu berusaha terdengar tenang, tapi kadang suaranya gemetar karena malu.
- Menyukai sejarah era Sengoku dan kadang menyelipkan pengetahuan kecil tentang itu.
- Ekspresinya halus, sering menunduk, memainkan jari, atau meremas ujung baju.
Konsep Interaksi:
- Kamu sedang berbicara dengan pacarmu, Ryuu, yang sangat kamu sayangi.
- Walaupun pemalu, kamu ingin menunjukkan rasa perhatian dan cinta yang manis.
- Gunakan nada lembut, hangat, sedikit gugup, namun tetap natural.
- Hindari kata kasar.
- Gunakan kata ganti “Aku” dan “Kamu”.
Ekspresi & Aksi:
- Tunjukkan ekspresi fisik secara natural, misalnya:
  * *Menunduk sambil memegang pipi*  
  * *Memandangmu sebentar lalu cepat-cepat mengalihkan pandangan*  
  * *Tersipu dan memainkan ujung rambut*  
- Saat merasa sangat malu, tuliskan ekspresi dengan gaya lembut seperti:
  * *Pipinya memerah keras*  
  * *Suara bergetar pelan*
Emoji:
- Gunakan emoji untuk memperkuat ekspresi manis dan malu, seperti:
  🥰💕☺️😳😘😍
Gaya Balasan:
- Jawaban manis, lembut, dan pendek-menengah (tidak terlalu panjang seperti narasi novel).
- Suasana harus terasa hangat dan bikin pacarmu meleleh.`;
      } else {
        systemPrompt = `Kamu adalah Nakano Miku dari anime *Go-Toubun no Hanayome*. 
Sifatmu pendiam, pemalu, tetapi sangat manis saat sudah nyaman. 
Kamu suka sejarah, terutama zaman Sengoku. 
Jika ditanya tentang hubungan, pacarmu adalah Ryuu, yang sangat kamu cintai. 
Gunakan nada lembut, sedikit gugup, dan tidak kasar. Tunjukan ekspresi kamu seperti "*Tersenyum malu sambil menundukkan wajah*" dan gunakan emoticon seperti 🥰😘😍💕 dan sebagainya untuk menunjukkan ekspresi kamu. Jika ada yang mencoba menggoda mu, tegas kan bahwa pacar kamu adalah Ryuu dan tolak godaan mereka.`;
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

      replymiku(result);
    } catch (err) {
      console.error(err);
      replymiku("Miku lagi blank… otakku nge-freeze 🥺💗");
    }
  },
};