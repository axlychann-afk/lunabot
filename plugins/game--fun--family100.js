import fs from "fs";
import { setGameTimeout, endGame } from "../lib/game-manager.js";

const filePath = "./database/game/family100.json";
const soalDB = fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath))
  : [];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const timeoutStore = {};

export default {
  command: ["family100", "f100"],
  group: true,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { reply, args }) => {
  const TMP_DIR = "./database/tmp";
  const from = m.chat;

  const isGameRunning = () => {
  if (!fs.existsSync(TMP_DIR)) return false;
  return fs.readdirSync(TMP_DIR)
    .some(f => f.endsWith(`-${from}.json`));
};

  if (isGameRunning())
  return reply("*Selesaikan Game sebelumnya dulu yah* 🍡✨");

  const tmpFile = `./database/tmp/family100-${from}.json`;

  const saveSession = (data) => {
    fs.writeFileSync(tmpFile, JSON.stringify(data));
  };

    const data = pickRandom(soalDB);
    const soal = data.soal;
    const jawaban = data.jawaban.map((x) => x.toLowerCase());

    reply(
      `💯 *FAMILY 100*\n` +
      `📝 Soal: *${soal}*\n` +
      `🔢 Jumlah jawaban: *${jawaban.length}*\n` +
      `⏱️ 10 menit dimulai sekarang`
    );

    saveSession({ answers: jawaban });
    
    setGameTimeout(
  from,
  setTimeout(() => {
    if (!fs.existsSync(tmpFile)) return;

    const session = JSON.parse(fs.readFileSync(tmpFile));

    reply(
      `⏱️ *Waktu habis!*\nJawaban:\n- ${session.answers.join("\n- ")}`
    );

    endGame(from, tmpFile);
     }, 600000)
   );
  }
};
