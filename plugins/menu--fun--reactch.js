import "../settings.js";

export default {
  command: ["reactch", "rch"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, args, text, reply, prefix, isCreator, command }) => {

  if (!isCreator) return reply(global.mess.owner);
  if (!text) return reply(`Contoh:
${prefix + command} https://whatsapp.com/channel/xxx/123 ✨deua
${prefix + command} https://whatsapp.com/channel/xxx/123 ✨deua|5`);

  const hurufGaya = {
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
    h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
    o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
    v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
    '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
    '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒', ' ': '➖'
  };

  const [mainText, offsetStr] = text.split('|');
  const argsa = mainText.trim().split(" ");
  const link = argsa[0];

  if (!link.includes("https://whatsapp.com/channel/"))
    return reply(`Link tidak valid!\nContoh: ${prefix}reactch https://whatsapp.com/channel/xxx/id ❤️matz|3`);

  const channelId = link.split('/')[4];
  const rawMessageId = parseInt(link.split('/')[5]);
  if (!channelId || isNaN(rawMessageId)) return reply("Link tidak lengkap!");

  const offset = parseInt(offsetStr?.trim()) || 1;
  const teksNormal = argsa.slice(1).join(' ');
  const teksTanpaLink = teksNormal.replace(link, '').trim();
  if (!teksTanpaLink) return reply("Masukkan teks/emoji untuk direaksikan.");

  const emoji = teksTanpaLink.toLowerCase().split('').map(c => {
    if (c === ' ') return '―';
    return hurufGaya[c] || c;
  }).join('');

  try {
    const metadata = await RyuuBotz.newsletterMetadata("invite", channelId);
    let success = 0, failed = 0;

    for (let i = 0; i < offset; i++) {
      const msgId = (rawMessageId - i).toString();
      try {
        await RyuuBotz.newsletterReactMessage(metadata.id, msgId, emoji);
        success++;
      } catch {
        failed++;
      }
    }

    reply(`✅ Berhasil kirim reaction *${emoji}* ke ${success} pesan di channel *${metadata.thread_metadata.name.text}*\n❌ Gagal di ${failed} pesan`);

  } catch (err) {
    console.error(err);
    reply("❌ Gagal memproses permintaan!");
  }

  }
};
