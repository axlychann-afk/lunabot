import '../settings.js';
import fetch from "node-fetch";

export default {
  command: ["listweb"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { reply }) => {


    const headers = { Authorization: `Bearer ${global.vercelToken}` };
  const res = await fetch('https://api.vercel.com/v9/projects', { headers });
  const data = await res.json();

  if (!data.projects || data.projects.length === 0)
    return reply('Tidak ada website yang ditemukan.');

  let teks = '*🌐 Daftar Website Anda:*\n\n';
  for (let proj of data.projects) {
    teks += `• ${proj.name} → https://${proj.name}.vercel.app\n`;
  }

  reply(teks);

  }
};
