import "../settings.js";
import fs from "fs";

export default {
  command: ["delplugins", "delplugin", "dp"],
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
  if (!fs.existsSync("./plugins/" + text.toLowerCase())) return reply("File plugins tidak ditemukan!");
  await fs.unlinkSync("./plugins/" + text.toLowerCase());
  return reply(`Berhasil menghapus file plugins *${text.toLowerCase()}*`);

  }
};
