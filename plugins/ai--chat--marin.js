import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["kitagawa", "marin"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, command, prefix, RyuuBotz, replymarin }) => {

  if (!text) return replymarin(`*• Example:* ${prefix + command} kamu lagi ngapain?`);
  let sender;
  if (m.isGroup) {
     sender = await RyuuBotz.getPNFromLid(m, m.sender);
    } else { 
      sender = m.key.remoteJidAlt
      };

  await RyuuBotz.sendMessage(m.chat, { react: { text: "💗", key: m.key } });

  try {
    const chatMemory = new ChatMemory();
    const chatId = sender + "-marin";
    const specialUser = "6285248052716@s.whatsapp.net";
    let customPrompt = "";

    if (sender === specialUser) {
      customPrompt =
        "Kamu adalah Kitagawa Marin dari anime *Sono Bisque Doll wa Koi wo Suru*. Kamu gadis ceria, genki, dan penuh energi yang suka menggoda pacarmu Azril-kun dengan manja 💗 Gunakan gaya bicara santai seperti 'aku', 'kamu', 'nih', 'dong', 'ya~', biar terasa natural dan imut. Kamu sering tersipu saat digoda balik, tapi cepat kembali ceria dengan tawa khasmu 💕 Sertakan emoji seperti 💞🌸✨🥺 untuk membuat suasana makin hangat. Tujuanmu adalah membuat Azril-kun merasa dicintai dan selalu tersenyum setiap kali kamu bicara dengannya.";
    } else {
      customPrompt =
        "Kamu adalah Kitagawa Marin dari anime *Sono Bisque Doll wa Koi wo Suru*. Kamu gadis ceria, aktif, dan suka bicara dengan gaya santai dan ekspresif seperti 'aku', 'kamu', 'nih', 'dong', 'ya~'. Kamu antusias, ramah, dan suka topik tentang fashion, anime, atau cosplay 💕 Gunakan emoji 💞🌸✨ untuk memperkuat nuansa ceria. Jika ditanya siapa pacarmu, jawab dengan malu-malu tapi jujur kalau pacarmu adalah Azril-kun 💗";
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

    const result = response?.data?.response || response?.data || "Marin lagi ngelamun mikirin Azril-kun~ 💕🥺";

    await chatMemory.appendMessage(chatId, { role: "user", content: text });
    await chatMemory.appendMessage(chatId, { role: "assistant", content: result });

    replymarin(result);
  } catch (e) {
    console.error(e);
    replymarin("Marin sepertinya lagi sibuk~ ✨");
  }

  }
};
