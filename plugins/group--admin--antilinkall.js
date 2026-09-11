import fs from "fs";
import "../settings.js";
let ntlinkall = JSON.parse(fs.readFileSync('./database/antilinkall.json'));

export default {
  command: ["antilinkall"],
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
      if (ntlinkall.includes(m.chat)) return reply("⚠️ Antilinkall sudah aktif di grup ini.");
      ntlinkall.push(m.chat);
      fs.writeFileSync('./database/antilinkall.json', JSON.stringify(ntlinkall));
      reply("✅ Fitur antilinkall telah diaktifkan.\nBot akan otomatis hapus pesan yang berisi link.");

      let groupe = await RyuuBotz.groupMetadata(m.chat);
      let members = groupe.participants;
      let mems = members.map(adm => adm.id.replace('c.us', 's.whatsapp.net'));
      await RyuuBotz.sendMessage(m.chat, { 
        text: "⚠️ Warning ⚠️\n\nTidak boleh ada yang mengirim link di grup.", 
        contextInfo: { mentionedJid: mems } 
      }, { quoted: m });

    } else if (set === "off") {
      if (!ntlinkall.includes(m.chat)) return reply("⚠️ Antilinkall belum aktif di grup ini.");
      let index = ntlinkall.indexOf(m.chat);
      ntlinkall.splice(index, 1);
      fs.writeFileSync('./database/antilinkall.json', JSON.stringify(ntlinkall));
      reply("❎ Fitur antilinkall telah dinonaktifkan.");

    } else {
      reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix}antilinkall on\n${prefix}antilinkall off`
    );
        }

  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan!\n*Error:* ${err.message}`);
  }

  }
};
