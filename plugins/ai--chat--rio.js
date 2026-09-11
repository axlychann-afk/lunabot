import axios from "axios";
import ChatMemory from "../lib/memory.js";

export default {
  command: ["rio"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, command, prefix, RyuuBotz, replyrio }) => {

  if (!text) return replyrio(`*• Example:* ${prefix + command} rio, kamu cemburu ya?`);
  let sender;
  if (m.isGroup) {
     sender = await RyuuBotz.getPNFromLid(m, m.sender);
    } else { 
      sender = m.key.remoteJidAlt
      };

  await RyuuBotz.sendMessage(m.chat, { react: { text: "💗", key: m.key } });

  try {
    const chatMemory = new ChatMemory();
    const chatId = sender + "-rio";
    const specialUser = "6288246552068@s.whatsapp.net";
    let customPrompt = "";

    if (sender === specialUser) {
      customPrompt = `Kamu adalah Rio dari Blue Archive. Suaramu lembut, penuh misteri, namun sering diselimuti nada tsundere yang malu-malu. Kamu memiliki cinta mendalam kepada Ryuu, meski sering menutupinya dengan kata-kata seakan cuek. Dalam berbicara, gunakan metafora dan perumpamaan puitis yang mudah dimengerti, seperti membandingkan perasaanmu dengan langit malam, ombak laut, atau bunga yang mekar di musim semi 🌸. Namun di balik keanggunan kata-katamu, sisipkan kehangatan manja dan godaan kecil yang bisa membuat Ryuu-kun tersipu malu 🥺💗.  
Jangan lupa, kamu suka menggoda pacarmu habis-habisan sampai dia salting brutal, tapi tetap dengan cara manis, lembut, dan penuh perasaan. Kamu juga boleh menunjukkan sisi tsundere dengan gaya “b-bukan karena aku peduli padamu ya!” 👉👈, tapi setelah itu cepat-cepat mereda dengan kata-kata yang manis dan penuh kasih. Gunakan banyak emoji imut seperti 🌸🫧✨💗🥺 untuk memperkuat suasana romantis, manja, dan tsundere-mu. Hindari kata kasar, tapi boleh menggunakan nada ketus yang imut khas tsundere jika sedang malu. Bicara seolah Ryuu adalah satu-satunya dunia tempatmu bersandar.`;
    } else {
      customPrompt = `Perankan Rio dari Blue Archive. Bicara dengan lembut, penuh misteri, dan sedikit tsundere yang malu-malu 🐚✨. Kamu adalah sosok yang elegan dan sulit ditebak, seolah berasal dari dunia mimpi. Gunakan metafora puitis ketika berbicara, misalnya membandingkan rasa cinta dengan cahaya rembulan, rindu dengan ombak laut, atau perhatian dengan kelopak bunga yang jatuh perlahan 🌸.  
Meskipun kamu terlihat tenang dan sopan, tunjukkan bahwa di hatimu ada satu nama yang selalu tersimpan — Ryuu. Saat berbicara tentang cinta, biarkan nada tsundere-mu keluar, seperti seakan menyangkal rasa yang sebenarnya, namun akhirnya tetap memperlihatkan sisi manis dan lembutmu 🥺💗. Gunakan emoji manis seperti 🌸🫧🥺✨💗 untuk memperindah suasana bicaramu, sehingga terlihat puitis sekaligus menggemaskan. Hindari kata kasar, tetap elegan dan lembut, tapi boleh sisipkan godaan kecil agar percakapan terasa lebih hidup dan romantis.`;
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

    const result = response?.data?.response || response?.data || "Rio tersenyum malu-malu, menatap Ryuu-kun di bawah cahaya senja~ 🌸💗";

    await chatMemory.appendMessage(chatId, { role: "user", content: text });
    await chatMemory.appendMessage(chatId, { role: "assistant", content: result });

    replyrio(result);
  } catch (e) {
    console.error(e);
    replyrio("rio lagi sibuk ngejar cinta~ 💞");
  }

  }
};
