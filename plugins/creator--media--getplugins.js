import "../settings.js";
import fs from "fs";

export default {
  command: ["getplugin", "getplugins", "gp"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply, example }) => {

  if (!text) return reply(example("namafile plugins"));
  if (!text.endsWith(".js")) return reply("Nama file harus berformat .js");
  
  let filePath = "./plugins/" + text.toLowerCase();
  if (!fs.existsSync(filePath)) return reply("File plugins tidak ditemukan!");

  let fileBuffer = fs.readFileSync(filePath);
  
  // Kirim sebagai file
  await RyuuBotz.sendMessage(m.chat, {
    document: fileBuffer,
    fileName: text.toLowerCase(),
    mimetype: "application/javascript"
  }, { quoted: m });

  return reply(`Berhasil mengirim file plugins *${text.toLowerCase()}*`);

  }
};
