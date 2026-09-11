/* =====================================================
 * lib/rpg/db.js — SQLite core (better-sqlite3)
 * Atomic, anti-corruption, WAL mode. Migrasi otomatis
 * dari database/rpg.json (format lama) ke SQLite.
 * ===================================================== */
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "database", "rpg.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");

/* ---------------- SCHEMA ---------------- */
db.exec(`
CREATE TABLE IF NOT EXISTS players (
  jid TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Traveler',
  adventure_rank INTEGER DEFAULT 1,
  adventure_exp INTEGER DEFAULT 0,
  world_level INTEGER DEFAULT 0,
  mora INTEGER DEFAULT 1000,
  primogems INTEGER DEFAULT 160,
  stardust INTEGER DEFAULT 0,
  starglitter INTEGER DEFAULT 0,
  resin INTEGER DEFAULT 160,
  fragile_resin INTEGER DEFAULT 0,
  condensed_resin INTEGER DEFAULT 0,
  resin_updated_at INTEGER DEFAULT 0,
  active_character TEXT DEFAULT 'amber',
  favorite_character TEXT,
  namecard TEXT DEFAULT 'default',
  namecards TEXT DEFAULT '["default"]',
  party TEXT DEFAULT '["amber"]',
  daily_claimed_at INTEGER DEFAULT 0,
  daily_commission_date TEXT DEFAULT '',
  daily_commissions TEXT DEFAULT '[]',
  weekly_boss_date TEXT DEFAULT '',
  weekly_boss_claims TEXT DEFAULT '[]',
  battlepass_season TEXT DEFAULT '',
  battlepass_level INTEGER DEFAULT 1,
  battlepass_exp INTEGER DEFAULT 0,
  abyss_reset_at INTEGER DEFAULT 0,
  potion_buffs TEXT DEFAULT '[]',
  statistics TEXT DEFAULT '{}',
  settings TEXT DEFAULT '{}',
  created_at INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS player_characters (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  char_id TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  ascension INTEGER DEFAULT 0,
  constellation INTEGER DEFAULT 0,
  talent_normal INTEGER DEFAULT 1,
  talent_skill INTEGER DEFAULT 1,
  talent_burst INTEGER DEFAULT 1,
  friendship INTEGER DEFAULT 1,
  friendship_exp INTEGER DEFAULT 0,
  equipped_weapon TEXT,
  artifact_flower TEXT,
  artifact_plume TEXT,
  artifact_sands TEXT,
  artifact_goblet TEXT,
  artifact_circlet TEXT,
  UNIQUE(player_id, char_id)
);

CREATE TABLE IF NOT EXISTS player_weapons (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  weapon_id TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  ascension INTEGER DEFAULT 0,
  refinement INTEGER DEFAULT 1,
  equipped_by TEXT
);

CREATE TABLE IF NOT EXISTS player_artifacts (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  set_id TEXT NOT NULL,
  slot TEXT NOT NULL,
  rarity INTEGER DEFAULT 3,
  level INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  main_stat TEXT NOT NULL,
  main_value REAL DEFAULT 0,
  sub_stats TEXT DEFAULT '[]',
  equipped_by TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
  player_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, item_id)
);

CREATE TABLE IF NOT EXISTS expedition_slots (
  player_id TEXT NOT NULL,
  slot INTEGER NOT NULL,
  char_id TEXT,
  region TEXT,
  duration TEXT,
  started_at INTEGER DEFAULT 0,
  end_at INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, slot)
);

CREATE TABLE IF NOT EXISTS exploration (
  player_id TEXT NOT NULL,
  region TEXT NOT NULL,
  chests_opened INTEGER DEFAULT 0,
  teleports INTEGER DEFAULT 0,
  seelies INTEGER DEFAULT 0,
  shrines INTEGER DEFAULT 0,
  events INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, region)
);

CREATE TABLE IF NOT EXISTS quests (
  player_id TEXT NOT NULL,
  quest_id TEXT NOT NULL,
  status TEXT DEFAULT 'locked',
  objectives TEXT DEFAULT '[]',
  completed_at INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, quest_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  player_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS gacha_state (
  player_id TEXT NOT NULL,
  banner_id TEXT NOT NULL,
  pity5 INTEGER DEFAULT 0,
  pity4 INTEGER DEFAULT 0,
  guaranteed5 INTEGER DEFAULT 0,
  total_pulls INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, banner_id)
);

CREATE TABLE IF NOT EXISTS gacha_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  banner_id TEXT NOT NULL,
  result_type TEXT,
  result_id TEXT,
  rarity INTEGER,
  pulled_at INTEGER
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  player_id TEXT,
  type TEXT,
  currency TEXT,
  amount INTEGER,
  reason TEXT,
  balance_before INTEGER,
  balance_after INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS abyss (
  player_id TEXT NOT NULL,
  floor INTEGER NOT NULL,
  chamber INTEGER NOT NULL,
  stars INTEGER DEFAULT 0,
  cleared INTEGER DEFAULT 0,
  rewards_claimed INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, floor, chamber)
);

CREATE TABLE IF NOT EXISTS teapot (
  player_id TEXT PRIMARY KEY,
  trust_rank INTEGER DEFAULT 1,
  trust_exp INTEGER DEFAULT 0,
  realm_currency INTEGER DEFAULT 0,
  furniture TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS cooking (
  player_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, recipe_id)
);
`);

/* ---------------- UTILITIES ---------------- */

/** Jalankan fn di dalam transaksi atomik. Rollback otomatis jika error. */
export function tx(fn) {
  const run = db.transaction(fn);
  return run();
}

/** Helper: generate id unik pendek */
export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Parse JSON kolom dengan aman */
export function jparse(str, fallback = null) {
  try {
    const v = JSON.parse(str);
    return v === undefined || v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function jstring(obj) {
  return JSON.stringify(obj ?? {});
}

/* ---------------- MIGRASI rpg.json LAMA ---------------- */

function migrateLegacyRpgJson() {
  const legacyPath = path.join(process.cwd(), "database", "rpg.json");
  if (!fs.existsSync(legacyPath)) return;
  try {
    const raw = fs.readFileSync(legacyPath, "utf-8").trim();
    if (!raw || raw === "[]" || raw === "{}") return;
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return;

    const count = Object.keys(data).length;
    if (count === 0) return;

    // cek apakah sudah pernah dimigrasi
    if (fs.existsSync(legacyPath + ".migrated")) return;

    let migrated = 0;
    tx(() => {
      const insPlayer = db.prepare(
        `INSERT OR IGNORE INTO players (jid, name, mora, primogems, active_character, party, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const insChar = db.prepare(
        `INSERT OR IGNORE INTO player_characters (id, player_id, char_id, level, exp) VALUES (?, ?, ?, ?, ?)`
      );
      const insWep = db.prepare(
        `INSERT OR IGNORE INTO player_weapons (id, player_id, weapon_id) VALUES (?, ?, ?)`
      );
      const insArt = db.prepare(
        `INSERT OR IGNORE INTO player_artifacts (id, player_id, set_id, slot, rarity, main_stat, main_value, sub_stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const insInv = db.prepare(
        `INSERT OR IGNORE INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)`
      );

      for (const [jid, u] of Object.entries(data)) {
        if (!u || typeof u !== "object") continue;
        const now = Date.now();
        insPlayer.run(
          jid,
          u.name || "Traveler",
          Number(u.mora) || 1000,
          Number(u.primogems) || 160,
          u.build?.activeChar || "amber",
          JSON.stringify([u.build?.activeChar || "amber"]),
          now,
          now
        );

        // karakter
        const chars = Array.isArray(u.inventory?.characters) ? u.inventory.characters : [];
        chars.forEach((cid, i) => {
          const level = i === 0 && u.stats?.level ? Number(u.stats.level) || 1 : 1;
          const exp = i === 0 ? Number(u.stats?.exp) || 0 : 0;
          insChar.run(uid("ch"), jid, cid, Math.min(level, 90), exp);
        });

        // senjata
        const weps = Array.isArray(u.inventory?.weapons) ? u.inventory.weapons : [];
        weps.forEach((wid) => insWep.run(uid("wp"), jid, wid));

        // artifact set → instance per slot (kompat: set 2/4 pc)
        const arts = Array.isArray(u.inventory?.artifacts) ? u.inventory.artifacts : [];
        const SLOTS = ["flower", "plume", "sands", "goblet", "circlet"];
        arts.forEach((a) => {
          const setId = a.name;
          const pieces = Math.min(Math.max(Number(a.set) || 2, 2), 4);
          for (let i = 0; i < pieces; i++) {
            const slot = SLOTS[i % SLOTS.length];
            const main = slot === "flower" ? "hp" : slot === "plume" ? "atk" : "atk_percent";
            insArt.run(uid("art"), jid, setId, slot, 3, main, 500, "[]");
          }
        });

        // materials
        if (u.inventory?.materials && typeof u.inventory.materials === "object") {
          for (const [itemId, qty] of Object.entries(u.inventory.materials)) {
            if (qty > 0) insInv.run(jid, itemId, Number(qty) || 0);
          }
        }

        // set senjata & artifact yang di-equip di karakter aktif
        const activeChar = u.build?.activeChar || "amber";
        const charRow = db.prepare("SELECT id FROM player_characters WHERE player_id = ? AND char_id = ?").get(jid, activeChar);
        if (charRow) {
          if (u.build?.weapon) {
            const wpRow = db.prepare("SELECT id FROM player_weapons WHERE player_id = ? AND weapon_id = ? LIMIT 1").get(jid, u.build.weapon);
            if (wpRow) {
              db.prepare("UPDATE player_characters SET equipped_weapon = ? WHERE id = ?").run(wpRow.id, charRow.id);
              db.prepare("UPDATE player_weapons SET equipped_by = ? WHERE id = ?").run(charRow.id, wpRow.id);
            }
          }
          if (u.build?.artifactSet) {
            const artRows = db.prepare("SELECT id, slot FROM player_artifacts WHERE player_id = ? AND set_id = ? LIMIT 5").all(jid, u.build.artifactSet);
            artRows.forEach((r) => {
              db.prepare("UPDATE player_characters SET artifact_" + r.slot + " = ? WHERE id = ?").run(r.id, charRow.id);
              db.prepare("UPDATE player_artifacts SET equipped_by = ? WHERE id = ?").run(charRow.id, r.id);
            });
          }
        }
        migrated++;
      }
    });

    fs.writeFileSync(legacyPath + ".migrated", JSON.stringify({ at: Date.now(), players: migrated }, null, 2));
    console.log(`[RPG DB] Migrasi rpg.json selesai: ${migrated} player -> rpg.db`);
  } catch (e) {
    console.error("[RPG DB] Gagal migrasi rpg.json:", e.message);
  }
}

migrateLegacyRpgJson();
