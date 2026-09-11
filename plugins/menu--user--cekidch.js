import "../settings.js";
import { generateWAMessageFromContent } from "@ryuu-reinzz/baileys";

export default {
  command: ["idch", "cekidch"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, reply }) => {

  if (!text) return reply("💬 Link channel-nya mana sayang?");
  if (!text.includes("https://whatsapp.com/channel/")) return reply("❌ Link tautan tidak valid!");

  try {
    const result = text.split("https://whatsapp.com/channel/")[1];
  async function cekInfoCh (input) {
    const metadataCh = await RyuuBotz.newsletterMetadata("invite", input);

    const followers = metadataCh.thread_metadata.subscribers_count
    const verif = metadataCh.thread_metadata.verification
    const name = metadataCh.thread_metadata.name.text
    const id = metadataCh.id
    const state = metadataCh.state.type

    return { followers, verif, name, id, state }
  };

    const output = await cekInfoCh(result)
    const teks = `🌐 *Informasi Channel WhatsApp*\n\n` +
      `*🆔 ID:* ${output.id}\n` +
      `*📛 Nama:* ${output.name}\n` +
      `*👥 Total Pengikut:* ${output.followers}\n` +
      `*⚙️ Status:* ${output.state}\n` +
      `*✅ Verified:* ${output.verif}`;     
        
        await RyuuBotz.sendMessage(m.chat, {
                caption: teks,
                document: {
                    url: 'https://deuala.zone.id'
                },
                mimetype: 'application/javascript',
                fileName: 'Channel Link Info',
                buttons: [{
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Salin ID Saluran',
                            copy_code: output.id
                        })
                    }
                ],
                mentionedJid: [m.sender],
                contextInfo: {
                    mentionedJid: [m.sender]
                }
            });
        
  } catch (err) {
    console.error(err);
    reply(`❌ Gagal mengambil data channel!\n📄 ${err.message}`);
  }

  }
};
