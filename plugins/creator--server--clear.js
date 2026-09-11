import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export default {
  command: ["clear"],
  group: false,
  limit: false,
  premium: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { reply }) => {

  const baseDir = "./database/jadibot";

  const cleanDB = (dbPath, label) => {
    if (!fs.existsSync(dbPath)) return null;

    const db = new Database(dbPath);
    const categories = {
      preKeys: "pre-key:",
      sessions: "session:",
      senderKeys: "sender-key:",
      appStateKeys: "app-state-sync-key:",
      appStateVersions: "app-state-sync-version:",
      lidMapping: "lid-mapping:"
    };

    const stats = {};

    for (const name in categories) {
      const prefix = categories[name];
      const before = db.prepare("SELECT COUNT(*) AS total FROM baileys_state WHERE key LIKE ?")
                       .get(`${prefix}%`).total;

      db.prepare("DELETE FROM baileys_state WHERE key LIKE ?").run(`${prefix}%`);
      stats[name] = before;
    }

    const creds = db.prepare("SELECT COUNT(*) AS total FROM baileys_state WHERE key='creds'")
                    .get().total;
    stats.creds = creds;

    db.pragma("wal_checkpoint(TRUNCATE)");
    db.prepare("ANALYZE").run();
    db.prepare("VACUUM").run();
    db.prepare("PRAGMA optimize").run();
    db.close();

    return { label, stats };
  };

  const sessions = fs.readdirSync(baseDir).filter(folder => {
    const full = path.join(baseDir, folder);
    return fs.lstatSync(full).isDirectory();
  });

  const results = [];

  for (const s of sessions) {
    const dbPath = path.join(baseDir, s, "auth.db");
    const cleaned = cleanDB(dbPath, `jadibot/${s}`);
    if (cleaned) results.push(cleaned);
  }

  const mainDb = "./session/auth.db";
  const cleanedMain = cleanDB(mainDb, "main-session");
  if (cleanedMain) results.push(cleanedMain);

  if (!results.length) {
    return reply("Tidak ada session yang ditemukan untuk dibersihkan.");
  }

  let out = "🧹 *Session Cleanup Complete*\n\n";
  for (const r of results) {
    out += `• ${r.label}\n`;
  }

  reply(out);

  }
};
