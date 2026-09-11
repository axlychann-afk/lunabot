import express from "express";
import fs from "fs";
import path from "path";
import "../settings.js";
import {
    startJadiBot,
    stopJadiBot
} from "../engines/jadibot.js";

export function serverRun(RyuuBotz) {
    const app = express();
    const PORT = 9999;

    const baseDir = "./database/jadibot/";

    const findFolder = (number) => {
        if (!fs.existsSync(baseDir)) return null;
        const dirs = fs.readdirSync(baseDir);
        return dirs.find(d => d.startsWith(number)) || null;
    };

    const restart = (delay = 5000) => {
        setTimeout(() => {
            process.exit(1);
        }, delay);
    };

    app.get("/jadibot/add/:num", async (req, res) => {
        const num = req.params.num.replace(/[^0-9]/g, "");

        const existingFolder = findFolder(num);
        if (existingFolder) {
            return res.status(400).json({
                status: false,
                error: `Jadibot dengan nomor ${num} sudah terdaftar (${existingFolder.includes("[running]") ? "Running" : "Stopped"}).`
            });
        }

        try {
            const code = await startJadiBot(num, null, RyuuBotz);

            res.json({
                status: true,
                action: "add",
                number: num,
                pairingCode: code
            });
        } catch (e) {
            res.status(500).json({
                status: false,
                error: e.message
            });
        }
    });


    app.get("/jadibot/stop/:num", async (req, res) => {
        const num = req.params.num;
        const folder = findFolder(num);

        if (!folder) {
            return res.status(404).json({
                status: false,
                message: "not found"
            });
        }

        try {
            const newPath = path.join(baseDir, `${num}[stopped]`);
            fs.renameSync(path.join(baseDir, folder), newPath);

            stopJadiBot(num);

            res.json({
                status: true,
                message: "stopping server..."
            });

            restart(5000);
        } catch (e) {
            res.status(500).json({
                status: false,
                error: e.message
            });
        }
    });

    let lastError = "Belum ada log error yang terekam.";
    app.get("/jadibot/err/give", (req, res) => {
        const {
            data
        } = req.query;

        if (!data) {
            return res.status(400).json({
                status: false,
                message: "Query 'data' tidak ditemukan."
            });
        }
        lastError = data;
        res.json({
            status: true,
            message: "Error string berhasil disimpan sementara.",
            timestamp: new Date().toLocaleString()
        });
    });

    app.get("/jadibot/err/get", (req, res) => {
        res.json({
            status: true,
            message: lastError
        });
    });

    app.get("/jadibot/run/:num", (req, res) => {
        const num = req.params.num;
        const folder = findFolder(num);

        if (!folder) {
            return res.status(404).json({
                status: false,
                message: "not found"
            });
        }

        try {
            const newPath = path.join(baseDir, `${num}[running]`);
            fs.renameSync(path.join(baseDir, folder), newPath);

            res.json({
                status: true,
                message: "running server..."
            });

            restart(5000);
        } catch (e) {
            res.status(500).json({
                status: false,
                error: e.message
            });
        }
    });

    app.get("/jadibot/list", (req, res) => {
        try {
            if (!fs.existsSync(baseDir)) return res.json({
                data: []
            });

            const dirs = fs.readdirSync(baseDir)
                .filter(d => fs.statSync(path.join(baseDir, d)).isDirectory())
                .map(v => ({
                    number: v.replace(/\[.*?\]/g, ""),
                    status: v.includes("[running]") ? "running" : "stopped"
                }));

            res.json({
                status: true,
                data: dirs
            });
        } catch (e) {
            res.status(500).json({
                status: false,
                error: e.message
            });
        }
    });

    app.get("/jadibot/delete/:num", (req, res) => {
        const num = req.params.num;
        const folder = findFolder(num);

        if (!folder) {
            return res.status(404).json({
                status: false,
                message: "not found"
            });
        }

        try {
            stopJadiBot(num);
            fs.rmSync(path.join(baseDir, folder), {
                recursive: true,
                force: true
            });

            res.json({
                status: true,
                message: "deleted, restarting..."
            });

            restart(5000);
        } catch (e) {
            res.status(500).json({
                status: false,
                error: e.message
            });
        }
    });

    app.get("/jadibot/trial/:num", async (req, res) => {
        const num = req.params.num.replace(/[^0-9]/g, "");

        try {
            const code = await startJadiBot(num, null, RyuuBotz);

            setTimeout(() => {
                const folder = findFolder(num);
                if (folder) {
                    stopJadiBot(num);
                    fs.rmSync(path.join(baseDir, folder), {
                        recursive: true,
                        force: true
                    });
                }
            }, 3 * 60 * 60 * 1000);

            res.json({
                status: true,
                message: "trial started",
                pairingCode: code
            });
        } catch (e) {
            res.status(500).json({
                status: false,
                error: e.message
            });
        }
    });
    app.listen(PORT, () => {
        console.log(`🚀 JadiBot API running on http://localhost:${PORT}`);
    });
}