import fs from "fs";

const filePath = "./database/menfess.json";
let menfessDB = fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath))
  : [];

function saveMenfess() {
  fs.writeFileSync(filePath, JSON.stringify(menfessDB, null, 2));
}

export default {
  command: ["menfess"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: true,
  usePrefix: true,
  disable: false,

  code: async (m, { prefix, text, reply, RyuuBotz }) => {

  if (!text)
    return reply(`💌 Format:\n${prefix}menfess tembak|target|pesan\n${prefix}menfess sesi\n${prefix}menfess tolak|alasan\n${prefix}menfess balas|pesan`);

  const [mode, arg1, arg2] = text.split("|");
  const sender = m.sender;

  switch (mode) {
    // === Kirim Menfess ===
    case "tembak": {
      if (!arg1 || !arg2)
        return reply(`📋 Contoh:\n${prefix}menfess tembak|62xxxx|pesan`);

      const target = arg1.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      const pesan = arg2.trim();
      const id = Date.now();

      menfessDB.push({
        id,
        from: sender,
        to: target,
        pesan,
        waktu: Date.now(),
        status: "pending",
      });
      saveMenfess();

      reply(`💌 Menfess berhasil dikirim ke ${arg1}\nMenunggu respon...`);

      await RyuuBotz.sendMessage(target, {
        text: `💌 Hai, ada menfess buat kamu~\n\n📨 Pesan: ${pesan}\n\nBalas dengan:\n${prefix}menfess balas|pesan_balasan → menerima ❤️\n${prefix}menfess tolak|alasan → menolak 💔`,
      });
      break;
    }

    // === Lihat Semua Sesi ===
    case "sesi": {
      if (menfessDB.length === 0)
        return reply("💭 Tidak ada sesi menfess aktif.");

      const list = menfessDB
        .map(
          (v, i) =>
            `#${i + 1}\n🆔 ID: ${v.id}\nDari: ${v.from}\nKe: ${v.to}\nPesan: ${v.pesan}\nStatus: ${v.status}\n⏰ ${new Date(v.waktu).toLocaleString()}`
        )
        .join("\n\n");

      reply(list);
      break;
    }

    // === Tolak Menfess ===
    case "tolak": {
      const alasan = arg1 || "tanpa alasan";
      const entryIndex = menfessDB.findIndex(
        (v) => v.to === sender && v.status === "pending"
      );

      if (entryIndex === -1) return reply("💭 Tidak ada menfess untuk kamu~");

      const entry = menfessDB[entryIndex];
      await RyuuBotz.sendMessage(entry.from, {
        text: `💔 Menfess kamu ditolak ${alasan ? `dengan alasan: ${alasan}` : "tanpa alasan."}`,
      });

      menfessDB.splice(entryIndex, 1); // hapus sesi
      saveMenfess();

      reply(`❌ Kamu menolak menfess tersebut (${alasan}).`);
      break;
    }

    // === Balas Menfess (Diterima) ===
    case "balas": {
      const pesanBalasan = arg1 || arg2;
      if (!pesanBalasan)
        return reply(`📨 Contoh:\n${prefix}menfess balas|pesan_balasan`);

      const entryIndex = menfessDB.findIndex(
        (v) => v.to === sender && v.status === "pending"
      );
      if (entryIndex === -1)
        return reply("💭 Tidak ada menfess yang bisa kamu balas~");

      const entry = menfessDB[entryIndex];

      // Kirim balasan ke pengirim
      await RyuuBotz.sendMessage(entry.from, {
        text: `💖 Kabar baik! Menfess kamu diterima~\n\n📨 Balasan: ${pesanBalasan}`,
      });

      // Hapus sesi
      menfessDB.splice(entryIndex, 1);
      saveMenfess();

      reply("💞 Kamu berhasil membalas menfess tersebut. Sesi telah dihapus 💌");
      break;
    }
    // === Batalkan Menfess ===
  case "batal": {
  const entryIndex = menfessDB.findIndex(
    (v) => v.from === sender && v.status === "pending"
  );

  if (entryIndex === -1)
    return reply("💭 Kamu tidak punya menfess yang bisa dibatalkan~");

  const entry = menfessDB[entryIndex];

  // Kirim notifikasi ke target
  await RyuuBotz.sendMessage(entry.to, {
    text: `💨 Menfess yang kamu terima telah dibatalkan oleh pengirim sebelum kamu sempat membalas.`,
  });

  // Hapus dari database
  menfessDB.splice(entryIndex, 1);
  saveMenfess();

  reply("❎ Menfess kamu berhasil dibatalkan dan target sudah diberi tahu~ 💌");
  break;
}

    default:
      reply(`💌 Format:\n${prefix}menfess tembak|target|pesan\n${prefix}menfess sesi\n${prefix}menfess tolak|alasan\n${prefix}menfess balas|pesan`);
  }

  }
};
