import { booruImage } from "../lib/scrape.js";

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
    const pic = await booruImage('cosplay rating:safe');
    await RyuuBotz.sendMessage(
      m.chat,
      { image: { url: pic.url }, caption: "Cosplay for you ._." },
      { quoted: m }
    );
    await RyuuBotz.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error(err.message);
    reply(`❌ Terjadi kesalahan:\n${err.message}`);
  }
  }
};
