import axios from 'axios';
import chalk from 'chalk';
import FormData from 'form-data';

const aiLabs = {
    api: {
        base: 'https://text2video.aritek.app',
        endpoints: {
            text2img: '/text2img',
            generate: '/txt2videov3',
            video: '/video'
        }
    },
    headers: {
        'user-agent': 'NB Android/1.0.0',
        'accept-encoding': 'gzip',
        'content-type': 'application/json',
        authorization: ''
    },
    state: {
        token: null
    },
    setup: {
        cipher: 'hbMcgZLlzvghRlLbPcTbCpfcQKM0PcU0zhPcTlOFMxBZ1oLmruzlVp9remPgi0QWP0QW',
        shiftValue: 3,
        dec(text, shift) {
            return [...text].map(c =>
                /[a-z]/.test(c) ?
                    String.fromCharCode((c.charCodeAt(0) - 97 - shift + 26) % 26 + 97) :
                /[A-Z]/.test(c) ?
                    String.fromCharCode((c.charCodeAt(0) - 65 - shift + 26) % 26 + 65) :
                c
            ).join('');
        },
        async decrypt() {
            if (aiLabs.state.token) return aiLabs.state.token;
            const input = aiLabs.setup.cipher;
            const shift = aiLabs.setup.shiftValue;
            const decrypted = aiLabs.setup.dec(input, shift);
            aiLabs.state.token = decrypted;
            aiLabs.headers.authorization = decrypted;
            return decrypted;
        }
    },
    deviceId() {
        return Array.from({ length: 16 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    },
    async text2img(prompt) {
        if (!prompt?.trim()) {
            return {
                success: false,
                code: 400,
                result: { error: 'Prompt kosong 🗿' }
            };
        }
        const token = await aiLabs.setup.decrypt();
        const form = new FormData();
        form.append('prompt', prompt);
        form.append('token', token);
        try {
            const url = aiLabs.api.base + aiLabs.api.endpoints.text2img;
            const res = await axios.post(url, form, {
                headers: {
                    ...aiLabs.headers,
                    ...form.getHeaders()
                }
            });
            const { code, url: imageUrl } = res.data;
            if (code !== 0 || !imageUrl) {
                console.log(chalk.yellow('Generate image gagal'));
                return {
                    success: false,
                    code: res.status,
                    result: { error: 'Error generate image' }
                };
            }
            console.log(chalk.green('Image berhasil dibuat'));
            return {
                success: true,
                code: res.status,
                result: { url: imageUrl.trim(), prompt }
            };
        } catch (err) {
            return {
                success: false,
                code: err.response?.status || 500,
                result: { error: err.message || 'Error generate image' }
            };
        }
    },
    async generate({ prompt = '', type = 'video', isPremium = 1 } = {}) {
        if (!prompt?.trim()) {
            return {
                success: false,
                code: 400,
                result: { error: 'Prompt tidak boleh kosong' }
            };
        }
        if (!/^(image|video)$/.test(type)) {
            return {
                success: false,
                code: 400,
                result: { error: 'Tipe harus image atau video' }
            };
        }
        console.log(chalk.cyan(`📡 Connect ke server AI type ${type}...`));
        if (type === 'image') {
            return await aiLabs.text2img(prompt);
        } else {
            await aiLabs.setup.decrypt();
            const payload = {
                deviceID: aiLabs.deviceId(),
                isPremium,
                prompt,
                used: [],
                versionCode: 59
            };
            try {
                const url = aiLabs.api.base + aiLabs.api.endpoints.generate;
                const res = await axios.post(url, payload, { headers: aiLabs.headers });
                const { code, key } = res.data;
                if (code !== 0 || !key || typeof key !== 'string') {
                    console.log(chalk.yellow('Key tidak valid'));
                    return {
                        success: false,
                        code: res.status,
                        result: { error: 'Gagal mendapatkan key' }
                    };
                }
                return await aiLabs.video(key);
            } catch (err) {
                console.log(chalk.red('Gagal connect ke server AI'));
                return {
                    success: false,
                    code: err.response?.status || 500,
                    result: { error: err.message || 'Error koneksi' }
                };
            }
        }
    },
    async video(key) {
        if (!key || typeof key !== 'string') {
            console.log(chalk.red('Key tidak valid'));
            return {
                success: false,
                code: 400,
                result: { error: 'Key tidak valid' }
            };
        }
        await aiLabs.setup.decrypt();
        const payload = { keys: [key] };
        const url = aiLabs.api.base + aiLabs.api.endpoints.video;
        const maxAttempts = 100;
        const delay = 2000;
        let attempt = 0;
        let lastProgress = '';

        console.log(chalk.blue('⏳ Memproses video...'));
        while (attempt < maxAttempts) {
            attempt++;
            try {
                const res = await axios.post(url, payload, {
                    headers: aiLabs.headers,
                    timeout: 15000
                });
                const { code, datas } = res.data;
                if (code === 0 && Array.isArray(datas) && datas.length > 0) {
                    const data = datas[0];
                    if (!data.url || data.url.trim() === '') {
                        const progress = parseFloat(data.progress || 0);
                        const pi = Math.round(progress);
                        const barLength = 20;
                        const filled = Math.floor(pi / 5);
                        const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
                        if (progress !== lastProgress) {
                            process.stdout.write(chalk.cyan(`\r⚡ Generating: [${bar}] ${pi}%`));
                            lastProgress = progress;
                        }
                        await new Promise(r => setTimeout(r, delay));
                        continue;
                    }
                    process.stdout.write(chalk.cyan(`\r⚡ Generating: [${'█'.repeat(20)}] 100%`));
                    console.log('\n' + chalk.bgGreen.black(' DONE ') + chalk.green(' Video selesai'));
                    return {
                        success: true,
                        code: res.status,
                        result: {
                            url: data.url.trim(),
                            safe: data.safe === 'true',
                            key: data.key,
                            progress: '100%'
                        }
                    };
                }
            } catch (err) {
                const retry = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT'].includes(err.code);
                if (retry && attempt < maxAttempts) {
                    process.stdout.write(chalk.yellow(`\rRetry (${attempt}/${maxAttempts})...`));
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                console.log('\n' + chalk.red('Video belum jadi'));
                return {
                    success: false,
                    code: err.response?.status || 500,
                    result: { error: 'Error', attempt }
                };
            }
        }
        console.log('\n' + chalk.red('Proses timeout'));
        return {
            success: false,
            code: 504,
            result: { error: 'Proses timeout', attempt }
        };
    }
};

export default {
  command: ['ailabs'],
  group: false,
  premium: true,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { args, RyuuBotz, reply }) => {
  let result = null;

    try {
        if (!args.length) return reply('Prompt tidak boleh kosong');
        let type = 'image';
        if (args.includes('--image')) type = 'image';
        if (args.includes('--video')) type = 'video';

        let prompt = args.filter(a => a !== '--image' && a !== '--video').join(' ').trim();
        if (!prompt) reply('Prompt tidak valid');
        
        await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

        result = await aiLabs.generate({ prompt, type });
        if (!result.success) reply(result.result.error);

        if (type === 'image') {
            await RyuuBotz.sendMessage(m.chat, {
                image: { url: result.result.url },
                caption: `${result.result.prompt}`
            }, { quoted: m });
        } else {
            await RyuuBotz.sendMessage(m.chat, {
                video: { url: result.result.url },
                caption: `${prompt}`
            }, { quoted: m });
        }
    } catch (err) {
        reply(`${err}\n${result}`);
        console.log(err);
        console.log(result);
    }

  }
};
