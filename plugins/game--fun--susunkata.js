import fs from "fs";
import { setGameTimeout, endGame } from "../lib/game-manager.js";

const filePath = "./database/game/susunkata.json";
const soalDB = fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath))
  : [];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
  command: ["susunkata"],
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
    const tmpFile = `./database/tmp/susunkata-${from}.json`;

    const isGameRunning = () => {
      if (!fs.existsSync(TMP_DIR)) return false;
      return fs.readdirSync(TMP_DIR)
        .some(f => f.endsWith(`-${from}.json`));
    };

    if (isGameRunning())
      return reply("*Selesaikan game sebelumnya dulu yah* 🍡✨");

    const data = pick(soalDB);
    const jawaban = data.jawaban.toLowerCase();
    const hint = jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, "-");

    reply(`🎮 *SUSUN KATA*\n🔤 ${data.soal}\n🔍 \`${hint}\`\n⏱️ 60 detik`);

    fs.writeFileSync(tmpFile, JSON.stringify({ answer: jawaban }));

    setGameTimeout(
      from,
      setTimeout(() => {
        if (!fs.existsSync(tmpFile)) return;
        reply(`⏱️ Waktu habis!\nJawaban: *${jawaban}*`);
        endGame(from, tmpFile);
      }, 60000)
    );
  }
};