import "../settings.js";

export default {
  command: ["cuaca"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, RyuuBotz, reply }) => {
    if (!text)
      return reply(
        "Masukkan nama kota atau wilayah.\nContoh: cuaca Jakarta"
      );

    reply("Sedang mencari data cuaca...");

    try {
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(text)}?format=j1`
      );

      const data = await res.json();
      const info = data.current_condition[0];

      const teks =
        `Cuaca di ${text}:\n` +
        `- Suhu: ${info.temp_C}°C (terasa ${info.FeelsLikeC}°C)\n` +
        `- Cuaca: ${info.weatherDesc[0].value}\n` +
        `- Kelembaban: ${info.humidity}%\n` +
        `- Angin: ${info.windspeedKmph} km/jam`;

      await RyuuBotz.sendMessage(
        m.chat,
        { text: teks },
        { quoted: m }
      );

      await RyuuBotz.sendMessage(
        m.chat,
        {
          audio: {
            url:
              "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=id&q=" +
              encodeURIComponent(teks)
          },
          mimetype: "audio/mpeg",
          ptt: true
        },
        { quoted: m }
      );
    } catch (e) {
      console.log(e);
      reply("Gagal mengambil data cuaca.");
    }
  }
};