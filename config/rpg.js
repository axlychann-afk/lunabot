/* =====================================================
 * CONFIG RPG — semua angka balancing terpusat di sini
 * Ubah nilai di file ini, jangan hardcode di plugin/engine.
 * ===================================================== */

export const rpgConfig = {
  /* ---------- PLAYER ---------- */
  player: {
    starter: {
      mora: 1000,
      primogems: 160,
      characters: ["amber"],
      weapon: "slingshot",
      artifactSet: "adventurer",
      artifactRarity: 3,
    },
    nameMaxLength: 20,
    nameMinLength: 3,
  },

  /* ---------- RESIN ---------- */
  resin: {
    max: 160,
    regenMinutes: 8, // +1 resin setiap 8 menit
    fragileToResin: 60,
    condensedToResin: 40,
    maxCondensed: 5,
  },

  /* ---------- ADVENTURE RANK & WORLD LEVEL ---------- */
  adventureRank: {
    // exp kumulatif yang dibutuhkan untuk naik ke rank berikutnya
    expCurve: [
      0, 225, 375, 500, 625, 750, 875, 1000, 1125, 1250,
      1375, 1500, 1625, 1750, 1875, 2000, 2125, 2250, 2375, 2500,
      2625, 2750, 2875, 3000, 3125, 3250, 3375, 3500, 3625, 3750,
      3875, 4000, 4125, 4250, 4375, 4500, 4625, 4750, 4875, 5000,
      5125, 5250, 5375, 5500, 5625, 5750, 5875, 6000, 6125, 6250,
      6375, 6500, 6625, 6750, 6875, 7000, 7125, 7250, 7375, 7500,
    ],
    // world level unlock berdasarkan adventure rank
    worldLevelByAR: {
      0: 20, // AR 20 → WL 0 (bisa naik via quest)
      1: 25, 2: 30, 3: 35, 4: 40, 5: 45, 6: 50, 7: 55, 8: 60,
    },
    maxWorldLevel: 9,
    // reward adventure exp per aktivitas
    expRewards: {
      hunt: 20, daily: 100, domain: 45, boss: 60, quest: 150,
      exploration: 30, commission: 40, abyss: 80, weeklyBoss: 75,
    },
  },

  /* ---------- GACHA ---------- */
  gacha: {
    costPrimogems: 160,
    costFate: 1, // 1 intertwined fate
    fiveStarPity: 90,
    fourStarPity: 10,
    softPityStart: 75, // mulai soft pity
    softPityBonus: 6, // +6% per pull setelah soft pity
    baseFiveStarRate: 0.006,
    baseFourStarRate: 0.051,
    featuredRate: 0.5, // 50/50
    dupeCharC6: { starglitter: 25 }, // dupe char saat C6 → starglitter
    dupeWeaponR5: { starglitter: 5 },
  },

  /* ---------- DAILY ---------- */
  daily: {
    resetHour: 4, // reset jam 4 pagi (WIB)
    mora: [3000, 8000],
    primogems: [60, 160],
    limitBot: [5, 20],
    exp: 150,
    friendship: 15,
  },

  /* ---------- EXPEDITION ---------- */
  expedition: {
    durations: {
      "4h":  { time: 4 * 3600000,  mult: 1, label: "4 Jam" },
      "8h":  { time: 8 * 3600000,  mult: 2, label: "8 Jam" },
      "12h": { time: 12 * 3600000, mult: 3, label: "12 Jam" },
      "20h": { time: 20 * 3600000, mult: 5, label: "20 Jam" },
    },
    maxSlots: 2,
    elementBonus: 0.25, // karakter sesuai elemen region → +25% reward
    friendshipPerClaim: 20,
    charExpPerClaim: 50,
  },

  /* ---------- CHARACTER ---------- */
  character: {
    maxLevel: 90,
    levelCaps: [20, 40, 50, 60, 70, 80, 90], // batas per ascension
    expPerLevel: 120, // exp dasar per level (dikalikan level)
    moraPerLevel: 100,
    expItems: { "wanderers_advice": 1000, "adventurers_experience": 5000, "heroes_wit": 20000 },
    talentMaxLevel: 10,
    talentMora: [500, 1000, 2000, 4000, 6000, 10000, 15000, 25000, 40000, 60000],
    talentBookTiers: { 1: "teachings", 2: "guide", 3: "philosophies" },
    friendshipMax: 10,
  },

  /* ---------- WEAPON ---------- */
  weapon: {
    maxLevel: 90,
    levelCaps: [20, 40, 50, 60, 70, 80, 90],
    expPerLevel: 100,
    moraPerLevel: 80,
    refinementMax: 5,
  },

  /* ---------- ARTIFACT ---------- */
  artifact: {
    maxLevel: 20,
    moraPerLevel: 200,
    xpPerLevel: 500,
    maxSubStats: 4,
    milestoneLevels: [4, 8, 12, 16, 20],
    rarityMainStat: { // nilai main stat dasar per rarity (level 0)
      3: { flat: 600, percent: 0.05 },
      4: { flat: 800, percent: 0.07 },
      5: { flat: 1000, percent: 0.09 },
    },
    raritySubStat: { 3: { min: 20, max: 60 }, 4: { min: 30, max: 80 }, 5: { min: 40, max: 100 } },
    setBonusThresholds: [2, 4],
  },

  /* ---------- BATTLE ---------- */
  battle: {
    baseCritRate: 0.05,
    baseCritDmg: 0.5,
    baseAtk: 0, // diganti per karakter
    defReductionConstant: 200,
    emReactionBonus: (em) => 1 + (em * 2) / (em + 1000),
  },

  /* ---------- DOMAIN ---------- */
  domain: {
    resinCost: 20,
    weeklyBossResinCost: 30,
    leyLineResinCost: 20,
    weeklyResetDay: 1, // Senin
    weeklyResetHour: 4,
  },

  /* ---------- ABYSS ---------- */
  abyss: {
    resetDays: 14,
    floors: 12,
    chambersPerFloor: 3,
    maxStarsPerChamber: 3,
  },

  /* ---------- BATTLE PASS ---------- */
  battlepass: {
    seasonId: "season_1",
    maxLevel: 50,
    expPerLevel: 1000,
    expRewards: { daily: 500, hunt: 80, domain: 150, quest: 200, abyss: 300, weeklyBoss: 250 },
  },

  /* ---------- EXPLORATION ---------- */
  exploration: {
    chestTypes: {
      common: { mora: [500, 1500], primogems: 2, weight: 45 },
      exquisite: { mora: [1500, 3000], primogems: 5, weight: 25 },
      precious: { mora: [3000, 6000], primogems: 10, weight: 8 },
      luxurious: { mora: [6000, 12000], primogems: 20, weight: 3 },
    },
    arExpPerEvent: 30,
  },

  /* ---------- FRIENDSHIP ---------- */
  friendship: {
    expPerLevel: 100,
    maxLevel: 10,
    rewardPerLevel: { primogems: 10 },
  },

  /* ---------- POTION ---------- */
  potion: {
    durationMinutes: 30,
    buffs: {
      pyro_dmg_potion: { element: "pyro", dmgBonus: 0.25 },
      hydro_dmg_potion: { element: "hydro", dmgBonus: 0.25 },
      electro_dmg_potion: { element: "electro", dmgBonus: 0.25 },
      cryo_dmg_potion: { element: "cryo", dmgBonus: 0.25 },
      anemo_dmg_potion: { element: "anemo", dmgBonus: 0.25 },
      geo_dmg_potion: { element: "geo", dmgBonus: 0.25 },
      dendro_dmg_potion: { element: "dendro", dmgBonus: 0.25 },
      atk_potion: { element: null, atkBonus: 0.2 },
      def_potion: { element: null, defBonus: 0.2 },
    },
  },

  /* ---------- TEAPOT ---------- */
  teapot: {
    maxTrustRank: 10,
    trustExpPerLevel: 200,
    weeklyRealmCurrency: 500,
  },
};
