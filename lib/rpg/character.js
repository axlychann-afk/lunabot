/* =====================================================
 * lib/rpg/character.js — Data statis karakter (Genshin)
 * Stats dasar, talent, ascension & constellation
 * digenerate deterministik (seeded) agar konsisten.
 * Tetap mengekspor `characters` (kompatibel lama).
 * ===================================================== */
import { rpgConfig } from "../../config/rpg.js";

/* ---------------- BASE DATA (nama, element, tipe, rarity) ---------------- */
const RAW = {
  albedo: { elemental: "geo", type: "sword", star: 5 },
  alhaitham: { elemental: "dendro", type: "sword", star: 5 },
  aloy: { elemental: "cryo", type: "archer", star: 5 },
  amber: { elemental: "pyro", type: "archer", star: 4 },
  arataki_itto: { elemental: "geo", type: "great_sword", star: 5 },
  arlecchino: { elemental: "pyro", type: "spearman", star: 5 },
  baizhu: { elemental: "dendro", type: "mage", star: 5 },
  barbara: { elemental: "hydro", type: "mage", star: 4 },
  beidou: { elemental: "electro", type: "great_sword", star: 4 },
  bennett: { elemental: "pyro", type: "sword", star: 4 },
  candace: { elemental: "hydro", type: "spearman", star: 4 },
  charlotte: { elemental: "cryo", type: "mage", star: 4 },
  chasca: { elemental: "anemo", type: "archer", star: 5 },
  chevreuse: { elemental: "pyro", type: "spearman", star: 4 },
  chiori: { elemental: "geo", type: "sword", star: 5 },
  chongyun: { elemental: "cryo", type: "great_sword", star: 4 },
  clorinde: { elemental: "electro", type: "sword", star: 5 },
  collei: { elemental: "dendro", type: "archer", star: 4 },
  cyno: { elemental: "electro", type: "spearman", star: 5 },
  dehya: { elemental: "pyro", type: "great_sword", star: 5 },
  diluc: { elemental: "pyro", type: "great_sword", star: 5 },
  diona: { elemental: "cryo", type: "archer", star: 4 },
  dori: { elemental: "electro", type: "great_sword", star: 4 },
  eula: { elemental: "cryo", type: "great_sword", star: 5 },
  faruzan: { elemental: "anemo", type: "archer", star: 4 },
  fischl: { elemental: "electro", type: "archer", star: 4 },
  freminet: { elemental: "cryo", type: "great_sword", star: 4 },
  furina: { elemental: "hydro", type: "sword", star: 5 },
  gaming: { elemental: "pyro", type: "great_sword", star: 4 },
  ganyu: { elemental: "cryo", type: "archer", star: 5 },
  gorou: { elemental: "geo", type: "archer", star: 4 },
  hu_tao: { elemental: "pyro", type: "spearman", star: 5 },
  jean: { elemental: "anemo", type: "sword", star: 5 },
  kachina: { elemental: "geo", type: "spearman", star: 4 },
  kaedehara_kazuha: { elemental: "anemo", type: "sword", star: 5 },
  kaeya: { elemental: "cryo", type: "sword", star: 4 },
  kamisato_ayaka: { elemental: "cryo", type: "sword", star: 5 },
  kamisato_ayato: { elemental: "hydro", type: "sword", star: 5 },
  kaveh: { elemental: "dendro", type: "great_sword", star: 4 },
  keqing: { elemental: "electro", type: "sword", star: 5 },
  kinich: { elemental: "dendro", type: "great_sword", star: 5 },
  kirara: { elemental: "dendro", type: "sword", star: 4 },
  klee: { elemental: "pyro", type: "mage", star: 5 },
  kujou_sara: { elemental: "electro", type: "archer", star: 4 },
  kuki_shinobu: { elemental: "electro", type: "sword", star: 4 },
  layla: { elemental: "cryo", type: "sword", star: 4 },
  lisa: { elemental: "electro", type: "mage", star: 4 },
  lynette: { elemental: "anemo", type: "sword", star: 4 },
  lyney: { elemental: "pyro", type: "archer", star: 5 },
  nika: { elemental: "cryo", type: "spearman", star: 4 },
  navuika: { elemental: "pyro", type: "great_sword", star: 5 },
  nualani: { elemental: "hydro", type: "mage", star: 5 },
  nona: { elemental: "hydro", type: "mage", star: 5 },
  nahida: { elemental: "dendro", type: "mage", star: 5 },
  navia: { elemental: "geo", type: "great_sword", star: 5 },
  neuvillette: { elemental: "hydro", type: "mage", star: 5 },
  nilou: { elemental: "hydro", type: "sword", star: 5 },
  ningguang: { elemental: "geo", type: "mage", star: 4 },
  noelle: { elemental: "geo", type: "great_sword", star: 4 },
  ororon: { elemental: "electro", type: "archer", star: 4 },
  qiqi: { elemental: "cryo", type: "sword", star: 5 },
  raiden_shogun: { elemental: "electro", type: "spearman", star: 5 },
  razor: { elemental: "electro", type: "great_sword", star: 4 },
  rosaria: { elemental: "cryo", type: "spearman", star: 4 },
  sangonomiya_kokomi: { elemental: "hydro", type: "mage", star: 5 },
  sayu: { elemental: "anemo", type: "great_sword", star: 4 },
  sethos: { elemental: "electro", type: "archer", star: 4 },
  shenhe: { elemental: "cryo", type: "spearman", star: 5 },
  shikanoin_heizou: { elemental: "anemo", type: "mage", star: 4 },
  sigewinne: { elemental: "hydro", type: "archer", star: 5 },
  sucrose: { elemental: "anemo", type: "mage", star: 4 },
  tartaglia: { elemental: "hydro", type: "archer", star: 5 },
  thoma: { elemental: "pyro", type: "spearman", star: 4 },
  tighnari: { elemental: "dendro", type: "archer", star: 5 },
  venti: { elemental: "anemo", type: "archer", star: 5 },
  wanderer: { elemental: "anemo", type: "mage", star: 5 },
  wriothesley: { elemental: "cryo", type: "mage", star: 5 },
  xiangling: { elemental: "pyro", type: "spearman", star: 4 },
  xianyun: { elemental: "anemo", type: "mage", star: 5 },
  xiao: { elemental: "anemo", type: "spearman", star: 5 },
  xingqiu: { elemental: "hydro", type: "sword", star: 4 },
  xinyan: { elemental: "pyro", type: "great_sword", star: 4 },
  xilonen: { elemental: "geo", type: "sword", star: 5 },
  yae_niko: { elemental: "electro", type: "mage", star: 5 },
  yanfei: { elemental: "pyro", type: "mage", star: 4 },
  yaoyao: { elemental: "dendro", type: "spearman", star: 4 },
  yelan: { elemental: "hydro", type: "archer", star: 5 },
  yoimiya: { elemental: "pyro", type: "archer", star: 5 },
  yun_jin: { elemental: "geo", type: "spearman", star: 4 },
  zhongli: { elemental: "geo", type: "spearman", star: 5 },
};

/* ---------------- GENERATOR DETERMINISTIK ---------------- */

const REGIONS = ["mondstadt", "liyue", "inazuma", "sumeru", "fontaine", "natlan", "snezhnaya"];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const STAT_BASE = {
  5: { hp: [10500, 13500], atk: [280, 370], def: [650, 860] },
  4: { hp: [9000, 11600], atk: [215, 285], def: [550, 730] },
};

// bonus kecil per element
const ELEMENT_MOD = {
  pyro: { atk: 1.08 }, hydro: { hp: 1.08 }, anemo: { atk: 1.04 },
  electro: { atk: 1.06 }, cryo: { atk: 1.05 }, geo: { def: 1.08 }, dendro: { hp: 1.04, atk: 1.02 },
};

/** bangun talent multiplier arrays (level 1..10) */
function genTalents(seed, skillBase, burstBase) {
  const jitter = (seed % 7) / 100;
  const normal = Array.from({ length: 10 }, (_, i) => +(0.5 + i * 0.22 + jitter).toFixed(3));
  const skill = Array.from({ length: 10 }, (_, i) => +(skillBase + i * 0.28 + jitter).toFixed(3));
  const burst = Array.from({ length: 10 }, (_, i) => +(burstBase + i * 0.4 + jitter).toFixed(3));
  return { normal, skill, burst };
}

function buildCharacter(id, raw) {
  const seed = hash(id);
  const base = STAT_BASE[raw.star];
  const variance = 0.85 + ((seed % 150) / 1000); // 0.85 - 0.99
  const mod = ELEMENT_MOD[raw.elemental] || {};

  const baseHP = Math.round((base.hp[0] + (base.hp[1] - base.hp[0]) * ((seed % 100) / 100)) * variance * (mod.hp || 1));
  const baseATK = Math.round((base.atk[0] + (base.atk[1] - base.atk[0]) * ((seed % 97) / 100)) * variance * (mod.atk || 1));
  const baseDEF = Math.round((base.def[0] + (base.def[1] - base.def[0]) * ((seed % 89) / 100)) * variance * (mod.def || 1));

  const region = REGIONS[seed % REGIONS.length];
  const talents = genTalents(seed, 1.0 + (raw.star === 5 ? 0.3 : 0), 1.6 + (raw.star === 5 ? 0.4 : 0.1));

  return {
    id,
    name: id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    elemental: raw.elemental,
    type: raw.type,
    star: raw.star,
    region,
    baseHP,
    baseATK,
    baseDEF,
    talents,
    // ascension: [20,40,50,60,70,80] masing2 butuh material
    ascensionCosts: [
      { mora: 20000, items: [{ item: `sliver_${raw.elemental}`, qty: 1 }, { item: `common_${raw.type}`, qty: 3 }] },
      { mora: 40000, items: [{ item: `fragment_${raw.elemental}`, qty: 3 }, { item: `boss_${raw.elemental}`, qty: 2 }, { item: `${region}_specialty`, qty: 10 }, { item: `common_${raw.type}`, qty: 15 }] },
      { mora: 60000, items: [{ item: `fragment_${raw.elemental}`, qty: 6 }, { item: `boss_${raw.elemental}`, qty: 4 }, { item: `${region}_specialty`, qty: 20 }, { item: `common_${raw.type}`, qty: 12 }] },
      { mora: 80000, items: [{ item: `chunk_${raw.elemental}`, qty: 3 }, { item: `boss_${raw.elemental}`, qty: 8 }, { item: `${region}_specialty`, qty: 30 }, { item: `common_${raw.type}`, qty: 18 }] },
      { mora: 100000, items: [{ item: `chunk_${raw.elemental}`, qty: 6 }, { item: `boss_${raw.elemental}`, qty: 12 }, { item: `${region}_specialty`, qty: 45 }, { item: `common_${raw.type}`, qty: 12 }] },
      { mora: 120000, items: [{ item: `gem_${raw.elemental}`, qty: 6 }, { item: `boss_${raw.elemental}`, qty: 20 }, { item: `${region}_specialty`, qty: 60 }, { item: `common_${raw.type}`, qty: 24 }] },
    ],
    // constellation: efek gameplay generik per C-level
    constellationEffects: [
      "Skill DMG +10%",
      "Burst DMG +10%",
      "Skill talent +3 level",
      "Reaction DMG +15%",
      "Burst talent +3 level",
      "All DMG +20%",
    ],
  };
}

/* ---------------- EXPORT ---------------- */

export const characters = Object.fromEntries(
  Object.entries(RAW).map(([id, raw]) => [id, buildCharacter(id, raw)])
);

export function getCharacter(id) {
  return characters[id] || null;
}

/** stats pada level & ascension tertentu (interpolasi linear). */
export function characterStats(charId, level = 1, ascension = 0) {
  const c = getCharacter(charId);
  if (!c) return null;
  const f = 0.15 + 0.85 * (Math.min(level, 90) / 90) + ascension * 0.02;
  return {
    hp: Math.round(c.baseHP * f),
    atk: Math.round(c.baseATK * f),
    def: Math.round(c.baseDEF * f),
  };
}

/** multiplier talent berdasarkan level talent (1..10). */
export function talentMultiplier(charId, which, talentLevel) {
  const c = getCharacter(charId);
  if (!c) return 1;
  const arr = c.talents[which] || c.talents.normal;
  const lvl = Math.min(Math.max(talentLevel, 1), 10);
  return arr[lvl - 1];
}

/** bonus damage dari constellation (C0 → 0). */
export function constellationDamageBonus(charId, constellation) {
  let bonus = 1;
  const c = getCharacter(charId);
  if (!c) return bonus;
  const effects = c.constellationEffects;
  for (let i = 0; i < Math.min(constellation, 6); i++) {
    const eff = effects[i] || "";
    if (eff.includes("Skill talent")) bonus *= 1.12;
    if (eff.includes("Burst talent")) bonus *= 1.12;
    if (eff.includes("Reaction")) bonus *= 1.15;
    if (eff.includes("All DMG")) bonus *= 1.2;
  }
  return bonus;
}
