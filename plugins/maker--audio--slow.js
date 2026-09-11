import fs from "fs";
import path from "path";
import { exec } from "child_process";

export default {
  command: ["slow"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, reply, prefix, command }) => {

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!/audio/.test(mime)) {
      return reply(`Reply audio dengan caption *${prefix + command}*`);
    }

    const input = path.join(
      "database/tmp",
      `input_${Date.now()}.mp3`
    );

    const output = path.join(
      "database/tmp",
      `output_${Date.now()}.mp3`
    );

    try {

      await reply(global.mess.wait);

      let buffer = await q.download();

      fs.writeFileSync(input, buffer);

      let set = `-filter:a "atempo=0.7,asetrate=44100"`;

      exec(
        `ffmpeg -i "${input}" ${set} "${output}"`,
        async (err) => {

          if (err) {
            console.log(err);
            return reply(String(err));
          }

          let buff = fs.readFileSync(output);

          await RyuuBotz.sendMessage(
            m.chat,
            {
              audio: buff,
              mimetype: "audio/mpeg"
            },
            { quoted: m }
          );

          if (fs.existsSync(input)) {
            fs.unlinkSync(input);
          }

          if (fs.existsSync(output)) {
            fs.unlinkSync(output);
          }

        }
      );

    } catch (e) {

      reply(String(e));

      if (fs.existsSync(input)) {
        fs.unlinkSync(input);
      }

      if (fs.existsSync(output)) {
        fs.unlinkSync(output);
      }

    }
  }
};
