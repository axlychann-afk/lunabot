import "../settings.js";
import axios from "axios";

export default {
  command: ["listusr", "listuser"],
  group: false,
  limit: false,
  premium: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { prefix, command, RyuuBotz, text, reply }) => {

  const Domain = global.domain;
  const apikey = global.aapikey;

  if (!Domain || !apikey) return reply("❌ Domain atau API key belum dikonfigurasikan.");

  let page = text || "1";

  try {
    const res = await axios.get(`${Domain.replace(/\/$/, "")}/api/application/users?page=${page}`, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
      },
      timeout: 20000
    });

    const users = res.data.data;
    let messageText = "📝 *Daftar User Panel:*\n\n";

    for (let u of users) {
      const attr = u.attributes;
      const status = attr.user?.server_limit === null ? "Inactive" : "Active";
      messageText += `🆔 ID: ${attr.id} - Status: ${status}\n`;
      messageText += `📛 Username: ${attr.username}\n`;
      messageText += `📛 Nama: ${attr.first_name} ${attr.last_name}\n\n`;
    }

    messageText += `📄 Page: ${res.data.meta.pagination.current_page}/${res.data.meta.pagination.total_pages}\n`;
    messageText += `📊 Total Users: ${res.data.meta.pagination.count}`;

    await RyuuBotz.sendMessage(m.chat, { text: messageText });

    if (res.data.meta.pagination.current_page < res.data.meta.pagination.total_pages) {
      reply(`Gunakan perintah ${prefix + command} ${parseInt(page) + 1} untuk melihat halaman selanjutnya.`);
    }

  } catch (err) {
    console.error("listusr error:", err?.response?.data || err.message || err);
    const msg = err.response?.data?.errors
      ? JSON.stringify(err.response.data.errors)
      : (err.response?.data?.message || err.message || "Unknown error");
    reply(`❌ Terjadi kesalahan saat mengambil daftar user!\n${msg}`);
  }

  }
};
