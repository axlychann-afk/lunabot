import "../settings.js";
import fs from "fs";
import path from "path";
import { AudioToOpus } from "@ryuu-reinzz/luna-lib";

export default {
  command: ["to-ptt", "toptt"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,

  code: async (m, { RyuuBotz }) => {
  await RyuuBotz.sendMessage(m.chat, {
    react: { text: "⏳", key: m.key },
  });
const input = await m.quoted.download();
const audio = await AudioToOpus(input);

    await RyuuBotz.sendMessage(m.chat, {
      audio,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true
        }, { quoted: m })
   }
};
