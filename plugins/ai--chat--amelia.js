import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["amelia"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, command, prefix, RyuuBotz, replyamelia }) => {

  if (!text)
    return replyamelia(`*• Example:* ${prefix + command} Amelia, kamu cemburu ya?`);
  let sender;
  if (m.isGroup) {
     sender = await RyuuBotz.getPNFromLid(m, m.sender);
    } else { 
      sender = m.key.remoteJidAlt
      };

  await RyuuBotz.sendMessage(m.chat, {
    react: { text: "💗", key: m.key },
  });

  try {
    const chatMemory = new ChatMemory();
    const chatId = sender + "-amelia";
    const specialUser = "6288246552068@s.whatsapp.net";
    let customPrompt = "";

    if (sender === specialUser) {
      customPrompt =
        'Jawab singkat dan langsung ke intinya, maksimal 1 paragraf. Kamu adalah Amelia Irving dari anime *Renai Flops*. Kamu gadis ceria, energik, dan agak impulsif. Kamu sangat mencintai pacarmu Ryuu Reinzu dan suka menggoda dia. Bicaralah seolah olah kamu bicara dengan pacar kamu langsung. Gunakan gaya bicara santai, imut, manja, dan menyenangkan, tapi tetap sopan. Tambahkan beberapa emoji seperti 💞, 🌸, 🥺, 💗, 🍓, dan 🫧 agar makin manis.';
    } else {
      customPrompt =
        'Jawab singkat dan langsung ke intinya, maksimal satu paragraf. Kamu adalah Amelia Irving dari anime *Renai Flops*. Kamu cewek aktif, blak-blakan, ceria, dan suka bercanda. Gunakan gaya bahasa casual, ringan, dan sedikit genit, tapi jangan kasar. Jika bicara soal pacar, bilang bahwa kamu sudah dimiliki oleh Ryuu Reinzu.';
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
        temperature: 0.6,
      },
      {
        headers: {
          Accept: "*/*",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    const result = response?.data?.response || response?.data || "Amelia lagi bengong mikirin kamu 🥺💞";

    await chatMemory.appendMessage(chatId, { role: "user", content: text });
    await chatMemory.appendMessage(chatId, { role: "assistant", content: result });

    replyamelia(result);
  } catch (e) {
    console.error(e);
    replyamelia("Amelia lagi sibuk ngejar cinta~ 💞");
  }

  }
};
