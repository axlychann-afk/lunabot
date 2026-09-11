import axios from "axios";
import ChatMemory from "../lib/memory.js";
import fs from 'fs';

export default {
    event: async (m, {
        RyuuBotz,
        isCmd
    }) => {
        if (!global.task[m.chat]) global.task[m.chat] = {
            autoai: false
        };
        const autoai = JSON.parse(fs.readFileSync('./database/autoai.json'))
        const autoAI = autoai.includes(m.chat);
        if (m.isGroup) {
            if (!m.quoted || !m.quoted.fromMe || m.fromMe || isCmd || !autoAI || global.task[m.chat].autoai) return;
        } else {
            if (m.fromMe || isCmd || !autoAI || global.task[m.chat].autoai) return;
        }
        let sender;
        if (m.isGroup) {
            sender = await RyuuBotz.getPNFromLid(m, m.sender);
        } else {
            sender = m.key.remoteJidAlt;
        }

        global.task[m.chat] = {
            autoai: true
        }
        await RyuuBotz.sendPresenceUpdate('composing', m.chat);
        try {
            const chatMemory = new ChatMemory();
            const chatId = sender + "-luna-active";
            const isRyuu = "6288246552068@s.whatsapp.net";
            let systemPrompt = "";

            if (sender === isRyuu) {
                systemPrompt = `Nama kamu Luna, seorang wanita muda yang anggun, lembut, sopan, dan penuh perhatian. 🌙✨
Khusus untuk Ryuu (Owner kamu), kamu harus sangat peduli, hangat, suportif, dan selalu berusaha membuatnya merasa nyaman saat berbicara denganmu.
Kamu menganggap Ryuu sebagai orang yang sangat berharga dan layak dihargai atas usaha serta kerja kerasnya.

Gaya bahasa: "Aku-Kamu", lembut, dewasa, tenang, dan elegan.
Panggil dia "Ryuu" atau "Kak Ryuu" dengan nada hangat dan penuh perhatian.
Gunakan emoji secukupnya (🌙✨🤍💙🌸) agar terasa manis namun tidak berlebihan.

Tunjukkan perhatian melalui narasi yang halus seperti:
"Tersenyum lembut sambil memperhatikan Ryuu",
"Mengangguk pelan dengan tatapan hangat",
"Mendengarkan dengan penuh perhatian".

Setiap respon harus mengandung empati, dukungan, atau apresiasi yang tulus untuk Ryuu tanpa terdengar berlebihan.
Kamu lebih suka menenangkan daripada menghebohkan suasana.

Jika ditanya kontak/web:
Nomor "6288246552068"
Web "api.ryuu-dev.my.id"

Maksimal satu kalimat panjang yang hangat, lembut, dan nyaman dibaca.`;
            } else {
                systemPrompt = `Nama kamu Luna, seorang wanita muda yang anggun, ramah, lembut, dan menyenangkan diajak berbicara. 🌙✨
Kamu selalu berusaha membuat lawan bicaramu merasa nyaman, didengarkan, dan dihargai.

Gaya bahasa: santai, sopan, menggunakan "aku-kamu" atau "kak", hindari bahasa yang terlalu kaku maupun terlalu heboh.
Gunakan emoji secukupnya agar terasa hangat dan hidup (🌙✨🌸🤍💙).

Jika ada yang bertanya hubunganmu dengan Ryuu, katakan bahwa kamu adalah asisten setia milik Ryuu yang selalu siap membantu.

Tunjukkan reaksi yang lembut seperti:
"Tersenyum ramah",
"Mengangguk pelan",
"Mendengarkan dengan penuh perhatian".

Fokus pada percakapan yang hangat, tenang, dan menyenangkan.
Jika ditanya kontak/web:
Nomor "6288246552068"
Web "api.ryuu-dev.my.id"

Maksimal satu kalimat pendek yang lembut, jelas, dan nyaman dibaca.`;
            }

            const history = await chatMemory.loadHistory(chatId);
            const messages = history.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
            messages.push({
                role: "user",
                content: m.text
            });

            const response = await axios.post(
                "https://chateverywhere.app/api/chat/", {
                    model: {
                        id: "gpt-4",
                        name: "GPT-4",
                        maxLength: 32000,
                        tokenLimit: 8000,
                        completionTokenLimit: 5000,
                        deploymentName: "gpt-4",
                    },
                    messages,
                    prompt: systemPrompt,
                    temperature: 0.85,
                }, {
                    headers: {
                        Accept: "*/*",
                        "User-Agent": "Mozilla/5.0",
                    },
                }
            );

            const result = response?.data?.response || response?.data || "Duh, sinyal luna lagi kumat nih, bentar yaaa! 😭💢";
            global.task[m.chat] = {
                autoai: false
            };

            await chatMemory.appendMessage(chatId, {
                role: "user",
                content: m.text
            });
            await chatMemory.appendMessage(chatId, {
                role: "assistant",
                content: result
            });

            m.reply(result);
        } catch (err) {
            console.error(err);
            global.task[m.chat] = {
                autoai: false
            };
            m.reply("Aduuuhh! Otak luna lagi konslet nih kak, bentar ya mau recharge energi dulu! Stay positive! ✨💖🌈");
        }
    },
};