import fs from "fs";
import path from "path";
import { endGame } from "../lib/game-manager.js";

const TMP_DIR = "./database/tmp";

export default {
  event: async (m, { RyuuBotz, reply }) => {
    if (!m.text) return;
    if (m.text.toLowerCase().trim() !== "nyerah") return;

    const from = m.chat;
    if (!fs.existsSync(TMP_DIR)) return;

    const files = fs.readdirSync(TMP_DIR)
      .filter(f => f.endsWith(`-${from}.json`));

    if (files.length < 1) return;

    const file = files[0];
    const tmpFile = path.join(TMP_DIR, file);
    const session = JSON.parse(fs.readFileSync(tmpFile));
    const deleteSoal = async () => {
            if (session.type === "tebakgambar" && session.msgKey) {
                try {
                    await RyuuBotz.sendMessage(from, {
                        delete: session.msgKey
                    });
                } catch {}
            }
        };

    endGame(from, tmpFile);

    if (session.answer) {
      await deleteSoal();
      return reply(`🫧 Kamu menyerah…\nJawabannya: *${session.answer}*`);
    }

    if (Array.isArray(session.answers)) {
      return reply(
        `🫧 Kamu menyerah…\nJawaban:\n- ${session.answers.join("\n- ")}`
      );
    }
  }
};