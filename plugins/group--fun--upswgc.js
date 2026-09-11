import fs from 'fs'
import crypto from 'crypto'
import {
    generateWAMessageContent,
    generateWAMessageFromContent
} from '@ryuu-reinzz/baileys'

async function sendGroupStatus(RyuuBotz, jid, content) {
    const inside = await generateWAMessageContent(content, {
        upload: RyuuBotz.waUploadToServer
    })
    const messageSecret = crypto.randomBytes(32)
    const m = generateWAMessageFromContent(jid, {
        messageContextInfo: {
            messageSecret,
            contextInfo: {
                isGroupStatus: true,
                remoteJid: jid
            }
        },
        groupStatusMessageV2: {
            message: {
                ...inside,
                messageContextInfo: {
                    messageSecret,
                    contextInfo: {
                        isGroupStatus: true,
                        remoteJid: jid
                    }
                }
            }
        }
    }, {})

    await RyuuBotz.relayMessage(jid, m.message, {
        messageId: m.key.id,
        additionalAttributes: {
            type: "text"
        }
    })
    return m
}

export default {
    command: ["upswgc", "swgc", "swgrup"],
    group: true,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, { isCreator, prefix, reply, args, text, RyuuBotz }) => {
        global.pendingSwgc = global.pendingSwgc || new Map();

        // LOGIKA KONFIRMASI (SETELAH PILIH GRUP)
        if (args[0] === '--confirm' && args[1]) {
            const targetGroupId = args[1]
            const pendingData = global.pendingSwgc.get(m.sender)

            if (!pendingData) {
                return await reply(`⚠️ *Tidak ada data pending. Silakan kirim ulang media + ${prefix}swgc*`)
            }
            if (targetGroupId !== m.chat && !isCreator) {
               global.pendingSwgc.delete(m.sender);
               return await reply("Upload status selain di grup ini ada fitur khusus owner!");
            };

            try {
                let groupName = 'Grup'
                try {
                    const meta = await RyuuBotz.groupMetadata(targetGroupId)
                    groupName = meta.subject
                } catch (e) { /* ignore error jika gagal fetch metadata */ }

                await RyuuBotz.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } })

                let content = {}
                if (pendingData.mediaPath && fs.existsSync(pendingData.mediaPath)) {
                    const buffer = fs.readFileSync(pendingData.mediaPath)
                    if (pendingData.type === 'image') {
                        content = { image: buffer, caption: pendingData.caption }
                    } else if (pendingData.type === 'video') {
                        content = { video: buffer, caption: pendingData.caption }
                    } else if (pendingData.type === 'audio') {
                        content = { audio: buffer, mimetype: 'audio/mp4' } // Audio biasanya tidak support caption di status
                    }
                } else {
                    content = { text: pendingData.caption }
                }

                await sendGroupStatus(RyuuBotz, targetGroupId, content)
                await reply(`sukses upsw ke grup *${groupName}*`)
                
                // Cleanup
                if (pendingData.mediaPath && fs.existsSync(pendingData.mediaPath)) {
                    fs.unlinkSync(pendingData.mediaPath)
                }
                global.pendingSwgc.delete(m.sender)

            } catch (error) {
                console.error(error)
                await reply(`*ᴇʀʀᴏʀ*\n\n> Gagal posting story.\n> _${error.message}_`)
            }
            return
        }

        // LOGIKA AWAL (SCAN MEDIA DAN TAMPILKAN LIST)
        const quoted = m.quoted ? m.quoted : m
        const isImage = /image/.test(quoted.mimetype || quoted.msg?.mimetype)
        const isVideo = /video/.test(quoted.mimetype || quoted.msg?.mimetype)
        const isAudio = /audio/.test(quoted.mimetype || quoted.msg?.mimetype)
        
        let mediaPath = null
        let type = 'text'

        if (isImage || isVideo || isAudio) {
            try {
                mediaPath = await RyuuBotz.downloadAndSaveMediaMessage(quoted)
                type = isImage ? 'image' : (isAudio ? 'audio' : 'video')
            } catch (e) {
                return await reply(`❌ Media gagal didownload: ${e.message}`)
            }
        } else if (!text) {
            return await reply(
                `⚠️ *sᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ*\n\n` +
                `> \`${prefix}swgc teks\` - Story teks\n` +
                `> Reply gambar/video/audio + \`${prefix}swgc\`\n` +
                `> Kirim gambar/video/audio + caption \`${prefix}swgc\``
            )
        }

        // Simpan data sementara
        global.pendingSwgc.set(m.sender, {
            mediaPath: mediaPath,
            type: type,
            caption: text || (m.quoted?.text || ''),
            timestamp: Date.now()
        })

        try {
            const groups = await RyuuBotz.groupFetchAllParticipating()
            const groupList = Object.entries(groups)
            
            if (groupList.length === 0) {
                if (mediaPath && fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath)
                global.pendingSwgc.delete(m.sender)
                return await reply(`⚠️ *Bot tidak berada di grup manapun.*`)
            }

            const groupRows = groupList.map(([id, meta]) => ({
                title: meta.subject || 'Unknown Group',
                description: `ID: ${id}`,
                id: `${prefix}swgc --confirm ${id}`
            }))

            await RyuuBotz.sendMessage(m.chat, {
                caption: `📋 *ᴘɪʟɪʜ ɢʀᴜᴘ ᴜɴᴛᴜᴋ ᴘᴏsᴛ sᴛᴏʀʏ*\n\n` +
                      `> Media: *${type.toUpperCase()}*\n` +
                      `> Total Grup: *${groupList.length}*\n\n` +
                      `_Pilih grup dari daftar di bawah:_`,
                document: { url: "./package.json" },
                fileName: global.ownername,
                mimetype: "application/javascript",
                footer: global.ownername,
                buttons: [
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: '💽 Pilih Grup (Owner only)',
                            sections: [{ title: 'Daftar Grup', rows: groupRows }]
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '➡️ Grup Ini',
                            id: `${prefix}swgc --confirm ${m.chat}`
                        })
                    }
                ]
            }, { quoted: m })

        } catch (error) {
            console.error(error)
            await reply(`❌ Gagal mengambil daftar grup: ${error.message}`)
            if (mediaPath && fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath)
            global.pendingSwgc.delete(m.sender)
        }
    }
}