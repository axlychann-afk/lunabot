import fs from 'fs'
import { getUser } from "../lib/rpg/database.js";

const ttcFile = './database/tictactoe.json'
let gameTimeouts = {} 

export default {
  command: ["tictactoe", "ttc"],
  group: true,
  limit: false,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,
    
  code: async (m, { args, prefix, RyuuBotz, reply, isCreator, command }) => {
        RyuuBotz.game = RyuuBotz.game || {}
        if (!RyuuBotz.game.tictactoe) {
            RyuuBotz.game.tictactoe = fs.existsSync(ttcFile) ? JSON.parse(fs.readFileSync(ttcFile)) : {}
        }
        
        let room = RyuuBotz.game.tictactoe

        if (args[0] === 'delete' || args[0] === 'clear') {
            if (!isCreator) return reply("🚫 Fitur ini khusus untuk Developer/Owner.")
            if (!room[m.chat]) return reply("Tidak ada sesi game yang sedang berjalan.")
            
            if (gameTimeouts[m.chat]) {
                clearTimeout(gameTimeouts[m.chat])
                delete gameTimeouts[m.chat]
            }
            
            delete room[m.chat]
            fs.writeFileSync(ttcFile, JSON.stringify(room, null, 2))
            return reply("✅ Sesi berhasil dihapus paksa.")
        }

        if (room[m.chat]) return reply("⚠️ Masih ada pertandingan berlangsung!")

        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : (args[0] === 'bot' ? 'bot' : null))
        if (!target) return reply(
`🎮 TIC TAC TOE

Contoh penggunaan:
- \`${prefix}${command} @user 5000\`
  Menantang pemain lain

- \`${prefix}${command} bot 5000\`
  Bermain melawan bot

- \`${prefix}${command} clear\`
  Menghapus sesi permainan yang aktif`
)
        if (target === m.sender) return reply("❌ Jangan menantang diri sendiri!")

        let bet = args.find(v => !isNaN(v)) ? parseInt(args.find(v => !isNaN(v))) : 0
        const { db } = getUser(m.sender, m.pushName)
        let senderData = Array.isArray(db) ? db.find(u => u.userid === m.sender) : db[m.sender]
        
        if (bet > 0 && (!senderData || (senderData.mora || 0) < bet)) {
            return reply(`💸 Mora tidak cukup!`)
        }

        room[m.chat] = {
            id: m.chat, 
            playerX: m.sender, 
            playerO: target,
            board: [1, 2, 3, 4, 5, 6, 7, 8, 9], 
            turn: 'X', 
            bet,
            state: target === 'bot' ? 'PLAYING' : 'CHALLENGE',
            time: Date.now()
        }

        if (target !== 'bot') {
            if (gameTimeouts[m.chat]) clearTimeout(gameTimeouts[m.chat])

            gameTimeouts[m.chat] = setTimeout(() => {
                if (RyuuBotz.game.tictactoe[m.chat] && RyuuBotz.game.tictactoe[m.chat].state === 'CHALLENGE') {
                    delete RyuuBotz.game.tictactoe[m.chat]
                    delete gameTimeouts[m.chat]
                    fs.writeFileSync(ttcFile, JSON.stringify(RyuuBotz.game.tictactoe, null, 2))
                    RyuuBotz.sendMessage(m.chat, { text: `⏰ *Waktu Habis!* Tantangan otomatis dibatalkan karena tidak ada respon.`, mentions: [target] })
                }
            }, 60000)
        }

        fs.writeFileSync(ttcFile, JSON.stringify(room, null, 2))

        if (target === 'bot') {
            reply(`*🎮 VS BOT*\n\n${renderBoard(room[m.chat].board)}`, [m.sender])
        } else {
            reply(`*⚔️ TANTANGAN TERBUKA ⚔️*\n\n@${target.split('@')[0]}, ketik *acc* atau *dec*!\n_Waktu: 1 menit._`, [target, m.sender])
        }
    }
}

function renderBoard(b) {
    let r = b.map(s => (s === 'X' ? '❌' : s === 'O' ? '⭕' : ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'][s-1]))
    return `   ┏━━━┳━━━┳━━━┓\n   ┃ ${r[0]} ┃ ${r[1]} ┃ ${r[2]} ┃\n   ┣━━━╋━━━╋━━━┫\n   ┃ ${r[3]} ┃ ${r[4]} ┃ ${r[5]} ┃\n   ┣━━━╋━━━╋━━━┫\n   ┃ ${r[6]} ┃ ${r[7]} ┃ ${r[8]} ┃\n   ┗━━━┻━━━┻━━━┛`
}
