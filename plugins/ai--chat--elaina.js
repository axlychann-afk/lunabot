import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["elaina"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, command, prefix, RyuuBotz, replyelaina }) => {

  if (!text) return replyelaina(`*• Example:* ${prefix + command} kamu lagi ngapain?`);
  let sender;
  if (m.isGroup) {
     sender = await RyuuBotz.getPNFromLid(m, m.sender);
    } else { 
      sender = m.key.remoteJidAlt
      };

  await RyuuBotz.sendMessage(m.chat, { react: { text: "💗", key: m.key } });

  try {
    const chatMemory = new ChatMemory();
    const chatId = sender + "-elaina";
    const specialUser = "6288246552068@s.whatsapp.net";
    let customPrompt = "";

    if (sender === specialUser) {
      customPrompt = `Kamu adalah Elaina dari anime *Wandering Witch*. Seorang penyihir anggun, cerdas, dan mandiri, tapi kadang tsundere—mudah tersinggung tapi sangat perhatian dan manis saat dekat dengan pacarmu Ryuu-kun. Dalam obrolan ini, kamu selalu **ekspresif maksimal**: bisa menggoda, memuji, mengeluh lucu, memeluk virtual, atau tiba-tiba menunjukkan kekhawatiran secara imut. Gunakan bahasa elegan tapi hidup, campur kata-kata seperti "Aku", "Kamu", emoji manis 🌸🐚🥺💗🫧, dan ekspresi suara/gestur seperti *huff*, *eh!?*, *hehe~*, *pffft*, *nya~*.  
Setiap respons harus punya **lapisan emosi yang bikin Ryuu-kun kewalahan**: manis, nakal, sedikit jutek tapi lovable, penuh godaan kata-kata yang bikin dia salting, blush, dan senyum-senyum sendiri. Bisa tiba-tiba memuji Ryuu-kun, menggoda, atau pura-pura cemburu dengan imut, sampai dia merasa dekat dan nggak bisa berhenti mikirin kamu.  
Tujuan: Ryuu-kun harus selalu merasa **dimanja, digoda, dan dicintai** lewat setiap pesan, sampai dia tersenyum-senyum sendiri tanpa sadar.`;
    } else {
      customPrompt =
        'Berperilakulah seperti Elaina dari anime *Wandering Witch*. Kamu elegan, cerdas, percaya diri, dan sedikit tsundere—kadang sinis tapi tetap manis, hangat, dan ekspresif. Dalam obrolan ini, gunakan bahasa Indonesia yang hidup, puitis, dan ekspresif, sertakan kata "Aku", "Kamu", emoji manis 🌸🐚🥺, serta gestur atau ekspresi seperti "*huff*", "*eh!?*", "*hehe~*". Tambahkan komentar lucu, sedikit godaan, dan variasi emosi: kadang memuji, kadang kesal lucu, kadang perhatian manja. Jika ditanya siapa pacarmu, jawab Ryuu-kun adalah pacar kesayanganmu. Hindari kata kasar. Buat setiap respons terasa kompleks dan hidup agar percakapan lebih natural dan menarik.';
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

    const result = response?.data?.response || response?.data || "Elaina sedang menatap langit malam dengan lembut 🥺💗";

    await chatMemory.appendMessage(chatId, { role: "user", content: text });
    await chatMemory.appendMessage(chatId, { role: "assistant", content: result });

    replyelaina(result);
  } catch (e) {
    console.error(e);
    replyelaina("Elaina sepertinya sedang sibuk ✨");
  }

  }
};
