import fs from "fs";
import "../settings.js";

export default {
  command: ["listpremium", "listprem"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, qtext, reply, mess }) => {

    let premList = JSON.parse(
      fs.readFileSync("./database/premium.json")
    );

    if (premList.length === 0) {
      return reply("⚠️ Tidak ada Premium yang terdaftar!");
    }

    let text = "💭 *Daftar Premium:*\n\n";

    for (let i = 0; i < premList.length; i++) {
      let jid = premList[i];
      if (jid.endsWith("@g.us")) {

        let groupName = "Unknown Group";

        try {
          let metadata = await RyuuBotz.groupMetadata(jid);
          groupName = metadata.subject;
        } catch {}

        text += `- ${i + 1}. 🏘️ ${groupName}\n`;
      }

      else {

        let number = jid
          .replace("@lid", "")
          .replace("@s.whatsapp.net", "");

        text += `- ${i + 1}. 👤 @${number}\n`;
      }
    }

    RyuuBotz.sendMessage(
      m.chat,
      {
        text,
        mentions: premList.filter(v => !v.endsWith("@g.us"))
      },
      { quoted: qtext }
    );
  }
};