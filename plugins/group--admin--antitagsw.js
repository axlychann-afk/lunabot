import antitagsw from "../lib/antitagsw.js";    
const list = antitagsw.list;
const add = antitagsw.add;
const remove = antitagsw.remove;
const isActive = antitagsw.isActive;
import "../settings.js";

export default {
  command: ["antitagsw"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, reply }) => {

  try {

    let set = (text || "").toLowerCase();

    if (set === "on") {
      if (isActive(m.chat)) return reply("⚠️ Antitagsw sudah aktif di grup ini.");
      add(m.chat);
      reply("✅ Fitur antitagsw telah diaktifkan.\nBot akan otomatis hapus pesan tag grup dari status.");
    } else if (set === "off") {
      if (!isActive(m.chat)) return reply("⚠️ Antitagsw belum aktif di grup ini.");
      remove(m.chat);
      reply("❎ Fitur antitagsw dinonaktifkan.");
    } else {
      reply(`📌 Gunakan perintah:\n.antitagsw on - untuk aktifkan\n.antitagsw off - untuk nonaktifkan`);
    }
  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan!\n*Error:* ${err.message}`);
  }

  }
};
