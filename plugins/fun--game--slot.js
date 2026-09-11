import fs from "fs";

const EMOJI = ["🍟","🍕","🫔","🌮","🌯","🥙","🧆","🥘","🥒","🎰","🗿"];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const randomSlot = () => [rand(EMOJI), rand(EMOJI), rand(EMOJI)];

const isJackpot = s => s.every(v => v === "🎰");
const isTripleSame = s => s[0] === s[1] && s[1] === s[2];
const isNearMiss = s =>
  (s[0] === "🎰" && s[1] === "🎰" && s[2] !== "🎰") ||
  (s[1] === "🎰" && s[2] === "🎰" && s[0] !== "🎰");

export default {
  command: ["slot", "judol", "bett"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { args, reply, addMoney, RyuuBotz }) => {
    const userPath = "./database/user.json";
    let userDB = JSON.parse(fs.readFileSync(userPath));
    let u = userDB.find(v => v.userid === m.sender);
    if (!u) return reply("Data user kamu belum dibuat.");
    if (!args[0]) return reply("Masukkan jumlah taruhan.\nContoh: .slot 1000");

    let bet = parseInt(args[0]);
    if (isNaN(bet) || bet <= 0) return reply("Taruhan tidak valid.");
    if (bet > u.money) return reply(`Uang kamu cuma ${u.money}.`);

    addMoney(m.sender, -bet);

    const win = Math.random() < 0.15;
    let finalSlot;

    if (win) {
      if (Math.random() < 0.3) {
        finalSlot = ["🎰","🎰","🎰"]; 
      } else {
        const e = rand(EMOJI.filter(v => v !== "🎰"));
        finalSlot = [e, e, e];
      }
    } else {
      if (Math.random() < 0.6) {
        finalSlot = ["🎰","🎰", rand(EMOJI.filter(v => v !== "🎰"))];
      } else {
        finalSlot = randomSlot();
        while (isJackpot(finalSlot) || isTripleSame(finalSlot)) {
          finalSlot = randomSlot();
        }
      }
    }

    const message = await RyuuBotz.sendMessage(m.chat, {
      text: "🎰 SLOT\n\n[ ? | ? | ? ]"
    });

    for (let i = 0; i < 5; i++) {
      await sleep(600);
      const temp = randomSlot();
      const text = `🎰 SLOT\n\n[ ${temp.join(" | ")} ]`;

      await RyuuBotz.relayMessage(
        m.chat,
        {
          protocolMessage: {
            key: message.key,
            type: 14,
            editedMessage: { conversation: text }
          }
        },
        {}
      );
    }

    await sleep(700);
    await RyuuBotz.relayMessage(
      m.chat,
      {
        protocolMessage: {
          key: message.key,
          type: 14,
          editedMessage: {
            conversation: `🎰 SLOT\n\n[ ${finalSlot.join(" | ")} ]`
          }
        }
      },
      {}
    );

    if (isJackpot(finalSlot)) {
      const reward = bet * 10;
      addMoney(m.sender, reward);
      return reply(`🔥 *JACKPOT!* 🎰🎰🎰\n+${reward}`);
    }

    if (isTripleSame(finalSlot)) {
      const reward = bet * 3;
      addMoney(m.sender, reward);
      return reply(`✨ *MENANG KECIL!* ${finalSlot.join("")}\n+${reward}`);
    }

    if (isNearMiss(finalSlot)) {
      return reply(`😖 *DIKIT LAGI!* ${finalSlot.join("")}\nSekali lagi ah…`);
    }

    return reply(`❌ *KALAH!* -${bet}`);
  }
};