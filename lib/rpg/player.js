/* =====================================================
 * lib/rpg/player.js — Player facade
 * getPlayer (auto-create + starter), party, karakter,
 * exp karakter & leveling.
 * ===================================================== */
import { db, tx, uid, jparse } from "./db.js";
import { rpgConfig } from "../../config/rpg.js";
import { EV, emit } from "./events.js";
import { addCurrency } from "./economy.js";

/* ---------------- PLAYER ---------------- */

/**
 * Ambil player; buat baru (dengan starter loadout) jika belum ada.
 * Mengembalikan row player dengan kolom JSON sudah di-parse.
 */
export function getPlayer(jid, name = "Traveler") {
  return tx(() => {
    let row = db.prepare("SELECT * FROM players WHERE jid = ?").get(jid);

    if (!row) {
      const now = Date.now();
      db.prepare(
        `INSERT INTO players (jid, name, mora, primogems, active_character, party, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        jid,
        (name || "Traveler").slice(0, rpgConfig.player.nameMaxLength),
        rpgConfig.player.starter.mora,
        rpgConfig.player.starter.primogems,
        rpgConfig.player.starter.characters[0],
        JSON.stringify([rpgConfig.player.starter.characters[0]]),
        now,
        now
      );

      // starter character
      const starterChar = rpgConfig.player.starter.characters[0];
      db.prepare(
        `INSERT OR IGNORE INTO player_characters (id, player_id, char_id) VALUES (?, ?, ?)`
      ).run(uid("ch"), jid, starterChar);

      // starter weapon
      const wpId = uid("wp");
      db.prepare(
        `INSERT OR IGNORE INTO player_weapons (id, player_id, weapon_id, equipped_by) VALUES (?, ?, ?, ?)`
      ).run(wpId, jid, rpgConfig.player.starter.weapon, uid("ch_ph"));

      // starter artifact set (5 slot)
      const set = rpgConfig.player.starter.artifactSet;
      const rarity = rpgConfig.player.starter.artifactRarity;
      const charRow = db.prepare("SELECT id FROM player_characters WHERE player_id = ? AND char_id = ?").get(jid, starterChar);
      const SLOTS = ["flower", "plume", "sands", "goblet", "circlet"];
      const mainStats = { flower: "hp", plume: "atk", sands: "atk_percent", goblet: "atk_percent", circlet: "crit_rate" };
      for (const slot of SLOTS) {
        const artId = uid("art");
        db.prepare(
          `INSERT INTO player_artifacts (id, player_id, set_id, slot, rarity, main_stat, main_value, sub_stats, equipped_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(artId, jid, set, slot, rarity, mainStats[slot], 500, "[]", charRow?.id || null);
        if (charRow) {
          db.prepare(`UPDATE player_characters SET artifact_${slot} = ? WHERE id = ?`).run(artId, charRow.id);
        }
      }

      // starter materials (insert langsung untuk hindari circular import)
      db.prepare(
        `INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, 'slime_condensate', 10), (?, 'sweet_flower', 10)`
      ).run(jid, jid);

      row = db.prepare("SELECT * FROM players WHERE jid = ?").get(jid);
      emit(EV.PLAYER_CREATED, { playerId: jid });
    }

    return parsePlayer(row);
  });
}

/** Parse kolom JSON pada row player. */
export function parsePlayer(row) {
  if (!row) return null;
  return {
    ...row,
    namecards: jparse(row.namecards, ["default"]),
    party: jparse(row.party, []),
    daily_commissions: jparse(row.daily_commissions, []),
    weekly_boss_claims: jparse(row.weekly_boss_claims, []),
    potion_buffs: jparse(row.potion_buffs, []),
    statistics: jparse(row.statistics, {}),
    settings: jparse(row.settings, {}),
  };
}

export function savePlayer(player) {
  db.prepare("UPDATE players SET updated_at = ? WHERE jid = ?").run(Date.now(), player.jid);
}

/* ---------------- PARTY ---------------- */

export function getParty(playerId) {
  const p = getPlayer(playerId);
  const ids = Array.isArray(p.party) && p.party.length ? p.party : [p.active_character || "amber"];
  const chars = [];
  for (const cid of ids.slice(0, 4)) {
    const inst = getCharacter(playerId, cid);
    if (inst) chars.push(inst);
  }
  if (chars.length === 0) {
    const active = getCharacter(playerId, p.active_character || "amber");
    if (active) chars.push(active);
  }
  return chars;
}

export function setParty(playerId, charIds) {
  return tx(() => {
    const clean = [...new Set(charIds.slice(0, 4))];
    const valid = clean.filter((cid) => getCharacter(playerId, cid));
    db.prepare("UPDATE players SET party = ?, updated_at = ? WHERE jid = ?").run(JSON.stringify(valid), Date.now(), playerId);
    return valid;
  });
}

/* ---------------- CHARACTER INSTANCES ---------------- */

export function getCharacter(playerId, charId) {
  const row = db.prepare("SELECT * FROM player_characters WHERE player_id = ? AND char_id = ?").get(playerId, charId);
  return row || null;
}

export function getAllCharacters(playerId) {
  return db.prepare("SELECT * FROM player_characters WHERE player_id = ? ORDER BY char_id").all(playerId);
}

export function getActiveCharacter(playerId) {
  const p = getPlayer(playerId);
  return getCharacter(playerId, p.active_character || "amber");
}

/** Tambah karakter baru ke koleksi (dari gacha/reward). Return false jika sudah punya. */
export function addCharacter(playerId, charId) {
  const ok = tx(() => {
    const exist = db.prepare("SELECT id FROM player_characters WHERE player_id = ? AND char_id = ?").get(playerId, charId);
    if (exist) return false;
    db.prepare("INSERT INTO player_characters (id, player_id, char_id) VALUES (?, ?, ?)").run(uid("ch"), playerId, charId);
    return true;
  });
  if (ok) emit(EV.CHARACTER_OBTAINED, { playerId, charId });
  return ok;
}

/** Duplicate karakter: naikkan constellation; jika sudah C6 → starglitter. */
export function addCharacterDuplicate(playerId, charId) {
  const inst = getCharacter(playerId, charId);
  if (!inst) return addCharacter(playerId, charId) ? { type: "new" } : null;

  if (inst.constellation >= 6) {
    addCurrency(playerId, "starglitter", rpgConfig.gacha.dupeCharC6.starglitter, "GACHA_DUPE", `Duplikat ${charId} (C6)`);
    return { type: "starglitter", amount: rpgConfig.gacha.dupeCharC6.starglitter };
  }

  db.prepare("UPDATE player_characters SET constellation = constellation + 1, updated_at = ? WHERE id = ?")
    .run(Date.now(), inst.id);
  return { type: "constellation", constellation: inst.constellation + 1 };
}

/* ---------------- EXP & LEVELING ---------------- */

/** Batas level untuk ascension tertentu. */
export function levelCap(ascension = 0) {
  const caps = rpgConfig.character.levelCaps;
  return caps[Math.min(Math.max(ascension, 0), caps.length - 1)];
}

/** exp yang dibutuhkan naik dari level L ke L+1. */
export function expNeeded(level) {
  return rpgConfig.character.expPerLevel * level;
}

/** Tambah exp karakter; auto level up sampai cap ascension. */
export function grantCharExp(playerId, charId, amount) {
  const inst = getCharacter(playerId, charId);
  if (!inst) return null;

  let { level, exp, ascension } = inst;
  let leveled = [];

  exp += amount;
  const cap = levelCap(ascension);
  while (level < cap && exp >= expNeeded(level)) {
    exp -= expNeeded(level);
    level++;
    leveled.push(level);
  }

  db.prepare("UPDATE player_characters SET level = ?, exp = ?, updated_at = ? WHERE id = ?").run(level, exp, Date.now(), inst.id);
  if (leveled.length) emit(EV.CHARACTER_LEVEL_UP, { playerId, charId, levels: leveled, level });
  return { level, exp, leveled };
}


