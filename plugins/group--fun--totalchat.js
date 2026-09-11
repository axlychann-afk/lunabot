import fs from "fs";

const dbase = "./database/allchats.json";

function loadDB() {
    if (!fs.existsSync(dbase)) {
        fs.writeFileSync(dbase, JSON.stringify({}, null, 2));
    }

    return JSON.parse(
        fs.readFileSync(dbase, "utf-8")
    );
}

export default {
    command: ["totalchat", "leaderboard"],
    group: true,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, {
        RyuuBotz
    }) => {

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: "🧭",
                key: m.key
            }
        });

        const db = loadDB();

        const groupData =
            db[m.chat] || {};

        const groupMetadata =
            await RyuuBotz.groupMetadata(
                m.chat
            );

        const allParticipants =
            groupMetadata.participants;
        const botNumber =
            RyuuBotz.user.lid.split(":")[0] +
            "@lid";

        const leaderboard =
            allParticipants
            .filter(
                p => p.id !== botNumber
            )
            .map((participant) => {

                const jid =
                    participant.id;

                return {
                    jid,
                    totalChat: groupData[jid] || 0
                };

            })
            .sort(
                (a, b) =>
                b.totalChat - a.totalChat
            )
            .slice(0, 10);

        const rows = [];
        const jids = [];

        let rank = 1;

        for (const user of leaderboard) {

            let name =
                await RyuuBotz.getName(
                    user.jid
                );

            let pn =
                await RyuuBotz.getPNFromLid(
                    m,
                    user.jid
                );

            rows.push([
                `#${rank}`,
                `@${pn.split("@")[0]}`,
                `${user.totalChat}`
            ]);
            jids.push(pn);

            rank++;
        }

        await RyuuBotz.sendRichResponse(
            m.chat, {

                text: `🏆 TOP 10 CHAT GRUP
Leaderboard anggota paling aktif minggu ini.`,

                table: {
                    title: "📊 Total Chat Leaderboard",

                    headers: [
                        "Peringkat",
                        "Nama/Nomor",
                        "Jumlah Chat"
                    ],
                    rows
                },
                mentionedJid: [...jids]
            }
        );
    }
};