process.env.FORCE_COLOR = "3";
import {
    createRequire
} from 'module';
import path from 'path';
import {
    fileURLToPath
} from 'url';
import {
    spawn,
    spawnSync
} from 'child_process';
import {
    Worker
} from 'worker_threads';
import fs from 'fs';

const ROOT_DIR = process.cwd();
const require = createRequire(import.meta.url);

import updateSettings from "./question.js";

const max_mb = 1550;
const limit = max_mb * 0.9;

const chalkModule = await import('chalk');
const axiosModule = await import('axios');
const fsModule = await import('fs');

const chalk = chalkModule.default || chalkModule;

const getTimestamp = () => chalk.gray(`[${new Date().toLocaleTimeString()}]`);
const log = {
    core: (msg) => console.log(`${getTimestamp()} ${chalk.bold.magenta('❖')} ${chalk.bold.magenta('[CORE]')} ${msg}`),
    info: (msg) => console.log(`${getTimestamp()} ${chalk.cyan('⬢')} ${chalk.cyan('[INFO]')} ${msg}`),
    success: (msg) => console.log(`${getTimestamp()} ${chalk.green('⬢')} ${chalk.green('[READY]')} ${msg}`),
    warn: (msg) => console.log(`${getTimestamp()} ${chalk.yellow('▲')} ${chalk.yellow('[WARN]')} ${msg}`),
    error: (msg) => console.log(`${getTimestamp()} ${chalk.red('▼')} ${chalk.red('[FAIL]')} ${msg}`),
    neon: (msg) => console.log(chalk.bold.cyan(msg)),
    dim: (msg) => console.log(chalk.dim.gray(msg))
};

console.clear();
log.neon(" ┌─────────────────────────────────────────────────────────────┐");
log.neon(" │  ______                                                     │");
log.neon(" │  | ___ \\                                                    │");
log.neon(" │  | |_/ /_   _ _   _ _   _  ___ ___  ___  _ __ ___           │");
log.neon(" │  |    /| | | | | | | | | |/ __/ _ \\/ _ \\| '__/ _ \\          │");
log.neon(" │  | |\\ \\| |_| | |_| | |_| | (_| (_) | (_) | | |  __/         │");
log.neon(" │  \\_| \\_|\\__, |\\__,_|\\__,_|\\___\\___/\\___/|_|  \\___|          │");
log.neon(" │          __/ |                                              │");
log.neon(" │         |___/      " + chalk.green("PROTECTION ENGINE v3.0 [PRODUCTION]") + "      │");
log.neon(" └─────────────────────────────────────────────────────────────┘");
log.dim(` [SYS] Environment Root : ${ROOT_DIR}`);
log.dim(` [SYS] Allocation Limit  : ${max_mb} MB (Threshold Guard: ${limit.toFixed(0)} MB)`);
log.dim(" ───────────────────────────────────────────────────────────────");

if (!fs.existsSync(path.join(ROOT_DIR, "node_modules")) || fs.readdirSync(path.join(ROOT_DIR, "node_modules")).length === 0) {
    log.warn("Dependency tree missing. Initializing automatic local deployment...");
    const install = spawnSync("npm", ["install"], {
        cwd: ROOT_DIR,
        stdio: "inherit"
    });
    if (install.status !== 0) {
        log.error("Deployment failure. Core execution halted.");
        process.exit(1);
    }
    log.success("Dependencies synchronized successfully.");
}

let simpleCode, workerCode;
try {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const addon = require(path.join(currentDir, 'boot.node'));

    log.core("Interfacing with native binary stack...");
    const modules = addon.getModules();

    simpleCode = modules["simple.js"];
    workerCode = modules["worker.js"];

    if (!simpleCode || !workerCode) {
        throw new Error("Null pointer or compromised module structures detected inside blob.");
    }
    log.success("Encrypted structures mapped into secure memory segments.");
} catch (err) {
    log.error(`Kernel linkage denied: ${err.message}`);
    process.exit(1);
}

global.chalk = chalk;
global.axios = axiosModule.default || axiosModule;
global.fs = fsModule.default || fsModule;
global.path = path;
global.fileURLToPath = fileURLToPath;
global.spawn = spawn;

log.core("Executing structural integrity subroutines...");

const settingsPath = `file://${path.join(ROOT_DIR, 'settings.js')}`;
try {
    await updateSettings();
    const settings = await import(settingsPath);
    for (const [key, value] of Object.entries(settings)) {
        global[key] = value;
    }
    log.info("Runtime variables synchronized with global config matrix.");
} catch (err) {
    log.error(`Context mounting aborted: ${err.message}`);
    process.exit(1);
}

const simpleBase64 = `data:text/javascript;base64,${Buffer.from(simpleCode).toString('base64')}`;
try {
    await import(simpleBase64);
    log.success("Integrity Verification Status: 200 OK (Verified Asset).");
} catch (err) {
    log.error("Integrity Violation Detected. Memory token revoked.");
    process.exit(1);
}

log.core("Spawning application instances...");
let worker;

function startWorker() {
    log.info("Allocating sandboxed environment via dynamic Base64 RAM string...");

    const absoluteIndexPath = `file://${path.join(ROOT_DIR, 'index.js')}`;

    const injectionHeader = `
        import workerThreads from 'worker_threads';
        import { spawn } from 'child_process';
        import fs from 'fs';
        import path from 'path';
        import { fileURLToPath } from 'url';

        global.parentPort = workerThreads.parentPort;
        global.spawn = spawn;
        global.fs = fs;
        global.path = path;
        global.fileURLToPath = fileURLToPath;
    \n`;

    let fullWorkerString = injectionHeader + workerCode;
    let patchedWorkerCode = fullWorkerString.replace(/['"]__TARGET_INDEX__['"]/g, `'${absoluteIndexPath}'`);

    const workerBase64 = `data:text/javascript;base64,${Buffer.from(patchedWorkerCode).toString('base64')}`;

    worker = new Worker(new URL(workerBase64), {
        stdout: true,
        stderr: true,
        stdin: true
    });

    worker.stdout.on("data", data => {
        process.stdout.write(data);
    });

    worker.stderr.on("data", data => {
        process.stderr.write(data);
    });

    worker.on("message", msg => {
        if (typeof msg !== "object") {
            console.log(chalk.gray(` [SANDBOX]`), msg);
        }
        if (msg?.type === "mem") {
            if (msg.rss > limit) {
                log.warn(`Memory overflow danger [${msg.rss.toFixed(1)} MB / ${limit.toFixed(0)} MB]. Recycling sandbox context...`);
                if (worker) worker.terminate();
            }
        }
    });

    worker.on("exit", code => {
        log.warn(`Isolated sandbox killed or closed (Exited code: ${code})`);
        if (worker.stdin) {
            process.stdin.unpipe(worker.stdin);
        }
        setTimeout(startWorker, 1000);
    });

    worker.on("error", err => {
        log.error(`Sandbox context memory exception: ${err.message}`);
    });
}


startWorker();

process.on("SIGUSR2", () => {
    log.warn("Hot-reload interrupt received. Purging runtime contexts...");
    if (worker) worker.terminate();
});

process.on("uncaughtException", err => {
    log.error(`Critical Master Thread Intercept: ${err.message}`);
});

process.on("unhandledRejection", err => {
    log.error(`Unhandled Promise Rejection Vector: ${err}`);
});
process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') return;
});


function msUntilMidnightWIB() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const wibNow = new Date(utc + 7 * 60 * 60 * 1000);
    const next = new Date(wibNow);
    next.setHours(24, 0, 0, 0);
    return next - wibNow;
}

setTimeout(() => {
    log.core("Scheduled cron trigger reached (00:00 WIB). Recycling all threads...");
    if (worker) worker.terminate();

    setInterval(() => {
        log.core("Scheduled cron trigger reached (00:00 WIB). Recycling all threads...");
        if (worker) worker.terminate();
    }, 24 * 60 * 60 * 1000);
}, msUntilMidnightWIB());