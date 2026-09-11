import fs from "fs";
import "../settings.js";

let ntlinkgc = JSON.parse(fs.readFileSync('./database/antilinkgc.json'));

export default {
  command: ["antilinkgc"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply, RyuuBotz, pushname, prefix, command }) => {

  try {

    let set = (text || "").toLowerCase();

    if (set === "on") {
      if (ntlinkgc.includes(m.chat)) return reply("⚠️ Antilinkgc sudah aktif di grup ini.");
      ntlinkgc.push(m.chat);
      fs.writeFileSync('./database/antilinkgc.json', JSON.stringify(ntlinkgc));
      reply("✅ Fitur antilinkgc telah diaktifkan.\nBot akan otomatis hapus pesan yang berisi link grup.");

      let groupe = await RyuuBotz.groupMetadata(m.chat);
      let members = groupe.participants;
      let mems = members.map(adm => adm.id.replace('c.us', 's.whatsapp.net'));
      await RyuuBotz.sendMessage(m.chat, { 
        text: "⚠️ Warning ⚠️\n\nTidak boleh ada yang mengirim link grup", 
        contextInfo: { mentionedJid: mems } 
      }, { quoted: m });

    } else if (set === "off") {
      if (!ntlinkgc.includes(m.chat)) return reply("⚠️ Antilinkgc belum aktif di grup ini.");
      let index = ntlinkgc.indexOf(m.chat);
      ntlinkgc.splice(index, 1);
      fs.writeFileSync('./database/antilinkgc.json', JSON.stringify(ntlinkgc));
      reply("❎ Fitur antilinkgc telah dinonaktifkan.");

    } else {
     reply(
      `❌ Pilihan tidak valid.\nGunakan:\n${prefix}antilinkgc on\n${prefix}antilinkgc off`
    );
        }

  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan!\n*Error:* ${err.message}`);
  }

  }
};
