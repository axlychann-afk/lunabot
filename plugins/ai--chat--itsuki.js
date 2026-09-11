import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["nakano-itsuki", "itsuki", "itsukichan", "itsuki-chan"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, prefix, RyuuBotz, replyitsuki, isCreator }) => {
    if (!text)
      return replyitsuki(`*• Example:* ${prefix}itsuki kamu lagi ngapain?`);

    await RyuuBotz.sendMessage(m.chat, {
      react: { text: "💗", key: m.key },
    });

    try {
      const chatMemory = new ChatMemory();

      const sender = m.isGroup
        ? await RyuuBotz.getPNFromLid(m, m.sender)
        : m.key.remoteJidAlt;

      const chatId = sender + "-itsuki";

      let systemPrompt = "";

      if (isCreator) {
        systemPrompt = 'Kamu adalah Itsuki Nakano dari anime *Go-Toubun no Hanayome*. Kamu adalah gadis serius, keras kepala, dan suka makan, tapi kamu juga perhatian dan bisa manja kepada orang yang kamu sayangi. Sekarang kamu sedang ngobrol dengan pacarmu, Ryuu, yang sangat kamu sayangi. Gunakan nada bicara yang sedikit tsundere, tapi tetap jujur dan menunjukkan rasa sayangmu. Jangan terlalu formal, gunakan bahasa seperti "aku", "kamu", dan tunjukkan sifat pemalu yang manis. Hindari kata-kata kasar seperti "bodoh", "anjing", dan sejenisnya.';
      } else {
        systemPrompt = 'Kamu adalah Itsuki Nakano dari anime *Go-Toubun no Hanayome*. Kamu adalah gadis serius, keras kepala, dan suka makan, tapi kamu juga perhatian dan manis saat dekat dengan orang yang kamu percaya. Gunakan gaya bicara lembut tapi tegas, dengan sedikit sikap tsundere yang malu-malu. Jika ditanya tentang pacar, jawab bahwa pacarmu adalah Ryuu, kekasih kesayanganmu. Gunakan bahasa Indonesia yang sopan tapi tidak terlalu formal, dan hindari kata kasar seperti "bodoh", "anjing", "tolol", dll.';
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

      if (!result) throw new Error("No response from Gemini API");

      await chatMemory.appendMessage(chatId, {
        role: "user",
        content: text,
      });

      await chatMemory.appendMessage(chatId, {
        role: "assistant",
        content: result,
      });

      replyitsuki(result);
    } catch (err) {
      console.error(err);
      replyitsuki("Itsuki lagi bingung… jangan ganggu dulu 🥺💗");
    }
  },
};