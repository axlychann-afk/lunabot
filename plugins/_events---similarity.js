import "../settings.js";
import fs from "fs";
import simis from 'similarity';
const similarity = simis;
import meannn from 'didyoumean';
const didyoumean = meannn;

export default {
    event: async (m, {
     RyuuBotz,
      plugins,
      isCmd,
      command,
      budy,
      prefix,
      text
    }) => {

        const antitypo = global.antiTypo;
        if (isCmd) {
            if (command) {
                if (antitypo) {
                    let handlerCommands = []
                    try {
                        const code = fs.readFileSync("./engines/handler.js", "utf8")
                        const regex = /case\s+['"`]([^'"`]+)['"`]:/g
                        let match
                        while ((match = regex.exec(code))) {
                            handlerCommands.push(match[1].toLowerCase())
                        }
                    } catch (err) {
                        console.error("Gagal baca engines/handler.js:", err)
                    }

                    let pluginCommands = []
                    try {
                        for (let plugin of plugins) {
                            if (plugin.command) {
                                pluginCommands.push(...plugin.command.map(c => c.toLowerCase()))
                            }
                        }
                    } catch (err) {
                        console.error("Gagal ambil plugin command:", err)
                    }

                    const help = [...new Set([...handlerCommands, ...pluginCommands])]

                    if (!help.includes(command.toLowerCase()) && !budy.startsWith('$ ') && !budy.startsWith('> ')) {
                        const mean = didyoumean(command, help)
                        const sim = similarity(command, mean)
                        const similarityPercentage = parseInt(sim * 100)

                        if (mean && command.toLowerCase() !== mean.toLowerCase()) {
                            const respon =  `ᴄᴏᴍᴍᴀɴᴅ ɪᴛᴜ ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴍᴜɴɢᴋɪɴ ʏᴀɴɢ ᴋᴀᴍᴜ ᴍᴀᴋsᴜᴅ\n` +
                                             `\n`+
                                             `➠ Command \`${prefix + mean}\`\n`+
                                             `➠ Similarity   \`[ ${similarityPercentage}% ]\`\n`

                                await RyuuBotz.sendButton(m.chat, {
                                    footer: `${global.namabot}`,
                                    buttons: [{
                                        buttonId: `.${mean} ${text || ""}`,
                                        buttonText: {
                                            displayText: `${mean}`
                                        },
                                        type: 1
                                    }, ],
                                    headerType: 1,
                                    viewOnce: true,
                                    image: {
                                        url: global.thumbnail.main
                                    },
                                    caption: respon,
                                    contextInfo: {
                                        mentionedJid: [m.sender],
                                    },
                                })
                        }
                    }
                }
            }
        }
    }
}