import fs from "fs";
import { setGameTimeout, endGame } from "../lib/game-manager.js";

const filePath = "./database/game/tebakgambar.json";
const soalDB = fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath))
  : [];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
  command: ["tebakgambar"],
  group: true,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, reply }) => {
    const from = m.chat;
    const TMP_DIR = "./database/tmp";
    const tmpFile = `./database/tmp/tebakgambar-${from}.json`;

    const isGameRunning = () => {
      if (!fs.existsSync(TMP_DIR)) return false;
      return fs.readdirSync(TMP_DIR)
        .some(f => f.endsWith(`-${from}.json`));
    };

    if (isGameRunning())
      return reply("*Selesaikan game sebelumnya dulu yah* 🍡✨");

    const data = pick(soalDB);

    const msg = await RyuuBotz.sendMessage(
      from,
      {
        image: { url: data.img },
        caption:
`🧩 *TEBAK GAMBAR*

⏱️ Waktu: 60 detik
💭 Petunjuk:
${data.soal}`
      },
      { quoted: m }
    );

    fs.writeFileSync(
      tmpFile,
      JSON.stringify({
        type: "tebakgambar",
        answer: data.jawaban.toLowerCase(),
        msgKey: msg.key
      })
    );

    setGameTimeout(
      from,
      setTimeout(async () => {
        if (!fs.existsSync(tmpFile)) return;

        const session = JSON.parse(fs.readFileSync(tmpFile));

        try {
          if (session.msgKey) {
            await RyuuBotz.sendMessage(from, {
              delete: session.msgKey
            });
          }
        } catch {}

        reply(
`⏱️ Waktu habis!

Jawaban yang benar:
*${data.jawaban}*`
        );

        endGame(from, tmpFile);

      }, 60000)
    );
  }
};