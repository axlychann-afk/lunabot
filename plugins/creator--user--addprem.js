import fs from "fs";
import "../settings.js";

export default {
  command: ["addpremium", "addprem"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, text, q, reply, prefix }) => {

    let users;
    let groupInfo;
    let groupLinkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
    let isGroup = groupLinkRegex.test(text)

    if (m.mentionedJid.length > 0) {
      users = m.mentionedJid[0];
    }

    else if (m.quoted) {
      users = m.quoted.sender;
    }

    else if (text) {

      if (groupLinkRegex.test(text)) {

        try {
          const inviteCode = text.match(groupLinkRegex)[1];

          groupInfo = await RyuuBotz.groupGetInviteInfo(inviteCode);

          users = groupInfo.id;

        } catch (e) {
          return reply("Link grup tidak valid atau bot tidak bisa mengambil info grup.");
        }

      } else {

        let number = text.replace(/[^0-9]/g, "");

        if (number.length < 5) {
          return reply("Nomor tidak valid!");
        }

        users = number + "@lid";
      }
    }

    else {
      return reply(
        `Silakan tag, reply pesan, nomor, atau link grup.\n\nContoh:\n${prefix}addprem 628xxxx\n${prefix}addprem https://chat.whatsapp.com/xxxx`
      );
    }

    let premium = JSON.parse(
      fs.readFileSync("./database/premium.json")
    );

    if (!premium.includes(users)) {
      premium.push(users);
    }

    fs.writeFileSync(
      "./database/premium.json",
      JSON.stringify(premium, null, 2)
    );

    reply(`Successfully Added ${isGroup ? groupInfo.subject : "@"+users.split("@")[0]} To Database`, [isGroup ? "" : users]);
  }
};