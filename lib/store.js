import Database from "better-sqlite3";
import { smsg } from "./myfunc.js";
import fs from 'fs';

const max_messages_in_ram = 50;

export default function makeInStorageStore({
    logger
} = {}) {
    if (!fs.existsSync("./store/")) {
        fs.mkdirSync("./store/", {
            recursive: true
        })
    };
    const db = new Database("./store/store.db");

    db.pragma("journal_mode = WAL");

    db.prepare(`
    CREATE TABLE IF NOT EXISTS messages (
      jid TEXT,
      id TEXT,
      data TEXT,
      PRIMARY KEY (jid, id)
    )
  `).run();

    db.prepare(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      data TEXT
    )
  `).run();

    db.prepare(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      data TEXT
    )
  `).run();

    db.prepare(`CREATE INDEX IF NOT EXISTS idx_messages_jid ON messages (jid)`).run();

    const getMessageQuery = db.prepare(`SELECT data FROM messages WHERE jid = ? AND id = ?`);
    const getMessagesQuery = db.prepare(`SELECT data FROM messages WHERE jid = ? ORDER BY id DESC LIMIT ?`);
    const getAllChatsQuery = db.prepare(`SELECT data FROM chats`);
    const getAllContactsQuery = db.prepare(`SELECT data FROM contacts`);

    const insertMessageQuery = db.prepare(`INSERT OR REPLACE INTO messages (jid, id, data) VALUES (?, ?, ?)`);
    const insertChatQuery = db.prepare(`INSERT OR REPLACE INTO chats (id, data) VALUES (?, ?)`);
    const insertContactQuery = db.prepare(`INSERT OR REPLACE INTO contacts (id, data) VALUES (?, ?)`);

    const store = {
        logger,
        state: {
            chats: [],
            messages: {},
            contacts: {}
        },

        loadMessage: (jid, id) => {
            if (store.state.messages[jid]) {
                const found = store.state.messages[jid].find(m => m.key.id === id);
                if (found) return found;
            }
            const row = getMessageQuery.get(jid, id);
            return row ? JSON.parse(row.data) : null;
        },

        loadMessages: (jid, limit = max_messages_in_ram) => {
            const rows = getMessagesQuery.all(jid, limit);
            const parsed = rows.map(r => JSON.parse(r.data)).reverse();

            store.state.messages[jid] = parsed;
            return store.state.messages[jid];
        },

        loadChats: () => {
            const rows = getAllChatsQuery.all();
            store.state.chats = rows.map(r => JSON.parse(r.data));
            return store.state.chats;
        },

        loadContacts: () => {
            const rows = getAllContactsQuery.all();
            store.state.contacts = {};

            for (const row of rows) {
                const d = JSON.parse(row.data);
                store.state.contacts[d.id] = d;
            }

            return store.state.contacts;
        },

        bind: conn => {
            conn.ev.on("messages.upsert", chatUpdate => {
                const insertMany = db.transaction((msgs) => {
                    for (const kay of msgs) {
                        if (!kay.message) continue;

                        kay.message =
                            Object.keys(kay.message)[0] === "ephemeralMessage" ?
                            kay.message.ephemeralMessage.message :
                            kay.message;

                        const m = smsg(conn, kay, store);

                        const jid = m.key?.remoteJid;
                        const id = m.key?.id;

                        if (!jid || !id) continue;

                        insertMessageQuery.run(
                            jid,
                            id,
                            JSON.stringify(m)
                        );

                        if (!store.state.messages[jid]) {
                            store.state.messages[jid] = [];
                        }

                        store.state.messages[jid].push(m);

                        if (
                            store.state.messages[jid].length >
                            max_messages_in_ram
                        ) {
                            store.state.messages[jid].shift();
                        }
                    }
                });

                insertMany(chatUpdate.messages);
            });


            conn.ev.on("chats.update", updates => {
                for (const upd of updates) {
                    const existing = store.state.chats.find(c => c.id === upd.id) || {};
                    const merged = {
                        ...existing,
                        ...upd
                    };

                    insertChatQuery.run(merged.id, JSON.stringify(merged));

                    const idx = store.state.chats.findIndex(c => c.id === upd.id);
                    if (idx !== -1) store.state.chats[idx] = merged;
                    else store.state.chats.push(merged);
                }
            });

            conn.ev.on("contacts.update", updates => {
                for (const upd of updates) {
                    const id = upd.id;
                    const merged = {
                        ...(store.state.contacts[id] || {}),
                        ...upd
                    };

                    insertContactQuery.run(id, JSON.stringify(merged));
                    store.state.contacts[id] = merged;
                }
            });
        }
    };

    return store;
}