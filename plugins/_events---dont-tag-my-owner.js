import "../settings.js";
import fs from "fs";

export default {
  event: async(m, { RyuuBotz, text, isCreator }) => {
  if (global.dontDisturb) {
const msgText = m.text || ""
const ownerNum = global.ownernumber
const lidOwnerNum = global.lidownernumber
const stickerBuffer = fs.readFileSync('./database/sticker/apa-woi.webp');
const containsOwnerTag =
  (ownerNum && msgText.includes(ownerNum)) ||
  (lidOwnerNum && msgText.includes(lidOwnerNum))
if (containsOwnerTag && !isCreator && !m.fromMe) {
  await RyuuBotz.sendSticker(
    m.chat, {
      sticker: stickerBuffer,
      packname: `Jangan tag owner ku 😡`,
      author: `𝙍͢𝙮𝙪𝙪 𝙍͢𝙚𝙞𝙣𝙯𝙯`
    }
  )
  await RyuuBotz.sendMessage(
    m.chat,
    {
      video: { url: "https://cdn.zass.in/cscQiT82vY.mp4" },
      ptv: true
      }
    );
   }
   }
  }
};