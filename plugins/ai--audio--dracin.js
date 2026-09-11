import axios from 'axios';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

async function textToSpeech(
    text,
    voice = 'voice-171',
    pitch = 0,
    rate = 0
) {
    const response = await axios.post(
        'https://speechma.com/com.api/tts-api.php', {
            text,
            voice,
            pitch,
            rate
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',
                Referer: 'https://speechma.com/indonesian'
            },
            responseType: 'arraybuffer'
        }
    );
    return Buffer.from(response.data);
}
async function mergeAudio(bufferAudio, urlAudio) {

    const tmpDir = path.join(process.cwd(), 'database/tmp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, {
            recursive: true
        });
    }
    const id = Date.now();
    const inputTTS = path.join(tmpDir, `${id}-tts.mp3`);
    const inputBG = path.join(tmpDir, `${id}-bg.mp3`);
    const output = path.join(tmpDir, `${id}-output.mp3`);
    try {
        fs.writeFileSync(inputTTS, bufferAudio);
        const bgAudio = await axios.get(urlAudio, {
            responseType: 'arraybuffer'
        });
        fs.writeFileSync(inputBG, bgAudio.data);
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(inputTTS)
                .input(inputBG)

                .complexFilter([
                    '[0:a]volume=1.5[a0]',
                    '[1:a]volume=0.20[a1]',
                    '[a0][a1]amix=inputs=2:duration=shortest[mix]',
                    '[mix]volume=2.0[out]'
                ])

                .audioCodec('libmp3lame')
                .audioBitrate('128k')
                .audioFrequency(44100)
                .audioChannels(2)
                .outputOptions([
                    '-map [out]',
                    '-threads 1'
                ])
                .save(output)
                .on('end', resolve)
                .on('error', reject);
        });

        const result = fs.readFileSync(output);
        [inputTTS, inputBG, output].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });

        return result;

    } catch (err) {
        [inputTTS, inputBG, output].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
        throw err;
    }
}

export default {
    command: ['tts', 'dracin'],
    group: false,
    premium: false,
    limit: true,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (
        m, {
            RyuuBotz,
            text,
            reply,
            prefix,
            command
        }
    ) => {
        if (!text) {
            return reply(
                `📌 Format:\n` +
                `*${prefix + command} halo dunia*`
            );
        }
        try {
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '⏳',
                    key: m.key
                }
            });
            const ttsAudio = await textToSpeech(text);
            const merged = await mergeAudio(
                ttsAudio,
                'https://api.ryuu-dev.my.id/backsound-dracin.mp3'
            );
            await RyuuBotz.sendMessage(
                m.chat, {
                    audio: merged,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: 'dracin.mp3'
                }, {
                    quoted: m
                }
            );
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            });
        } catch (err) {
            console.error(err);
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });
            reply(
                `❌ Error:\n${err.message}`
            );
        }
    }
};