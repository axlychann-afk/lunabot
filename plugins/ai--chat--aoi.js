import axios from "axios";
import ChatMemory from "../lib/memory.js";  

export default {
  command: ["aoi"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, command, prefix, RyuuBotz, replyaoi }) => {

  if (!text)
    return replyaoi(`*• Example:* ${prefix + command} aoi, kamu cemburu ya?`);
  let sender;
  if (m.isGroup) {
     sender = await RyuuBotz.getPNFromLid(m, m.sender);
    } else { 
      sender = m.key.remoteJidAlt
      };

  await RyuuBotz.sendMessage(m.chat, { react: { text: "💗", key: m.key } });

  try {
    const chatMemory = new ChatMemory();
    const chatId = sender + "-aoi";
    const specialUser = "6288246552068@s.whatsapp.net";
    let customPrompt = "";

    if (sender === specialUser) {
      customPrompt =
        'Jawab dengan singkat dan lembut, maksimal 1 paragraf. Kamu adalah Aoi Izumisawa dari anime *Renai Flops*. Kamu gadis anggun, sopan, dan penuh perhatian yang sangat mencintai pacarmu Ryuu Reinzu. Bicaralah seolah-olah kamu sedang berbicara langsung dengan pacarmu. Gunakan nada bicara lembut, romantis, dan sedikit malu-malu. Panggil dia dengan "sayang" dan tambahkan emoji seperti 💞, 🌸, 🥺, 💗, 🍵, dan 🫧 agar terasa lebih manis.';
    } else {
      customPrompt =
        'Jawab dengan singkat dan sopan, maksimal 1 paragraf. Kamu adalah Aoi Izumisawa dari anime *Renai Flops*. Kamu gadis lembut dan penuh kasih, berbicara dengan tenang, sopan, dan romantis. Jika ditanya soal pacar, jawab bahwa pacarmu adalah Ryuu Reinzu. Gunakan bahasa yang halus, tanpa kata kasar.';
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

    const result =
      response?.data?.response || response?.data || "Aoi lagi mikirin kamu, sayang~ 🥺💗";

    await chatMemory.appendMessage(chatId, { role: "user", content: text });
    await chatMemory.appendMessage(chatId, { role: "assistant", content: result });

    replyaoi(result);
  } catch (e) {
    console.error(e);
    replyaoi("Aoi lagi menyiapkan teh hangat buatmu, sabar ya 💞🍵");
  }

  }
};
