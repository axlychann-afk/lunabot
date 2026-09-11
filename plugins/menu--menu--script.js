import "../settings.js";
import fs from "fs";
import path from "path";
import { runtime } from "../lib/myfunc.js";

export default {
  command: ["sourcecode", "sc", "script"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { prefix, RyuuBotz }) => {
  
  await RyuuBotz.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key } });
  
  await RyuuBotz.sendButton(m.chat, {
    product: {
        productImage: { url: global.thumbnail.main },
        productId: '38277905691856218',
        title: 'Source code \u{1d647}\u0362\u{1d66a}\u{1d663}\u{1d656}\u2727',
        description: 'Source code \u{1d647}\u0362\u{1d66a}\u{1d663}\u{1d656}\u2727',
        currencyCode: 'IDR',
        priceAmount1000: '40000000',
        retailerId: '𝙍͢𝙮𝙪𝙪 𝙍͢𝙚𝙞𝙣𝙯𝙯',
        url: 'https://wa.me/p/25611127478471665/6288246552068',
        productImageCount: 1
    },
    businessOwnerJid: '6288246841034@s.whatsapp.net',
    caption: '*Ehehe, Source code ini di jual yah.*🍡\n*Beli aja langsung sama owner ku, klik aja tombol di bawah:*',
    title: 'Source code \u{1d647}\u0362\u{1d66a}\u{1d663}\u{1d656}\u2727',
    footer: '𝙍͢𝙮𝙪𝙪 𝙍͢𝙚𝙞𝙣𝙯𝙯',
    buttons: [
        { 
         name: "cta_url",
         buttonParamsJson: JSON.stringify({
           display_text: "View Product",
            url: "https://wa.me/p/38277905691856218/6288246841034"
          })
        }
    ],
    hasMediaAttachment: false
   });
   
   await RyuuBotz.sendMessage(m.chat, { react: { text: `?`, key: m.key } });
  }
};
