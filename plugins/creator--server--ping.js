import {
    A2UI,
    sendA2UIWidget
} from "../lib/a2ui.js";
import os from "os";
import fs from "fs";
import {
    execSync
} from "child_process";
import speed from "performance-now";
import {
    runtime,
    formatp
} from "../lib/myfunc.js";

function countIds(path = "./database/registered.json") {
    try {
        return JSON.parse(fs.readFileSync(path)).length;
    } catch {
        return 0;
    }
}

export default {
    command: ['info', 'tes', 'ping', 'bot', 'bot-tes', 'bottes'],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: true,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz,
        loadingBar
    }) => {

        await loadingBar(m, RyuuBotz);

        const totalUser = countIds();
        const start = speed();
        const latency = speed() - start;
        const mem = process.memoryUsage();

        const selfMode = global.Client[RyuuBotz.user.id.split(":")[0]]?.state?.self;

        const ramPercent = (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1);
        const ramUsed = formatp(os.totalmem() - os.freemem());
        const ramTotal = formatp(os.totalmem());

        const [diskUsed, diskTotal, diskPercent] = execSync(
            `df -h / | awk 'NR==2 {print $3, $2, $5}'`
        ).toString().trim().split(" ");

        const diskFree = execSync(
            `df -h / | awk 'NR==2 {print $4}'`
        ).toString().trim();

        const cpus = os.cpus().map(cpu => {
            cpu.total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            return cpu;
        });

        const cpuCount = cpus.length;
        const cpuModel = cpus[0]?.model || "Unknown";
        const avgSpeed = Math.round(
            cpus.reduce((a, b) => a + b.speed, 0) / cpuCount
        );

        const cpu = cpus.reduce((acc, c) => {
            acc.total += c.total;
            acc.user += c.times.user;
            acc.sys += c.times.sys;
            acc.idle += c.times.idle;
            return acc;
        }, {
            total: 0,
            user: 0,
            sys: 0,
            idle: 0
        });

        const cpuUser = (cpu.user * 100 / cpu.total).toFixed(1);
        const cpuSys = (cpu.sys * 100 / cpu.total).toFixed(1);
        const cpuIdle = (cpu.idle * 100 / cpu.total).toFixed(1);

        const cpuInfoSimple = cpus.map((cpu, i) =>
            `• Core ${i + 1}: ${cpu.speed} MHz`
        ).join("\n");

        const ui = new A2UI();
        const img = ui.image(
            global.thumbnail.main, {
                variant: "header"
            }
        );

        const dashboard = {
            "BOT INFORMATION": [
                `Latency: ${latency.toFixed(4)} ms`,
                `Runtime: ${runtime(process.uptime())}`,
                `Mode: ${selfMode ? "Self" : "Public"}`,
                `Users: ${totalUser}`,
                `Prefix: ${global.pref}`,
                `Loading: ${global.BarLoad}`,
                `Channel Log: ${global.channel_log}`
            ],

            "BOT MEMORY": [
                `RSS: ${formatp(mem.rss)}`,
                `Heap Total: ${formatp(mem.heapTotal)}`,
                `Heap Used: ${formatp(mem.heapUsed)}`,
                `External: ${formatp(mem.external)}`,
                `ArrayBuffer: ${formatp(mem.arrayBuffers)}`
            ],

            "SERVER MEMORY": [
                `Used RAM: ${ramUsed}`,
                `Free RAM: ${formatp(os.freemem())}`,
                `Total RAM: ${ramTotal}`,
                `Usage: ${ramPercent}%`
            ],

            "STORAGE": [
                `Used: ${diskUsed}`,
                `Free: ${diskFree}`,
                `Total: ${diskTotal}`,
                `Usage: ${diskPercent}`
            ],

            "CPU SUMMARY": [
                `Model: ${cpuModel}`,
                `Cores: ${cpuCount}`,
                `Speed: ${avgSpeed} MHz`,
                `User: ${cpuUser}%`,
                `System: ${cpuSys}%`,
                `Idle: ${cpuIdle}%`
            ],

            "PROCESS": [
                `PID: ${process.pid}`,
                `Platform: ${process.platform}`,
                `Arch: ${process.arch}`,
                `NodeJS: ${process.version}`,
                `Hostname: ${os.hostname()}`,
                `OS: ${os.type()}`
            ],

            "NETWORK": [
                `Hostname: ${os.hostname()}`,
                `Platform: ${process.platform}`,
                `Architecture: ${process.arch}`,
                `Node Version: ${process.version}`,
                `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
            ],

            "FEATURE STATUS": [
                `Self: ${selfMode}`,
                `Prefix: ${global.pref}`,
                `Loading Bar: ${global.BarLoad}`,
                `Channel Log: ${global.channel_log}`
            ],

            "PERFORMANCE": [
                `Event Loop: ${latency.toFixed(4)} ms`,
                `CPU Core: ${cpuCount}`,
                `Memory Used: ${formatp(mem.heapUsed)}`,
                `Memory Total: ${formatp(mem.heapTotal)}`,
                `Server RAM: ${ramTotal}`
            ]
        };

        const header = ui.card(
            ui.column([
                img,
                ui.text(global.namabot + "Monitor"),
                ui.text(
                    `Uptime ${runtime(process.uptime())}`, {
                        variant: "caption"
                    }
                )
            ])
        );

        const cards = Object.entries(dashboard).map(([title, info]) =>
            ui.card(
                ui.column([
                    ui.text(title),
                    ui.text(info.join("\n"), {
                        variant: "caption"
                    })
                ])
            )
        );

        ui.root([
            header,
            ...cards
        ]);

        await sendA2UIWidget(RyuuBotz, m.chat, {
            footer: global.ownername,
            a2ui: ui,
            contextInfo: {
                expiration: 7776000
            }
        });
    }
};