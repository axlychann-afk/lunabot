import fs from 'fs'
import {
    getUser,
    save
} from "../lib/rpg/database.js";

const ttcFile = './database/tictactoe.json'
let stepTimeouts = {}

export default {
    event: async (m, {
        RyuuBotz,
        reply
    }) => {
        const room = RyuuBotz.game?.tictactoe
        if (!room || !room[m.chat] || room[m.chat].state !== 'PLAYING') return

        const activeGame = room[m.chat]
        const turnJid = activeGame.turn === 'X' ? activeGame.playerX : activeGame.playerO

        const finish = async (winner, cause = '') => {
            if (stepTimeouts[m.chat]) {
                clearTimeout(stepTimeouts[m.chat])
                delete stepTimeouts[m.chat]
            }

            const {
                db
            } = getUser(m.sender, m.pushName)
            let msg = ""

            if (winner) {
                let winJid = winner === 'X' ? activeGame.playerX : activeGame.playerO
                let loseJid = winner === 'X' ? activeGame.playerO : activeGame.playerX
                let prize = activeGame.playerO === 'bot' ? Math.floor(activeGame.bet * 1.5) : activeGame.bet * 2

                if (activeGame.bet > 0) {
                    let userWin = winJid !== 'bot' ? (Array.isArray(db) ? db.find(u => u.userid === winJid) : db[winJid]) : null
                    let userLose = loseJid !== 'bot' ? (Array.isArray(db) ? db.find(u => u.userid === loseJid) : db[loseJid]) : null

                    if (userWin) {
                        userWin.mora = (userWin.mora || 0) + prize
                    }
                    if (userLose) {
                        userLose.mora = Math.max(0, (userLose.mora || 0) - prize)
                    }

                    save(db)

                    if (cause === 'timeout') {
                        msg = `⏰ *TIMEOUT!* @${loseJid.split('@')[0]} kelamaan mikir.\n🏆 @${winJid.split('@')[0]} menang tipis & dapet *${(prize/2).toLocaleString()} Mora dari lawan*!`
                    } else if (cause === 'surrender') {
                        msg = `🏳️ *SURRENDER!* @${loseJid.split('@')[0]} menyerah.\n🏆 @${winJid.split('@')[0]} menang telak & dapet *${(prize/2).toLocaleString()} Mora dari lawan*!`
                    } else {
                        msg = `🎉 *VICTORY!* @${winJid.split('@')[0]} memenangkan duel!\n💰 Hadiah: *${(prize/2).toLocaleString()} Mora dari lawan*!`
                    }
                } else {
                    msg = (winner === 'O' && activeGame.playerO === 'bot') ? "🤖 *BOT WIN!* Master Bot tidak terkalahkan." : `🏆 *WINNER!* @${winJid.split('@')[0]} pemenangnya!`
                }
            } else {
                if (activeGame.bet > 0) {
                    [activeGame.playerX, activeGame.playerO].forEach(jid => {
                        if (jid === 'bot') return
                        let user = Array.isArray(db) ? db.find(u => u.userid === jid) : db[jid]
                        if (user) {
                            user.mora = (user.mora || 0)
                        }
                    });
                    save(db)
                }
                msg = "⚖️ *DRAW!* Skor seimbang. Tidak ada Mora yang berpindah tangan."
            }

            await reply(`*🏁 GAME OVER 🏁*\n\n${renderBoard(activeGame.board)}\n\n${msg}`, [activeGame.playerX, activeGame.playerO].filter(v => v !== 'bot'))
            delete room[m.chat]
            fs.writeFileSync(ttcFile, JSON.stringify(room))
        }

        if (m.text.toLowerCase() === 'surrend') {
            if (m.sender === activeGame.playerX || m.sender === activeGame.playerO) {
                return finish(m.sender === activeGame.playerX ? 'O' : 'X', 'surrender')
            }
        }

        if (!/^[1-9]$/.test(m.text.trim()) || m.sender !== turnJid) return

        let pos = parseInt(m.text) - 1
        if (typeof activeGame.board[pos] !== 'number') return reply("🚫 Kotak sudah terisi!")

        activeGame.board[pos] = activeGame.turn
        activeGame.turn = activeGame.turn === 'X' ? 'O' : 'X'

        let win = checkWinner(activeGame.board)
        let isFull = activeGame.board.every(s => typeof s !== 'number')

        if (win || isFull) return finish(win)

        if (activeGame.turn === 'O' && activeGame.playerO === 'bot') {
            let botPos = getBestMove(activeGame.board)
            activeGame.board[botPos] = 'O'
            activeGame.turn = 'X'
            let botWin = checkWinner(activeGame.board)
            let botFull = activeGame.board.every(s => typeof s !== 'number')
            if (botWin || botFull) return finish(botWin)
        }

        if (stepTimeouts[m.chat]) clearTimeout(stepTimeouts[m.chat])
        stepTimeouts[m.chat] = setTimeout(() => {
            if (RyuuBotz.game?.tictactoe[m.chat]) {
                finish(activeGame.turn === 'X' ? 'O' : 'X', 'timeout')
            }
        }, 300000)

        fs.writeFileSync(ttcFile, JSON.stringify(room, null, 2))
        let nextPlayer = activeGame.turn === 'X' ? activeGame.playerX : activeGame.playerO
        reply(`*🎮 TIC TAC TOE - BOARD*\n\n${renderBoard(activeGame.board)}\n\n✨ Giliran: @${nextPlayer.split('@')[0]}\n⏰ Batas waktu: 5 menit\n🏳️ Ketik *surrend* untuk menyerah.`, [nextPlayer].filter(v => v !== 'bot'))
    }
}

function renderBoard(b) {
    let r = b.map(s => (s === 'X' ? '❌' : s === 'O' ? '⭕' : ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'][s - 1]))
    return `   ┏━━━┳━━━┳━━━┓\n   ┃ ${r[0]} ┃ ${r[1]} ┃ ${r[2]} ┃\n   ┣━━━╋━━━╋━━━┫\n   ┃ ${r[3]} ┃ ${r[4]} ┃ ${r[5]} ┃\n   ┣━━━╋━━━╋━━━┫\n   ┃ ${r[6]} ┃ ${r[7]} ┃ ${r[8]} ┃\n   ┗━━━┻━━━┻━━━┛`
}

function checkWinner(b) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]
    for (let [a, b1, c] of lines) {
        if (typeof b[a] === 'string' && b[a] === b[b1] && b[a] === b[c]) return b[a]
    }
    return null
}

function getBestMove(board) {
    let bestScore = -Infinity,
        move = -1
    board.forEach((val, i) => {
        if (typeof val === 'number') {
            board[i] = 'O'
            let score = minimax(board, 0, false)
            board[i] = i + 1
            if (score > bestScore) {
                bestScore = score;
                move = i
            }
        }
    })
    return move
}

function minimax(board, depth, isMaximizing) {
    let res = checkWinner(board)
    if (res === 'O') return 10 - depth
    if (res === 'X') return depth - 10
    if (board.every(s => typeof s !== 'number')) return 0
    if (isMaximizing) {
        let best = -Infinity
        board.forEach((v, i) => {
            if (typeof v === 'number') {
                board[i] = 'O';
                best = Math.max(best, minimax(board, depth + 1, false));
                board[i] = i + 1
            }
        })
        return best
    } else {
        let best = Infinity
        board.forEach((v, i) => {
            if (typeof v === 'number') {
                board[i] = 'X';
                best = Math.min(best, minimax(board, depth + 1, true));
                board[i] = i + 1
            }
        })
        return best
    }
}