import "../settings.js";
import axios from "axios";

export default {
  command: ["deluser", "delusr"],
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
  if (!text) return reply("⚠️ Masukkan ID user yang ingin dihapus.");

  const userId = text.trim();

  try {
    await axios.delete(`${Domain.replace(/\/$/, "")}/api/application/users/${userId}`, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
      }
    });

    await reply(global.mess.success);

  } catch (err) {
    console.error("deluser error:", err?.response?.data || err.message || err);
    reply("❌ Terjadi kesalahan saat menghapus user!");
  }

  }
};
