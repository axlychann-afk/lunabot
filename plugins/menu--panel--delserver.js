import "../settings.js";
import axios from "axios";

export default {
  command: ["delserver", "delsrv"],
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
  if (!text) return reply("⚠️ Masukkan ID server yang ingin dihapus.");

  const serverId = text.trim();

  try {
    await axios.delete(`${Domain.replace(/\/$/, "")}/api/application/servers/${serverId}`, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
      }
    });

    await reply(global.mess.success);

  } catch (err) {
    console.error("delsrv error:", err?.response?.data || err.message || err);
    reply("❌ Terjadi kesalahan saat menghapus server!");
  }

  }
};
