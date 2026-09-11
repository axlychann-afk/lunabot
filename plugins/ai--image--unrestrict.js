import axios from 'axios';
import * as cheerio from 'cheerio';

async function unrestrictedai(prompt, style = 'anime') {
    try {
        const styles = ['photorealistic', 'digital-art', 'impressionist', 'anime', 'fantasy', 'sci-fi', 'vintage'];
        if (!prompt) throw new Error('Prompt is required.');
        if (!styles.includes(style)) throw new Error(`Available styles: ${styles.join(', ')}.`);

        const { data: html } = await axios.get('https://unrestrictedaiimagegenerator.com/', {
            headers: {
                origin: 'https://unrestrictedaiimagegenerator.com',
                referer: 'https://unrestrictedaiimagegenerator.com/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });

        const $ = cheerio.load(html);
        const nonce = $('input[name="_wpnonce"]').attr('value');
        if (!nonce) throw new Error('Nonce not found.');

        const { data } = await axios.post(
            'https://unrestrictedaiimagegenerator.com/',
            new URLSearchParams({
                generate_image: true,
                image_description: prompt,
                image_style: style,
                _wpnonce: nonce
            }).toString(),
            {
                headers: {
                    origin: 'https://unrestrictedaiimagegenerator.com',
                    referer: 'https://unrestrictedaiimagegenerator.com/',
                    'user-agent':
                        'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
                }
            }
        );

        const $$ = cheerio.load(data);
        const img = $$('img#resultImage').attr('src');
        if (!img) throw new Error('No result found.');

        return img;
    } catch (error) {
        throw new Error(error.message);
    }
}

export default {
  command: ['genimg', 'ai-img', 'unrestrict'],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

code: async (m, { RyuuBotz, text, prefix, command, reply, args }) => {

    if (!text) {
        return reply(
            `📌 Format salah!\nGunakan: *${prefix + command} [prompt] > [style]*\n` +
            `Contoh: *${prefix + command} cewek rambut putih > anime*`
        );
    }

    const [prompt, style] = text.split('>').map(v => v?.trim());
    const styleName = style || 'anime';

    await RyuuBotz.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const resultUrl = await unrestrictedai(prompt, styleName);

        const imgBuffer = await axios
            .get(resultUrl, { responseType: 'arraybuffer' })
            .then(r => Buffer.from(r.data));

        await RyuuBotz.sendMessage(
            m.chat,
            {
                image: imgBuffer,
                caption: `✨ *Gambar Berhasil Dibuat*\nPrompt: ${prompt}\nStyle: ${styleName}`
            },
            { quoted: m }
        );

        await RyuuBotz.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        await RyuuBotz.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        reply(`❌ Error: ${err.message}`);
    }

  }
};
