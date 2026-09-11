import fs from 'fs'
import { getUser, save } from "../lib/rpg/database.js";

const ttcFile = './database/tictactoe.json'

export default {
    event: async (m, { RyuuBotz, reply }) => {
        if (!m.text || m.isBaileys) return
        const room = RyuuBotz.game?.tictactoe
        if (!room || !room[m.chat] || room[m.chat].state !== 'CHALLENGE') return

        const activeGame = room[m.chat]
        const txt = m.text.toLowerCase().trim()
        if (m.sender !== activeGame.playerO) return

        if (['acc', 'accept'].includes(txt)) {
            const { db } = getUser(m.sender, m.pushName)
            if (activeGame.bet > 0) {
                let pX = Array.isArray(db) ? db.find(u => u.userid === activeGame.playerX) : db[activeGame.playerX]
                let pO = Array.isArray(db) ? db.find(u => u.userid === activeGame.playerO) : db[activeGame.playerO]
                if ((pX?.mora || 0) < activeGame.bet || (pO?.mora || 0) < activeGame.bet) {
                    delete room[m.chat]; fs.writeFileSync(ttcFile, JSON.stringify(room))
                    return reply("⚡ *Pertandingan Dibatalkan!* Salah satu pemain kehilangan Mora-nya sebelum laga dimulai.")
                }
                pX.mora -= activeGame.bet; pO.mora -= activeGame.bet; save(db)
            }
            activeGame.state = 'PLAYING'
            fs.writeFileSync(ttcFile, JSON.stringify(room, null, 2))
            return reply(`*🔔 PERTARUHAN DIMULAI!*\n\n${renderBoard(activeGame.board)}\n\n❌ @${activeGame.playerX.split('@')[0]} (Duluan)\n⭕ @${activeGame.playerO.split('@')[0]}\n\nSemoga beruntung!`, [activeGame.playerO, activeGame.playerX])
        }

        if (['dec', 'decline'].includes(txt)) {
            reply(`*Coward Alert!* 😂 @${activeGame.playerO.split('@')[0]} tidak berani menerima tantangan.`, [activeGame.playerO])
            delete room[m.chat]; fs.writeFileSync(ttcFile, JSON.stringify(room, null, 2))
        }
    }
}

function renderBoard(b) {
    let r = b.map(s => (s === 'X' ? '❌' : s === 'O' ? '⭕' : ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'][s-1]))
    return `   ┏━━━┳━━━┳━━━┓\n   ┃ ${r[0]} ┃ ${r[1]} ┃ ${r[2]} ┃\n   ┣━━━╋━━━╋━━━┫\n   ┃ ${r[3]} ┃ ${r[4]} ┃ ${r[5]} ┃\n   ┣━━━╋━━━╋━━━┫\n   ┃ ${r[6]} ┃ ${r[7]} ┃ ${r[8]} ┃\n   ┗━━━┻━━━┻━━━┛`
}
