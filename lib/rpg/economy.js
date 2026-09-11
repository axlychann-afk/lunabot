/* =====================================================
 * lib/rpg/economy.js — Economy Engine terpusat
 * Semua perubahan currency WAJIB lewat engine ini,
 * tercatat di tabel transactions (audit + anti-exploit).
 * ===================================================== */
import { db, tx, uid } from "./db.js";

const CURRENCIES = new Set([
  "mora", "primogems", "stardust", "starglitter",
  "resin", "fragile_resin", "condensed_resin",
]);

export const CURRENCY_ICON = {
  mora: "🪙", primogems: "💎", stardust: "✨", starglitter: "🌟",
  resin: "⚗️", fragile_resin: "🧪", condensed_resin: "🔮",
};

/**
 * Tambah currency ke player + catat transaksi.
 * amount negatif = kurangi (validasi saldo via check).
 */
export function addCurrency(playerId, currency, amount, type = "SYSTEM", reason = "") {
  if (!CURRENCIES.has(currency)) throw new Error(`Currency tidak dikenal: ${currency}`);
  if (!amount || amount === 0) return false;

  return tx(() => {
    const row = db.prepare("SELECT * FROM players WHERE jid = ?").get(playerId);
    if (!row) return false;

    const before = Number(row[currency]) || 0;
    const after = Math.max(0, before + amount);
    if (amount < 0 && after !== before + amount) return false; // saldo tidak cukup

    db.prepare(`UPDATE players SET ${currency} = ?, updated_at = ? WHERE jid = ?`).run(after, Date.now(), playerId);

    db.prepare(
      `INSERT OR IGNORE INTO transactions (id, player_id, type, currency, amount, reason, balance_before, balance_after, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(uid("tx"), playerId, type, currency, amount, reason || "", before, after, Date.now());

    return true;
  });
}

/** Kurangi currency, return false jika saldo tidak cukup (tanpa mengubah apapun). */
export function removeCurrency(playerId, currency, amount, type = "SYSTEM", reason = "") {
  return addCurrency(playerId, currency, -Math.abs(amount), type, reason);
}

/** Cek saldo (dengan lazy resin regen). */
export function getBalance(playerId, currency) {
  if (currency === "resin") return getResin(playerId).resin;
  const row = db.prepare("SELECT " + currency + " FROM players WHERE jid = ?").get(playerId);
  return row ? Number(row[currency]) || 0 : 0;
}

/** Ambil semua saldo currency player. */
export function getBalances(playerId) {
  const row = db.prepare(
    "SELECT mora, primogems, stardust, starglitter, resin, fragile_resin, condensed_resin FROM players WHERE jid = ?"
  ).get(playerId);
  if (!row) return null;
  return { ...row };
}

/* ---------------- RESIN (regen lazy) ---------------- */
import { rpgConfig } from "../../config/rpg.js";

/** Hitung resin dengan regen otomatis (+1 / 8 menit), simpan hasilnya. */
export function getResin(playerId) {
  const cfg = rpgConfig.resin;
  return tx(() => {
    const row = db.prepare("SELECT resin, resin_updated_at FROM players WHERE jid = ?").get(playerId);
    if (!row) return { resin: 0, nextAt: 0, max: cfg.max };

    const now = Date.now();
    let resin = Number(row.resin) || 0;
    let updatedAt = Number(row.resin_updated_at) || now;

    if (resin < cfg.max) {
      const gained = Math.floor((now - updatedAt) / (cfg.regenMinutes * 60000));
      if (gained > 0) {
        resin = Math.min(cfg.max, resin + gained);
        updatedAt = updatedAt + gained * cfg.regenMinutes * 60000;
        db.prepare("UPDATE players SET resin = ?, resin_updated_at = ? WHERE jid = ?").run(resin, updatedAt, playerId);
      }
    } else if (resin > cfg.max) {
      resin = cfg.max;
      updatedAt = now;
      db.prepare("UPDATE players SET resin = ?, resin_updated_at = ? WHERE jid = ?").run(resin, updatedAt, playerId);
    }

    const nextAt = resin >= cfg.max ? 0 : updatedAt + cfg.regenMinutes * 60000;
    return { resin, nextAt, max: cfg.max };
  });
}

/** Kurangi resin dengan atomic check — false jika resin kurang (tidak ada perubahan). */
export function spendResin(playerId, amount, type = "DOMAIN", reason = "") {
  return tx(() => {
    const { resin } = getResin(playerId);
    if (resin < amount) return false;
    db.prepare("UPDATE players SET resin = resin - ?, resin_updated_at = ?, updated_at = ? WHERE jid = ?")
      .run(amount, Date.now(), Date.now(), playerId);
    const row = db.prepare("SELECT resin FROM players WHERE jid = ?").get(playerId);
    db.prepare(
      `INSERT OR IGNORE INTO transactions (id, player_id, type, currency, amount, reason, balance_before, balance_after, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(uid("tx"), playerId, type, "resin", -amount, reason || "", resin, Number(row.resin), Date.now());
    return true;
  });
}

/** Riwayat transaksi terakhir (untuk audit). */
export function getTransactionLog(playerId, limit = 20) {
  return db.prepare(
    "SELECT type, currency, amount, reason, balance_before, balance_after, created_at FROM transactions WHERE player_id = ? ORDER BY created_at DESC LIMIT ?"
  ).all(playerId, limit);
}
