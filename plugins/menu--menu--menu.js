import "../settings.js"
import {
    A2UI,
    sendA2UIWidget
} from "../lib/a2ui.js";
import fs from "fs"
import path from "path"
import {
    runtime
} from "../lib/myfunc.js"
import axios from "axios";
import {
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia
} from "@ryuu-reinzz/baileys"

export default {
    command: ["menu", "allmenu"],
    group: false,
    limit: false,
    premium: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        reply,
        pushname,
        prefix,
        isPremium,
        isCreator,
        checkName,
        text,
        qbotz
    }) => {
        try {
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: `⏱️`,
                    key: m.key
                }
            })

            if (global.menu === "tree") {
                function countIdsFromFile(path = "./database/registered.json") {
                    try {
                        const raw = fs.readFileSync(path)
                        const db = JSON.parse(raw)
                        return db.length
                    } catch {
                        return 0
                    }
                }

                const totalIds = countIdsFromFile()
                const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))

                const status = isPremium ? "ᴘʀᴇᴍɪᴜᴍ ✓" : "ғʀᴇᴇ 𝕏"
                const status_ = isCreator ? "ᴏᴡɴᴇʀ♛" : status

                const folderPath = "./plugins"
                let menu = {}

                for (let file of fs.readdirSync(folderPath)) {
                    if (!file.endsWith(".js")) continue
                    if (file.startsWith("_events")) continue

                    let parts = file.replace(".js", "").split(/--+/g)

                    if (parts.length < 2) continue

                    let commandName = parts.pop()

                    let pointer = menu
                    for (let p of parts) {
                        if (!pointer[p]) pointer[p] = {}
                        pointer = pointer[p]
                    }

                    if (!pointer.__cmds) pointer.__cmds = []
                    pointer.__cmds.push(commandName)
                }

                const code = fs.readFileSync("./engines/handler.js", "utf8")
                const regex = /case\s+['"`]([^'"`]+)['"`]:/g
                let matches = [],
                    match
                while ((match = regex.exec(code))) matches.push(match[1])
                const tulong = [
                    ...new Set(
                        matches
                        .map((v) => v.trim().split(" ")[0].toLowerCase())
                        .filter(Boolean)
                    ),
                ]

                let args = text?.trim()?.toLowerCase() || ""
                if (args) {
                    let pointer = menu[args]
                    if (!pointer) {
                        return reply(
                            `Kategori *${args}* tidak ditemukan.\n\nTersedia:\n${Object.keys(menu)
            .map(v => "• " + v)
            .join("\n")}`
                        )
                    }

                    function render(obj, indent = "") {
                        let out = ""
                        let keys = Object.keys(obj).filter(k => k !== "__cmds")

                        keys.forEach((key, i) => {
                            let isLast = i === keys.length - 1 && !obj.__cmds
                            out += `${indent}${isLast ? "└─ " : "├─ "}${key}\n`
                            out += render(obj[key], indent + (isLast ? "   " : "│  "))
                        })

                        if (obj.__cmds) {
                            obj.__cmds.forEach((cmd, i) => {
                                let isLast = i === obj.__cmds.length - 1
                                out += `${indent}${isLast ? "└─ " : "├─ "}${indent ? "" : ""}${prefix}${cmd}\n`
                            })
                        }

                        return out
                    }

                    return reply(`📂 *${args.toUpperCase()}*\n\n${render(pointer)}`)
                }

                function renderTree(obj, indent = "") {
                    let out = ""
                    let keys = Object.keys(obj).filter(k => k !== "__cmds")

                    keys.forEach((key, i) => {
                        let isLast = i === keys.length - 1
                        out += `${indent}${isLast ? "└─ " : "├─ "}${key}\n`
                        out += renderTree(obj[key], indent + (isLast ? "   " : "│  "))
                    })

                    if (obj.__cmds) {
                        obj.__cmds.forEach((cmd, i) => {
                            let isLast = i === obj.__cmds.length - 1
                            out += `${indent}${isLast ? "└─ " : "├─ "}${prefix + cmd}\n`
                        })
                    }

                    return out
                }
                let caseMenu = ""
                if (tulong.length) {
                    caseMenu += `├─ CASE\n`
                    tulong.forEach((c, i) => {
                        const isLast = i === tulong.length - 1
                        const branch = isLast ? "│  └─" : "│  ├─"
                        caseMenu += `${branch} ${prefix}${c}${isLast ? "" : "\n"}`
                    })
                }

                let treeMenu =
                    `./${global.namabot}
├─ INFO USER
│  ├─ Nama   : ${checkName(m.sender)}
│  ├─ Status : ${status_}
│  └─ Nomor  : @${m.sender.split("@")[0]}
│
├─ BOT INFO
│  ├─ Nama Bot : ${global.namabot}
│  ├─ Versi    : ${pkg.version}
│  ├─ Type     : CASE x PLUGIN
│  ├─ Runtime  : ${runtime(process.uptime())}
│  ├─ Developer: ${global.ownername}
│  ├─ Mode     : ${global.Client[RyuuBotz.user.id.split(':')[0]].state.self ? "Self" : "Public"}
│  └─ Pengguna : ${totalIds}
│${global.kosong}
${caseMenu}
└─ PLUGINS
${renderTree(menu, "   ")}`


                await RyuuBotz.sendMessage(
                    m.chat, {
                        text: treeMenu,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            previewThumbnail: {
                                title: global.namabot,
                                description: global.ownername,
                                thumbnail: {
                                    url: global.thumbnail.main
                                },
                                sourceUrl: `https://whatsapp.com/channel/0029Vb49CCWJ93wO2dLDqx14`,
                                largerThumbnail: true
                            }
                        }
                    }, {
                        quoted: m
                    }
                );
            } else if (global.menu === "table") {
                function countIdsFromFile(path = "./database/registered.json") {
                    try {
                        const raw = fs.readFileSync(path)
                        const db = JSON.parse(raw)
                        return db.length
                    } catch {
                        return 0
                    }
                }

                const totalIds = countIdsFromFile()
                const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))

                const status = isPremium ? "ᴘʀᴇᴍɪᴜᴍ ✓" : "ғʀᴇᴇ 𝕏"
                const status_ = isCreator ? "ᴏᴡɴᴇʀ♛" : status

                const folderPath = "./plugins"
                let menu = {}

                for (let file of fs.readdirSync(folderPath)) {
                    if (!file.endsWith(".js")) continue
                    if (file.startsWith("_events")) continue

                    let parts = file.replace(".js", "").split(/--+/g)

                    if (parts.length < 2) continue

                    let commandName = parts.pop()

                    let pointer = menu
                    for (let p of parts) {
                        if (!pointer[p]) pointer[p] = {}
                        pointer = pointer[p]
                    }

                    if (!pointer.__cmds) pointer.__cmds = []
                    pointer.__cmds.push(commandName)
                }

                const code = fs.readFileSync("./engines/handler.js", "utf8")
                const regex = /case\s+['"`]([^'"`]+)['"`]:/g
                let matches = [],
                    match
                while ((match = regex.exec(code))) matches.push(match[1])
                const tulong = [
                    ...new Set(
                        matches
                        .map((v) => v.trim().split(" ")[0].toLowerCase())
                        .filter(Boolean)
                    ),
                ]

                let args = text?.trim()?.toLowerCase() || ""
                if (args) {
                    let pointer = menu[args]
                    if (!pointer) {
                        return reply(
                            `Kategori *${args}* tidak ditemukan.\n\nTersedia:\n${Object.keys(menu)
            .map(v => "• " + v)
            .join("\n")}`
                        )
                    }

                    function render(obj, indent = "") {
                        let out = ""
                        let keys = Object.keys(obj).filter(k => k !== "__cmds")

                        keys.forEach((key, i) => {
                            let isLast = i === keys.length - 1 && !obj.__cmds
                            out += `${indent}${isLast ? "└─ " : "├─ "}${key}\n`
                            out += render(obj[key], indent + (isLast ? "   " : "│  "))
                        })

                        if (obj.__cmds) {
                            obj.__cmds.forEach((cmd, i) => {
                                let isLast = i === obj.__cmds.length - 1
                                out += `${indent}${isLast ? "└─ " : "├─ "}${indent ? "" : ""}${prefix}${cmd}\n`
                            })
                        }

                        return out
                    }

                    return reply(`📂 *${args.toUpperCase()}*\n\n${render(pointer)}`)
                }

                function renderTree(obj, indent = "") {
                    let out = ""
                    let keys = Object.keys(obj).filter(k => k !== "__cmds")

                    keys.forEach((key) => {
                        out += `│ ${indent}╭─ ${key.toUpperCase()}\n`
                        out += renderTree(obj[key], indent + "│  ")
                        out += `│ ${indent}╰──────────────\n`
                    })

                    if (obj.__cmds) {
                        obj.__cmds.forEach(cmd => {
                            out += `│ ${indent}├─ ${prefix}${cmd}\n`
                        })
                    }
                    return out
                }

                let caseMenu = ""
                if (tulong.length) {
                    caseMenu += `
╭─ CASE MENU ──────────╮
`
                    tulong.forEach(c => {
                        caseMenu += `│ ├─ ${prefix}${c}\n`
                    })
                    caseMenu += `╰──────────────────────╯\n`
                }
                const now = new Date()
                const formatter = new Intl.DateTimeFormat("id-ID", {
                    timeZone: "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                })
                const [jam, menit, detik] = formatter.format(now).split(".")

                const tanggal = now.getDate()
                const bulan = now.getMonth() + 1
                const tahun = now.getFullYear()
                let tableMenu = `
╭──────────────────────╮
│ Date: *${tanggal}/${bulan}/${tahun}*        
│ Time: *${jam}:${menit}:${detik}*
╰──────────────────────╯

╭──── USER INFO  ─────────╮
│ Nama   : ${checkName(m.sender)}
│ Status : ${status_}
│ Nomor  : @${m.sender.split("@")[0]}
╰──────────────────────╯

╭─ BOT INFO  ─────────────╮
│ Nama Bot  : ${global.namabot}
│ Versi     : ${pkg.version}
│ Type      : CASE x PLUGIN
│ Runtime   : ${runtime(process.uptime())}
│ Developer : ${global.ownername}
│ Mode      : ${global.Client[RyuuBotz.user.id.split(':')[0]].state.self ? "Self" : "Public"}
│ Pengguna  : ${totalIds}
╰──────────────────────╯
${global.kosong}
${caseMenu}
╭─ PLUGINS ──────────────╮
${renderTree(menu)}╰──────────────────────╯
`


                await RyuuBotz.sendMessage(
                    m.chat, {
                        text: tableMenu,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            previewThumbnail: {
                                title: global.namabot,
                                description: global.ownername,
                                thumbnail: {
                                    url: global.thumbnail.main
                                },
                                sourceUrl: `https://whatsapp.com/channel/0029Vb49CCWJ93wO2dLDqx14`,
                                largerThumbnail: true
                            }
                        }
                    }, {
                        quoted: m
                    }
                );
            } else if (global.menu === "button") {

                function countIdsFromFile(path = "./database/registered.json") {
                    try {
                        const raw = fs.readFileSync(path)
                        const db = JSON.parse(raw)
                        return db.length
                    } catch {
                        return 0
                    }
                }

                const totalIds = countIdsFromFile()
                const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))

                const status = isPremium ? "ᴘʀᴇᴍɪᴜᴍ ✓" : "ғʀᴇᴇ 𝕏"
                const status_ = isCreator ? "ᴏᴡɴᴇʀ♛" : status
                const nomor =
                    (await RyuuBotz.getPNFromLid(m, m.sender))?.split("@")[0] ||
                    m.sender.split("@")[0]

                const cap = `
✧･ﾟ: ───:* ${global.namabot} 𝑴𝒆𝒏𝒖 *:───:･ﾟ✧

✧ 𝑼𝒔𝒆𝒓 𝑰𝒏𝒇𝒐 ✧
┊ ✧ Nama   : ${checkName(m.sender)}
┊ ✧ Status : ${status_}
┊ ✧ Nomor  : ${nomor}

✧ 𝑩𝒐𝒕 𝑰𝒏𝒇𝒐 ✧
┊ ✧ Nama Bot  : ${global.namabot}
┊ ✧ Versi     : ${pkg.version}
┊ ✧ Runtime   : ${runtime(process.uptime())}
┊ ✧ Developer : ${global.ownername}
┊ ✧ Mode      : ${
    global.Client[RyuuBotz.user.id.split(':')[0]].state.self
      ? "Self"
      : "Public"
}
┊ ✧ Pengguna  : ${totalIds}

✧･ﾟ: ───────:* ✧ *:──────:･ﾟ✧
`;

                function buildMenuFromPlugins(folderPath) {
                    const menu = {}
                    for (const file of fs.readdirSync(folderPath)) {
                        if (!file.endsWith(".js")) continue
                        if (file.startsWith("_")) continue

                        const parts = file.replace(".js", "").split(/--+/g)
                        const cmd = parts.pop()

                        let ptr = menu
                        for (const part of parts) {
                            if (!ptr[part]) ptr[part] = {}
                            ptr = ptr[part]
                        }

                        if (!ptr.__cmds) ptr.__cmds = []
                        ptr.__cmds.push(cmd)
                    }
                    return menu
                }

                function buildButtonsPerSub(menu, prefix) {
                    const buttons = [{
                            name: "cta_copy",
                            params: {
                                display_text: `WELCOME TO ${global.namabot} - Menu`,
                                id: "copy_code",
                                copy_code: "`WELCOME TO ${global.namabot} - Menu`"
                            }
                        },

                        {
                            name: "galaxy_message",
                            params: {
                                flow_cta: "╭━─────────━━ ⌜ ALL MENU 」━━─────────━╮",
                                icon: "",
                                flow_message_version: "3",
                                flow_action: "navigate",
                                flow_action_payload: {
                                    screen: "SATISFACTION_SCREEN",
                                    data: {}
                                }
                            }
                        }
                    ];

                    for (const category in menu) {
                        const subs = menu[category];

                        for (const sub in subs) {
                            if (sub === "__cmds") continue;

                            const cmds = subs[sub].__cmds || [];
                            if (!cmds.length) continue;

                            buttons.push({
                                name: "single_select",
                                params: {
                                    title: `${category.toUpperCase()} › ${sub.toUpperCase()}`,
                                    sections: [{
                                        title: `${sub.toUpperCase()} COMMANDS`,
                                        highlight_label: "リュウ・ラインツ",
                                        rows: cmds.map(cmd => ({
                                            title: `${prefix}${cmd}`,
                                            description: `Command ${cmd}`,
                                            id: `${prefix}${cmd}`
                                        }))
                                    }]
                                }
                            });
                        }
                    }
                    buttons.push({
                            name: "galaxy_message",
                            params: {
                                flow_cta: "╰━────────────━━━━━━━━────────────━╯",
                                icon: "",
                                flow_message_version: "3",
                                flow_action: "navigate",
                                flow_action_payload: {
                                    screen: "SATISFACTION_SCREEN",
                                    data: {}
                                }
                            }
                        },

                        {
                            name: "galaxy_message",
                            params: {
                                flow_cta: "╭━─────────━━ ⌜ PAYMENT 」━━─────────━╮",
                                icon: "",
                                flow_message_version: "3",
                                flow_action: "navigate",
                                flow_action_payload: {
                                    screen: "SATISFACTION_SCREEN",
                                    data: {}
                                }
                            }
                        },

                        {
                            name: "cta_copy",
                            params: {
                                display_text: "GOPAY | Rianss",
                                id: "copy_gopay",
                                copy_code: "088246841034"
                            }
                        },

                        {
                            name: "cta_copy",
                            params: {
                                display_text: "DANA | HALXXXX",
                                id: "copy_dana",
                                copy_code: "088246841034"
                            }
                        },

                        {
                            name: "galaxy_message",
                            params: {
                                flow_cta: "╰━────────────━━━━━━━━────────────━╯",
                                icon: "",
                                flow_message_version: "3",
                                flow_action: "navigate",
                                flow_action_payload: {
                                    screen: "SATISFACTION_SCREEN",
                                    data: {}
                                }
                            }
                        },

                        {
                            name: "galaxy_message",
                            params: {
                                flow_message_version: "3",
                                flow_cta: "© RyuuReinzz 2025 - 2026",
                                icon: "",
                                flow_action: "navigate",
                                flow_action_payload: {
                                    screen: "SATISFACTION_SCREEN",
                                    data: {}
                                }
                            }
                        });

                    return buttons;
                }

                const menuJson = buildMenuFromPlugins("./plugins")
                const buttons = buildButtonsPerSub(menuJson, prefix)
                const ui = new A2UI();
                const img = ui.image(
                    global.thumbnail.main, {
                        variant: "header"
                    }
                );
                const description = ui.text(global.namabot);
                const stats = ui.text(cap, {
                    variant: "caption"
                });
                const profileCard = ui.card(
                    ui.column([
                        img,
                        description,
                        stats
                    ])
                );

                ui.root([
                    profileCard
                ]);
                await sendA2UIWidget(RyuuBotz, m.chat, {
                    footer: global.ownername,
                    buttons,
                    a2ui: ui,
                    bottom_sheet: {
                        name: global.namabot
                    },
                    limited_time_offer: {
                        text: `${global.namabot} - Main Menu`,
                        time: 7776000
                    },
                    contextInfo: {
                        expiration: 7776000
                    }
                });

            } else {
                reply("Set the menu mode you want in the settings.js file, change the global.menu variable as in the commented example.")
            }
        } catch (err) {
            reply("Error: " + err.message)
        }

    }
}