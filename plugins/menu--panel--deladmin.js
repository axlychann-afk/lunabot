import "../settings.js";
import axios from "axios";

export default {
  command: ["deladmin", "del-admin"],
  group: false,
  limit: false,
  premium: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply }) => {

  const Domain = global.domain;
  const apikey = global.aapikey;

  if (!Domain || !apikey) return reply("❌ Domain atau API key belum dikonfigurasikan.");
  if (!text) return reply("⚠️ Masukkan ID admin yang ingin dihapus.");

  const adminId = text.trim();

  try {
    const res = await axios.get(`${Domain.replace(/\/$/, "")}/api/application/users?page=1`, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
      }
    });

    const users = res.data.data;
    const targetAdmin = users.find(u => u.attributes.id.toString() === adminId && u.attributes.root_admin === true);
    if (!targetAdmin) return reply("❌ Akun admin panel tidak ditemukan!");

    await axios.delete(`${Domain.replace(/\/$/, "")}/api/application/users/${adminId}`, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
      }
    });

    await reply(global.mess.success);

  } catch (err) {
    console.error("deladmin error:", err?.response?.data || err.message || err);
    reply("❌ Terjadi kesalahan saat menghapus admin!");
  }

  }
};
