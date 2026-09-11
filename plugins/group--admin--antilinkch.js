import fs from "fs";
import "../settings.js";
let ntlinkch = JSON.parse(fs.readFileSync('./database/antilinkch.json'));

export default {
  command: ["antilinkch"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply, pushname, prefix, command, RyuuBotz }) => {

  try {

    let set = (text || "").toLowerCase();

    if (set === "on") {
      if (ntlinkch.includes(m.chat)) return reply("⚠️ Antilinkch sudah aktif di grup ini.");
      ntlinkch.push(m.chat);
      fs.writeFileSync('./database/antilinkch.json', JSON.stringify(ntlinkch));
      reply("✅ Fitur antilinkch telah diaktifkan.\nBot akan otomatis hapus pesan yang berisi link saluran.");

      let groupe = await RyuuBotz.groupMetadata(m.chat);
      let members = groupe.participants;
      let mems = members.map(adm => adm.id.replace('c.us', 's.whatsapp.net'));
      await RyuuBotz.sendMessage(m.chat, { 
        text: "⚠️ Warning ⚠️\n\nTidak boleh ada yang boleh mengirim link Saluran.", 
        contextInfo: { mentionedJid: mems } 
      }, { quoted: m });

    } else if (set === "off") {
      if (!ntlinkch.includes(m.chat)) return reply("⚠️ Antilinkch belum aktif di grup ini.");
      let index = ntlinkch.indexOf(m.chat);
      ntlinkch.splice(index, 1);
      fs.writeFileSync('./database/antilinkch.json', JSON.stringify(ntlinkch));
      reply("❎ Fitur antilinkch telah dinonaktifkan.");

    } else {
      reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix}antilinkch on\n${prefix}antilinkch off`
    );
        }

  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan!\n*Error:* ${err.message}`);
  }

  }
};
