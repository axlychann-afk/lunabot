/* =====================================================
 * lib/rpg/events.js — Event Bus in-process
 * Engine memancarkan event; quest/achievement/statistics
 * berlangganan tanpa saling bergantung.
 * ===================================================== */

const listeners = new Map();

/**
 * Daftarkan listener: events.on("MONSTER_DEFEATED", (payload) => {})
 */
export function on(eventName, fn) {
  if (!listeners.has(eventName)) listeners.set(eventName, []);
  listeners.get(eventName).push(fn);
  return () => off(eventName, fn);
}

export function off(eventName, fn) {
  const arr = listeners.get(eventName);
  if (!arr) return;
  const i = arr.indexOf(fn);
  if (i !== -1) arr.splice(i, 1);
}

/** Emit event. Error listener tidak menggagalkan emit lainnya. */
export function emit(eventName, payload = {}) {
  const arr = listeners.get(eventName);
  if (!arr) return;
  for (const fn of [...arr]) {
    try {
      fn(payload);
    } catch (e) {
      console.error(`[RPG EVENT] ${eventName} listener error:`, e.message);
    }
  }
}

/* ---------------- Event Constants ---------------- */
export const EV = {
  PLAYER_CREATED: "PLAYER_CREATED",
  CHARACTER_OBTAINED: "CHARACTER_OBTAINED",
  CHARACTER_LEVEL_UP: "CHARACTER_LEVEL_UP",
  CHARACTER_ASCENDED: "CHARACTER_ASCENDED",
  WEAPON_OBTAINED: "WEAPON_OBTAINED",
  WEAPON_UPGRADED: "WEAPON_UPGRADED",
  ARTIFACT_OBTAINED: "ARTIFACT_OBTAINED",
  MONSTER_DEFEATED: "MONSTER_DEFEATED",
  BOSS_DEFEATED: "BOSS_DEFEATED",
  DOMAIN_COMPLETED: "DOMAIN_COMPLETED",
  QUEST_COMPLETED: "QUEST_COMPLETED",
  DAILY_CLAIMED: "DAILY_CLAIMED",
  GACHA_PULLED: "GACHA_PULLED",
  ITEM_CRAFTED: "ITEM_CRAFTED",
  EXPLORATION_DISCOVERED: "EXPLORATION_DISCOVERED",
  CHEST_OPENED: "CHEST_OPENED",
  ITEM_OBTAINED: "ITEM_OBTAINED",
  ABYSS_CLEARED: "ABYSS_CLEARED",
  EXPEDITION_COMPLETED: "EXPEDITION_COMPLETED",
  BATTLE_WON: "BATTLE_WON",
  BATTLE_LOST: "BATTLE_LOST",
};
