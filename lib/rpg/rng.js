/* =====================================================
 * lib/rpg/rng.js — Central RNG Engine
 * Semua sistem random WAJIB lewat engine ini.
 * ===================================================== */

/** Random 0..1 */
export function chance() {
  return Math.random();
}

/** true dengan probabilitas p (0..1) */
export function roll(p) {
  return Math.random() < p;
}

/** integer acak di [min, max] */
export function range(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** pilih satu elemen acak dari array */
export function pick(arr) {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/** pilih acak dengan bobot: [{item, weight}] */
export function weighted(entries) {
  if (!entries || entries.length === 0) return undefined;
  const total = entries.reduce((s, e) => s + (e.weight ?? 1), 0);
  let r = Math.random() * total;
  for (const e of entries) {
    r -= e.weight ?? 1;
    if (r <= 0) return e;
  }
  return entries[entries.length - 1];
}

/**
 * Roll loot table monster/domain:
 * lootTable = [{ item, chance (0-100), min, max, weight? }]
 * Kembalikan [{ item, qty }] yang berhasil.
 */
export function loot(lootTable, luck = 1) {
  const drops = [];
  for (const entry of lootTable || []) {
    const p = Math.min(100, (entry.chance ?? 100) * luck);
    if (roll(p / 100)) {
      drops.push({
        item: entry.item,
        qty: range(entry.min ?? 1, entry.max ?? entry.min ?? 1),
      });
    }
  }
  return drops;
}

/**
 * Roll gacha tunggal dengan pity.
 * state = { pity5, pity4, guaranteed5 }
 * rates = { fiveStarPity, fourStarPity, softPityStart, softPityBonus, baseFiveStarRate, baseFourStarRate, featuredRate }
 * featured = { char: [ids], weapon: [ids] } (pool 5★ & 4★)
 * Return: { rarity, type, id, fiveStarPityUsed }
 */
export function gacha(state, rates, featured) {
  const pity5 = state.pity5 + 1;
  const pity4 = state.pity4 + 1;

  let fiveRate = rates.baseFiveStarRate;
  if (pity5 > rates.softPityStart) {
    fiveRate += (pity5 - rates.softPityStart) * rates.softPityBonus * 0.01;
  }
  if (pity5 >= rates.fiveStarPity) fiveRate = 1;

  const isFive = pity5 >= rates.fiveStarPity || Math.random() < fiveRate;
  let isFour = false;
  if (!isFive) {
    isFour = pity4 >= rates.fourStarPity || Math.random() < rates.baseFourStarRate;
  }

  if (isFive) {
    const isFeatured = state.guaranteed5 || Math.random() < rates.featuredRate;
    const pool = isFeatured && featured?.char?.length
      ? featured.char
      : featured?.pool5 || [];
    const id = pool[Math.floor(Math.random() * pool.length)];
    return {
      rarity: 5,
      type: "character",
      id,
      five: true,
      four: false,
      guaranteed: !isFeatured, // kalah 50/50 → guaranteed berikutnya
    };
  }

  if (isFour) {
    const isWeapon = Math.random() < 0.5;
    const pool = isWeapon ? featured?.weapons4 || [] : featured?.chars4 || [];
    const id = pool[Math.floor(Math.random() * pool.length)];
    return {
      rarity: 4,
      type: isWeapon ? "weapon" : "character",
      id,
      five: false,
      four: true,
      guaranteed: false,
    };
  }

  // bintang 3: weapon 3★
  const id = featured?.pool3 ? featured.pool3[Math.floor(Math.random() * featured.pool3.length)] : null;
  return {
    rarity: 3,
    type: "weapon",
    id,
    five: false,
    four: false,
    guaranteed: false,
  };
}
