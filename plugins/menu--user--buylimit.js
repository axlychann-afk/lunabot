import fs from "fs";

export default {
  command: ["buylimit"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { args, reply, addUserLimit, delMoney }) => {

    const userPath = "./database/user.json";
    const users = JSON.parse(fs.readFileSync(userPath));

    let ud = users.find(x => x.userid === m.sender);
    if (!ud) return reply("Data kamu belum ada di database, sayang…");

    let jumlah = parseInt(args[0]);
    if (!jumlah || jumlah < 1) {
      return reply("Contoh penggunaan:\n.buylimit 1");
    }

    const harga = 2000;
    const total = jumlah * harga;

    if (ud.money < total) {
      return reply(
        `Uang kamu kurang🗿💔\n` +
        `Harga ${jumlah} limit = ${total}\n` +
        `Money kamu: ${ud.money}`
      );
    }

    delMoney(m.sender, total);
    addUserLimit(m.sender, jumlah);

    reply(
      `Berhasil beli limit🍡✨\n\n` +
      `• Jumlah : ${jumlah}\n` +
      `• Harga : ${total}\n` +
      `• Sisa Money : ${ud.money - total}`
    );
  }
};