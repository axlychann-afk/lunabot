import fs from "fs";

export default {
  command: ["transfer", "tf"],
  group: true,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { args, reply, addMoney, delMoney }) => {
    const userPath = "./database/user.json";
    const users = JSON.parse(fs.readFileSync(userPath));

    if (!m.quoted) {
      return reply("*Reply pesan orang yang mau kamu transfer yahh*✨");
    }

    const target = m.quoted.sender;
    const jumlah = parseInt(args[0]);

    if (!jumlah || jumlah < 1) {
      return reply("Contoh penggunaan:\n.transfer 1000");
    }

    const senderData = users.find(u => u.userid === m.sender);
    const targetData = users.find(u => u.userid === target);

    if (!senderData) {
      return reply("Data kamu belum ada di database🗿🥀");
    }

    if (!targetData) {
      return reply("Dia belum terdaftar di database🗿🥀");
    }

    if (senderData.money < jumlah) {
      return reply(
        `Money kamu kurang🗿🥀\n` +
        `Money kamu : ${senderData.money}\n` +
        `Dibutuhkan : ${jumlah}`
      );
    }

    delMoney(m.sender, jumlah);
    addMoney(target, jumlah);

    reply(
      `Transfer berhasil 💸✨\n\n` +
      `• Ke : @${target.split("@")[0]}\n` +
      `• Jumlah : ${jumlah}\n` +
      `• Sisa money kamu : ${senderData.money - jumlah}`,
      { mentions: [target] }
    );
  }
};