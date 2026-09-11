import '../settings.js';
import {
    createCanvas
} from 'canvas';
import os from 'os';
import fs from 'fs';
import {
    execSync
} from 'child_process';

export default {
    command: ['stats'],
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
        reply
    }) => {
        reply("Proses pengambilan statistik memerlukan waktu 5-6 detik, mohon bersabar....");
        async function getServerData() {
            function countIdsFromFile(path = "./database/registered.json") {
                try {
                    const raw = fs.readFileSync(path)
                    const db = JSON.parse(raw)
                    return db.length
                } catch {
                    return 0
                }
            }
            const getCPUUsage = async () => {
                const start = os.cpus();
                await new Promise(r => setTimeout(r, 500));
                const end = os.cpus();

                let idleDiff = 0;
                let totalDiff = 0;

                for (let i = 0; i < start.length; i++) {
                    const s = start[i].times;
                    const e = end[i].times;
                    const idle = e.idle - s.idle;
                    const total = Object.keys(s).reduce((acc, k) => acc + (e[k] - s[k]), 0);
                    idleDiff += idle;
                    totalDiff += total;
                }
                return 1 - (idleDiff / totalDiff);
            };

            function getNetworkRaw() {
                try {
                    const interfaces = os.networkInterfaces();
                    let totalRx = 0;
                    let totalTx = 0;
                    let activeInterface = 'N/A';
                    let ip = 'N/A';

                    for (const [name, addrs] of Object.entries(interfaces)) {
                        if (name.toLowerCase().includes('lo')) continue;

                        for (const addr of addrs) {
                            if (addr.family === 'IPv4' && !addr.internal) {
                                activeInterface = name;
                                ip = addr.address;
                                break;
                            }
                        }
                    }

                    try {
                        const netstat = execSync("cat /proc/net/dev 2>/dev/null || echo ''").toString();
                        const lines = netstat.split('\n');

                        for (const line of lines) {
                            if (line.includes(':') && !line.includes('lo:')) {
                                const parts = line.trim().split(/\s+/);
                                if (parts.length >= 10) {
                                    totalRx += parseInt(parts[1]) || 0;
                                    totalTx += parseInt(parts[9]) || 0;
                                }
                            }
                        }
                    } catch (e) {}

                    return {
                        rx: totalRx,
                        tx: totalTx
                    };
                } catch (e) {
                    return {
                        rx: 0,
                        tx: 0
                    };
                }
            }


            const cpuHistory = [];
            const inboundHistory = [];
            const outboundHistory = [];

            let lastNet = getNetworkRaw();

            for (let i = 0; i < 6; i++) {
                await new Promise(r => setTimeout(r, 1000));
                const currentNet = getNetworkRaw();
                const cpu = await getCPUUsage();

                const inRate = ((currentNet.rx - lastNet.rx) / (1024 * 1024)) * 1024;
                const outRate = ((currentNet.tx - lastNet.tx) / (1024 * 1024)) * 1024;

                inboundHistory.push(Number(inRate.toFixed(2)));
                outboundHistory.push(Number(outRate.toFixed(2)));
                cpuHistory.push(Number(cpu.toFixed(2)));

                lastNet = currentNet;
            }

            const maxNet = Math.max(...inboundHistory, ...outboundHistory, 0.1);
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;

            let diskTotal = 0,
                diskUsed = 0,
                diskUsage = 0;
            try {
                const output = execSync('df -k /').toString().split('\n')[1].split(/\s+/);
                diskTotal = parseInt(output[1]) * 1024;
                diskUsed = parseInt(output[2]) * 1024;
                diskUsage = Math.round((diskUsed / diskTotal) * 100);
            } catch {
                diskUsage = 0;
            }

            const cpus = os.cpus();
            let cpuMod = cpus[0].model;
            cpuMod = cpuMod.length > 22 ? cpuMod.substring(0, 22) + "..." : cpuMod;

            return {
                hostname: os.hostname(),
                runtime: "NodeJs",
                version: process.version,
                ramTotal: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                diskTotal: `${(diskTotal / 1024 / 1024 / 1024).toFixed(2)} GB`,
                cpuModel: cpuMod,
                cpuCore: `${cpus.length} Core`,
                totalUsers: countIdsFromFile(),
                ramUsage: Math.round((usedMem / totalMem) * 100),
                diskUsage,
                cpuUsageNow: Math.round(cpuHistory.at(-1) * 100),
                maxNetScale: maxNet * 1.2,
                history: {
                    cpu: cpuHistory,
                    inbound: inboundHistory,
                    outbound: outboundHistory
                }
            };
        }

        const serverData = await getServerData();
        const baseWidth = 1000;
        const baseHeight = 800;
        const resScale = 2;

        const canvas = createCanvas(baseWidth * resScale, baseHeight * resScale);
        const ctx = canvas.getContext('2d');

        ctx.scale(resScale, resScale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, baseWidth, baseHeight);

        const scaleFactor = 0.8;
        const marginTop = 90;

        ctx.save();
        ctx.translate(30, 45);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Sistem monitor | ${serverData.hostname}`, 0, 0);

        const logoX = 920;
        ctx.translate(logoX, 0);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.rotate(-Math.PI / 4);
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate((baseWidth - (baseWidth * scaleFactor)) / 2, marginTop);
        ctx.scale(scaleFactor, scaleFactor);

        const drawPremiumCard = (x, y, w, h, r) => {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 6;
            ctx.shadowOffsetY = 6;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.fill();
            ctx.restore();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        };

        drawPremiumCard(30, 30, 440, 230, 20);
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.moveTo(48, 55);
        ctx.lineTo(48, 235);
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = '500 16px Arial';
        const info = [
            ['Hostname', `: ${serverData.hostname}`],
            ['Runtime', `: ${serverData.runtime}`],
            ['Runtime Version', `: ${serverData.version}`],
            ['RAM', `: ${serverData.ramTotal}`],
            ['DISK', `: ${serverData.diskTotal}`],
            ['CPU Model', `: ${serverData.cpuModel}`],
            ['CPU Core', `: ${serverData.cpuCore}`],
            ['CPU Usage', `: ${serverData.cpuUsageNow}%`],
            ['Total Users', `: ${serverData.totalUsers} Users`]
        ];
        info.forEach((item, i) => {
            let y = 70 + (i * 21);
            ctx.fillText(item[0], 65, y);
            ctx.fillText(item[1], 215, y);
        });

        drawPremiumCard(500, 30, 470, 230, 20);
        const drawDynamicGauge = (x, y, pct, label) => {
            const radius = 65;
            const startAngle = -Math.PI * 0.5;
            const endAngle = startAngle + (Math.PI * 2 * (pct / 100));
            ctx.beginPath();
            ctx.lineWidth = 14;
            ctx.strokeStyle = '#f2f2f2';
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 15;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000';
            ctx.arc(x, y, radius, startAngle, endAngle, false);
            ctx.stroke();
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 22px Arial';
            ctx.fillText(`${pct}%`, x, y + 8);
            ctx.font = '600 15px Arial';
            ctx.fillText(label, x, y + 90);
        };

        drawDynamicGauge(615, 125, serverData.ramUsage, 'RAM Usage');
        drawDynamicGauge(855, 125, serverData.diskUsage, 'DISK Usage');

        const drawNetworkAnalytic = (x, y, title, pts, maxScale) => {
            const w = 440,
                h = 135;
            drawPremiumCard(x, y, w, h, 15);
            const cx = x + 65,
                cy = y + 25,
                cw = w - 85,
                ch = h - 50;
            ctx.textAlign = 'right';
            ctx.font = '10px Arial';
            for (let i = 0; i <= 4; i++) {
                let val = (maxScale / 4) * i;
                let gy = cy + ch - (i * ch / 4);
                ctx.strokeStyle = i === 0 ? '#000000' : '#e8e8e8';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx, gy);
                ctx.lineTo(cx + cw, gy);
                ctx.stroke();
                ctx.fillStyle = '#888';
                let label = val < 1 ? `${(val * 1024).toFixed(0)}K` : `${val.toFixed(1)}M`;
                ctx.fillText(label, cx - 10, gy + 4);
            }
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            pts.forEach((p, i) => {
                let px = cx + (i * cw / (pts.length - 1));
                let py = cy + ch - ((p / maxScale) * ch);
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            });
            ctx.stroke();
            pts.forEach((p, i) => {
                let px = cx + (i * cw / (pts.length - 1));
                let py = cy + ch - ((p / maxScale) * ch);
                ctx.beginPath();
                ctx.arc(px, py, 4.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
            const lastVal = pts[pts.length - 1];
            const valLabel = lastVal < 1 ? `${(lastVal * 1024).toFixed(1)} KB/s` : `${lastVal.toFixed(2)} MB/s`;
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 12px Monospace';
            ctx.textAlign = 'right';
            ctx.fillText(valLabel, x + w - 15, y + h - 10);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(title, x + w / 2, y + h + 25);
        };

        drawNetworkAnalytic(30, 285, 'Outbound ↑', serverData.history.outbound, serverData.maxNetScale);
        drawNetworkAnalytic(530, 285, 'Inbound ↓', serverData.history.inbound, serverData.maxNetScale);

        const mx = 30,
            my = 475,
            mw = 650,
            mh = 230;
        drawPremiumCard(mx, my, mw, mh, 18);
        const gx = mx + 60,
            gy = my + 25,
            gw = mw - 90,
            gh = mh - 65;

        for (let i = 0; i <= 4; i++) {
            let ly = gy + (i * gh / 4);
            ctx.lineWidth = 1;
            ctx.strokeStyle = i === 4 ? '#000000' : '#e8e8e8';
            ctx.beginPath();
            ctx.moveTo(gx, ly);
            ctx.lineTo(gx + gw, ly);
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${100 - i * 25}%`, gx - 12, ly + 4);
        }

        const timeline = ['Now', '1s', '2s', '3s', '4s', '5s'];
        for (let j = 0; j <= 5; j++) {
            let lx = gx + (j * gw / 5);
            ctx.strokeStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(lx, gy);
            ctx.lineTo(lx, gy + gh);
            ctx.stroke();
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#444';
            ctx.fillText(timeline[j], lx, gy + gh + 22);
        }

        ctx.beginPath();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#000';
        serverData.history.cpu.forEach((p, j) => {
            let px = gx + (j * gw / 5);
            let py = gy + gh - (p * gh);
            j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        });
        ctx.stroke();

        serverData.history.cpu.forEach((p, j) => {
            let px = gx + (j * gw / 5);
            let py = gy + gh - (p * gh);
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        });

        const lastCpu = Math.round(serverData.history.cpu[serverData.history.cpu.length - 1] * 100);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`AVG: ${lastCpu}%`, mx + mw - 20, my + mh - 15);

        ctx.fillStyle = '#000';
        ctx.font = 'italic 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`System Analysis: ${serverData.cpuModel} Processor Load`, mx + mw / 2, my + mh + 25);
        ctx.restore();

        return await RyuuBotz.sendMessage(m.chat, {
            image: canvas.toBuffer('image/png', {
                compressionLevel: 9
            }),
            caption: `*SERVER REPORT: ${serverData.hostname}*\nMonitor status per detik (High Definition).`
        }, {
            quoted: m
        });
    }
};