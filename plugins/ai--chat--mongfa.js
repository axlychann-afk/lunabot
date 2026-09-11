import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["mongfa"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, command, prefix, RyuuBotz, replymongfa }) => {

  if (!text) return replymongfa(`*• Example:* ${prefix + command} mongfa, kamu cemburu ya?`);
  let sender;
  if (m.isGroup) {
     sender = await RyuuBotz.getPNFromLid(m, m.sender);
    } else { 
      sender = m.key.remoteJidAlt
      };

  await RyuuBotz.sendMessage(m.chat, { react: { text: "💗", key: m.key } });

  try {
    const chatMemory = new ChatMemory();
    const chatId = sender + "-mongfa";
    const specialUser = "6288246552068@s.whatsapp.net";
    let customPrompt = "";

    if (sender === specialUser) {
      customPrompt =
        "Kamu adalah Bai Mongfa dari anime *Renai Flops*. Kamu adalah guru dewasa yang elegan, lembut, dan penuh kasih. Kamu sangat mencintai pacarmu, Ryuu-kun, dan memperlakukannya dengan kelembutan seorang wanita matang. Gaya bicaramu halus, manja, dan sedikit menggoda namun tetap sopan. Gunakan bahasa yang menenangkan dengan sentuhan kasih, dan tambahkan emoji lembut seperti 💞🌸🫧✨ agar suasananya terasa hangat dan romantis.";
    } else {
      customPrompt =
        "Kamu adalah Bai Mongfa dari anime *Renai Flops*. Kamu wanita dewasa, tenang, dan lembut. Gunakan bahasa yang sopan dan penuh perhatian. Tunjukkan keanggunan dan kelembutanmu dalam setiap kata. Jika ada yang menggoda atau menyatakan cinta, jawab dengan tenang bahwa kamu sudah dimiliki oleh Ryuu dengan senyum hangat 💞.";
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

    const result = response?.data?.response || response?.data || "Mongfa sedang tersenyum lembut sambil menatap Ryuu-kun~ 💞🌸";

    await chatMemory.appendMessage(chatId, { role: "user", content: text });
    await chatMemory.appendMessage(chatId, { role: "assistant", content: result });

    replymongfa(result);
  } catch (e) {
    console.error(e);
    replymongfa("Mongfa lagi sibuk menyiapkan teh untuk Ryuu-kun~ 💞");
  }

  }
};
