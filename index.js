// SETTINGS
process.on("unhandledRejection", err => {
    const msg = String(err?.message || err)
    if (msg.includes("rate") || msg.includes("over-limit")) {
        console.log("[BOT] Rate limit kena, ditahan")
        return
    }
    console.error("[BOT] Unhandled rejection:", err)
})
process.on("uncaughtException", err => {
    const msg = String(err?.message || err)
    if (msg.includes("rate") || msg.includes("over-limit")) {
        console.log("[BOT] Rate limit exception ditahan, ga jadi mati")
        return
    }
    console.error("[BOT] Fatal error:", err)
    process.exit(1)
})

import "./settings.js";
import util from 'util';
import {
    checkExpiredSewa
} from './lib/store-manage.js';
import logger from "./lib/logger.js";
import {
    pluginsLoader,
    hotReload,
    plugins
} from "./engines/plugins.js";
import {
    dirname
} from 'path';
import {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    addExif
} from './lib/exif.js';
import cron from "node-cron";
import haruka from "@ryuu-reinzz/luna-lib";
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
} from './lib/myfunc.js';
import makeInStorageStore from './lib/store.js';
import makeWASocket, {
    fetchLatestBaileysVersion,
    DisconnectReason,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
    jidDecode,
    downloadContentFromMessage,
    proto,
    generateMessageID,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
    BufferJSON,
    initAuthCreds,
    generateWAMessage
} from '@ryuu-reinzz/baileys';

import os from 'os';
import {
    exec,
    spawn
} from 'child_process';
import moment from "moment-timezone";

import {
    color,
    bgcolor
} from './lib/color.js';
import {
    uncache,
    nocache
} from './lib/loader.js';
import {
    handleIncomingMessage
} from './lib/user.js';

import fs from 'fs';
import fetch from "node-fetch";
import path from 'path';
import pino from 'pino';
import readline from "readline";
import yargs from 'yargs/yargs';
import _ from 'lodash';
import NodeCache from "node-cache";
import axios from 'axios';
import boom from '@hapi/boom';
import chalk from 'chalk';
import extendSocketBotz from "./lib/socket.js";
import {
    startJadiBot,
    stopJadiBot
} from './engines/jadibot.js';
import {
    Low
} from 'lowdb'
import {
    JSONFile
} from 'lowdb/node'
const {
    Boom
} = boom;
import {
    fileURLToPath,
    pathToFileURL
} from 'url';
let __filename = fileURLToPath(import.meta.url);
let __dirname = dirname(__filename);

const execPromise = util.promisify(exec);

let store;
store = makeInStorageStore({
    logger: pino().child({
        level: 'fatal',
        stream: 'store'
    })
});
store.contacts = store.state.contacts;
const useSQLiteAuthState = haruka.useSQLiteAuthState;
const {
    version
} = await fetchLatestBaileysVersion();

global.opts = yargs(process.argv.slice(2)).exitProcess(false).parse();
const defaultData = {
    users: [],
    chats: [],
    welcome: {},
    settings: {}
}
global.db = new Low(
    new JSONFile('./database/database.json'),
    defaultData
)
db.welcome = JSON.parse(fs.readFileSync('./database/welcome.json'))

await global.db.read()
global.db.data ||= defaultData
global.DATABASE = global.db;
global.loadDatabase = async function() {
    if (global.db.READ) return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (!global.db.READ) {
                clearInterval(interval);
                resolve(global.db.data ?? global.loadDatabase());
            }
        }, 1000);
    });
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read();
    global.db.READ = false;
    global.db.data = {
        users: {},
        chats: {},
        game: {},
        database: {},
        settings: {},
        setting: {},
        others: {},
        sticker: {},
        ...(global.db.data || {})
    };
    global.db.chain = _.chain(global.db.data);
};
await global.loadDatabase();
spawn("node", ["./lib/cron.js"], {
    stdio: "inherit"
});
const cstate = "./database/state.json";

function saveClientState() {
    const data = {};

    for (const phone in global.Client) {
        data[phone] = global.Client[phone].state;
    }

    fs.writeFileSync(cstate, JSON.stringify(data, null, 2));
}
async function initOwnerLID(RyuuBotz) {
    if (global.lidownernumber) return global.lidownernumber;

    const jid = global.ownernumber + "@s.whatsapp.net";
    const lid = await RyuuBotz.signalRepository.lidMapping
        .getLIDForPN(jid);

    global.lidownernumber = lid.split("@")[0];
    return global.lidownernumber;
}

// UTILS
const property = {
    proto,
    generateWAMessageFromContent,
    jidDecode,
    downloadContentFromMessage,
    prepareWAMessageMedia,
    generateMessageID,
    generateWAMessage
};
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);
const type = (x) => x?.constructor?.name ?? (x === null ? "null" : "undefined");
const isStringSame = (x, y) => Array.isArray(y) ? y.includes(x) : y === x;

let phoneNumber = `${nomorbot}`;

// ======================
// FUNCTION START BOT
// ======================
async function loadAllJadiBot(startJadiBot, plugins) {
    const basePath = "./database/jadibot";
    if (!fs.existsSync(basePath)) return;

    const folders = fs.readdirSync(basePath).filter((name) => {
        const fullPath = path.join(basePath, name);
        return fs.statSync(fullPath).isDirectory() &&
            name.includes('[running]') &&
            /^\d+/.test(name)
    });

    folders.forEach(async (folderName) => {
        const nomor = folderName.split('[')[0];
        console.log(chalk.blue(`[AUTOLOAD] Menjalankan kembali JadiBot: ${nomor}...`));

        try {
            await startJadiBot(nomor, null, {}, startJadiBot, stopJadiBot, plugins);
        } catch (e) {
            console.error(chalk.red(`Gagal autoload ${nomor}:`), e.message);
            const errDetail = `[AUTOLOAD ERROR - ${nomor}] ${e.message}`;
            fetch(`http://localhost:9999/jadibot/err/give?data=${encodeURIComponent(errDetail)}`).catch((err) => {
                console.log(err)
            });
        }
    });

    console.log(chalk.green(`[AUTOLOAD] Proses inisialisasi semua session telah dipicu.`));
}
let {
    mainHandler
} = await import("./engines/handler.js");
let pluginsDir = path.resolve(__dirname, "plugins");
async function startsesi() {
    await global.sleep(3000);
    await pluginsLoader(pluginsDir);
    const resultDf = await execPromise('df -h /');
    const output = resultDf.stdout.split('\n')[1].split(/\s+/);
    const totals = output[1];
    const useds = output[2];
    const availables = output[3];
    const percents = output[4];
    const infoBot = path.join("package.json");
    const botData = fs.readFileSync(infoBot, "utf8");
    const rootPackage = JSON.parse(botData);
    const infoBails = path.join("node_modules", "@ryuu-reinzz", "baileys", "package.json");
    const bailsData = fs.readFileSync(infoBails, "utf8");
    const baileysPackage = JSON.parse(bailsData);
    const ramUsage = formatp(os.totalmem() - os.freemem()) + " / " + formatp(os.totalmem());
    const diskUsage = useds + "B" + " / " + totals + "B" + "(" + percents + ")";
    const diskFree = availables + "B";
    const nameBot = rootPackage.name;
    const verBot = rootPackage.version;
    const verNodejs = process.version;
    const resultnpm = await execPromise('npm -v');
    const npmVersion = resultnpm.stdout.toString().trim();
    const totalPlugins = [...plugins.values()].length;
    const bailName = baileysPackage.name;
    const verBail = baileysPackage.version;

    const {
        default: print
    } = await import("./lib/print.js");
    await print(ramUsage, diskUsage, diskFree, nameBot, verBot, verNodejs, npmVersion, totalPlugins, bailName, verBail, chalk);

    const {
        saveCreds,
        state
    } = await useSQLiteAuthState(`./session/auth.db`, {
        proto,
        BufferJSON,
        initAuthCreds
    });
    const msgRetryCounterCache = new NodeCache();
    const browser = Browsers.macOS("Safari");

    const RyuuBotz = makeWASocket({
        logger: pino({
            level: "fatal"
        }),
        printQRInTerminal: false,
        syncFullHistory: false,
        browser,
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
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: false,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid);
            let msg = await store.loadMessage(jid, key.id);
            return msg?.message || "";
        },
        msgRetryCounterCache,
    });
    if (fs.existsSync("./lib/server.js")) {
        try {
            const {
                serverRun
            } = await import("./lib/server.js");
            serverRun(RyuuBotz);
        } catch (_) {
            console.log(_);
            process.exit(1);
        }
    }
    await loadAllJadiBot(startJadiBot, plugins);
    extendSocketBotz(RyuuBotz, store, smsg);
    haruka.addProperty(RyuuBotz, property);
    store?.bind(RyuuBotz);

    RyuuBotz.ev.on("creds.update", saveCreds);
    if (!RyuuBotz.authState.creds.registered) {
        const [os, client, version] = browser;
        console.log(`
${chalk.hex('#ff00ff')('╔═══════════════ SECURE LINK ═══════════════╗')}
${chalk.hex('#00e5ff')('│')} ${chalk.bold.white('AUTH')} ${chalk.gray('»')} ${chalk.greenBright('GENERATING PAIRING KEY')}
${chalk.hex('#00e5ff')('│')} ${chalk.bold.white('OS')}   ${chalk.gray('»')} ${chalk.yellow(os)}
${chalk.hex('#00e5ff')('│')} ${chalk.bold.white('APP')}  ${chalk.gray('»')} ${chalk.cyan(client)}
${chalk.hex('#00e5ff')('│')} ${chalk.bold.white('VER')}  ${chalk.gray('»')} ${chalk.green(version)}
${chalk.hex('#ff00ff')('╚═══════════════════════════════════════════╝')}
`);

        const number = phoneNumber;
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await delay(6000);

        const code = await RyuuBotz.requestPairingCode(number);

        console.log(`
${chalk.cyan.bold("╔═══════════ NETWORK MONITOR ═══════════╗")}
${chalk.cyan("ID:    ")} ${chalk.white.dim("HARUKA-" + number)}
${chalk.cyan("STATUS:")} ${chalk.green("AUTHENTICATING")}
${chalk.gray("╚═══════════════════════════════════════╝")}

    ${chalk.white.bold("◢ CONNECTION ESTABLISHED ◣")}

    ${chalk.cyan("┇")} ${chalk.white("DEVICE ID ")} ❯ ${chalk.yellow(number)}
    ${chalk.cyan("┇")} ${chalk.white("AUTH CODE ")} ❯ ${chalk.white.bold(` ${code} `)}

${chalk.gray("─────────────────────────────────────────")}
    ${chalk.cyan("»")} ${chalk.white.italic("Handshake sequence initiated...")}
    ${chalk.cyan("»")} ${chalk.magenta("Awaiting confirmation from terminal...")}
${chalk.gray("─────────────────────────────────────────")}
    `);
    }


    // ======================
    // CONNECTION UPDATE
    // ======================
    RyuuBotz.ev.on('connection.update', async (update) => {
        const {
            connection,
            lastDisconnect
        } = update;

        try {
            if (connection === 'close') {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

                if (reason === DisconnectReason.badSession) {
                    console.log(`Bad Session File, Please Delete Session and Connect Again`);
                    startsesi();
                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log("Connection closed, reconnecting....");
                    startsesi();
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log("Connection Lost from Server, reconnecting...");
                    startsesi();
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log("Connection Replaced, Another New Session Opened. Closing current...");
                    process.exit(0);
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log(`Device Logged Out, Please Connect Again And Run.`);
                    if (fs.existsSync("./session/auth.db")) {
                        const dir = "./session";
                        fs.readdirSync(dir)
                            .filter(file => file.startsWith("auth."))
                            .forEach(file => {
                                fs.unlinkSync(path.join(dir, file));
                            });
                    }
                    startsesi();
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log("Restart Required, Restarting...");
                    startsesi();
                } else if (reason === DisconnectReason.timedOut) {
                    console.log("Connection TimedOut, Reconnecting...");
                    startsesi();
                } else {
                    console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
                    startsesi();
                }
            }

            if (connection === "connecting") {
                console.clear();
                console.log(`
${chalk.cyan("┌────────────────────────────────────────────────────────┐")}
${chalk.cyan("│")} ${chalk.yellow.bold("⚡ SYSTEM INITIALIZING")}                               
${chalk.cyan("├────────────────────────────────────────────────────────┤")}
${chalk.white("  STATUS  :")} ${chalk.cyan("SEARCHING SIGNAL...")}
${chalk.white("  MODULE  :")} ${chalk.magenta("CORE_ENGINE_V" + verBot)}
${chalk.white("  LOG     :")} ${chalk.gray("Fetching handshake protocols...")}
${chalk.white("  PROGRESS:")} ${chalk.cyan("▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱")} ${chalk.white("50%")}
${chalk.cyan("└────────────────────────────────────────────────────────┘")}
    `);
            }

            if (connection === "open") {
                const timestamp = new Date().toLocaleTimeString();
                console.log(`
${chalk.green.bold("╔══════════════════════════════════════════════════════════╗")}
${chalk.green.bold("║")}  ${chalk.bgGreen.black(" SUCCESS ")} ${chalk.green("CONNECTION ESTABLISHED")}               
${chalk.green.bold("╠══════════════════════════════════════════════════════════╣")}
${chalk.green("║")} ${chalk.white("TIME     :")} ${chalk.yellow(timestamp)}                             
${chalk.green("║")} ${chalk.white("NODE     :")} ${chalk.cyan(process.version)} ${chalk.gray("|")} ${chalk.white("ARCH:")} ${chalk.cyan(process.arch)}     
${chalk.green("║")} ${chalk.white("PLATFORM :")} ${chalk.cyan(process.platform.toUpperCase())}                     
${chalk.green("║")} ${chalk.white("SECURITY :")} ${chalk.green("ENCRYPTED END-TO-END")}                     
${chalk.green("║")} ${chalk.white("PROGRESS :")} ${chalk.cyan("▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰")} ${chalk.white("100%")}
${chalk.green.bold("╚══════════════════════════════════════════════════════════╝")}
${chalk.gray(" > Waiting for incoming packets...")}
    `);

                console.log(`
${chalk.cyan.bold("╔══════════════════════════════════════════════════════════╗")}
${chalk.cyan.bold("║")}  ${chalk.bgCyan.black.bold(" READY ")} ${chalk.cyan("HARUKA SYSTEM IS NOW OPERATIONAL")}          
${chalk.cyan.bold("╠══════════════════════════════════════════════════════════╣")}
${chalk.cyan("║")} ${chalk.white("STATUS   :")} ${chalk.green("ACTIVE / LISTEN MODE")}                      
${chalk.cyan("║")} ${chalk.white("TIME     :")} ${chalk.yellow(timestamp)}                             
${chalk.cyan("║")} ${chalk.white("MESSAGE  :")} ${chalk.magentaBright.bold("ENJOY THE BOT!!")}                        
${chalk.cyan("║")} ${chalk.white("STABILITY:")} ${chalk.green("100% SECURE")}                               
${chalk.cyan("║")} ${chalk.white("LOAD     :")} ${chalk.cyan("▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰")} ${chalk.white("DONE")}
${chalk.cyan.bold("╚══════════════════════════════════════════════════════════╝")}
${chalk.gray(` [${timestamp}]`)} ${chalk.white("Waiting for incoming messages...")}
`);

                await initOwnerLID(RyuuBotz);

                logger.add(`database/logger/bot-${global.nomorbot}.log`, "Logger initiated");
                logger.view(`./database/logger/bot-${global.nomorbot}.log`);
                const botId = RyuuBotz.user.id.split(":")[0];
                setInterval(async () => {
                    await checkExpiredSewa(RyuuBotz);
                }, 10 * 60 * 1000);
                global.Client ??= {};
                global.Client[botId] ??= {
                    socket: RyuuBotz,
                    state: {
                        self: false,
                        autoread: false
                    }
                };

                if (fs.existsSync(cstate)) {
                    const saved = JSON.parse(fs.readFileSync(cstate));
                    for (const phone in saved) {
                        global.Client[phone] ??= {};
                        global.Client[phone].state = {
                            self: !!saved[phone].self,
                            autoread: !!saved[phone].autoread
                        };
                    }
                }
                global.Client[botId].socket = RyuuBotz;
            }



            if (connection === "close") {
                const reason = lastDisconnect?.error?.output?.statusCode || "UNKNOWN";
                console.log(`
${chalk.red.bold("╔════════════════════ SYSTEM HALTED ═══════════════════╗")}
${chalk.red("║")} ${chalk.white("STATUS   :")} ${chalk.bgRed.white.bold(" DISCONNECTED ")}                      
${chalk.red("║")} ${chalk.white("REASON   :")} ${chalk.yellow(reason)}                                  
${chalk.red("║")} ${chalk.white("ACTION   :")} ${chalk.cyan("ATTEMPTING RECONNECT...")}            
${chalk.red.bold("╚═══════════════════════════════════════════════════════╝")}
    `);
            }

        } catch (e) {
            console.log('Error in connection.update:', e);
        }
    });


    // ======================
    // MESSAGES >
    // ======================
    RyuuBotz.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const kay = chatUpdate.messages[0];
            if (!kay.message) return;
            kay.message = Object.keys(kay.message)[0] === "ephemeralMessage" ?
                kay.message.ephemeralMessage.message :
                kay.message;

            const m = smsg(RyuuBotz, kay, store);
            if (m.key.remoteJid?.endsWith('@newsletter')) return;
            //if (kay.key.id.startsWith("AE59") && kay.key.id.length === 16) return;
            mainHandler(RyuuBotz, m, chatUpdate, store, startsesi, plugins, startJadiBot, stopJadiBot);
        } catch (err) {
            console.error("Error processing message:", err);
            let msg = `Error processing message: ${err}`
            RyuuBotz.sendMessage(global.owmernumber + "@s.whatsapp.net", {
                text: msg
            });
        }
    });

    // ======================
    // GROUP PARTICIPANTS
    // ======================
    RyuuBotz.ev.on("group-participants.update", async (anuid) => {
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

            const currentBotJid = RyuuBotz.user.id.split(":")[0] + "@s.whatsapp.net";
            const mainBotJid = global.nomorbot.includes("@s.whatsapp.net") ?
                global.nomorbot :
                global.nomorbot + "@s.whatsapp.net";

            const groupMetadata = await RyuuBotz.groupMetadata(id).catch(() => null);
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
                        participant: "628131850918@s.whatsapp.net",
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

                let ppUrl;
                try {
                    ppUrl = await RyuuBotz.profilePictureUrl(num, "preview", 3000);
                } catch {}
                if (!ppUrl) {
                    try {
                        ppUrl = await RyuuBotz.profilePictureUrl(num, "image", 3000);
                    } catch {}
                }
                if (!ppUrl) {
                    try {
                        ppUrl = await RyuuBotz.profilePictureUrl(id, "preview", 3000);
                    } catch {}
                }
                if (!ppUrl) {
                    try {
                        ppUrl = await RyuuBotz.profilePictureUrl(id, "image", 3000);
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

                await RyuuBotz.sendMessage(
                    id, {
                        text: teks,
                        mentions: [num],
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            mentionedJid: [num],
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
                const userTag = "@" + num.split("@")[0];
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
    RyuuBotz.ev.on("contacts.update", (update) => {
        for (let contact of update) {
            let id = RyuuBotz.decodeJid(contact.id);
            if (store && store.contacts)
                store.contacts[id] = {
                    id,
                    name: contact.notify,
                };
        }
    });
    RyuuBotz.ev.on('messaging-history.set', ({
        contacts
    }) => {
        store.allContacts = contacts.map(contact => ({
            id: contact.id,
            name: contact.name || contact.notify || 'Tanpa Nama',
            verifiedName: contact.verifiedName || ''
        }));
    });

    // ### End of sending message ###
    return RyuuBotz;
}

// START BOT
startsesi();

const userDBPath = "./database/user.json";

function resetClaimedDaily() {
    let data = JSON.parse(fs.readFileSync(userDBPath));

    data = data.map(u => ({
        ...u,
        claimed: false
    }));

    fs.writeFileSync(userDBPath, JSON.stringify(data, null, 2));
    console.log("Reset claimed selesai (00:00).");
}
cron.schedule("0 0 * * *", () => {
    resetClaimedDaily();
});

const dbase = "./database/allchats.json";
cron.schedule("0 0 * * 0", () => {
    try {
        if (!fs.existsSync(dbase)) {
            fs.writeFileSync(dbase, JSON.stringify({}, null, 2));
            return;
        }

        const db = JSON.parse(fs.readFileSync(dbase, "utf-8"));

        for (const groupId in db) {
            for (const userId in db[groupId]) {
                db[groupId][userId] = 0;
            }
        }

        fs.writeFileSync(dbase, JSON.stringify(db, null, 2));
        console.log("[CRON] Reset mingguan allchats.json berhasil (semua = 0)");
    } catch (err) {
        console.error("[CRON ERROR]", err);
    }
}, {
    timezone: "Asia/Jakarta"
});
console.log("[CRON] Weekly reset aktif (setiap Minggu 00:00 WIB)");
// ======================
// AUTO WATCH FILE
// ======================
fs.watch(pluginsDir, async (_, filename) => {
    if (!filename?.endsWith('.js')) return;
    await hotReload(
        path.join(pluginsDir, filename)
    );
});