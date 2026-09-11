import "../settings.js";
import axios from "axios";
import fs from "fs";

/**
 * Handle perubahan peserta di grup (add/leave/remove)
 * @param {object} RyuuBotz - instance bot
 * @param {string} id - JID grup
 * @param {"add"|"remove"} action - aksi update
 * @param {Array<string>} participants - array JID peserta
 * @param {object} db - database global
 */
export async function participantsUpdate(RyuuBotz, id, action, participants, db) {
    const currentBotJid = RyuuBotz.user.id.split(":")[0] + "@s.whatsapp.net";
    const mainBotJid = global.botNumber.includes("@s.whatsapp.net") ?
        global.botNumber :
        global.botNumber + "@s.whatsapp.net";

    const groupMetadata = await RyuuBotz.groupMetadata(id).catch(() => null);
    if (!groupMetadata) return;

    if (currentBotJid !== mainBotJid) {
        const isMainBotPresent = groupMetadata.participants.some(p => p.phoneNumber === mainBotJid);
        if (isMainBotPresent) return;
    }


    async function sendWelcLeftMessage(
        RyuuBotz,
        id,
        num,
        userTag,
        nama,
        groupName,
        ppUrl,
        bgUrl,
        rawText,
        titleText,
        imgTitle,
        desc2
    ) {

        const qbotz = {
            key: {
                participant: "628131850918@s.whatsapp.net",
                remoteJid: "status@broadcast",
            },
            message: {
                contactMessage: {
                    displayName: titleText,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=6288704756515:+62 887-0475-6515\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                    sendEphemeral: true,
                },
            },
        };

        const teks2 = desc2
            .replace(/@user/gi, userTag)
            .replace(/@group/gi, groupName);

        const desc_2 = teks2.replace(userTag, nama);
        const teks = rawText
            .replace(/@user/gi, userTag)
            .replace(/@group/gi, groupName);

        const desc = teks.replace(userTag, nama);
        const bufferUrl = `https://api.ryuu-dev.my.id/canvas/welcome-leave?desc=${encodeURIComponent(
    desc_2
  )}&title=${encodeURIComponent(
  imgTitle
  )}&profile=${encodeURIComponent(
    ppUrl
  )}&background=${encodeURIComponent(bgUrl)}`;
        const arraybuffer = await axios.get(bufferUrl, { responseType: "arraybuffer" })
        await RyuuBotz.sendMessage(id, {
            text: teks,
            mentions: [num],
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterName: global.ownername,
                    newsletterJid: global.idSaluran
                },
                previewThumbnail: {
                        title: titleText,
                        desc: global.ownername,
                        thumbnail: Buffer.from(arraybuffer.data),
                        sourceUrl: "https://api ryuu-dev.my.id",
                        largerThumbnail: true                   
                }
            }
        }, {
            quoted: qbotz
        });


    }
    if (!id || !action || !participants?.length) {
        console.log("participantsUpdate invalid:", {
            id,
            action,
            participants
        });
        return;
    }

    // init db grup kalau belum ada
    db.welcome.groups ??= {};
    db.welcome.groups[id] ??= {
        welcome: false,
        goodbye: false
    };

    try {
        const groupMetadata = await RyuuBotz.groupMetadata(id);
        const groupName = groupMetadata.subject || "Grup ini";
        const bgUrl = global.thumbnail.main;

        for (const p of participants) {
            const num = p.phoneNumber;
            if (!num) return console.log("participant not found");

            const userTag = "@" + num.split("@")[0];

            // Ambil pp user atau fallback default
            let ppUrl;
            try {
                ppUrl = await RyuuBotz.profilePictureUrl(num);
            } catch {
                ppUrl = "https://telegra.ph/file/265c672094dfa87caea19.jpg";
            }

            if (action === "add" && db.welcome.groups[id].welcome) {
                await sendWelcLeftMessage(
                    RyuuBotz,
                    id,
                    num,
                    userTag,
                    userTag,
                    groupName,
                    ppUrl,
                    bgUrl,
                    db.welcome.groups[id].welcomeText || `Selamat datang @user di grup @group!`,
                    `Welcome ${userTag}!`,
                    "Welcome!!",
                    `Selamat datang di grup @group!`
                );
            }

            if ((action === "remove" || action === "leave") && db.welcome.groups[id].goodbye) {
                await sendWelcLeftMessage(
                    RyuuBotz,
                    id,
                    num,
                    userTag,
                    userTag,
                    groupName,
                    ppUrl,
                    bgUrl,
                    db.welcome.groups[id].goodbyeText || `Selamat tinggal @user, semoga betah di luar @group`,
                    `Good bye ${userTag}!`,
                    "Good Bye",
                    `Selamat tinggal, semoga betah di luar @group`
                );
            }
        }
    } catch (err) {
        console.error("participantsUpdate failed:", err);
    }
}