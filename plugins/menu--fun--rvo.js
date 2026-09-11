import fs from "fs";
import path from "path";

export default {
  command: ["readviewonce", "rvo", "lihatsekali"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, reply }) => {

  if (!m.quoted) return reply("❌ Balas gambar/video *view once* yang ingin dilihat");

  const isViewOnce =  
    m.quoted.viewOnce ||  
    m.quoted?.message?.[m.quoted.mtype]?.viewOnce ||  
    m.quoted?.msg?.viewOnce ||  
    (m.quoted?.message?.[m.quoted.mtype]?.viewOnce === true) ||  
    (m.quoted?.msg?.viewOnce === true) ||  
    m.quoted?.isViewOnce ||  
    m.quoted?.once;  

  if (!isViewOnce) return reply("❌ Itu bukan pesan *view once*");

  try {
    const tempDir = path.join(process.cwd(), "database/tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const now = Date.now();
    fs.readdirSync(tempDir).forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > 5 * 60 * 1000) fs.unlinkSync(filePath);
    });

    const quotedMsg = m.quoted.message?.[m.quoted.mtype] || m.quoted.msg || {};
    const isImage = ["imageMessage", "viewOnceImage"].includes(m.quoted.mtype);  
    const isVideo = ["videoMessage", "viewOnceVideo"].includes(m.quoted.mtype);  

    if (!isImage && !isVideo) return reply("❌ Hanya support gambar dan video");

    const timestamp = Date.now();
    const ext = isImage ? "jpg" : "mp4";
    const filename = `rvo_${timestamp}.${ext}`;
    const filepath = await RyuuBotz.downloadAndSaveMediaMessage(m.quoted);
    const captions = m.quoted.text;

    await RyuuBotz.sendFile(m.chat, filepath, filename, captions, m, false, {
      contextInfo: { isForwarded: true },
      mentions: [m.sender],
    });

    setTimeout(() => {
      try {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      } catch (err) {
        console.error("❌ Gagal hapus file sementara:", err);
      }
    }, 5 * 60 * 1000);

  } catch (err) {
    console.error("RVO Error:", err);
    reply("❌ Gagal memproses media, coba lagi nanti\n\n" + err);
  }

  }
};
