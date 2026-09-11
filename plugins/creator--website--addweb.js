import '../settings.js';
import fetch from "node-fetch";
import unzipper from "unzipper";

export default {
  command: ["addweb"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, prefix, reply }) => {

  try {
    if (!text) return reply("<namaWeb>");
    if (!/zip|html/.test(m.quoted.mimetype)) return reply("Reply file .zip atau .html");
    let qmsg = m.quoted;

    const webName = text.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    const domainCheckUrl = `https://${webName}.vercel.app`;

    await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });
    const check = await fetch(domainCheckUrl);
    if (check.status === 200) return reply(`[ x ] Nama web *${webName}* sudah digunakan.`);

    const quotedFile = await RyuuBotz.downloadMediaMessage(qmsg);
    const filesToUpload = [];

    if (qmsg.mimetype.includes("zip")) {
      const zipBuffer = Buffer.from(quotedFile);
      const directory = await unzipper.Open.buffer(zipBuffer);
      for (const file of directory.files) {
        if (file.type === "File") {
          const content = await file.buffer();
          const filePath = file.path.replace(/^\/+/, "").replace(/\\/g, "/");
          filesToUpload.push({
            file: filePath,
            data: content.toString("base64"),
            encoding: "base64",
          });
        }
      }
      if (!filesToUpload.some(x => x.file.toLowerCase().endsWith("index.html")))
        return reply("File index.html tidak ditemukan dalam struktur ZIP.");

    } else if (qmsg.mimetype.includes("html")) {
      filesToUpload.push({
        file: "index.html",
        data: Buffer.from(quotedFile).toString("base64"),
        encoding: "base64",
      });
    } else {
      return reply("File tidak dikenali. Kirim file .zip atau .html.");
    }

    const headers = {
      Authorization: `Bearer ${global.vercelToken}`,
      "Content-Type": "application/json",
    };

    await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers,
      body: JSON.stringify({ name: webName }),
    }).catch(() => {});

    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: webName,
        project: webName,
        files: filesToUpload,
        projectSettings: { framework: null },
      }),
    });

    const deployData = await deployRes.json().catch(() => null);
    if (!deployData || !deployData.url)
      return reply(`Gagal deploy ke Vercel:\n${JSON.stringify(deployData)}`);

    reply(`[ ✓ ] Website berhasil dibuat!\n\n🌐 URL: https://${webName}.vercel.app`);
  } catch (e) {
    reply(`[ x ] Error: ${e.message}`);
  }

  }
};
