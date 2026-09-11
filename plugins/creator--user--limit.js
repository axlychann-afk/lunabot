import fs from "fs";
import "../settings.js";

export default {
  command: ["limit"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { args, q, reply, prefix }) => {

  if (!args[0]) {
    return reply(
      `Penggunaan:\n` +
      `${prefix}limit add jumlah|reply/userid\n` +
      `${prefix}limit del jumlah|reply/userid`
    );
  }

  let sub = args[0].toLowerCase(); 
  let input = q.replace(sub, "").trim();

  if (!input) return reply("Format salah. Harus ada jumlah limit.");

  let jumlah = parseInt(input.split("|")[0]);
  if (isNaN(jumlah)) return reply("Jumlah limit tidak valid.");

  let target = m.quoted ? m.quoted.sender : input.split("|")[1];
  if (!target) return reply("User tidak ditemukan.");

  if (!target.includes("@")) {
    target = target.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  }

  const dbPath = "./database/registered.json";
  let users = JSON.parse(fs.readFileSync(dbPath));

  let u = users.find(x => x.id === target);
  if (!u) return reply(`User ${target} tidak ada di database.`);

  if (sub === "add") {
    u.limit += jumlah;
  } else if (sub === "del") {
    u.limit -= jumlah;
    if (u.limit < 0) u.limit = 0;
  } else {
    return reply("Subcommand tidak dikenal. Gunakan add atau del.");
  }

  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

  reply(
    `Limit berhasil di${sub === "add" ? "tambah" : "kurang"}.\n` +
    `User: @${target.split("@")[0]}\n` +
    `${sub === "add" ? "Ditambah" : "Dikurangi"}: ${jumlah}\n` +
    `Limit sekarang: ${u.limit}`, [target]
  );

  }
};
