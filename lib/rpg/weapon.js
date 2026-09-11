/* =====================================================
 * lib/rpg/weapon.js — Data statis senjata
 * Leveling curve, ascension, refinement.
 * Tetap mengekspor `weapons` (kompatibel lama).
 * ===================================================== */
import { rpgConfig } from "../../config/rpg.js";

const RAW = {
  sword: {
    mistsplitter_reforged: { name: "Mistsplitter Reforged", star: 5, base_atk: 674, sub_stat: "crit_dmg", sub_value: 44.1 },
    freedom_sworn: { name: "Freedom-Sworn", star: 5, base_atk: 608, sub_stat: "elemental_mastery", sub_value: 198 },
    primordial_jade_cutter: { name: "Primordial Jade Cutter", star: 5, base_atk: 542, sub_stat: "crit_rate", sub_value: 44.1 },
    light_of_foliar_incision: { name: "Light of Foliar Incision", star: 5, base_atk: 542, sub_stat: "crit_dmg", sub_value: 88.2 },
    haran_geppaku_futsu: { name: "Haran Geppaku Futsu", star: 5, base_atk: 608, sub_stat: "crit_rate", sub_value: 33.1 },
    amenoma_kageuchi: { name: "Amenoma Kageuchi", star: 4, base_atk: 454, sub_stat: "atk", sub_value: 55.1 },
    iron_sting: { name: "Iron Sting", star: 4, base_atk: 510, sub_stat: "elemental_mastery", sub_value: 165 },
    sacrificial_sword: { name: "Sacrificial Sword", star: 4, base_atk: 454, sub_stat: "energy_recharge", sub_value: 61.3 },
    favonius_sword: { name: "Favonius Sword", star: 4, base_atk: 454, sub_stat: "energy_recharge", sub_value: 61.3 },
    cool_steel: { name: "Cool Steel", star: 3, base_atk: 401, sub_stat: "atk", sub_value: 35.2 },
    harbinger_of_dawn: { name: "Harbinger of Dawn", star: 3, base_atk: 401, sub_stat: "crit_dmg", sub_value: 46.9 },
    skyrider_sword: { name: "Skyrider Sword", star: 3, base_atk: 354, sub_stat: "energy_recharge", sub_value: 51.7 },
    travelers_handy_sword: { name: "Traveler's Handy Sword", star: 2, base_atk: 235, sub_stat: "def", sub_value: 35.2 },
    dull_blade: { name: "Dull Blade", star: 1, base_atk: 185, sub_stat: null, sub_value: null },
  },
  great_sword: {
    debate_club: { name: "Debate Club", star: 3, base_atk: 401, sub_stat: "atk", sub_value: 35.2 },
    bloodtainted_greatsword: { name: "Bloodtainted Greatsword", star: 3, base_atk: 354, sub_stat: "elemental_mastery", sub_value: 187 },
    white_iron_greatsword: { name: "White Iron Greatsword", star: 3, base_atk: 401, sub_stat: "def", sub_value: 43.9 },
    old_mercs_pal: { name: "Old Merc's Pal", star: 2, base_atk: 243, sub_stat: "atk", sub_value: 25.2 },
    waster_greatsword: { name: "Waster Greatsword", star: 1, base_atk: 185, sub_stat: null, sub_value: null },
    redhorn_stonethresher: { name: "Redhorn Stonethresher", star: 5, base_atk: 542, sub_stat: "crit_dmg", sub_value: 88.2 },
    beacon_of_the_reed_sea: { name: "Beacon of the Reed Sea", star: 5, base_atk: 608, sub_stat: "crit_rate", sub_value: 33.1 },
    wolfs_gravestone: { name: "Wolf's Gravestone", star: 5, base_atk: 608, sub_stat: "atk", sub_value: 49.6 },
    whiteblind: { name: "Whiteblind", star: 4, base_atk: 510, sub_stat: "def", sub_value: 51.7 },
    prototype_archaic: { name: "Prototype Archaic", star: 4, base_atk: 565, sub_stat: "atk", sub_value: 27.6 },
    serpent_spine: { name: "Serpent Spine", star: 4, base_atk: 510, sub_stat: "crit_rate", sub_value: 27.6 },
  },
  spearman: {
    black_tassel: { name: "Black Tassel", star: 3, base_atk: 354, sub_stat: "hp", sub_value: 46.9 },
    white_tassel: { name: "White Tassel", star: 3, base_atk: 401, sub_stat: "crit_rate", sub_value: 23.4 },
    halberd: { name: "Halberd", star: 3, base_atk: 401, sub_stat: "atk", sub_value: 35.2 },
    iron_point: { name: "Iron Point", star: 2, base_atk: 243, sub_stat: "atk", sub_value: 25.2 },
    beginners_protector: { name: "Beginner's Protector", star: 1, base_atk: 185, sub_stat: null, sub_value: null },
    engulfing_lightning: { name: "Engulfing Lightning", star: 5, base_atk: 608, sub_stat: "energy_recharge", sub_value: 55.1 },
    staff_of_homa: { name: "Staff of Homa", star: 5, base_atk: 608, sub_stat: "crit_dmg", sub_value: 66.2 },
    primordial_jade_winged_spear: { name: "Primordial Jade Winged-Spear", star: 5, base_atk: 674, sub_stat: "crit_rate", sub_value: 22.1 },
    the_catch: { name: "The Catch", star: 4, base_atk: 510, sub_stat: "energy_recharge", sub_value: 45.9 },
    deathmatch: { name: "Deathmatch", star: 4, base_atk: 454, sub_stat: "crit_rate", sub_value: 36.8 },
  },
  archer: {
    slingshot: { name: "Slingshot", star: 3, base_atk: 354, sub_stat: "crit_rate", sub_value: 31.2 },
    sharpshooters_oath: { name: "Sharpshooter's Oath", star: 3, base_atk: 401, sub_stat: "crit_dmg", sub_value: 46.9 },
    raven_bow: { name: "Raven Bow", star: 3, base_atk: 354, sub_stat: "elemental_mastery", sub_value: 187 },
    messenger: { name: "Messenger", star: 3, base_atk: 401, sub_stat: "crit_dmg", sub_value: 31.2 },
    hunters_bow: { name: "Hunter's Bow", star: 1, base_atk: 185, sub_stat: null, sub_value: null },
    thundering_pulse: { name: "Thundering Pulse", star: 5, base_atk: 608, sub_stat: "crit_dmg", sub_value: 66.2 },
    polar_star: { name: "Polar Star", star: 5, base_atk: 608, sub_stat: "crit_rate", sub_value: 33.1 },
    aqua_simulacra: { name: "Aqua Simulacra", star: 5, base_atk: 542, sub_stat: "crit_dmg", sub_value: 88.2 },
    the_stringless: { name: "The Stringless", star: 4, base_atk: 510, sub_stat: "elemental_mastery", sub_value: 165 },
    favonius_warbow: { name: "Favonius Warbow", star: 4, base_atk: 454, sub_stat: "energy_recharge", sub_value: 61.3 },
  },
  mage: {
    thrilling_tales_of_dragon_slayers: { name: "Thrilling Tales of Dragon Slayers", star: 3, base_atk: 401, sub_stat: "hp", sub_value: 35.2 },
    magic_guide: { name: "Magic Guide", star: 3, base_atk: 354, sub_stat: "elemental_mastery", sub_value: 187 },
    emerald_orb: { name: "Emerald Orb", star: 3, base_atk: 448, sub_stat: "elemental_mastery", sub_value: 94 },
    pocket_grimoire: { name: "Pocket Grimoire", star: 2, base_atk: 243, sub_stat: "atk", sub_value: 25.2 },
    apprentices_notes: { name: "Apprentice's Notes", star: 1, base_atk: 185, sub_stat: null, sub_value: null },
    tome_of_the_eternal_flow: { name: "Tome of the Eternal Flow", star: 5, base_atk: 542, sub_stat: "crit_dmg", sub_value: 88.2 },
    a_thousand_floating_dreams: { name: "A Thousand Floating Dreams", star: 5, base_atk: 542, sub_stat: "elemental_mastery", sub_value: 265 },
    lost_prayer_to_the_sacred_winds: { name: "Lost Prayer to the Sacred Winds", star: 5, base_atk: 608, sub_stat: "crit_rate", sub_value: 33.1 },
    solar_pearl: { name: "Solar Pearl", star: 4, base_atk: 510, sub_stat: "crit_rate", sub_value: 27.6 },
    mappa_mare: { name: "Mappa Mare", star: 4, base_atk: 565, sub_stat: "elemental_mastery", sub_value: 110 },
  },
};

/** normalisasi tipe (dari char type ke kategori senjata) */
export const TYPE_TO_CATEGORY = {
  sword: "sword",
  great_sword: "great_sword",
  "great-sword": "great_sword",
  spearman: "spearman",
  polearm: "spearman",
  archer: "archer",
  bow: "archer",
  mage: "mage",
  catalyst: "mage",
};

export const weapons = RAW;

/** cari data senjata dari semua kategori */
export function findWeapon(id) {
  for (const cat of Object.keys(RAW)) {
    if (RAW[cat][id]) return { data: RAW[cat][id], category: cat };
  }
  return null;
}

/** batas level per ascension */
export function weaponLevelCap(ascension = 0) {
  const caps = rpgConfig.weapon.levelCaps;
  return caps[Math.min(Math.max(ascension, 0), caps.length - 1)];
}

/** base ATK pada level & ascension tertentu */
export function weaponAtkAtLevel(weaponId, level = 1, ascension = 0) {
  const found = findWeapon(weaponId);
  if (!found) return 0;
  const f = 0.18 + 0.82 * (Math.min(level, 90) / 90) + ascension * 0.015;
  return Math.round(found.data.base_atk * f);
}

/** exp yang dibutuhkan naik dari level L ke L+1 */
export function weaponExpNeeded(level) {
  return rpgConfig.weapon.expPerLevel * level;
}

/** biaya ascension senjata (per ascension index) */
export function weaponAscensionCosts(category, ascensionIndex) {
  const costs = [
    { mora: 10000, items: [{ item: `weapon_${category}_1`, qty: 3 }] },
    { mora: 20000, items: [{ item: `weapon_${category}_1`, qty: 3 }, { item: `weapon_${category}_2`, qty: 3 }] },
    { mora: 40000, items: [{ item: `weapon_${category}_2`, qty: 3 }, { item: `weapon_${category}_3`, qty: 3 }] },
    { mora: 60000, items: [{ item: `weapon_${category}_3`, qty: 3 }, { item: `weapon_${category}_4`, qty: 4 }] },
    { mora: 90000, items: [{ item: `weapon_${category}_4`, qty: 3 }, { item: `weapon_${category}_5`, qty: 4 }] },
    { mora: 120000, items: [{ item: `weapon_${category}_5`, qty: 6 }] },
  ];
  return costs[Math.min(Math.max(ascensionIndex, 0), costs.length - 1)];
}

/** bonus passive dari refinement (R1-R5): 1.0 → 1.4 */
export function refinementBonus(refinement = 1) {
  return 1 + (Math.min(Math.max(refinement, 1), 5) - 1) * 0.1;
}
