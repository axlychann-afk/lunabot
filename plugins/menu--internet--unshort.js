/*
* Nama fitur : Bypass Shortlink (Updated)
* Type : Plugin Esm
* Sumber : BypassUnlock
*/
import axios from 'axios';

export default {
  command: ['unshort', 'skiplink'],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply, command }) => {
    if (!text) return reply(`Contoh : .${command} https://link-yang-ingin-dibypass`);
    
    await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

    const CORS_PROXY = "https://cors.rifkyshre.biz.id/";
    const ENDPOINT = "https://trw.lat/api/bypass";
    const API_KEY = "TRW_FREE-GAY-15a92945-9b04-4c75-8337-f2a6007281e9";

    function parseResult(result) {
        if (typeof result !== "string") return String(result);
        const tuple = result.match(/^\(['"](.+?)['"],\s*(True|False)\)$/);
        if (tuple) return tuple[1];
        const quoted = result.match(/^["'](.+?)["']$/);
        if (quoted) return quoted[1];
        return result;
    }

    try {
        const target = `${ENDPOINT}?apikey=${encodeURIComponent(API_KEY)}&url=${encodeURIComponent(text.trim())}`;
        const res = await axios.get(`${CORS_PROXY}${target}`, {
            timeout: 90000,
            validateStatus: () => true,
            headers: {
                Accept: "application/json",
                Origin: "https://code.rifkyshre.biz.id",
                Referer: "https://code.rifkyshre.biz.id/",
            },
        });

        const body = res.data;
        if (!body || !body.success) {
            return reply(`Gagal bypass: ${body.message || 'URL tidak didukung atau error server'}`);
        }

        const cleanUrl = parseResult(body.result);
        await reply(`✅ Berhasil di-bypass:\n\n${cleanUrl}`);
        
    } catch (err) {
        reply(`Error kak: ${err.message}`);
    }
  }
};
