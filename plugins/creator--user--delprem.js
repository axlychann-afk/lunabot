import fs from "fs";
import "../settings.js";

export default {
  command: ["delpremium", "delprem"],
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

    if (m.mentionedJid.length > 0) {
      users = m.mentionedJid[0];
    }

    else if (m.quoted) {
      users = m.quoted.sender;
    }

    else if (text) {

      const groupLinkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;

      if (groupLinkRegex.test(text)) {

        try {
          const inviteCode = text.match(groupLinkRegex)[1];

          const groupInfo = await RyuuBotz.groupGetInviteInfo(inviteCode);

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
        `Penggunaan:\n${prefix}delprem nomor/tag/linkgrup\n\nContoh:\n${prefix}delprem 628xxxx\n${prefix}delprem https://chat.whatsapp.com/xxxx`
      );
    }

    let premium = JSON.parse(
      fs.readFileSync("./database/premium.json")
    );

    let unp = premium.indexOf(users);

    if (unp === -1) {
      return reply(`${users} Tidak Ada Di Database`);
    }

    premium.splice(unp, 1);

    fs.writeFileSync(
      "./database/premium.json",
      JSON.stringify(premium, null, 2)
    );

    reply(`Successfully Removed @${users.split("@")[0]} From Database`, [users]);
  }
};