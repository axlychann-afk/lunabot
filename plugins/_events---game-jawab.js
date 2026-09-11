import fs from "fs";
import path from "path";
import {
    endGame
} from "../lib/game-manager.js";

const TMP_DIR = "./database/tmp";

export default {
    event: async (m, {
        RyuuBotz,
        reply,
        addMoney
    }) => {

        if (!m.text) return;
        if (m.text.startsWith(".")) return;
        if (m.fromMe) return;

        const from = m.chat;
        const text = m.text.toLowerCase().trim();

        if (!fs.existsSync(TMP_DIR)) return;
        const file = fs.readdirSync(TMP_DIR)
            .find(f => f.endsWith(`-${from}.json`));
        if (!file) return;
        const filePath = path.join(TMP_DIR, file);
        const session = JSON.parse(fs.readFileSync(filePath));
        const deleteSoal = async () => {
            if (session.type === "tebakgambar" && session.msgKey) {
                try {
                    await RyuuBotz.sendMessage(from, {
                        delete: session.msgKey
                    });
                } catch {}
            }
        };        

        if (session.answer && text.includes(session.answer)) {
            await deleteSoal();
            endGame(from, filePath);
            addMoney(m.sender, 1000);
            return reply(
                `✨ Benar! Jawabannya *${session.answer}*
*Selamat, kamu mendapatkan 1000 money!*`
            );
        }

        if (Array.isArray(session.answers)) {
            for (const ans of session.answers) {
                if (text.includes(ans)) {
                    session.answers = session.answers.filter(a => a !== ans);
                    fs.writeFileSync(
                        filePath,
                        JSON.stringify(session)
                    );
                    await reply(`🎉 Benar! *${ans}*`);
                    addMoney(m.sender, 1000);

                    if (session.answers.length < 1) {
                        await deleteSoal();
                        endGame(from, filePath);
                        reply("🏆 Semua jawaban terjawab!");
                    }
                    return;
                }
            }
        }
    }
};