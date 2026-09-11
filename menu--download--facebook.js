import axios from "axios";
import "../settings.js";
import { getmyfb } from "../lib/scrape.js";

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

export default {
  command: ["fb", "fbdl", "facebook", "facebookvid"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { text, prefix, command, RyuuBotz, reply }) => {
    if (!text)
      return reply(
        `Silakan kirimkan tautan video Facebook\n\nCONTOH:\n*${prefix + command}* https://fb.watch/...`
      );

    const link = text.trim().split(/\s+/)[0];
    if (!/facebook\.com|fb\.watch/i.test(link)) return reply("Link bukan Facebook.");

    await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

    try {
      // jalur 1: fetcher getmyfb (tanpa key)
      try {
        const g = await getmyfb(link);
        const best = g.hd || g.sd || g.videos[0];
        if (best) {
          await RyuuBotz.sendMessage(m.chat, {
            video: { url: best },
            mimetype: 'video/mp4',
            caption: `*${g.title}*${g.hd ? ' (HD)' : ''}`
          }, { quoted: m });
          await RyuuBotz.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
          return;
        }
      } catch (ge) {
        console.log("FB getmyfb fail, fallback scrape:", ge.message);
      }

      // jalur 2: scrape halaman langsung
      const { data } = await axios.get(link, {
        headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
        timeout: 30000, maxRedirects: 5,
      });
      const html = String(data).replace(/&quot;/g, '"').replace(/&amp;/g, "&");
      const unesc = (s) => { try { return JSON.parse(`{"text":"${s}"}`).text; } catch (_) { return s; } };

      const hd = html.match(/"browser_native_hd_url":"(.*?)"/);
      const sd = html.match(/"browser_native_sd_url":"(.*?)"/) || html.match(/"playable_url":"(.*?)"/);
      const title = (html.match(/<meta\sname="description"\scontent="(.*?)"/) || [])[1];

      const best = hd?.[1] || sd?.[1];
      if (!best) throw new Error("Video tidak ditemukan (privat / login-wall). Coba video publik lain.");

      await RyuuBotz.sendMessage(m.chat, {
        video: { url: unesc(best) },
        mimetype: 'video/mp4',
        caption: `*${title ? unesc(title) : 'Facebook Video'}*${hd ? ' (HD)' : ''}`
      }, { quoted: m });

      await RyuuBotz.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (err) {
      console.log("FB Error:", err.message);
      await RyuuBotz.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      reply(`❌ Gagal mengambil video Facebook.\n\n${err.message}`);
    }
  }
};
