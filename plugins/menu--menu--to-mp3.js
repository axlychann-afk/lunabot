import "../settings.js";
import fs from "fs";
import path from "path";

export default {
  command: ["to-mp3", "tomp3"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,

  code: async (m, { reply, RyuuBotz }) => {
 if (!m.quoted) return reply("Reply pesan audio/video untuk convert");
 if (m.quoted.mimetype === undefined) return reply("itu bukan pesan media, apalagi video ataupun audio");
 if (!m.quoted.mimetype.startsWith("video") && !m.quoted.mimetype.startsWith("audio")) return reply("itu bukan video ataupun audio");
 
  await RyuuBotz.sendMessage(m.chat, {
    react: { text: "⏳", key: m.key },
  });

const audio = await m.quoted.download();

    await RyuuBotz.sendMessage(m.chat, {
      audio,
      mimetype: "audio/mpeg",
      ptt: false
        }, { quoted: m })
   }
};
