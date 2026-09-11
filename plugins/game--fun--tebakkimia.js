import fs from "fs";
import { setGameTimeout, endGame } from "../lib/game-manager.js";

const filePath = "./database/game/tebakkimia.json";
const soalDB = fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath))
  : [];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
  command: ["tebakkimia"],
  group: true,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { reply }) => {
    const from = m.chat;
    const TMP_DIR = "./database/tmp";
    const tmpFile = `./database/tmp/tebakkimia-${from}.json`;

    const isGameRunning = () => {
      if (!fs.existsSync(TMP_DIR)) return false;
      return fs.readdirSync(TMP_DIR)
        .some(f => f.endsWith(`-${from}.json`));
    };

    if (isGameRunning())
      return reply("*Selesaikan game sebelumnya dulu yah* 🍡✨");

    const data = pick(soalDB);

    reply(
      `🧪 *TEBAK KIMIA*\n` +
      `⚗️ Unsur: ${data.soal}\n` +
      `⏱️ 60 detik`
    );

    fs.writeFileSync(
      tmpFile,
      JSON.stringify({ answer: data.jawaban.toLowerCase() })
    );

    setGameTimeout(
      from,
      setTimeout(() => {
        if (!fs.existsSync(tmpFile)) return;
        reply(`⏱️ Waktu habis!\nJawaban: *${data.jawaban}*`);
        endGame(from, tmpFile);
      }, 60000)
    );
  }
};