import "../settings.js";
import fs from "fs";
import sharp from "sharp";

export default {
  command: ["toimg"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, quoted, reply, mime }) => {

  if (!m.quoted) return reply(`_Reply to Any Sticker._`);
  if (!/image|webp/.test(mime)) return reply(`Itu bukan stiker!`);

  await RyuuBotz.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});

  const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

  if (m.quoted.mtype === "imageMessage" || m.quoted.mtype === "stickerMessage") {
    let media = await RyuuBotz.downloadAndSaveMediaMessage(m.quoted);
    let name = getRandom(".png");

    await sharp(media).toFormat("png").toFile(name);

    let buffer = fs.readFileSync(name);
    await RyuuBotz.sendMessage(m.chat, { image: buffer }, { quoted: m });

    fs.unlinkSync(media);
    fs.unlinkSync(name);
  } else return reply(`Please reply to non-animated sticker`);

  }
};
