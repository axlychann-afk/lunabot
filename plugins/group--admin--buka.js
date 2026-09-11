import fs from "fs";
import "../settings.js";
export default {
  command: ["open", "buka"],
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
   await RyuuBotz.groupSettingUpdate(m.chat, 'not_announcement')
    reply(global.mess.success);
  } catch (err) {
    console.error(err);
    reply(`❌ *Error:* ${err.message}`);
   }
  }
};
