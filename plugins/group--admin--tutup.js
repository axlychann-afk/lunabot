import fs from "fs";
import "../settings.js";

export default {
  command: ["close", "tutup"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,
  
  code: async (m, { RyuuBotz, reply }) => {
  try {
   await RyuuBotz.groupSettingUpdate(m.chat, 'announcement')
    reply(global.mess.success);
  } catch (err) {
    console.error(err);
    reply(`❌ *Error:* ${err.message}`);
   }
  }
};

