import { randomBA } from "../lib/scrape.js";

export default {
  command: ["randomba"],
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
    const pic = await randomBA();
    await RyuuBotz.sendMessage(
      m.chat,
      { image: { url: pic.url }, caption: `Blue Archive — ${pic.name} ._.` },
      { quoted: m }
    );
    await RyuuBotz.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error(err.message);
    reply(`❌ Terjadi kesalahan:\n${err.message}`);
  }
  }
};
