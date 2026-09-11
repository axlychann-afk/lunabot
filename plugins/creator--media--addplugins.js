import "../settings.js";
import fs from "fs";

export default {
  command: ["addplugins", "addplugin", "addp", "addplug", "ap"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { reply, example }) => {

  if (!m.quoted) return reply(example("reply file .js untuk menambahkan plugin"));

  if (m.quoted.mtype === "documentMessage") {
    let filename = m.quoted.fileName || "file.js";
    if (!filename.endsWith(".js")) filename += ".js";

    if (fs.existsSync("./plugins/" + filename)) 
      return reply(`Nama file plugins *${filename}* sudah terdaftar di folder plugins!`);

    const fileContent = await m.quoted.download();
    fs.writeFileSync("./plugins/" + filename, fileContent);

    return reply(`Berhasil menambahkan file plugins *${filename}* dari file yang direply! 💖`);
  }

  if (m.quoted.text) {
    return reply("File yang direply bukan file .js, gunakan file document ya sayang 😳");
  }

  return reply(example("reply file .js untuk menambahkan plugin"));

  }
};
