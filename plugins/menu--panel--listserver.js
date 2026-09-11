import "../settings.js";
import axios from "axios";

export default {
  command: ["listserver", "listsrv", "list-server"],
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
    const res = await axios.get(`${Domain.replace(/\/$/, "")}/api/application/servers?page=${page}`, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
      },
      timeout: 20000
    });

    const servers = res.data.data;
    let messageText = "📝 *Daftar Server:*\n\n";

    for (let s of servers) {
      const attrs = s.attributes;
      const status = attrs.status || "Unknown";
      messageText += `🆔 ID Server: ${attrs.id}\n`;
      messageText += `📛 Nama Server: ${attrs.name}\n`;
      messageText += `⚡ Status: ${status}\n\n`;
    }

    messageText += `📄 Page: ${res.data.meta.pagination.current_page}/${res.data.meta.pagination.total_pages}\n`;
    messageText += `📊 Total Server: ${res.data.meta.pagination.count}`;

    await RyuuBotz.sendMessage(m.chat, { text: messageText });

    if (res.data.meta.pagination.current_page < res.data.meta.pagination.total_pages) {
      reply(`Gunakan perintah ${prefix + command} ${parseInt(page) + 1} untuk halaman selanjutnya.`);
    }

  } catch (err) {
    console.error("listsrv error:", err?.response?.data || err.message || err);
    const msg = err.response?.data?.errors
      ? JSON.stringify(err.response.data.errors)
      : (err.response?.data?.message || err.message || "Unknown error");
    reply(`❌ Terjadi kesalahan saat mengambil daftar server!\n${msg}`);
  }

  }
};
