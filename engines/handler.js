import '../settings.js';
import path from 'path';
import {
    exec,
    spawn,
    execSync
} from 'child_process';
import {
    color,
    bgcolor
} from '../lib/color.js';
import {
    plugins
} from "./plugins.js";
import logger from "../lib/logger.js";
import BodyForm from 'form-data';
import os from 'os';
import axios from 'axios';
import * as baileys from '@ryuu-reinzz/baileys';
import chalk from 'chalk';
import fs from 'fs';
import process from 'process';
import moment from 'moment-timezone';
import speed from 'performance-now';
import ms from 'ms';
import util from 'util';
import simis from 'similarity';
let similarity = simis;
import meannn from 'didyoumean';
let didyoumean = meannn;
import {
    fileURLToPath,
    pathToFileURL
} from 'url';
import {
    dirname
} from 'path';
import {
    Jimp
} from 'jimp';
import {
    addMoney,
    delMoney,
    addExperience,
    createUserDatabase,
    deleteUserDatabase,
    setClaimedTrue,
    checkUserRegistered
} from '../lib/user.js';
import {
    generateWAMessageFromContent,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    prepareWAMessageMedia,
    areJidsSameUser,
    getContentType,
} from '@ryuu-reinzz/baileys';
import {
    getRegisteredRandomId,
    addRegisteredUser,
    removeRegisteredUser,
    createSerial,
    checkRegisteredUser,
    reduceUserLimit,
    theLimit,
    resetAllLimit,
    addUserLimit,
    checkName
} from '../lib/register.js';

import {
    clockString,
    parseMention,
    formatp,
    isUrl,
    sleep,
    runtime,
    getBuffer,
    jsonformat,
    capital,
} from '../lib/myfunc.js';

let readFile = util.promisify(fs.readFile);
let more = String.fromCharCode(8206);
let readmore = more.repeat(4001);
let __filename = fileURLToPath(import.meta.url);
let __dirname = dirname(__filename);

export let mainHandler = async (RyuuBotz, m, chatUpdate, store, startsesi = null, idk, startJadiBot, stopJadiBot) => {
            const cstate = "./database/state.json";

            function saveClientState() {
                const data = {};

                for (const phone in global.Client) {
                    data[phone] = global.Client[phone].state;
                }

                fs.writeFileSync(cstate, JSON.stringify(data, null, 2));
            }
            let adminOnly = JSON.parse(fs.readFileSync('./database/adminonly.json'))
            let mute = JSON.parse(fs.readFileSync('./database/mute.json'))
            let blacklist = JSON.parse(fs.readFileSync("./database/blacklist.json"));
            try {
                let afkPath = path.join(__dirname, '../database/afk.json');
                let afkDB = fs.existsSync(afkPath) ? JSON.parse(fs.readFileSync(afkPath)) : [];
                if (!fs.existsSync(afkPath)) fs.writeFileSync(afkPath, JSON.stringify(afkDB, null, 2));

                function saveAFK() {
                    fs.writeFileSync(afkPath, JSON.stringify(afkDB, null, 2));
                }
                let pathDB = "./database/allchats.json";

                function loadDB() {
                    if (!fs.existsSync(pathDB)) {
                        fs.writeFileSync(pathDB, JSON.stringify({}, null, 2));
                    }
                    return JSON.parse(fs.readFileSync(pathDB, "utf-8"));
                }

                function saveChats(dbase) {
                    fs.writeFileSync(pathDB, JSON.stringify(dbase, null, 2));
                }

                function updateChatCount(m) {
                    if (!m.chat?.endsWith("@g.us")) return;
                    let groupId = m.chat;
                    let sender = m.sender;
                    let dbase = loadDB();
                    if (!dbase[groupId]) {
                        dbase[groupId] = {};
                    }
                    if (!dbase[groupId][sender]) {
                        dbase[groupId][sender] = 0;
                    }
                    dbase[groupId][sender] += 1;
                    saveChats(dbase);
                }

                async function appenTextMessage(text, chatUpdate) {
                    let messages = await generateWAMessage(
                        m.chat, {
                            text: text,
                            mentions: m.mentionedJid,
                        }, {
                            userJid: RyuuBotz.user.id,
                            quoted: m.quoted && m.quoted.fakeObj,
                        },
                    );
                    messages.key.fromMe = areJidsSameUser(m.sender, RyuuBotz.user.id);
                    messages.key.id = m.key.id;
                    messages.pushName = m.pushName;
                    if (m.isGroup) messages.participant = m.sender;
                    let msg = {
                        ...chatUpdate,
                        messages: [proto.WebMessageInfo.fromObject(messages)],
                        type: "append",
                    };
                    RyuuBotz.ev.emit("messages.upsert", msg);
                }
                let {
                    type,
                    quotedMsg,
                    mentioned,
                    now,
                    fromMe
                } = m;
                let body =
                    m?.mtype === "interactiveResponseMessage" ?
                    JSON?.parse(m?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson)?.id :
                    m?.mtype === "conversation" ?
                    m?.message?.conversation :
                    m?.mtype == "imageMessage" ?
                    (m?.message?.imageMessage?.caption || "") :
                    m?.mtype == "videoMessage" ?
                    (m?.message?.videoMessage?.caption || "") :
                    m?.mtype == "extendedTextMessage" ?
                    m?.message?.extendedTextMessage?.text :
                    m?.mtype == "buttonsResponseMessage" ?
                    m?.message?.buttonsResponseMessage?.selectedButtonId :
                    m?.mtype == "listResponseMessage" ?
                    m?.message?.listResponseMessage?.singleSelectReply?.selectedRowId :
                    m?.mtype == "templateButtonReplyMessage" ?
                    m?.message?.templateButtonReplyMessage?.selectedId :
                    m?.mtype == "messageContextInfo" ?
                    m?.message?.buttonsResponseMessage?.selectedButtonId ||
                    m?.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                    m?.text :
                    m?.mtype === "protocolMessage" ?
                    (m?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text || "Nothing") :
                    m?.mtype === "pollCreationMessageV3" ?
                    m?.message?.pollCreationMessageV3?.name : m.text
                let rawTxt = body ? body : (m.mtype ? m.mtype : "Empty message");
                let premium = JSON.parse(fs.readFileSync("./database/premium.json"))

                if (m.key.remoteJid && m.key.remoteJid.endsWith('@newsletter')) {
                    return;
                }
                let budy = (typeof m.text == 'string' ? m.text : '.')

                let preff;
                if (global.pref === true) {
                    preff = global.prefix;
                } else if (global.pref === false) {
                    preff = [''];
                } else {
                    preff = ['.'];
                }

                let prefixes = preff;
                let prefix = prefixes.find(p => body.startsWith(p));
                let isCmd = prefix !== undefined;
                let withoutPrefix = isCmd ? body.slice(prefix.length).trim() : m.text;
                let firstSpace = withoutPrefix.indexOf(" ");
                let command = firstSpace === -1 ?
                    withoutPrefix :
                    withoutPrefix.slice(0, firstSpace);
                let text = firstSpace === -1 ?
                    "" :
                    withoutPrefix.slice(firstSpace + 1);
                let args = text ?
                    text.split(" ") : [];
                let chath = body;
                let pes = body || "";
                let messagesC = pes.slice(0).trim();
                let content = JSON.stringify(m.message);
                let from = m.key.remoteJid;
                let messagesD = body.slice(0).trim().split(/ +/).shift().toLowerCase();
                let botNumber = await RyuuBotz.decodeJid(RyuuBotz.user.id);
                let botLid = (await RyuuBotz.signalRepository.lidMapping.getLIDForPN(botNumber))
                /*        
                // let store = sock.signalRepository.lidMapping
                // available methods:
                // storeLIDPNMapping, storeLIDPNMappings, getLIDForPN, getLIDsForPNs, getPNForLID
                */

                let isCreator =
                    m.sender.split("@")[0] === global.lidownernumber ||
                    m.sender.split("@")[0] === global.ownernumber;
                let isLimit = theLimit(m.sender);
                let pushname = m.pushName || "Nothing";
                let isAsync = budy.slice(2).trim().length > 0;
                let q = args.join(" ");
                let quoted = m.quoted ? m.quoted : m;
                let mime = (quoted.msg || quoted).mimetype || "";
                let qmsg = quoted.msg || quoted;
                let isMedia = /image|video|sticker|audio/.test(mime);
                let isImage = m.mtype == "imageMessage";
                let isVideo = m.mtype == "videoMessage";
                let isAudio = m.mtype == "audioMessage";
                let isSticker = m.mtype == "stickerMessage";
                let isQuotedImage =
                    type === "extendedTextMessage" && content.includes("imageMessage");
                let isQuotedLocation =
                    type === "extendedTextMessage" && content.includes("locationMessage");
                let isQuotedVideo =
                    type === "extendedTextMessage" && content.includes("videoMessage");
                let isQuotedSticker =
                    type === "extendedTextMessage" && content.includes("stickerMessage");
                let isQuotedAudio =
                    type === "extendedTextMessage" && content.includes("audioMessage");
                let isQuotedContact =
                    type === "extendedTextMessage" && content.includes("contactMessage");
                let isQuotedDocument =
                    type === "extendedTextMessage" && content.includes("documentMessage");
                let sender = m.isGroup ?
                    m.key.participant ?
                    m.key.participant :
                    m.participant :
                    m.key.remoteJid;
                let senderNumber = sender.split("@")[0];
                let groupMetadata = m.isGroup ?
                    await RyuuBotz.groupMetadata(m.chat).catch((e) => {}) :
                    "";
                let participants =
                    m.isGroup && groupMetadata ? groupMetadata.participants : [];
                let groupAdmins = m.isGroup ?
                    await participants.filter((v) => v.admin !== null).map((v) => v.id) : [];
                let groupName = m.isGroup && groupMetadata ? groupMetadata.subject : [];
                let groupOwner = m.isGroup && groupMetadata ? groupMetadata.owner : [];
                let groupMembership =
                    m.isGroup && groupMetadata ? groupMetadata.membership : [];
                let groupMembers =
                    m.isGroup && groupMetadata ? groupMetadata.participants : [];
                let isBotAdmins = m.isGroup ? groupAdmins.includes(botLid) : false;
                let isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
                let isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
                let AdminOnly = m.isGroup ? adminOnly.includes(m.chat) : false
                let groupMute = m.isGroup ? mute.includes(m.chat) : false
                let rawPremium = premium.includes(m.sender);
                let rawPremiumGroup = premium.includes(m.chat);
                let isPremium = rawPremiumGroup || rawPremium || isCreator;
                let userRegistered = checkRegisteredUser(m.sender)
                let registeredUser = checkUserRegistered(m.sender);
                let isRegistered = userRegistered && registeredUser;
                let delay = ms => new Promise(resolve => setTimeout(resolve, ms))
                let deviceinfo = /^3A/.test(m.id) ? 'ɪᴏs' : m.id.startsWith('3EB') ? 'ᴡᴇʙ' : /^.{21}/.test(m.id) ? 'ᴀɴᴅʀᴏɪᴅ' : /^.{18}/.test(m.id) ? 'ᴅᴇsᴋᴛᴏᴘ' : 'ᴜɴᴋɴᴏᴡ';
                let ments = (text) => {
                    return text.match('@') ? [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net') : []
                }
                let froms = m.quoted ? m.quoted.sender : text ? (text.replace(/[^0-9]/g, '') ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false) : false;
                let mentionUser = [
                    ...new Set([
                        ...(m.mentionedJid || []),
                        ...(m.quoted ? [m.quoted.sender] : []),
                    ]),
                ];
                let Spath = './database/sticker-cmd.json'
                let stickerDB = fs.existsSync(Spath) ?
                    JSON.parse(fs.readFileSync(Spath)) : {}
                let mentionByTag =
                    type == "extendedTextMessage" &&
                    m.message.extendedTextMessage.contextInfo != null ?
                    m.message.extendedTextMessage.contextInfo.mentionedJid : [];
                let mentionByReply =
                    type == "extendedTextMessage" &&
                    m.message.extendedTextMessage.contextInfo != null ?
                    m.message.extendedTextMessage.contextInfo.participant || "" :
                    "";
                let numberQuery =
                    q.replace(new RegExp("[()+-/ +/]", "gi"), "") + "@s.whatsapp.net";
                let usernya = mentionByReply ? mentionByReply : mentionByTag[0];
                let Input = mentionByTag[0] ?
                    mentionByTag[0] :
                    mentionByReply ?
                    mentionByReply :
                    q ?
                    numberQuery :
                    false;

                let xtime = moment.tz("Asia/Jakarta").format("HH:mm:ss");
                let xdate = moment.tz("Asia/Jakarta").format("DD/MM/YYYY");
                let time2 = moment().tz("Asia/Jakarta").format("HH:mm:ss");
                if (time2 < "23:59:00") {
                    var timewisher = `Selamat Malam`;
                }
                if (time2 < "19:00:00") {
                    var timewisher = `Selamat Malam`;
                }
                if (time2 < "18:00:00") {
                    var timewisher = `Selamat Sore`;
                }
                if (time2 < "15:00:00") {
                    var timewisher = `Selamat Siang`;
                }
                if (time2 < "11:00:00") {
                    var timewisher = `Selamat Pagi`;
                }
                if (time2 < "05:00:00") {
                    var timewisher = `Selamat Pagi`;
                }
                let sekarang = new Date(
                    new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Jakarta"
                    }),
                );

                function tanggal(ms) {
                    return new Date(ms).getDate().toString().padStart(2, "0");
                }

                function bulan(ms) {
                    return (new Date(ms).getMonth() + 1).toString().padStart(2, "0");
                }

                function tahun(ms) {
                    return new Date(ms).getFullYear();
                }

                function formatJam(date) {
                    let jam = date.getHours().toString().padStart(2, "0");
                    let menit = date.getMinutes().toString().padStart(2, "0");
                    let detik = date.getSeconds().toString().padStart(2, "0");
                    return `${jam}:${menit}:${detik}`;
                }
                let futureDescription = `
📅 *Update Kurs:* ${tanggal(sekarang.getTime())}/${bulan(sekarang.getTime())}/${tahun(sekarang.getTime())}
🕰 *Waktu Jakarta (WIB):* ${formatJam(sekarang)}`;

                //Quoted\\
                let qmeta = {
                    key: {
                        participant: "13135550002@s.whatsapp.net",
                        remoteJid: "status@broadcast",
                    },
                    message: {
                        contactMessage: {
                            displayName: global.namabot,
                            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+62 852-9802-7445\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                            sendEphemeral: true,
                        },
                    },
                };
                let qbotz = {
                    key: {
                        participant: "6288704756515@s.whatsapp.net",
                        remoteJid: "status@broadcast",
                    },
                    message: {
                        contactMessage: {
                            displayName: global.namabot,
                            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=6288704756515:+62 887-0475-6515\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                            sendEphemeral: true,
                        },
                    },
                };

                let qgrup = {
                    key: {
                        participant: "6288704756515@s.whatsapp.net",
                        remoteJid: "status@broadcast",
                    },
                    message: {
                        contactMessage: {
                            displayName: "Minna!!",
                            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=6288704756515:+62 887-0475-6515\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                            sendEphemeral: true,
                        },
                    },
                };

                let qtext = {
                    key: {
                        remoteJid: "status@broadcast",
                        participant: "0@s.whatsapp.net",
                    },
                    message: {
                        extendedTextMessage: {
                            text: `${prefix + command}`,
                        },
                    },
                };

                let qbug = {
                    key: {
                        remoteJid: "status@broadcast",
                        fromMe: false,
                        participant: "0@s.whatsapp.net",
                    },
                    message: {
                        listResponseMessage: {
                            title: `${global.ownername}`,
                        },
                    },
                };

                let qdoc = {
                    key: {
                        participant: "0@s.whatsapp.net",
                        ...(m.chat ? {
                            remoteJid: "status@broadcast"
                        } : {}),
                    },
                    message: {
                        documentMessage: {
                            title: `${global.ownername}`,
                            jpegThumbnail: "",
                        },
                    },
                };

                let qloc = {
                    key: {
                        participant: "0@s.whatsapp.net",
                        ...(m.chat ? {
                            remoteJid: "status@broadcast"
                        } : {}),
                    },
                    message: {
                        locationMessage: {
                            name: `${global.ownername}`,
                            jpegThumbnail: "",
                        },
                    },
                };

                let qloc2 = {
                    key: {
                        participant: "0@s.whatsapp.net",
                        ...(m.chat ? {
                            remoteJid: "status@broadcast"
                        } : {}),
                    },
                    message: {
                        locationMessage: {
                            name: `${global.ownername}`,
                            jpegThumbnail: "",
                        },
                    },
                };

                let qpayment = {
                    key: {
                        remoteJid: "0@s.whatsapp.net",
                        fromMe: false,
                        id: `ownername`,
                        participant: "0@s.whatsapp.net",
                    },
                    message: {
                        requestPaymentMessage: {
                            currencyCodeIso4217: "USD",
                            amount1000: 999999999,
                            requestFrom: "0@s.whatsapp.net",
                            noteMessage: {
                                extendedTextMessage: {
                                    text: global.namabot,
                                },
                            },
                            expiryTimestamp: 999999999,
                            amount: {
                                value: 91929291929,
                                offset: 1000,
                                currencyCode: "USD",
                            },
                        },
                    },
                };

                let qtoko = {
                    key: {
                        fromMe: false,
                        participant: "0@s.whatsapp.net",
                        ...(m.chat ? {
                            remoteJid: "status@broadcast"
                        } : {}),
                    },
                    message: {
                        productMessage: {
                            product: {
                                productImage: {
                                    mimetype: "image/jpeg",
                                    jpegThumbnail: "",
                                },
                                title: `${global.ownername}`,
                                description: null,
                                currencyCode: "IDR",
                                priceAmount1000: "1000000000",
                                retailerId: `${global.ownername}`,
                                productImageCount: 1,
                            },
                            businessOwnerJid: "0@s.whatsapp.net",
                        },
                    },
                };

                let qlive = {
                    key: {
                        participant: "0@s.whatsapp.net",
                        ...(m.chat ? {
                            remoteJid: "status@broadcast"
                        } : {}),
                    },
                    message: {
                        liveLocationMessage: {
                            caption: `${global.ownername}`,
                            jpegThumbnail: "",
                        },
                    },
                };
                // Reply function 
                async function replymahiru(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.ownername,
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Mahiru-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://api.ryuu-dev.my.id/random/mahiru'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    });
                }

                async function reply(text, mention = []) {
                    let contextInfo = {
                        mentionedJid: mention,
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.namabot,
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: global.namabot,
                            description: global.ownername,
                            thumbnail: {
                                url: global.thumbnail.mini
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function reply_(text) {
                    let contextInfo = {
                        mentionedJid: [botNumber],
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.namabot,
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: global.namabot,
                            description: global.ownername,
                            thumbnail: {
                                url: global.thumbnail.mini
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                let replyafk = async (text) => {
                    let contextInfo = {
                        mentionedJid: [m.sender],
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.namabot,
                            newsletterJid: global.idSaluran
                        },
                        mentions: [m.sender],
                        previewThumbnail: {
                            title: 'Dia mau Afk',
                            description: global.ownername,
                            thumbnail: {
                                url: global.thumbnail.mini
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function replyalma(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.ownername,
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Alma-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://api.ryuu-dev.my.id/assets/bot/alma-ai.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    });
                }

                async function replymarin(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.ownername,
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Marin-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://cdn.aceimg.com/56310de3b.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    });
                }

                async function replyrio(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.ownername,
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Rio-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://files.catbox.moe/o2yq2c.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function replyelaina(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.ownername,
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Elaina-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://files.catbox.moe/j6uoif.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function replyaoi(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: 'Character AI',
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Aoi-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://files.catbox.moe/gy0b0m.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function replyamelia(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: 'Character AI',
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Amelia-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://files.catbox.moe/tlv50f.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function replyiroha(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: 'Character AI',
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Iroha-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://files.catbox.moe/ii8hg1.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function replymongfa(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: 'Character AI',
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Mongfa-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://files.catbox.moe/96e0td.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function replykarin(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: 'Character AI',
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Karin-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://files.catbox.moe/jjbu7b.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function replyitsuki(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.namabot,
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Itsuki-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://files.catbox.moe/iwxe5y.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                async function replymiku(text) {
                    let contextInfo = {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: global.namabot,
                            newsletterJid: global.idSaluran
                        },
                        previewThumbnail: {
                            title: 'Miku-AI',
                            description: global.ownername,
                            thumbnail: {
                                url: 'https://files.catbox.moe/no85cx.jpg'
                            },
                            sourceUrl: 'https://api.ryuu-dev.my.id',
                            favicon: {
                                url: "https://api.ryuu-dev.my.id/logo.png"
                            },
                            largerThumbnail: false
                        }
                    }
                    await RyuuBotz.sendMessage(m.chat, {
                        text,
                        contextInfo
                    }, {
                        quoted: m
                    })
                }

                let reply2 = (teks) => {
                    RyuuBotz.sendMessage(from, {
                        text: teks
                    }, {
                        quoted: m
                    })
                }
                async function autoRegister(m) {
                 if (!global.autoregister || isRegistered) return;
                    const nama = m.pushName || "User";
                    const nomor = m.sender.split("@")[0];
                    const serialUser = createSerial(20);
                    const timeNow = Date.now();
                    const limit = global.limitawal?.free || 25;

                    const detectOperator = (number) => {
                        const prefix = number.slice(0, 4);
                        const operators = {
                            Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0852", "0853", "0851"],
                            Indosat: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
                            XL: ["0817", "0818", "0819", "0859", "0877", "0878"],
                            Tri: ["0895", "0896", "0897", "0898", "0899"],
                            Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
                        };
                        for (const [name, prefixes] of Object.entries(operators)) {
                            if (prefixes.includes(prefix)) return name;
                        }
                        return "Tidak Diketahui";
                    };

                    const operator = detectOperator(
                        nomor.replace(/[^0-9]/g, "").replace(/^62/, "0").slice(0, 12)
                    );

                    if (typeof addRegisteredUser === 'function') addRegisteredUser(m.sender, nama, timeNow, limit, serialUser);
                    if (typeof createUserDatabase === 'function') createUserDatabase(m.sender);

                    let ppuser;
                    try {
                        ppuser = await RyuuBotz.profilePictureUrl(m.sender, "image");
                    } catch {
                        ppuser = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460960720.png?q=60";
                    }
                }
                let example = (teks) => {
                    return `\n *Contoh Penggunaan :*\n Ketik *${prefix+command}* ${teks}\n`
                }

                if (m.message) {
                    if (global.Client[RyuuBotz?.user?.id?.split(':')[0]]?.state?.autoread) {
                        RyuuBotz.readMessages([m.key]);
                    };
                    if (global.reactsw && m.key.remoteJid === "status@broadcast") {
                        let emote = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😭", "😉", "😗", "😙", "😚", "😘", "🥰", "😍", "🤩", "🥳", "🫠", "🙃", "🙂", "🥲", "🥹", "😊", "😌", "😏", "🤤", "😋", "😛", "😝", "😜", "🤪", "🫪", "😔", "🥺", "😬", "😑", "😐", "😶", "🫥", "🤐", "🤔", "🤫", "🫢", "🤭", "🥱", "🤗", "🫣", "😱", "🤨", "🧐", "😒", "🙄", "😤", "😠", "😡", "🤬", "😞", "😓", "😟", "😥", "😢", "🙁", "🫤", "😕", "😰", "😨", "😧", "😦", "😮", "😯", "😲", "😳", "🤯", "😖", "😣", "😩", "😫", "😵", "🫨", "🥴", "🥵", "🥶", "🤢", "🤮", "🫩", "😴", "😪", "🤧", "🤒", "🤕", "😷", "🤥", "😇", "🤠", "🤑", "🤓", "😎", "🥸", "🤡", "💩", "😈", "👿", "👻", "💀", "🤖", "👹", "👺", "👽", "👾", "🌚", "🌝", "🌞", "🌛", "🌜", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉", "🙊"];
                        let emotes = emote[Math.floor(Math.random() * emote.length)];
                        await RyuuBotz.sendMessage(m.sender, {
                            react: {
                                text: emotes,
                                key: m.key
                            }
                        });
                    };
                    if (isRegistered && !groupMute && !global.Client[RyuuBotz.user.id.split(':')[0]].state.self) {
                        addExperience(m.sender, reply);
                    };
                    let accent = chalk.hex("#FFB347")
                    let highlight = chalk.hex("#FFD369")
                    let dim = chalk.gray

                    let time = highlight(moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss'))
                    let rawTxt = body ? body : (m.mtype ? m.mtype : "Empty message");
                    let msgType = accent(rawTxt.length > 25 ? rawTxt.slice(0, 25) + '....' : rawTxt);
                    let keyId = `${chalk.white(m.key.id)}`
                    let sender = `${chalk.white(pushname)} ${dim(`<${m.sender}>`)}`
                    let location = m.isGroup ?
                        `${accent('👥 Group')} ${chalk.white(groupName)} ${dim(`(${m.chat})`)}` :
                        highlight('✉️ Private Chat')

                    logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, `
${highlight("╔══════════════════ ✦ MESSAGE LOG ✦ ══════════════════╗")}
 ${dim("│")} ⏰ ${chalk.cyan.bold("Time:")} ${time}
 ${dim("│")} 💬 ${chalk.cyan.bold("Message:")} ${msgType}
 ${dim("│")} 🙋 ${chalk.cyan.bold("Sender:")} ${sender}
 ${dim("│")} 🎮 ${chalk.cyan.bold("ID:")} ${keyId}
 ${dim("│")} 📍 ${chalk.cyan.bold("Location:")} ${location}
 ${dim("│")} 👑 ${chalk.cyan.bold("isCreator:")} ${isCreator ? "YES" : "NOPE"}
${highlight("╚═════════════════════════════════════════════════════╝")}
`)
                    updateChatCount(m);
                    if (global.debug) {
                        logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, JSON.stringify(m, null, 2));
                    }
                };


                // ─────乂  ALL FUNCTION ────乂 \\
                function saveStickerDB() {
                    fs.writeFileSync(Spath, JSON.stringify(stickerDB, null, 2))
                }
                let botNum = RyuuBotz.user.id.split(":")[0];
                let senderNum = m.sender.split("@")[0];

                // apakah session ini bot utama?
                let isMainBot =
                    botNum === global.nomorbot;

                // self mode session ini
                let isSelf =
                    global.Client?.[botNum]?.state?.self === true;

                // semua participant grup
                let participantNumbers = participants
                    .map(v => v.phoneNumber?.split("@")[0])
                    .filter(Boolean);

                // ========================
                // AMBIL SEMUA JADIBOT
                // ========================

                let baseDir = "./database/jadibot/";

                let dirs = fs.readdirSync(baseDir)
                    .filter(d => {
                        let fullPath = path.join(baseDir, d);

                        let match = d.match(
                            /^(\d+)\[(running|stopping)\]$/
                        );

                        if (!match) return false;

                        return fs
                            .statSync(fullPath)
                            .isDirectory();
                    });

                let jadibotNumbers = dirs
                    .map(d =>
                        d.match(
                            /^(\d+)\[(running|stopping)\]$/
                        )?.[1]
                    )
                    .filter(Boolean);
                let otherBotsInGroup =
                    participantNumbers.some(num =>
                        jadibotNumbers.includes(num) &&
                        num !== botNum
                    );

                // ========================
                // RULE 1
                // kalau bot utama ada di grup,
                // semua jadibot diam
                // ========================

                let mainBotInGroup =
                    participantNumbers.includes(
                        global.nomorbot
                    );

                if (
                    mainBotInGroup &&
                    !isMainBot
                ) {
                    return;
                }

                // ========================
                // RULE 2 - 5
                // ========================

                // kalau session ini self,
                // jangan respon apapun
                // biarkan bot lain yang respon
                if (
                    (!isCreator && isSelf) &&
                    !isMainBot &&
                    otherBotsInGroup
                ) {
                    return;
                }

                // ========================
                // skip command dari
                // nomor bot sendiri
                //
                // CONTOH:
                // A kirim command
                // maka A diam
                // B respon
                //
                // TAPI:
                // kalau self aktif,
                // aturan ini dipatahkan
                // ========================

                if (
                    senderNum === botNum &&
                    otherBotsInGroup
                ) {
                    return;
                }

                if (!m.isGroup && global.onlyGc) {
                    return;
                }
                if (global.Client[RyuuBotz.user.id.split(':')[0]].state.self || groupMute) {
                    if (!isCreator && !m.fromMe) {
                        return;
                    }
                }

                if (!budy.startsWith('=>') && !budy.startsWith('>>') && !budy.startsWith('$') && /(>>|=>|\$|\.backup)/.test(budy) && !isCreator && isCmd && !global.Client[RyuuBotz.user.id.split(':')[0]].state.self) return m.reply("Kau siapo kampang?");

                if (m.isGroup && AdminOnly && !isAdmins) {
                    return;
                }

                async function RyuuCloud(filePath) {
                    try {
                        let fileStream = fs.createReadStream(filePath);
                        let formData = new BodyForm();
                        formData.append('file', fileStream);
                        let response = await axios.post('https://files.ryuu-dev.my.id/api/upload', formData, {
                            headers: {
                                ...formHeaders
                            },
                        });
                        return response.data;
                    } catch (error) {
                        logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, "Error at RyuuCloud uploader:", error);
                        return "Terjadi kesalahan saat upload ke RyuuCloud.";
                    }
                };

                async function CatBox(filePath) {
                    try {
                        let fileStream = fs.createReadStream(filePath);
                        let formData = new BodyForm();
                        formData.append('fileToUpload', fileStream);
                        formData.append('reqtype', 'fileupload');
                        formData.append('userhash', '');
                        let response = await axios.post('https://catbox.moe/user/api.php', formData, {
                            headers: {
                                ...formData.getHeaders(),
                            },
                        });
                        return response.data;
                    } catch (error) {
                        logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, "Error at Catbox uploader:", error);
                        return "Terjadi kesalahan saat upload ke Catbox.";
                    }
                };

                async function TempFile(input) {
                    return new Promise(async (resolve, reject) => {
                        let form = new BodyForm();
                        form.append("files[]", fs.createReadStream(input))
                        await axios({
                            url: "https://uguu.se/upload.php",
                            method: "POST",
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
                                ...form.getHeaders()
                            },
                            data: form
                        }).then((data) => {
                            resolve(data.data.files[0])
                        }).catch((err) => reject(err))
                    })
                }

                async function loadingBar(m, RyuuBotz) {
                    try {
                        if (BarLoad) {
                            let createProgressBar = (value, maxValue, length) => {
                                let percentage = value / maxValue;
                                let progress = Math.round(length * percentage);
                                let empty = length - progress;
                                return `[${"█".repeat(progress)}${"░".repeat(empty)}]`;
                            };

                            let progress = 0;
                            let message = await RyuuBotz.sendMessage(
                                m.chat, {
                                    text: `Loading...\n${createProgressBar(progress, 100, 20)} ${progress}%`
                                }, {
                                    quoted: m
                                }
                            );

                            while (progress < 100) {
                                await global.sleep(500);
                                progress += 5;
                                let newText = `Loading...\n${createProgressBar(progress, 100, 20)} ${progress}%`;

                                await RyuuBotz.relayMessage(
                                    m.chat, {
                                        protocolMessage: {
                                            key: message.key,
                                            type: 14,
                                            editedMessage: {
                                                conversation: newText
                                            }
                                        }
                                    }, {}
                                );
                            }

                            let finalText = `Loading Selesai!!!`;
                            await RyuuBotz.relayMessage(
                                m.chat, {
                                    protocolMessage: {
                                        key: message.key,
                                        type: 14,
                                        editedMessage: {
                                            conversation: finalText
                                        }
                                    }
                                }, {}
                            );

                            return message;
                        } else {
                            await RyuuBotz.sendMessage(m.chat, {
                                react: {
                                    text: '⏱️',
                                    key: m.key
                                }
                            });
                        }
                    } catch (err) {
                        logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, 'error bang :v', err);
                        reply(`Yah error ${err}`);
                    }
                }

                async function sendconnMessage(chatId, message, options = {}) {
                    let generate = await generateWAMessage(chatId, message, options);
                    let type2 = getContentType(generate.message);
                    if ("contextInfo" in options)
                        generate.message[type2].contextInfo = options?.contextInfo;
                    if ("contextInfo" in message)
                        generate.message[type2].contextInfo = message?.contextInfo;
                    return await RyuuBotz.relayMessage(chatId, generate.message, {
                        messageId: generate.key.id,
                    });
                }

                function GetType(Data) {
                    return new Promise((resolve, reject) => {
                        let Result, Status;
                        if (Buffer.isBuffer(Data)) {
                            Result = new Buffer.from(Data).toString("base64");
                            Status = 0;
                        } else {
                            Status = 1;
                        }
                        resolve({
                            status: Status,
                            result: Result,
                        });
                    });
                }

                function randomId() {
                    return Math.floor(100000 + Math.random() * 900000);
                }

                function monospace(string) {
                    return '```' + string + '```'
                }

                function monospa(string) {
                    return '`' + string + '`'
                }

                function getRandomFile(ext) {
                    return `${Math.floor(Math.random() * 10000)}${ext}`;
                }

                function pickRandom(list) {
                    return list[Math.floor(Math.random() * list.length)]
                }

                function randomNomor(min, max = null) {
                    if (max !== null) {
                        min = Math.ceil(min);
                        max = Math.floor(max);
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    } else {
                        return Math.floor(Math.random() * min) + 1
                    }
                }

                function generateRandomPassword() {
                    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#%^&*';
                    let length = 10;
                    let password = '';
                    for (let i = 0; i < length; i++) {
                        let randomIndex = Math.floor(Math.random() * characters.length);
                        password += characters[randomIndex];
                    }
                    return password;
                }

                function generateRandomNumber(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                async function listbut2(m, teks, listnye, qtext) {
                    let msg = generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                "messageContextInfo": {
                                    "deviceListMetadata": {},
                                    "deviceListMetadataVersion": 2
                                },
                                interactiveMessage: proto.Message.InteractiveMessage.create({
                                    contextInfo: {
                                        mentionedJid: [m.sender],
                                        forwardingScore: 999999,
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: `120363405649403674@newsletter`,
                                            newsletterName: `— ${namabot} AI WhatsApp Bot`,
                                            serverMessageId: 145
                                        }
                                    },
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text: teks
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: `${namabot} By ${ownername}`
                                    }),
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        title: ``,
                                        thumbnailUrl: "",
                                        gifPlayback: true,
                                        subtitle: "",
                                        hasMediaAttachment: true,
                                        ...(await prepareWAMessageMedia({
                                            image: {
                                                url: 'https://files.catbox.moe/rj0ok0.jpg'
                                            }
                                        }, {
                                            upload: RyuuBotz.waUploadToServer
                                        })),
                                    }),
                                    gifPlayback: true,
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        buttons: [{
                                            "name": "single_select",
                                            "buttonParamsJson": JSON.stringify(listnye)
                                        }],
                                    }),
                                })
                            }
                        }
                    }, {
                        quoted: qtext
                    })
                    await RyuuBotz.relayMessage(msg.key.remoteJid, msg.message, {
                        messageId: msg.key.id
                    })
                }

                async function dellCase(filePath, caseNameToRemove) {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) {
                            logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, 'Terjadi kesalahan:', err);
                            return;
                        }

                        let regex = new RegExp(`case\\s+'${caseNameToRemove}':[\\s\\S]*?break`, 'g');
                        let modifiedData = data.replace(regex, '');

                        fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
                            if (err) {
                                logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, 'Terjadi kesalahan saat menulis file:', err);
                                return;
                            }

                            logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, `Teks dari case '${caseNameToRemove}' telah dihapus dari file.`);
                        });
                    });
                }
                let ryuu_dev = {
                    startsesi,
                    global,
                    logger,
                    RyuuBotz,
                    prefix,
                    command,
                    reply,
                    replyafk,
                    afkDB,
                    text,
                    isGroup: m.isGroup,
                    isCreator,
                    example,
                    sender,
                    senderNumber,
                    isSticker,
                    pushname,
                    args,
                    runtime,
                    formatp,
                    sleep,
                    getBuffer,
                    isBotAdmins,
                    isAdmins,
                    isCmd,
                    qtext,
                    isPremium,
                    randomNomor,
                    monospace,
                    pickRandom,
                    getRandomFile,
                    groupMetadata,
                    saveAFK,
                    participants,
                    createSerial,
                    deviceinfo,
                    isRegistered,
                    addRegisteredUser,
                    removeRegisteredUser,
                    db,
                    q,
                    replykarin,
                    replymongfa,
                    replyiroha,
                    replyamelia,
                    replyaoi,
                    replymarin,
                    replymahiru,
                    replyelaina,
                    replyrio,
                    replymiku,
                    replyitsuki,
                    replyalma,
                    mime,
                    quoted,
                    qgrup,
                    loadingBar,
                    checkName,
                    stickerDB,
                    saveStickerDB,
                    isAsync,
                    budy,
                    util,
                    exec,
                    createUserDatabase,
                    deleteUserDatabase,
                    addExperience,
                    addMoney,
                    setClaimedTrue,
                    addUserLimit,
                    delMoney,
                    TempFile,
                    chatUpdate,
                    isSticker,
                    isImage,
                    plugins,
                    body,
                    groupAdmins,
                    saveClientState,
                    store,
                    appenTextMessage,
                    startJadiBot, 
                    stopJadiBot 
                };

                if (isCmd) {
                    let pluginCommands = [];
                    for (let plugin of [...global.plugins.values()]) {
                        if (plugin.command) {
                            pluginCommands.push(...plugin.command.map(c => c.toLowerCase()));
                        }
                    }

                    let tulung = [...new Set(pluginCommands)];
                    let code = fs.readFileSync("./engines/handler.js", "utf8");
                    let regex = /case\s+['"`]([^'"`]+)['"`]:/g;
                    let matches = [];
                    let match;

                    while ((match = regex.exec(code))) {
                        matches.push(match[1]);
                    }

                    let tulong = Object.values(matches)
                        .flatMap(v => v ?? [])
                        .map(entry => entry.trim().split(' ')[0].toLowerCase())
                        .filter(Boolean);

                    if ((tulung.includes(command.toLowerCase()) || tulong.includes(command)) &&
                        !isRegistered && !['daftar', 'regis', 'register'].includes(command) && !m.fromMe) {
                        if (!global.autoregister) return reply(mess.notregist);
                        await autoRegister(m);
                    } else if (tulung.includes(command.toLowerCase()) || tulong.includes(command)) {
                        await RyuuBotz.sendPresenceUpdate('composing', m.chat);
                    }
                }

                if (!global.task[m.chat]) {
                    global.task[m.chat] = {
                        task: false
                    };
                }
                if (!global.disable.plugins) {
                    for (let plugin of [...global.plugins.values()]) {
                        let runPlugin = plugin.default || plugin;
                        if (runPlugin.code && runPlugin.event === undefined) {
                            runPlugin.group ??= false
                            runPlugin.premium ??= false
                            runPlugin.limit ??= false
                            runPlugin.admin ??= false
                            runPlugin.creator ??= false
                            runPlugin.botAdmin ??= false
                            runPlugin.privates ??= false
                            runPlugin.usePrefix ??= true
                            runPlugin.disable ??= false
                        };

                        if (
                            typeof runPlugin.event === "function" &&
                            !runPlugin.command &&
                            runPlugin.usePrefix === undefined &&
                            runPlugin.disable === undefined &&
                            rawTxt.toLowerCase() !== "empty message"
                        ) {
                            await runPlugin.event(m, ryuu_dev);
                            continue;
                        }
                        if (!runPlugin.command) continue;

                        if (runPlugin.usePrefix === true && !isCmd) continue;
                        if (runPlugin.usePrefix === false && isCmd) continue;
                        if (runPlugin.usePrefix === undefined && !isCmd) continue;

                        if (runPlugin.usePrefix === false) {
                            let isMatch = runPlugin.command?.some(cmd => budy.startsWith(cmd));

                            if (!isMatch) continue;
                        }

                        if (runPlugin.usePrefix === true) {
                            if (!runPlugin.command?.includes(command.toLowerCase())) continue;
                        }

                        if (global.task[m.chat].task && runPlugin.usePrefix) {
                            return reply("*Bentar kak lagi ada perintah lain...* 🍡✨");
                        } else {
                            global.task[m.chat].task = true;
                        }

                        if (runPlugin.group && !m.isGroup) {
                            reply(global.mess.group);
                            global.task[m.chat] = {
                                task: false
                            };
                            return;
                        }
                        if (runPlugin.privates && m.isGroup) {
                            reply(global.mess.private);
                            global.task[m.chat] = {
                                task: false
                            };
                            return;
                        }
                        if (runPlugin.premium && !isPremium) {
                            reply(global.mess.premium);
                            global.task[m.chat] = {
                                task: false
                            };
                            return;
                        }
                        if (runPlugin.admin && !isAdmins && !m.fromMe) {
                            reply(global.mess.admin);
                            global.task[m.chat] = {
                                task: false
                            };
                            return;
                        }
                        if (runPlugin.creator && !isCreator) {
                            reply(global.mess.creator);
                            global.task[m.chat] = {
                                task: false
                            };
                            return;
                        }
                        if (runPlugin.botAdmin && !isBotAdmins) {
                            reply(global.mess.botAdmin);
                            global.task[m.chat] = {
                                task: false
                            };
                            return;
                        }
                        if (runPlugin.disable) {
                            reply(global.mess.disable);
                            global.task[m.chat] = {
                                task: false
                            };
                            return;
                        }

                        if (runPlugin.limit && runPlugin.usePrefix === true) {
                            if (isRegistered && !m.fromMe) {
                                if (!isCreator && !isPremium) {
                                    if (isLimit) {
                                        reply(global.mess.endLimit);
                                        global.task[m.chat] = {
                                            task: false
                                        };
                                        return;
                                    }
                                    reduceUserLimit(m.sender);
                                    reply(`Limit kamu berkurang 1`);
                                }
                            }
                        }
                        if (blacklist.includes(m.sender)) return

                        if (typeof runPlugin === "function" &&
                            rawTxt.toLowerCase() !== "empty message") {
                            await global.sleep(700);
                            try {
                                await runPlugin(m, ryuu_dev);
                            } finally {
                                await global.sleep(1000);
                                global.task[m.chat].task = false;
                                await RyuuBotz.sendMessage(m.chat, {
                                    react: {
                                        text: "",
                                        key: m.key
                                    }
                                });
                            }
                        } else if (typeof runPlugin.code === "function" &&
                            rawTxt.toLowerCase() !== "empty message") {
                            await global.sleep(700);
                            try {
                                await runPlugin.code(m, ryuu_dev);
                            } finally {
                                await global.sleep(1000);
                                global.task[m.chat].task = false;
                                await RyuuBotz.sendMessage(m.chat, {
                                    react: {
                                        text: "",
                                        key: m.key
                                    }
                                });
                            }
                        } else {
                            console.error(`[PLUGIN WARNING] Plugin "${runPlugin.command?.[0]}" bukan fungsi valid.`);
                        }
                    }
                }
        // End of plugins function 
                

        //Type CASE command
        if (isCmd) {
          if (!global.disable.case) {
                switch (command) {
                    case 'addcase': {
                        if (!isCreator) return reply(mess.creator)
                        if (!text) return reply('Mana case nya');
                        let namaFile = 'handler.js';
                        let caseBaru = `${text}`;
                        fs.readFile(namaFile, 'utf8', (err, data) => {
                            if (err) {
                                logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, 'Terjadi kesalahan saat membaca file:', err);
                                return;
                            }
                            let posisiAwalGimage = data.indexOf("case 'addcase':");

                            if (posisiAwalGimage !== -1) {
                                let kodeBaruLengkap = data.slice(0, posisiAwalGimage) + '\n' + caseBaru + '\n' + data.slice(posisiAwalGimage);
                                fs.writeFile(namaFile, kodeBaruLengkap, 'utf8', (err) => {
                                    if (err) {
                                        reply('Terjadi kesalahan saat menulis file:', err);
                                    } else {
                                        reply(mess.success);
                                    }
                                });
                            } else {
                                reply('Tidak dapat menambahkan case dalam file.');
                            }
                        });

                    }
                    break
                    case 'getcase': {
                        if (!isCreator) return reply(mess.creator)
                        if (!text) return reply('Case apa bang?');

                        try {
                            let fileContent = fs.readFileSync('./engines/handler.js', 'utf8')

                            let casePattern1 = `case "${text}"`
                            let casePattern2 = `case '${text}'`

                            let startIndex = -1
                            let caseDeclaration = ''

                            if (fileContent.includes(casePattern1)) {
                                startIndex = fileContent.indexOf(casePattern1)
                                caseDeclaration = casePattern1
                            } else if (fileContent.includes(casePattern2)) {
                                startIndex = fileContent.indexOf(casePattern2)
                                caseDeclaration = casePattern2
                            } else {
                                return reply(`❌ Case "${text}" tidak ditemukan.`)
                            }

                            let caseContentFromStart = fileContent.substring(startIndex)
                            let breakIndex = caseContentFromStart.indexOf('break')

                            if (breakIndex === -1) return reply('❌ Tidak menemukan akhir dari case (break).')

                            let finalCaseContent = caseContentFromStart.substring(0, breakIndex + 5)
                            reply(`✅ Isi case *${text}*:\n\n\`\`\`js\n${finalCaseContent}\n\`\`\``)
                        } catch (err) {
                            logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, err)
                            reply('❌ Terjadi kesalahan saat mengambil case.')
                        }
                    }
                    break
                    case 'delcase': {
                        if (!isCreator) return reply(mess.creator)
                        if (!text) return reply('Mana case nya bang?');
                        dellCase('./engines/handler.js', q)
                        reply('Berhasil menghapus case!.');
                    }
                    break
                    /* ====================== OWNER ====================== */
                    case "owner": {
                        try {
                            let owner = global.ownernumber;

                            function formatNomor(nomor) {
                                nomor = nomor.replace(/\D/g, "");

                                if (!nomor.startsWith("62"))
                                    return "Format salah, harus diawali 62";

                                let kodeNegara = "+62";
                                let bagian1 = nomor.slice(2, 5);
                                let bagian2 = nomor.slice(5, 9);
                                let bagian3 = nomor.slice(9);

                                return `${kodeNegara} ${bagian1}-${bagian2}-${bagian3}`;
                            }

                            let ownerEdit = formatNomor(owner);

                            let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${global.ownername}
ORG:The Developer Of ${global.namabot};
TEL;type=CELL;type=VOICE;waid=${owner}:${ownerEdit}
URL: https://api.ryuu-dev.my.id
END:VCARD
        `.trim();

                            await RyuuBotz.sendMessage(
                                m.chat, {
                                    contacts: {
                                        displayName: "Ryuu Reinzz",
                                        contacts: [{
                                            vcard
                                        }]
                                    }
                                }, {
                                    quoted: m
                                }
                            );

                            global.sleep(500);

                            reply(
                                "Semua transaksi di luar command `.owner` tidak di tanggung oleh developer asli *Ryuu Reinzz*, jika ada pembelian di luar command `.owner`, developer tidak bertanggung jawab atas apa yang terjadi"
                            );
                        } catch (e) {
                            RyuuBotz.sendMessage(m.chat, {
                                text: typeof e === "string" ?
                                    e : "🚫 *Terjadi kesalahan saat memproses permintaan.*",
                                quoted: m
                            });
                        } finally {
                            await RyuuBotz.sendMessage(m.chat, {
                                react: {
                                    text: "✅",
                                    key: m.key
                                }
                            });
                        }
                    }
                    break;

                    /* ====================== RUNTIME ====================== */
                    case "runtime": {
                        let lowq = `*@${botNumber.split("@")[0]} Telah Online Selama:*\n${runtime(
        process.uptime()
      )}`;
                        reply_(lowq);
                    }
                    break;

                    /* ====================== DEFAULT ====================== */
                    default:
                }
            }
        }

        /* ====================== EVAL ====================== */
   if (global.devCommand)  {
        if (budy.startsWith("=>")) {
            if (!isCreator) return;
            if (!isAsync) return reply("There is no word to execute");

            let _text = budy.slice(2).trim();

            try {
                let evaled = await eval(`(async () => { ${_text} })();`);
                if (typeof evaled !== "string")
                    evaled = util.inspect(evaled);

                await m.reply(
                    `*Input:*\n${budy.slice(2)}\n\n*___________________________*\n${global.kosong} *Output:*\n${evaled}`
                );
            } catch (err) {
                await m.reply(String(err));
            }
        }

        if (budy.startsWith('>>')) {
            if (!isCreator) return;
            if (!isAsync) return reply("There is no word to execute");
            let _text = budy.slice(2).trim();
            try {
                let evaled = await eval(_text);
                if (typeof evaled !== 'string') evaled = util.inspect(evaled);
                let output = `*Input:*\n${budy.slice(2)}\n\n*___________________________*\n${global.kosong} *Output:*\n${evaled}`;
                await m.reply(output);
            } catch (err) {
                await m.reply(String(err));
            }
        }

        if (budy.startsWith('$')) {
            if (!isCreator) return;
            exec(budy.slice(2), (err, stdout) => {
                if (err) return m.reply(`${err}`)
                let output = `*Input:*\n${budy.slice(2)}\n\n*___________________________*\n${global.kosong} *Output:*\n${stdout}`;
                if (stdout) return m.reply(output)
               })
            }
        }
    } catch (err) {
        logger.add(`database/logger/bot-${RyuuBotz.user.id.split(":")[0]}.log`, util.format(err))
    }
}