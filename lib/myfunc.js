import {
    proto,
    delay,
    getContentType,
    areJidsSameUser,
    generateWAMessage
} from "@ryuu-reinzz/baileys";
import fs from "fs";
import Crypto from "crypto";
import path, {
    dirname
} from "path";
import util from "util";
import {
    fileURLToPath
} from "url";
import {
    defaultMaxListeners
} from "events";
import chalk from "chalk";
import axios from "axios";
import moment from "moment";
import {
    sizeFormatter
} from "human-readable";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

export const generateMessageTag = (epoch) => {
    let tag = unixTimestampSeconds().toString()
    if (epoch) tag += ".--" + epoch
    return tag
}

export const formatp = sizeFormatter({
    std: "JEDEC",
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})

export const processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

export const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

export const getBuffer = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "get",
            url,
            headers: {
                DNT: 1,
                "Upgrade-Insecure-Request": 1,
            },
            ...options,
            responseType: "arraybuffer",
        })
        return res.data
    } catch (err) {
        return err
    }
}

export const capital = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export const fetchJson = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "GET",
            url: url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
            },
            ...options,
        })
        return res.data
    } catch (err) {
        return err
    }
}

export function runtime(seconds) {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor((seconds % (3600 * 24)) / 3600)
    var m = Math.floor((seconds % 3600) / 60)
    var s = Math.floor(seconds % 60)
    var dDisplay = d > 0 ? d + (d == 1 ? " hari, " : " hari, ") : ""
    var hDisplay = h > 0 ? h + (h == 1 ? " jam, " : " jam, ") : ""
    var mDisplay = m > 0 ? m + (m == 1 ? " menit, " : " menit, ") : ""
    var sDisplay = s > 0 ? s + (s == 1 ? " detik" : " detik") : ""
    return dDisplay + hDisplay + mDisplay + sDisplay
}

export const clockString = (ms) => {
    let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60
    return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":")
}

export const sleep = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const isUrl = (url) => {
    return url.match(
        new RegExp(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
            "gi"
        )
    )
}

export const getTime = (format, date) => {
    if (date) {
        return moment(date).locale("id").format(format)
    } else {
        return moment.tz("Asia/Jakarta").locale("id").format(format)
    }
}

export const formatDate = (n, locale = "id") => {
    let d = new Date(n)
    return d.toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    })
}

export const tanggal = (numer) => {
    let myMonths = [
        "𝖩𝖺𝗇𝗎𝖺𝗋𝗂",
        "𝖥𝖾𝖻𝗋𝗎𝖺𝗋𝗂",
        "𝖬𝖺𝗋𝖾𝗍",
        "𝖠𝗉𝗋𝗂𝗅",
        "𝖬𝖾𝗂",
        "𝖩𝗎𝗇𝗂",
        "𝖩𝗎𝗅𝗂",
        "𝖠𝗀𝗎𝗌𝗍𝗎𝗌",
        "𝖲𝖾𝗉𝗍𝖾𝗆𝖻𝖾𝗋",
        "𝖮𝗄𝗍𝗈𝖻𝖾𝗋",
        "𝖭𝗈𝗏𝖾𝗆𝖻𝖾𝗋",
        "𝖣𝖾𝗌𝖾𝗆𝖻𝖾𝗋",
    ]
    let myDays = [
        "𝖬𝗂𝗇𝗀𝗀𝗎",
        "𝖲𝖾𝗇𝗂𝗇",
        "𝖲𝖾𝗅𝖺𝗌𝖺",
        "𝖱𝖺𝖻𝗎",
        "𝖪𝖺𝗆𝗂𝗌",
        "𝖩𝗎𝗆𝖺𝗍",
        "𝖲𝖺𝖻𝗍𝗎",
    ]
    var tgl = new Date(numer)
    var day = tgl.getDate()
    return `${day}`
}

export const day = (numer) => {
    let myDays = [
        "𝖬𝗂𝗇𝗀𝗀𝗎",
        "𝖲𝖾𝗇𝗂𝗇",
        "𝖲𝖾𝗅𝖺𝗌𝖺",
        "𝖱𝖺𝖻𝗎",
        "𝖪𝖺𝗆𝗂𝗌",
        "𝖩𝗎𝗆𝖺𝗍",
        "𝖲𝖺𝖻𝗍𝗎",
    ]
    var tgl = new Date(numer)
    var thisDay = tgl.getDay()
    thisDay = myDays[thisDay]
    return `${thisDay}`
}

export const bulan = (numer) => {
    let myMonths = [
        "𝖩𝖺𝗇𝗎𝖺𝗋𝗂",
        "𝖥𝖾𝖻𝗋𝗎𝖺𝗂",
        "𝖬𝖺𝗋𝖾𝗍",
        "𝖠𝗉𝗋𝗂𝗅",
        "𝖬𝖾𝗂",
        "𝖩𝗎𝗇𝗂",
        "𝖩𝗎𝗅𝗂",
        "𝖠𝗀𝗎𝗌𝗍𝗎𝗌",
        "𝖲𝖾𝗉𝗍𝖾𝗆𝖻𝖾𝗋",
        "𝖮𝗄𝗍𝗈𝖻𝖾𝗋",
        "𝖭𝗈𝗏𝖾𝗆𝖻𝖾𝗋",
        "𝖣𝖾𝗌𝖾𝗆𝖻𝖾𝗋",
    ]
    var tgl = new Date(numer)
    var bulan = tgl.getMonth()
    return `${myMonths[bulan]}`
}

export const tahun = (numer) => {
    var tgl = new Date(numer)
    var yy = tgl.getYear()
    var year = yy < 1000 ? yy + 1900 : yy
    return `${year}`
}

export async function checkTheNumber(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error("\x1b[31m[ERROR] File tidak ditemukan!\x1b[0m");
            return;
        }
        const moduleURL = path.resolve(filePath);
        const imported = await import(`file://${moduleURL}`);
        if (typeof imported.whitelistChecking !== "function") {
            console.error(
                "\x1b[31m[TECH WARNING]\nYou wanna crack this bot?!, HAHA\n\x1b[0m"
            );
        }
        return imported;
    } catch (err) {
        console.error("\x1b[31m[ERROR] Gagal load modul:\x1b[0m", err);
    }
}

export const weton = (numer) => {
    let weton = ["Pahing", "Pon", "Wage", "Kliwon", "Legi"]
    let d = new Date()
    let gmt = new Date(0).getTime() - new Date("1 January 1970").getTime()
    return `${weton[Math.floor(((d * 1) + gmt) / 84600000) % 5]}`
}

export const jsonformat = (string) => {
    return JSON.stringify(string, null, 2)
}

function format(...args) {
    return util.format(...args)
}

export const logic = (check, inp, out) => {
    if (inp.length !== out.length) throw new Error("Input and Output must have same length")
    for (let i in inp)
        if (util.isDeepStrictEqual(check, inp[i])) return out[i]
    return null
}

export const bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export const getSizeMedia = (path) => {
    return new Promise((resolve, reject) => {
        if (/http/.test(path)) {
            axios.get(path).then((res) => {
                let length = parseInt(res.headers["content-length"])
                let size = bytesToSize(length, 3)
                if (!isNaN(length)) resolve(size)
            })
        } else if (Buffer.isBuffer(path)) {
            let length = Buffer.byteLength(path)
            let size = bytesToSize(length, 3)
            if (!isNaN(length)) resolve(size)
        } else {
            reject("error")
        }
    })
}

export const parseMention = (text = "") => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net")
}

export const getGroupAdmins = (participants) => {
    let admins = []
    for (let i of participants) {
        i.admin === "superadmin" ?
            admins.push(i.id) :
            i.admin === "admin" ?
            admins.push(i.id) :
            ""
    }
    return admins || []
}

export const smsg = (RyuuBotz, m, store) => {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith("@g.us")
        m.sender = RyuuBotz.decodeJid(
            (m.fromMe && RyuuBotz.user.id) || m.participant || m.key.participant || m.chat || ""
        )
        if (m.isGroup) m.participant = RyuuBotz.decodeJid(m.key.participant) || ""
    }
    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg =
            m.mtype === "viewOnceMessage" ?
            m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] :
            m.message[m.mtype]
        m.body =
            m.message?.conversation ||
            m.msg?.caption ||
            m.msg?.text ||
            (m.mtype === "listResponseMessage" && m.msg?.singleSelectReply?.selectedRowId) ||
            (m.mtype === "buttonsResponseMessage" && m.msg?.selectedButtonId) ||
            (m.mtype === "viewOnceMessage" && m.msg?.caption) ||
            m.text ||
            ""

        let quoted = (m.quoted = m.msg?.contextInfo?.quotedMessage || null)
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0]
            m.quoted = m.quoted[type]
            if (["productMessage"].includes(type)) {
                type = Object.keys(m.quoted)[0]
                m.quoted = m.quoted[type]
            }
            if (typeof m.quoted === "string") m.quoted = {
                text: m.quoted
            }
            m.quoted.mtype = type || "nothing"
            m.quoted.id = m.msg?.contextInfo?.stanzaId
            m.quoted.chat = m.msg?.contextInfo?.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ?
                m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16 :
                false
            m.quoted.sender = RyuuBotz.decodeJid(m.msg?.contextInfo?.participant)
            m.quoted.fromMe = m.quoted.sender === RyuuBotz.decodeJid(RyuuBotz.user.lid)

            m.quoted.text =
                m.quoted.text ||
                m.quoted.caption ||
                m.quoted.conversation ||
                m.quoted.contentText ||
                m.quoted.selectedDisplayText ||
                m.quoted.title ||
                ""
            m.quoted.mentionedJid = m.msg?.contextInfo?.mentionedJid || []
            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false
                let q = await store.loadMessage(m.chat, m.quoted.id, RyuuBotz)
                return smsg(RyuuBotz, q, store)
            }
            let vM = (m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id,
                },
                message: quoted,
                ...(m.isGroup ? {
                    participant: m.quoted.sender
                } : {}),
            }))

            m.quoted.delete = () => RyuuBotz.sendMessage(m.quoted.chat, {
                delete: vM.key
            })
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
                RyuuBotz.copyNForward(jid, vM, forceForward, options)
            m.quoted.download = () => RyuuBotz.downloadMediaMessage(m.quoted)
        }
    }
    if (m.msg?.url) m.download = () => RyuuBotz.downloadMediaMessage(m.msg)
    m.text =
        m.msg?.text ||
        m.msg?.caption ||
        m.message?.conversation ||
        m.msg?.contentText ||
        m.msg?.selectedDisplayText ||
        m.msg?.title ||
        ""
    m.reply = (text, chatId = m.chat, options = {}) =>
        Buffer.isBuffer(text) ?
        RyuuBotz.sendMedia(chatId, text, "file", "", m, {
            ...options
        }) :
        RyuuBotz.sendText(chatId, text, m, {
            ...options
        })
    m.copy = () => smsg(RyuuBotz, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
        RyuuBotz.copyNForward(jid, m, forceForward, options)

    return m
}

export const fetchBuffer = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "GET",
            url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36",
                DNT: 1,
                "Upgrade-Insecure-Request": 1,
            },
            ...options,
            responseType: "arraybuffer",
        })
        return res.data
    } catch (err) {
        return err
    }
}

export async function whitelistChecking({
    fs,
    chalk,
    fetch
}) {
    const url = "https://api.ryuu-dev.my.id//assest/bot/whitelist-checker.mjs";
    const code = await fetch(url).then(res => res.text());
    const RYUU = await import(`data:text/javascript,${encodeURIComponent(code)}`);
    return await RYUU.checkWhitelist({
        fs,
        chalk,
        fetch
    });
}

fs.watchFile(__filename, () => {
    fs.unwatchFile(__filename)
    console.log(chalk.redBright(`${__filename} Update`))
    import(`${__filename}?update=${Date.now()}`)
})