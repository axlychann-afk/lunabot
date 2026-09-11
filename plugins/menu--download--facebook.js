import axios from "axios";
import "../settings.js";

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

    await reply("tunggu sebentar ya..");

    try {
      const getFBInfo = videoUrl => {
        const headers = {
          "sec-fetch-user": "?1",
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-site": "none",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "cache-control": "max-age=0",
          authority: "www.facebook.com",
          "upgrade-insecure-requests": "1",
          "accept-language": "en-GB,en;q=0.9",
          "sec-ch-ua":
            '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        };

        const parseString = str =>
          JSON.parse(`{"text":"${str}"}`).text;

        return new Promise((resolve, reject) => {
          if (!videoUrl || !videoUrl.trim())
            return reject("URL tidak valid");

          if (
            ["facebook.com", "fb.watch"].every(domain =>
              !videoUrl.includes(domain)
            )
          )
            return reject("Link bukan Facebook");

          axios
            .get(videoUrl, { headers })
            .then(({ data }) => {
              data = data
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, "&");

              const sdMatch =
                data.match(/"browser_native_sd_url":"(.*?)"/) ||
                data.match(/"playable_url":"(.*?)"/);

              const titleMatch = data.match(
                /<meta\sname="description"\scontent="(.*?)"/
              );

              if (!sdMatch) return reject("Video tidak ditemukan");

              resolve({
                sd: parseString(sdMatch[1]),
                title: titleMatch
                  ? parseString(titleMatch[1])
                  : "Facebook Video"
              });
            })
            .catch(() => reject("Gagal mengambil data video"));
        });
      };

      const hasil = await getFBInfo(text);

      await RyuuBotz.sendMessage(
        m.chat,
        {
          video: { url: hasil.sd },
          caption: `*${hasil.title}*`
        },
        { quoted: m }
      );
    } catch (err) {
      console.log("FB Error:", err);
      reply("Yah error kak");
    }
  }
};