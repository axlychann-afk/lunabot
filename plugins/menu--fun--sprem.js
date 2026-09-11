import {
    downloadContentFromMessage,
    prepareWAMessageMedia,
    generateWAMessageFromContent
} from "@ryuu-reinzz/baileys";
import "../settings.js";

export default {
    command: ["sprem", "stickerpremium", "stikerpremium"],
    group: false,
    limit: false,
    premium: false,
    admin: false,
    creator: true,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (m, {
        RyuuBotz
    }) => {
        const quoted = m.quoted;
        if (!quoted) {
            return RyuuBotz.sendMessage(m.chat, {
                text: "*Sticker Premium*\n\n> Reply sticker yang mau dijadikan premium!"
            }, {
                quoted: m
            });
        }
        if (quoted.mtype !== "stickerMessage") {
            return RyuuBotz.sendMessage(m.chat, {
                text: "❌ Reply sticker WEBP!"
            }, {
                quoted: m
            });
        }
        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: "⏳",
                key: m.key
            }
        });
        try {
            const stickerBuffer = await m.quoted.download();

            function buildStickerExif(metadata) {
                const json = Buffer.from(JSON.stringify(metadata), "utf-8");
                const exif = Buffer.concat([Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]), Buffer.alloc(4), Buffer.from([0x16, 0x00, 0x00, 0x00]), json]);
                exif.writeUInt32LE(json.length, 14);
                return exif;
            }

            function makeChunk(type, data) {
                const typeBuffer = Buffer.from(type);
                const sizeBuffer = Buffer.alloc(4);
                sizeBuffer.writeUInt32LE(data.length, 0);
                const padding = data.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);
                return Buffer.concat([typeBuffer, sizeBuffer, data, padding]);
            }

            function setWebpExif(webpBuffer, metadata) {
                if (webpBuffer.slice(0, 4).toString() !== "RIFF" || webpBuffer.slice(8, 12).toString() !== "WEBP") {
                    throw new Error("File bukan WEBP valid.");
                }
                const chunks = [];
                let offset = 12;
                while (offset + 8 <= webpBuffer.length) {
                    const type = webpBuffer.slice(offset, offset + 4).toString();
                    const size = webpBuffer.readUInt32LE(offset + 4);
                    const chunkStart = offset;
                    const chunkEnd = offset + 8 + size + (size % 2);
                    if (chunkEnd > webpBuffer.length) break;
                    if (type !== "EXIF") {
                        chunks.push(webpBuffer.slice(chunkStart, chunkEnd));
                    }
                    offset = chunkEnd;
                }
                const exifPayload = buildStickerExif(metadata);
                const exifChunk = makeChunk("EXIF", exifPayload);
                const body = Buffer.concat([...chunks, exifChunk]);
                const header = Buffer.alloc(12);
                header.write("RIFF", 0);
                header.writeUInt32LE(body.length + 4, 4);
                header.write("WEBP", 8);
                return Buffer.concat([header, body]);
            }
            const metadata = {
                "sticker-pack-id": "2be7e369-b5ce-4706-a3d4-f78805a20328",
                "sticker-pack-name": "deuabotz",
                "sticker-pack-publisher": "deuabotz",
                "accessibility-text": "S-0x19191919",
                "android-app-store-link": "https://whatsapp.com",
                "ios-app-store-link": "https://whatsapp.com/ios",
                "emojis": ["🦸", "😴", "😌"],
                "is-from-sticker-maker": 0,
                "is-avatar-sticker": 0,
                "avatar-sticker-template-id": "whatsapp",
                "is-ai-sticker": 0,
                "is-avatar-country-sticker": 1,
                "is-avatar-instant-sticker": 1,
                "sticker-maker-source-type": 4,
                "is-avatar-social-sticker": 1,
                "avatar-sticker-style": "whatsapp",
                "avatar-sticker-revision-id": "2026",
                "is-from-user-created-pack": 1,
                "origin-pack-id": "whatsapp",
                "is-text-sticker": 1,
                "premium": 1
            };
            const finalStickerBuffer = setWebpExif(stickerBuffer, metadata);
            const media = await prepareWAMessageMedia({
                sticker: finalStickerBuffer
            }, {
                upload: RyuuBotz.waUploadToServer
            });
            const msgContent = {
                messageContextInfo: {
                    limitSharingV2: {
                        sharingLimited: true,
                        trigger: "CHAT_SETTING",
                        limitSharingSettingTimestamp: Date.now().toString(),
                        initiatedByMe: true
                    }
                },
                stickerMessage: {
                    ...media.stickerMessage,
                    isAnimated: quoted.isAnimated || false,
                    isAvatar: true,
                    isAiSticker: true,
                    isLottie: false
                }
            };
            const waMsg = await generateWAMessageFromContent(m.chat, msgContent, {
                quoted: m,
                userJid: RyuuBotz.user?.id
            });
            await RyuuBotz.relayMessage(m.chat, waMsg.message, {
                messageId: waMsg.key.id
            });
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: "✅",
                    key: m.key
                }
            });
        } catch (err) {
            console.error("[SPREM ERROR]", err);
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: "❌",
                    key: m.key
                }
            });
            await RyuuBotz.sendMessage(m.chat, {
                text: "❌ Gagal: " + err.message
            }, {
                quoted: m
            });
        }
    }
};