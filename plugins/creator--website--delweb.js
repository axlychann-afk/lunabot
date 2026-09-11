import '../settings.js';
import fetch from "node-fetch";

export default {
  command: ["delweb"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply, }) => {

  if (!text) return reply("Contoh: .delweb <namaWeb>");

  const webName = text.trim().toLowerCase();
  const headers = { Authorization: `Bearer ${global.vercelToken}` };

  try {
    await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

    const response = await fetch(`https://api.vercel.com/v9/projects/${webName}`, {
      method: "DELETE",
      headers,
    });

    if (response.status === 200 || response.status === 204) {
      return reply(`[ ✓ ] Website *${webName}* berhasil dihapus dari Vercel.`);
    } else if (response.status === 404) {
      return reply(`[ x ] Website *${webName}* tidak ditemukan.`);
    } else if ([403, 401].includes(response.status)) {
      return reply(`[ ! ] Token Vercel tidak valid.`);
    } else {
      const result = await response.json().catch(() => ({}));
      return reply(`[ x ] Gagal menghapus website:\n${result.error?.message || "Tidak diketahui"}`);
    }
  } catch (err) {
    reply(`Terjadi kesalahan saat menghapus:\n${err.message}`);
  }

  }
};
