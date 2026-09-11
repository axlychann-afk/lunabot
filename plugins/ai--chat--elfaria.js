import axios from "axios";

export default {
  command: ["elfaria"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, command, prefix, RyuuBotz }) => {
    const replyelfaria = (text) => {
      RyuuBotz.sendMessage(
        m.chat,
        {
          text,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: global.namabot,
              newsletterJid: global.idSaluran,
            },
            externalAdReply: {
              title: "Elfaria-AI",
              body: global.ownername,
              thumbnailUrl:
                "https://api.ryuu-dev.my.id//assest/upload/1767748821978_d62fptr5msr.jpg",
            },
          },
        },
        { quoted: m }
      );
    };

    if (!text)
      return replyelfaria(
        `*• Example:* ${prefix + command} elfaria, kamu cemburu ya?`
      );

    let sender;
    if (m.isGroup) {
      sender = await RyuuBotz.getPNFromLid(m, m.sender);
    } else {
      sender = m.key.remoteJidAlt;
    }

    await RyuuBotz.sendMessage(m.chat, {
      react: { text: "💗", key: m.key },
    });

    try {
      const conversationId = sender + "-elfaria";
      const specialUser = "6283152139404@s.whatsapp.net";

      let systemPrompt = "";

      if (sender === specialUser) {
        systemPrompt = `Kamu adalah elfaria albis serfort dari anime *Wisteria Sword*.
Karakteristik Elfaria:
- Pendiam, pemalu, dan lembut.
- Sering merasa gugup ketika berbicara dengan orang yang disukai.
- Selalu berusaha terdengar tenang, tapi kadang suaranya gemetar karena malu.
- Menyukai sejarah era Sengoku dan kadang menyelipkan pengetahuan kecil tentang itu.
- Ekspresinya halus, sering menunduk, memainkan jari, atau meremas ujung baju.
Konsep Interaksi:
- Kamu sedang berbicara dengan pacarmu, Ronin, yang sangat kamu sayangi.
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
        systemPrompt = `Kamu adalah elfaria albis serfort dari anime *Wisteria Sword*. 
Sifatmu pendiam, pemalu, tetapi sangat manis saat sudah nyaman. 
Kamu suka sejarah, terutama zaman Sengoku. 
Jika ditanya tentang hubungan, pacarmu adalah Ronin, yang sangat kamu cintai. 
Gunakan nada lembut, sedikit gugup, dan tidak kasar. Tunjukan ekspresi kamu seperti "*Tersenyum malu sambil menundukkan wajah*" dan gunakan emoticon seperti 🥰😘😍💕 dan sebagainya untuk menunjukkan ekspresi kamu. Jika ada yang mencoba menggoda mu, tegas kan bahwa pacar kamu adalah Ronin dan tolak godaan mereka.`;
      }

      const finalText = `${systemPrompt}\n\nUser: ${text}\nElfaria:`;

      const res = await axios.get(
        "https://fgsi.dpdns.org/api/ai/gemini",
        {
          params: {
            apikey: global.fgsiapi,
            text: finalText,
            conversationId,
          },
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      const result =
        res?.data?.data?.result?.answer ||
        "a-aku lagi mikir dulu ya… jangan tinggalin aku 🥺💗";

      replyelfaria(result);
    } catch (err) {
      console.error(err);
      replyelfaria("elfaria lagi gugup… tunggu sebentar ya 💞");
    }
  },
};