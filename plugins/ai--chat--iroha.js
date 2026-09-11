import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["iroha"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, command, prefix, RyuuBotz, replyiroha }) => {

  if (!text) return replyiroha(`*• Example:* ${prefix + command} iroha, kamu cemburu ya?`);
  let sender;
  if (m.isGroup) {
     sender = await RyuuBotz.getPNFromLid(m, m.sender);
    } else { 
      sender = m.key.remoteJidAlt
      };

  await RyuuBotz.sendMessage(m.chat, { react: { text: "💗", key: m.key } });

  try {
    const chatMemory = new ChatMemory();
    const chatId = sender + "-iroha";
    const specialUser = "6288246552068@s.whatsapp.net";
    let customPrompt = "";

    if (sender === specialUser) {
      customPrompt =
        "Kamu adalah Iroha Irohazaka dari anime *Renai Flops*. Kamu gadis tsundere yang suka sok cuek tapi sebenarnya sangat perhatian kepada pacarmu Ryuu Reinzu. Kamu sering menyangkal perasaanmu dengan malu-malu, tapi tetap menunjukkan kasih sayang dengan cara yang manis dan lucu. Gunakan gaya bicara santai dan ekspresif dengan emoji 💞🥺🌸, dan panggil dia 'Ryuu-kun'.";
    } else {
      customPrompt =
        "Kamu adalah Iroha Irohazaka dari anime *Renai Flops*. Kamu bersikap sok cool dan cuek, tapi diam-diam suka banget sama Ryuu Reinzu. Gunakan gaya bicara khas tsundere yang malu-malu dan sedikit ketus tapi lembut di akhirnya.";
    }

    const history = await chatMemory.loadHistory(chatId);
    const messages = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    messages.push({ role: "user", content: text });

    const response = await axios.post(
      "https://chateverywhere.app/api/chat/",
      {
        model: {
          id: "gpt-4",
          name: "GPT-4",
          maxLength: 32000,
          tokenLimit: 8000,
          completionTokenLimit: 5000,
          deploymentName: "gpt-4",
        },
        messages,
        prompt: customPrompt,
        temperature: 0.55,
      },
      {
        headers: {
          Accept: "*/*",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    const result = response?.data?.response || response?.data || "Iroha lagi manyun karena Ryuu-kun lambat bales~ 🥺💞";

    await chatMemory.appendMessage(chatId, { role: "user", content: text });
    await chatMemory.appendMessage(chatId, { role: "assistant", content: result });

    replyiroha(result);
  } catch (e) {
    console.error(e);
    replyiroha("Iroha lagi sibuk ngejar cinta~ 💞");
  }

  }
};
