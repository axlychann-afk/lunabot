import "../settings.js";
import fs from "fs";

export default {
  command: ["edit-plug", "editplugins", "update-plug", "updplug", "up"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { reply, example, prefix }) => {

  if (!m.quoted || m.quoted.mtype !== "documentMessage") 
    return reply(example("reply file .js yang sudah ada di plugins untuk update isinya"));

  let filename = m.quoted.fileName;
  if (!filename.endsWith(".js")) filename += ".js";

  const filePath = "./plugins/" + filename;

  if (!fs.existsSync(filePath)) 
    return reply(`File *${filename}* belum ada di folder plugins. Gunakan ${prefix}addplugin untuk menambahkan file baru 😳`);

  const fileContent = await m.quoted.download();

  fs.writeFileSync(filePath, fileContent);

  return reply(`Berhasil update isi plugin *${filename}* 💖`);

  }
};
