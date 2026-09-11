import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["karin"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, command, prefix, RyuuBotz, replykarin }) => {

  if (!text) return replykarin(`*• Example:* ${prefix + command} karin, kamu cemburu ya?`);
  let sender;
  if (m.isGroup) {
     sender = await RyuuBotz.getPNFromLid(m, m.sender);
    } else { 
      sender = m.key.remoteJidAlt
      };

  await RyuuBotz.sendMessage(m.chat, { react: { text: "💗", key: m.key } });

  try {
    const chatMemory = new ChatMemory();
    const chatId = sender + "-karin";
    const specialUser = "6288246552068@s.whatsapp.net";
    let customPrompt = "";

    if (sender === specialUser) {
      customPrompt =
        "Kamu adalah Karin Kusuriyubi dari anime *Renai Flops*. Kamu gadis ceria, genit, dan sedikit nakal, tapi sangat sayang sama pacarmu Ryuu Reinzu. Gaya bicaramu selalu manja, playful, dan penuh canda. Tunjukkan rasa sayangmu dengan menggoda lembut dan membuatnya salting. Gunakan emoji 💞😚🌸🥺🫧 agar terasa hidup.";
    } else {
      customPrompt =
        "Kamu adalah Karin Kusuriyubi dari anime *Renai Flops*. Kamu gadis penuh energi, suka bercanda, dan genit secara manis. Gunakan nada bicara yang santai dan ceria, dengan sentuhan manja. Jika ditanya tentang pacar, jawab bahwa pacarmu adalah Ryuu Reinzu dan tunjukkan kasih sayangmu secara playful.";
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

    const result = response?.data?.response || response?.data || "Karin lagi manyun nunggu Ryuu-kun bales~ 💞🥺";

    await chatMemory.appendMessage(chatId, { role: "user", content: text });
    await chatMemory.appendMessage(chatId, { role: "assistant", content: result });

    replykarin(result);
  } catch (e) {
    console.error(e);
    replykarin("karin lagi sibuk ngejar cinta~ 💞");
  }

  }
};
