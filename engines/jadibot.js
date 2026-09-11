// SETTINGS
import "../settings.js";
import {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    addExif
} from '../lib/exif.js';
import haruka from "@ryuu-reinzz/luna-lib";
import {
    dirname
} from 'path';
import {
    tanggal,
    day,
    bulan,
    tahun,
    weton,
    smsg,
    isUrl,
    generateMessageTag,
    getBuffer,
    getSizeMedia,
    fetchJson,
    sleep,
    runtime,
    formatp
} from '../lib/myfunc.js';
import {
    checkExpiredSewa
} from '../lib/store-manage.js';
import makeInStorageStore from '../lib/store.js';
import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
    jidDecode,
    downloadContentFromMessage,
    proto,
    generateMessageID,
    generateWAMessage,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
    BufferJSON,
    initAuthCreds
} from '@ryuu-reinzz/baileys';

import os from 'os';
import {
    execSync
} from 'child_process';
import moment from "moment-timezone";

import {
    color,
    bgcolor
} from '../lib/color.js';
import {
    uncache,
    nocache
} from '../lib/loader.js';
import {
    handleIncomingMessage
} from '../lib/user.js';

import fs from 'fs';
import fetch from "node-fetch";
import path from 'path';
import pino from 'pino';
import readline from "readline";
import yargs from 'yargs/yargs';
import _ from 'lodash';
import NodeCache from "node-cache";
import extendSocketBotz from "../lib/socket.js";
import axios from 'axios';
import boom from '@hapi/boom';
import chalk from 'chalk';
import {
    fileURLToPath,
    pathToFileURL
} from 'url';
let __filename = fileURLToPath(import.meta.url);
let __dirname = dirname(__filename);
const {
    Boom
} = boom;
// DATABASE
let db = JSON.parse(fs.readFileSync('./database/database.json', 'utf-8'));
let {
    mainHandler
} = await import("./handler.js");
db.welcome = JSON.parse(fs.readFileSync('./database/welcome.json'))
global.stopJadiBot = {};

const customCode = global.codePair;
// ======================
// FUNCTION START BOT
// ======================
global.stopJadiBot = global.stopJadiBot || {};
global.jadibotStopFlag = global.jadibotStopFlag || {};
global.Client = global.Client || {};
const sesi = {
    proto,
    BufferJSON,
    initAuthCreds
};

const {
    version
} = await fetchLatestBaileysVersion();
let errorBuffer = [];
let errorTimeout = null;
const flushErrors = async () => {
    if (errorBuffer.length === 0) return;
    const fullLog = errorBuffer.join('\n\n');
    const encoded = encodeURIComponent(fullLog);
    try {
        await fetch(`http://localhost:9999/jadibot/err/give?data=${encoded}`);
        errorBuffer = [];
        console.log("[LOG] Buffer error telah dikirim ke dashboard.");
    } catch (e) {
        console.error("Gagal kirim buffer error:", e);
    }
};

// ====================================
// START JADIBOT
// ====================================
const cstate = "./database/state.json";

function saveClientState() {
    const data = {};

    for (const phone in global.Client) {
        data[phone] = global.Client[phone].state;
    }

    fs.writeFileSync(cstate, JSON.stringify(data, null, 2));
}
export async function startJadiBot(numberBotz, m = {}, RyuuBotz, startJadiBot, stopJadiBot, plugins) {
    let store = makeInStorageStore({
        logger: pino().child({
            level: 'fatal',
            stream: 'store'
        })
    });
    store.contacts = store.state.contacts;
    if (fs.existsSync(`./database/jadibot/${numberBotz}[stopped]`)) return;
    global.stopJadiBot[numberBotz] = false;
    global.jadibotStopFlag[numberBotz] = false;

    const shouldStop = () => !!global.stopJadiBot[numberBotz];

    if (shouldStop()) return;

    if (!fs.existsSync(`./database/jadibot/${numberBotz}[running]`)) {
        fs.mkdirSync(`./database/jadibot/${numberBotz}[running]`, {
            recursive: true
        });
    }


    if (shouldStop()) return;

    const {
        saveCreds,
        state
    } = await haruka.useSQLiteAuthState(`./database/jadibot/${numberBotz}[running]/auth.db`, sesi);
    const msgRetryCounterCache = new NodeCache();
    const property = {
        proto,
        generateWAMessageFromContent,
        jidDecode,
        downloadContentFromMessage,
        prepareWAMessageMedia,
        generateMessageID,
        generateWAMessage
    };

    if (shouldStop()) return;

    const jadibotz = makeWASocket({
        logger: pino({
            level: "fatal"
        }),
        printQRInTerminal: false,
        syncFullHistory: false,
        browser: Browsers.macOS("Safari"),
        patchMessageBeforeSending: (message) => {
            const requiresPatch =
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage;
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        },
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({
                level: "fatal"
            })),
        },
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: false,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid);
            let msg = await store.loadMessage(jid, key.id);
            return msg?.message || "";
        },
        msgRetryCounterCache,
    });


    extendSocketBotz(jadibotz, store, smsg);
    haruka.addProperty(jadibotz, property)
    try {
        if (store?.bind) store.bind(jadibotz);
    } catch (e) {}

    jadibotz.ev.on("creds.update", saveCreds);
    async function sendMessage(text, mention = []) {
        if (m?.chat === undefined) return;
        let contextInfo = {
            mentionedJid: mention,
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: global.namabot,
                newsletterJid: global.idSaluran
            }
        }
        contextInfo.previewThumbnail = {
            title: global.namabot,
            desc: global.ownername,
            thumbnail: { url: global.thumbnail.mini },
            sourceUrl: "https://api.ryuu-dev.my.id"
        }

        await RyuuBotz.sendMessage(m.chat, {
            text,
            contextInfo
        }, {
            quoted: m
        })
    }

    if (!jadibotz.authState.creds.registered) {
        if (shouldStop()) return;

        const number = numberBotz;

        try {
            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            await delay(6000);

            if (shouldStop()) return;

            const code = await jadibotz.requestPairingCode(number);
            if (shouldStop()) return;

            const dir = `./database/jadibot/${number}[running]`;
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, {
                recursive: true
            });

            const filePath = path.join(dir, `code-${number}.json`);
            fs.writeFileSync(
                filePath,
                JSON.stringify({
                        code,
                        self: false
                    },
                    null,
                    2
                )
            );
        } catch (err) {
            const dir = `./database/jadibot/${number}[running]`;
            console.error(`Error pada nomor ${number}:`, err);
            fs.rmSync(dir, {
                recursive: true,
                force: true
            })
            const logEntry = `[ERROR Number: ${number}] ${new Date().toLocaleTimeString()} - ${err.stack || err}
            Deleting ${dir}\n\n`;
            errorBuffer.push(logEntry);
            if (errorTimeout) clearTimeout(errorTimeout);
            errorTimeout = setTimeout(() => {
                flushErrors();
            }, 5000);
        }

    }


    // ======================
    // CONNECTION UPDATE
    // ======================
    jadibotz.ev.on('connection.update', async (update) => {
        if (shouldStop() || global.jadibotStopFlag[numberBotz]) {
            console.log(`[${numberBotz}] Bot is stopped — ignoring connection updates.`);
            return;
        }

        try {
            const {
                connection,
                lastDisconnect
            } = update;

            // ===== CONNECTION CLOSED =====
            if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                console.log("Connection closed:", reason);

                if (shouldStop() || global.jadibotStopFlag[numberBotz]) {
                    console.log("Bot stopped intentionally → no reconnect.");
                    return;
                }

                switch (reason) {
                    case DisconnectReason.badSession:
                        console.log("Bad session file → delete and restart.");
                        startJadiBot(numberBotz, m, RyuuBotz);
                        break;

                    case DisconnectReason.connectionClosed:
                        console.log("Connection closed → reconnecting...");
                        startJadiBot(numberBotz, m, RyuuBotz);
                        break;

                    case DisconnectReason.connectionLost:
                        console.log("Connection lost → reconnecting...");
                        startJadiBot(numberBotz, m, RyuuBotz);
                        break;

                    case DisconnectReason.connectionReplaced:
                        console.log("Connection replaced → exiting current session.");
                        process.exit(0);
                        break;

                    case DisconnectReason.loggedOut:
                        console.log("Logged out → deleting session and restarting. Number:", numberBotz);
                        try {
                            fs.rmSync(`./database/jadibot/${numberBotz}[running]`, {
                                force: true,
                                recursive: true
                            });
                        } catch (e) {}
                        startJadiBot(numberBotz, m, RyuuBotz);
                        break;

                    case DisconnectReason.restartRequired:
                        console.log("Restart required → restarting...");
                        startJadiBot(numberBotz, m, RyuuBotz);
                        break;

                    case DisconnectReason.timedOut:
                        console.log("Timeout → reconnecting...");
                        startJadiBot(numberBotz, m, RyuuBotz);
                        break;

                    default:
                        console.log("Unknown reason:", reason);
                        try {
                            fs.rmSync(`./database/jadibot/${numberBotz}[running]`, {
                                force: true,
                                recursive: true
                            });
                        } catch (e) {}
                        startJadiBot(numberBotz, m, RyuuBotz);
                }

                return;
            }

            if (connection === "open" || update.receivedPendingNotifications === "true") {
                sendMessage(`┌───────────────────────┐
│      🤖 JADIBOT       
├───────────────────────┤
│ Nomor  : ${numberBotz} 
│ Status : Connected     
│ Mode   : Active        
├───────────────────────┤
│ Bot siap digunakan 🚀  
└───────────────────────┘`)

                const botId = numberBotz;
                setInterval(async () => {
                    await checkExpiredSewa(jadibotz);
                }, 10 * 60 * 1000);
                setInterval(async () => {
                    const sewaPath = "./database/sewa.json";
                    const baseDir = "./database/jadibot/";

                    if (!fs.existsSync(sewaPath)) return;

                    try {
                        const db = JSON.parse(fs.readFileSync(sewaPath, "utf-8"));
                        if (!db.jadibot || !db.jadibot.length) return;

                        const now = Date.now();
                        let updated = false;


                        db.jadibot = db.jadibot.filter(item => {
                            if (item.expiredAt === null) return true;

                            if (now > item.expiredAt) {
                                console.log(`[CRON] JadiBot ${item.number} expired. Menghentikan...`);

                                if (typeof stopJadiBot === "function") {
                                    try {
                                        stopJadiBot(item.number);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }

                                if (fs.existsSync(baseDir)) {
                                    const dirs = fs.readdirSync(baseDir);
                                    const targetFolder = dirs.find(d => d.startsWith(item.number));
                                    if (targetFolder && !targetFolder.includes("[stopping]")) {
                                        try {
                                            fs.renameSync(
                                                path.join(baseDir, targetFolder),
                                                path.join(baseDir, `${item.number}[stopping]`)
                                            );
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }
                                }

                                updated = true;
                                return false;
                            }
                            return true;
                        });

                        if (updated) {
                            fs.writeFileSync(sewaPath, JSON.stringify(db, null, 2), "utf-8");
                            console.log("[CRON] Database sewa.json berhasil diperbarui (Expired cleared).");
                        }
                    } catch (err) {
                        console.error("[CRON-ERROR] Gagal menjalankan check-expired:", err.message);
                    }
                }, 10 * 60 * 1000);

                global.Client[botId] ??= {
                    socket: jadibotz,
                    state: {
                        self: false,
                        autoread: false
                    }
                }
                if (fs.existsSync(cstate)) {
                    const saved = JSON.parse(fs.readFileSync(cstate));
                    for (const phone in saved) {
                        global.Client ??= {};
                        global.Client[phone] ??= {};
                        global.Client[phone].state = {
                            self: !!saved[phone].self,
                            autoread: !!saved[phone].autoread
                        };
                    }
                };

                global.Client[botId].socket = jadibotz;
            }

        } catch (e) {
            console.log("Error in connection.update:", e);

            if (!shouldStop() && !global.jadibotStopFlag[numberBotz]) {
                console.log("Recovering from error…");
                setTimeout(() => {
                    if (!shouldStop()) startJadiBot(numberBotz, m, RyuuBotz);
                }, 1000);
            } else {
                console.log("Error ignored because bot is stopped intentionally.");
            }
        }
    });

    // ======================
    // MESSAGES >
    // ======================
    jadibotz.ev.on("messages.upsert", async (chatUpdate) => {
        if (shouldStop()) return;

        if (typeof chatUpdate.requestId === "string" && chatUpdate.requestId.length > 0) return;
        try {
            const kay = chatUpdate.messages[0];
            if (!kay?.message) return;
            kay.message = Object.keys(kay.message)[0] === "ephemeralMessage" ? kay.message.ephemeralMessage.message : kay.message;

            const m = smsg(jadibotz, kay, store);
            const isLogs = false;
            if (shouldStop()) return;
            if (m.key.remoteJid?.endsWith('@newsletter')) return;
            if (kay.key.id.startsWith("AE59") && kay.key.id.length === 16) return;

            if (!m.key.fromMe && m.key.remoteJid.endsWith("@s.whatsapp.net") && m.text) {
                handleIncomingMessage(jadibotz, m.key.remoteJid);
            }
            mainHandler(jadibotz, m, chatUpdate, store, null, plugins, startJadiBot, stopJadiBot);
        } catch (err) {
            console.error("Error processing message:", err);
            try {
                let msg = `Error processing message: ${err}`;
                jadibotz.sendMessage(global.owmernumber + "@s.whatsapp.net", {
                    text: String(err)
                });
            } catch {}
        }
    });

    // ======================
    // GROUP PARTICIPANTS
    // ======================
    jadibotz.ev.on("group-participants.update", async (anuid) => {
        try {
            const {
                id,
                participants,
                action
            } = anuid || {};

            if (
                !id ||
                !action ||
                !Array.isArray(participants) ||
                !participants.length
            ) {
                return console.log("participantsUpdate invalid:", anuid);
            }

            const currentBotJid = jadibotz.user.id.split(":")[0] + "@s.whatsapp.net";
            const mainBotJid = global.nomorbot.includes("@s.whatsapp.net") ?
                global.nomorbot :
                global.nomorbot + "@s.whatsapp.net";

            const groupMetadata = await jadibotz.groupMetadata(id).catch(() => null);
            if (!groupMetadata) return;

            if (currentBotJid !== mainBotJid) {
                const isMainBotPresent = groupMetadata.participants.some(
                    p => p.phoneNumber === mainBotJid
                );

                if (isMainBotPresent) return;
            }

            db.welcome ??= {};
            db.welcome.groups ??= {};
            db.welcome.groups[id] ??= {
                welcome: false,
                goodbye: false
            };

            const groupName = groupMetadata.subject || "Grup ini";
            const bgUrl = global.thumbnail.main;

            const sendWelcLeftMessage = async (
                num,
                userTag,
                nama,
                rawText,
                titleText,
                imgTitle,
                desc2
            ) => {
                const qbotz = {
                    key: {
                        participant: "6288704756515@s.whatsapp.net",
                        remoteJid: "status@broadcast"
                    },
                    message: {
                        contactMessage: {
                            displayName: titleText,
                            vcard: `BEGIN:VCARD
VERSION:3.0
N:XL;ttname,;;;
FN:ttname
item1.TEL;waid=6288704756515:+62 887-0475-6515
item1.X-ABLabel:Ponsel
END:VCARD`,
                            sendEphemeral: true
                        }
                    }
                };

                const pn = await jadibotz.signalRepository.lidMapping.getPNForLID(num);
                const jid = pn.split(":")[0] + "@s.whatsapp.net";
                let ppUrl;
                try {
                    ppUrl = await jadibotz.profilePictureUrl(num, "preview", 3000);
                } catch {}
                if (!ppUrl) {
                    try {
                        ppUrl = await jadibotz.profilePictureUrl(num, "image", 3000);
                    } catch {}
                }
                if (!ppUrl) {
                    try {
                        ppUrl = await jadibotz.profilePictureUrl(id, "preview", 3000);
                    } catch {}
                }
                if (!ppUrl) {
                    try {
                        ppUrl = await jadibotz.profilePictureUrl(id, "image", 3000);
                    } catch {}
                }
                if (!ppUrl) {
                    try {
                        ppUrl = "https://telegra.ph/file/265c672094dfa87caea19.jpg";
                    } catch {}
                }


                const teks2 = desc2
                    .replace(/@user/gi, userTag)
                    .replace(/@group/gi, groupName);

                const desc_2 = teks2.replace(userTag, nama);

                const teks = rawText
                    .replace(/@user/gi, userTag)
                    .replace(/@group/gi, groupName);

                const bufferUrl =
                    `https://api.ryuu-dev.my.id/canvas/welcome-leave?desc=${encodeURIComponent(desc_2)}&title=${encodeURIComponent(imgTitle)}&profile=${encodeURIComponent(ppUrl)}&background=${encodeURIComponent(bgUrl)}`;

                let thumbnail;

                try {
                    const res = await axios.get(bufferUrl, {
                        responseType: "arraybuffer"
                    });
                    thumbnail = Buffer.from(res.data);
                } catch {
                    thumbnail = null;
                }

                await jadibotz.sendMessage(
                    id, {
                        text: teks,
                        mentions: [num],
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            mentionedJid: [jid],
                            forwardedNewsletterMessageInfo: {
                                newsletterName: global.ownername,
                                newsletterJid: global.idSaluran
                            },
                            ...(thumbnail ? {
                                previewThumbnail: {
                                    title: titleText,
                                    desc: global.ownername,
                                    thumbnail: {
                                        url: bufferUrl
                                    },
                                    sourceUrl: "https://api.ryuu-dev.my.id",
                                    largerThumbnail: true
                                }
                            } : {})
                        }
                    }, {
                        quoted: qbotz
                    }
                );
            };

            for (const participant of participants) {
                const num =
                    typeof participant === "string" ?
                    participant :
                    participant?.id;

                if (!num) {
                    console.log("participant not found");
                    continue;
                }
                const pn = await jadibotz.signalRepository.lidMapping.getPNForLID(num);
                const userTag = pn ? "@" + pn?.split(":")[0] : "@" + num.split("@")[0];
                if (
                    action === "add" &&
                    db.welcome.groups[id].welcome
                ) {
                    await sendWelcLeftMessage(
                        num,
                        userTag,
                        userTag,
                        db.welcome.groups[id].welcomeText ||
                        "Selamat datang @user di grup @group!",
                        `Welcome ${userTag}!`,
                        "Welcome!!",
                        "Selamat datang di grup @group!"
                    );
                }

                if (
                    (action === "remove" || action === "leave") &&
                    db.welcome.groups[id].goodbye
                ) {
                    await sendWelcLeftMessage(
                        num,
                        userTag,
                        userTag,
                        db.welcome.groups[id].goodbyeText ||
                        "Selamat tinggal @user, semoga betah di luar @group",
                        `Good bye ${userTag}!`,
                        "Good Bye",
                        "Selamat tinggal, semoga betah di luar @group"
                    );
                }
            }
        } catch (err) {
            console.error("participantsUpdate failed:", err);
        }
    });

    // ======================
    // CONTACTS UPDATE 
    // ======================
    jadibotz.ev.on("contacts.update", (update) => {
        if (shouldStop()) return;
        for (let contact of update) {
            let id = jadibotz.decodeJid(contact.id);
            if (store && store.contacts)
                store.contacts[id] = {
                    id,
                    name: contact.notify,
                };
        }
    });

    jadibotz.ev.on('messaging-history.set', ({
        contacts
    }) => {
        store.allContacts = contacts.map(contact => ({
            id: contact.id,
            name: contact.name || contact.notify || 'Tanpa Nama',
            verifiedName: contact.verifiedName || ''
        }));
    });

    // ### End of sending message ###

    const pairPath = `./database/jadibot/${numberBotz}[running]/code-${numberBotz}.json`;
    const codePairs = fs.existsSync(pairPath) ?
        JSON.parse(fs.readFileSync(pairPath)).code :
        null;

    return codePairs;
}

// =======================================
// STOP JADIBOT
// =======================================
export async function stopJadiBot(numberBotz) {
    try {
        global.stopJadiBot[numberBotz] = true;
        global.jadibotStopFlag[numberBotz] = true;

        console.log("Stopping bot:", numberBotz);

        const jadibotz = global.Client?.[numberBotz];
        if (jadibotz) {
            try {
                if (jadibotz.ev && jadibotz.ev.removeAllListeners) jadibotz.ev.removeAllListeners();
            } catch (e) {}

            try {
                if (jadibotz?.ws && jadibotz.ws.close) jadibotz.ws.close();
            } catch (e) {}

            try {
                if (typeof jadibotz.end === "function") await jadibotz.end();
            } catch (e) {}

            // Jangan override store.bind — hal ini menyebabkan store tidak bisa
            // menangkap event messages.upsert pada instance jadibot berikutnya.

            try {
                delete global.Client[numberBotz];
            } catch (e) {}
        } else {
            console.log("No active client found for:", numberBotz);
        }

        console.log("Bot stopped:", numberBotz);
    } catch (e) {
        console.error("Error stopping bot:", e);
    }
}
let handler = path.join(__dirname, "handler.js");
fs.watchFile(handler, async () => {
    fs.unwatchFile(handler);
    console.log(chalk.redBright(`Update ${handler}`));
    try {
        mainHandler = await import(`${handler}?update=${Date.now()}`);
    } catch (err) {
        console.log(err);
    }
});