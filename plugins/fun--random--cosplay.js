import axios from "axios";

export default {
  command: ["cosplay"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, reply }) => {

  try {
    await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

    const url = "https://api.ryuu-dev.my.id/random/cosplay-loli";
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    await RyuuBotz.sendMessage(
      m.chat,
      { image: buffer, caption: "Loli for you ._." },
      { quoted: m }
    );
  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan:\n${err}`);
  }

  }
};
