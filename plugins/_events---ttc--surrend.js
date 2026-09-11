import fs from 'fs'
import { getUser, save } from "../lib/rpg/database.js";

const ttcFile = './database/tictactoe.json'

export default {
    event: async (m, { RyuuBotz, reply }) => {
        if (!m.text) return
        const txt = m.text.toLowerCase().trim()
        if (txt !== "sureend" && txt !== "surrender") return

        const room = RyuuBotz.game?.tictactoe
        if (!room || !room[m.chat] || room[m.chat].state !== 'PLAYING') return

        const game = room[m.chat]
        if (m.sender !== game.playerX && m.sender !== game.playerO) return

        let winner = game.playerX === m.sender ? game.playerO : game.playerX
        
        if (game.bet > 0 && winner !== 'bot') {
            const { db } = getUser(m.sender, m.pushName)
            let winData = Array.isArray(db) ? db.find(u => u.userid === winner) : db[winner]
            if (winData) {
                let prize = game.playerO === 'bot' ? Math.floor(game.bet * 1.5) : game.bet * 2
                winData.mora = (winData.mora || 0) + prize
                save(db)
            }
        }

        reply(`🏳️ *GIVE UP!* @${m.sender.split('@')[0]} menyerah di tengah jalan.\n\nKemenangan diberikan otomatis kepada @${winner === 'bot' ? 'Bot' : winner.split('@')[0]}!`, [m.sender, winner].filter(v => v !== 'bot'))
        delete room[m.chat]
        fs.writeFileSync(ttcFile, JSON.stringify(room, null, 2))
    }
}
