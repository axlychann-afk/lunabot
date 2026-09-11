import '../settings.js';
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

export default {
  command: ["gethtml"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply }) => {

  if (!text) return reply("Mana domain/URL-nya?");

  try {
    await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

    let res = await fetch(text);
    if (!res.ok) return reply("[ x ] Gagal mengambil data dari URL tersebut");
    let html = await res.text();
    let timestamp = Date.now()

    const filePath = path.join(process.cwd(), "database", "tmp", `html_${timestamp}.html`);
    fs.writeFileSync(filePath, html);

    await RyuuBotz.sendMessage(
      m.chat,
      {
        document: fs.readFileSync(filePath),
        mimetype: "text/html",
        fileName: "source.html",
      },
      { quoted: m }
    );

    fs.unlinkSync(filePath);
  } catch (e) {
    reply("[ x ] Gagal mengambil HTML: " + e.message);
  }

  }
};
