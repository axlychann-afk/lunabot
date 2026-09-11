/* =====================================================
 * lib/rpg/inventory.js — Inventory Engine
 * Semua item (material, food, potion, fate, exp book)
 * disimpan di tabel inventory. Reward selalu masuk sini.
 * ===================================================== */
import { db, tx } from "./db.js";
import { addCurrency } from "./economy.js";
import { EV, emit } from "./events.js";
import { rpgConfig } from "../../config/rpg.js";
import { grantCharExp } from "./player.js";
import { grantFriendshipExp } from "./friendship.js";

/** Tambah item ke inventory. */
export function addItem(playerId, itemId, qty = 1, reason = "") {
  if (qty <= 0) return false;
  tx(() => {
    db.prepare(
      `INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)
       ON CONFLICT(player_id, item_id) DO UPDATE SET quantity = quantity + excluded.quantity`
    ).run(playerId, itemId, qty);
  });
  emit(EV.ITEM_OBTAINED, { playerId, itemId, qty, reason });
  return true;
}

/** Kurangi item, return false jika stok kurang (tanpa mengubah apapun). */
export function removeItem(playerId, itemId, qty = 1) {
  return tx(() => {
    const row = db.prepare("SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?").get(playerId, itemId);
    const have = row ? Number(row.quantity) || 0 : 0;
    if (have < qty) return false;
    if (have === qty) {
      db.prepare("DELETE FROM inventory WHERE player_id = ? AND item_id = ?").run(playerId, itemId);
    } else {
      db.prepare("UPDATE inventory SET quantity = quantity - ? WHERE player_id = ? AND item_id = ?").run(qty, playerId, itemId);
    }
    return true;
  });
}

export function hasItem(playerId, itemId, qty = 1) {
  const row = db.prepare("SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?").get(playerId, itemId);
  return row ? Number(row.quantity) >= qty : false;
}

export function getQuantity(playerId, itemId) {
  const row = db.prepare("SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?").get(playerId, itemId);
  return row ? Number(row.quantity) || 0 : 0;
}

/** Daftar isi inventory (hanya qty > 0). */
export function getInventory(playerId) {
  return db.prepare("SELECT item_id, quantity FROM inventory WHERE player_id = ? AND quantity > 0 ORDER BY item_id").all(playerId);
}

/** Konsumsi item (untuk cooking/craft/potion). */
export function consumeItem(playerId, itemId, qty = 1) {
  return removeItem(playerId, itemId, qty);
}

/**
 * Grant reward terpusat. reward = {
 *   mora?, primogems?, stardust?, starglitter?, arExp?,
 *   items?: [{ item, qty }],
 *   charExp?: { charId, amount },
 *   friendshipExp?: { charId, amount },
 * }
 * return daftar reward yang diberikan untuk ditampilkan.
 */
export function grantReward(playerId, reward, type = "REWARD", reason = "") {
  const given = { items: [], currency: [], charExp: [], friendshipExp: [] };

  for (const cur of ["mora", "primogems", "stardust", "starglitter"]) {
    if (reward[cur]) {
      addCurrency(playerId, cur, reward[cur], type, reason);
      given.currency.push({ currency: cur, amount: reward[cur] });
    }
  }

  if (reward.arExp) {
    addAdventureExp(playerId, reward.arExp, type);
    given.currency.push({ currency: "arExp", amount: reward.arExp });
  }

  for (const it of reward.items || []) {
    if (!it || !it.item || it.qty <= 0) continue;
    addItem(playerId, it.item, it.qty, reason);
    given.items.push({ item: it.item, qty: it.qty });
  }

  if (reward.charExp) {
    grantCharExp(playerId, reward.charExp.charId, reward.charExp.amount);
    given.charExp.push(reward.charExp);
  }

  if (reward.friendshipExp) {
    grantFriendshipExp(playerId, reward.friendshipExp.charId, reward.friendshipExp.amount);
    given.friendshipExp.push(reward.friendshipExp);
  }

  return given;
}

/* ---------------- ADVENTURE RANK ---------------- */

/** Tambah adventure exp; auto level up + world level naik sesuai config. */
export function addAdventureExp(playerId, amount, type = "SYSTEM") {
  const cfg = rpgConfig.adventureRank;
  const row = db.prepare("SELECT adventure_rank, adventure_exp, world_level FROM players WHERE jid = ?").get(playerId);
  if (!row) return;

  let ar = Number(row.adventure_rank) || 1;
  let exp = Number(row.adventure_exp) || 0;
  let leveled = [];

  exp += amount;
  while (ar < cfg.expCurve.length && exp >= (cfg.expCurve[ar] ?? Infinity)) {
    exp -= cfg.expCurve[ar];
    ar++;
    leveled.push(ar);
  }

  // world level naik otomatis saat AR mencapai threshold
  let wl = Number(row.world_level) || 0;
  for (const [w, reqAR] of Object.entries(cfg.worldLevelByAR)) {
    if (ar >= reqAR && Number(w) > wl) wl = Number(w);
  }

  db.prepare("UPDATE players SET adventure_rank = ?, adventure_exp = ?, world_level = ?, updated_at = ? WHERE jid = ?")
    .run(ar, exp, wl, Date.now(), playerId);

  if (leveled.length) emit(EV.PLAYER_CREATED, { playerId, type, levels: leveled }); // reuse bus (stats hook)
  return leveled;
}


