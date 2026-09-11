import "../settings.js";
import axios from "axios";

export default {
  command: ["listadmin", "list-admin"],
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

  if (!Domain || !apikey) return reply("❌ Domain atau API key Pterodactyl belum dikonfigurasikan pada global.");
  let page = text || "1";

  try {
    const url = `${Domain.replace(/\/$/, "")}/api/application/users?page=${page}`;
    const res = await axios.get(url, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`
      },
      timeout: 20000
    });

    const users = res.data.data;
    let messageText = "📝 *Daftar Admin Panel:*\n\n";

    let adminCount = 0;
    for (let user of users) {
      const u = user.attributes;
      if (u.root_admin) {
        adminCount++;
        const status = u.server_limit === null ? "Inactive" : "Active";
        messageText += `👤 ${u.username}\n`;
        messageText += `🆔 ID: ${u.id}\n`;
        messageText += `📛 ${u.first_name} ${u.last_name}\n`;
        messageText += `⚡ Status: ${status}\n\n`;
      }
    }

    messageText += `📄 Page: ${res.data.meta.pagination.current_page}/${res.data.meta.pagination.total_pages}\n`;
    messageText += `📊 Total Admin: ${adminCount}`;

    const buttons = {
      text: messageText,
      footer: `© ${global.ownername} - 2025`,
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "Next page",
            id: `${prefix + command} ${parseInt(page) + 1}`,
          }),
        },
      ],
    };

   await RyuuBotz.sendMessage(m.chat, buttons, {
                quoted: m
            });

  } catch (err) {
    console.error("listadmin error:", err?.response?.data || err.message || err);
    const msg = err.response?.data?.errors
      ? JSON.stringify(err.response.data.errors)
      : (err.response?.data?.message || err.message || "Unknown error");
    reply(`❌ *Error mengambil list admin!*\n${msg}`);
  }

  }
};
