import fs from "fs";

export default {
  command: ["casino"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { args, reply, addMoney }) => {

  const userPath = "./database/user.json";
  let userDB = JSON.parse(fs.readFileSync(userPath));

  let u = userDB.find(v => v.userid === m.sender);
  if (!u) return reply("Data user kamu belum dibuat.");

  if (u.money < 10) return reply("Uang kamu kurang dari 10, kamu tidak bisa bermain casino.");

  if (!args[0]) return reply("Masukkan jumlah taruhan.\nContoh: .casino 1000");
  let bet = parseInt(args[0]);
  if (isNaN(bet) || bet <= 0) return reply("Jumlah taruhan tidak valid.");

  if (bet > u.money) return reply(`Taruhan kamu terlalu besar.\nUang kamu hanya: ${u.money}`);

  addMoney(m.sender, -bet);

  let win = Math.random() < 0.15;

  if (win) {
    let multiplier = Math.floor(Math.random() * 10) + 1;
    let reward = bet * multiplier;

    addMoney(m.sender, reward); 

    return reply(`🎰 *MENANG!*  
Kamu mendapatkan *${reward}* (${multiplier}x).`);
  } else {
    return reply(`🎰 *KALAH!*  
Taruhan *${bet}* hilang.`);
  }

  }
};
