import axios from 'axios';

export default {
    command: ['aimusic', 'aisong', 'suno'],
    group: false,
    premium: true,
    limit: true,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        text,
        reply,
        prefix,
        command
    }) => {
        const [style, title, lyrics] = text?.split('|').map(s => s.trim()) || [];

        if (!title || !lyrics) {
            return reply(
                `📌 Format:\n*${prefix + command} [style] | [judul lagu] | [lirik]*\n` +
                `Contoh: *${prefix + command} anime | Semangat Pagi | Bangun pagi, raih mimpi, ayo semangat!*`
            );
        }

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key
            }
        });

        let model = null;
        if (style === "anime") {
            model = {
                apikey: global.fgsiapi,
                title: title,
                style: 'anime upbeat',
                lyrics: lyrics,
                prompt: 'energetic anime song, inspiring, cheerful',
                negativetags: 'sad, slow, dark',
                instrumental: false,
                vocalGender: 'female',
            }
        } else if (style === "sad") {
            model = {
                apikey: global.fgsiapi,
                title: title,
                style: 'emotional',
                lyrics: lyrics,
                prompt: 'sad but motivational song, deep emotional sadness, feeling of disappointment, quiet pain, slow tempo at start then gradually stronger, emotional build-up, reflective, inner strength, resilience',
                negativetags: 'happy, cheerful, upbeat, playful, party',
                instrumental: false,
                vocalGender: 'female',
            }
        } else if (style === "metal") {
            model = {
                apikey: global.fgsiapi,
                title: title,
                style: 'metal',
                lyrics: lyrics,
                prompt: 'pure metal song, high energy, powerful and aggressive, driving riffs, fast drums, intense rhythm, motivational, fighting spirit, never give up, raw strength, headbanging vibe',
                negativetags: 'sad, slow, soft, emotional, ballad, pop',
                instrumental: false,
                vocalGender: 'female',
            }
        } else if (style === "jj" || style === "jedag-jedug") {
            model = {
                apikey: global.fgsiapi,
                title: title,
                style: 'plat jmk',
                lyrics: lyrics,
                prompt: `
pure modern metal song with full beat and tight rhythm.
emotion, mood, and intensity MUST dynamically follow the lyrics content:
- lyrics about struggle, anger, pressure, or being underestimated → aggressive, heavy, angry, powerful
- lyrics about rising, hope, fighting spirit, never giving up → motivational, uplifting, heroic
- lyrics about disappointment or reality hits → dark, tense, emotional but still strong and heavy
keep fast drums, driving riffs, punchy bass, modern metal production,
anthem feeling, headbanging vibe, fighting spirit,
lyrics reflect modern street mentality, mental toughness, silent grind, rising from zero,
never sound weak or soft unless lyrics explicitly demand it
`,
                negativetags: `
slow, soft, pop, ballad, cute, acoustic,
overly sad, sleepy, chill, lo-fi,
happy pop vibe that breaks metal energy
`,
                instrumental: false,
                vocalGender: 'female'
            }
        } else return reply(`*Style yang valid:*\n` +
            `- *anime*\n` +
            `- *jedag-jedug*\n` +
            `- *metal*\n` +
            `- *sad*`)



        try {
            const startResp = await axios.get('https://fgsi.dpdns.org/api/ai/music/suno', {
                params: model,
                headers: {
                    accept: 'application/json'
                }
            });

            const task = startResp.data.data;
            if (!task?.pollUrl) throw new Error('Gagal start generate lagu');

            let result = null;
            for (let i = 0; i < 100; i++) {
                await new Promise(r => setTimeout(r, 90000));
                const pollResp = await axios.get(task.pollUrl, {
                    headers: {
                        accept: 'application/json'
                    }
                });
                if (pollResp.data.data?.result?.[0]?.status === 'complete') {
                    result = pollResp.data.data.result[0];
                    break;
                }
            }

            if (!result) throw new Error('Lagu belum selesai setelah beberapa detik');

            const audioBuffer = await axios
                .get(result.audioUrl, {
                    responseType: 'arraybuffer'
                })
                .then(r => Buffer.from(r.data));

            await RyuuBotz.sendMessage(
                m.chat, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${result.title}.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: result.title,
                            body: 'Suno AI Music',
                            thumbnailUrl: result.imageUrl,
                            mediaType: 2,
                            mediaUrl: result.audioUrl
                        }
                    }
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
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });
            reply(`❌ Error: ${err.message}`);
        }
    }
};