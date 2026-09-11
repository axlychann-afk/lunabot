export const monsters = [

  // =========================
  // SLIMES
  // =========================
  {
    name: "Pyro Slime",
    element: "pyro",
    hpRequired: 450,
    exp: 70,
    loot: [
      { item: "slime_condensate", chance: 85, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 200, max: 600 }
    ]
  },
  {
    name: "Cryo Slime",
    element: "cryo",
    hpRequired: 450,
    exp: 70,
    loot: [
      { item: "slime_condensate", chance: 85, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 200, max: 600 }
    ]
  },
  {
    name: "Hydro Slime",
    element: "hydro",
    hpRequired: 500,
    exp: 75,
    loot: [
      { item: "slime_secretions", chance: 70, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 250, max: 700 }
    ]
  },
  {
    name: "Electro Slime",
    element: "electro",
    hpRequired: 550,
    exp: 80,
    loot: [
      { item: "slime_secretions", chance: 70, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 300, max: 800 }
    ]
  },
  {
    name: "Anemo Slime",
    element: "anemo",
    hpRequired: 520,
    exp: 80,
    loot: [
      { item: "slime_secretions", chance: 70, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 300, max: 800 }
    ]
  },

  // =========================
  // HILICHURL FAMILY
  // =========================
  {
    name: "Hilichurl",
    element: "none",
    hpRequired: 300,
    exp: 50,
    loot: [
      { item: "damaged_mask", chance: 70, min: 1, max: 3 },
      { item: "mora", chance: 100, min: 100, max: 500 }
    ]
  },
  {
    name: "Hilichurl Shooter",
    element: "none",
    hpRequired: 700,
    exp: 120,
    loot: [
      { item: "damaged_mask", chance: 80, min: 1, max: 3 },
      { item: "arrowhead", chance: 60, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 500, max: 1200 }
    ]
  },
  {
    name: "Mitachurl",
    element: "none",
    hpRequired: 4000,
    exp: 900,
    loot: [
      { item: "stained_mask", chance: 60, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 6000, max: 9000 }
    ]
  },
  {
    name: "Lawachurl",
    element: "cryo",
    hpRequired: 7000,
    exp: 1500,
    loot: [
      { item: "ominous_mask", chance: 70, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 9000, max: 15000 }
    ]
  },

  // =========================
  // ABYSS MAGES
  // =========================
  {
    name: "Pyro Abyss Mage",
    element: "pyro",
    hpRequired: 1200,
    exp: 250,
    loot: [
      { item: "dead_ley_line_branch", chance: 50, min: 1, max: 1 },
      { item: "mora", chance: 100, min: 1000, max: 2500 }
    ]
  },
  {
    name: "Cryo Abyss Mage",
    element: "cryo",
    hpRequired: 1200,
    exp: 250,
    loot: [
      { item: "dead_ley_line_branch", chance: 50, min: 1, max: 1 },
      { item: "mora", chance: 100, min: 1000, max: 2500 }
    ]
  },
  {
    name: "Hydro Abyss Mage",
    element: "hydro",
    hpRequired: 1300,
    exp: 260,
    loot: [
      { item: "dead_ley_line_branch", chance: 50, min: 1, max: 1 },
      { item: "mora", chance: 100, min: 1100, max: 2600 }
    ]
  },

  // =========================
  // RUIN MACHINES
  // =========================
  {
    name: "Ruin Guard",
    element: "none",
    hpRequired: 2500,
    exp: 500,
    loot: [
      { item: "chaos_device", chance: 40, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 3000, max: 5000 }
    ]
  },
  {
    name: "Ruin Hunter",
    element: "none",
    hpRequired: 5000,
    exp: 1100,
    loot: [
      { item: "chaos_circuit", chance: 45, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 7000, max: 10000 }
    ]
  },

  // =========================
  // INAZUMA MACHINES
  // =========================
  {
    name: "Ruin Sentinel: Scout",
    element: "none",
    hpRequired: 3200,
    exp: 700,
    loot: [
      { item: "chaos_gear", chance: 50, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 4000, max: 7000 }
    ]
  },
  {
    name: "Ruin Sentinel: Destroyer",
    element: "none",
    hpRequired: 4200,
    exp: 850,
    loot: [
      { item: "chaos_axis", chance: 45, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 6000, max: 9000 }
    ]
  },

  // =========================
  // HYPOSTASIS BOSSES
  // =========================
  {
    name: "Anemo Hypostasis",
    element: "anemo",
    hpRequired: 9000,
    exp: 2200,
    loot: [
      { item: "hurricane_seed", chance: 100, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 12000, max: 20000 },
      { item: "primogems", chance: 12, min: 5, max: 20 }
    ]
  },
  {
    name: "Geo Hypostasis",
    element: "geo",
    hpRequired: 9200,
    exp: 2300,
    loot: [
      { item: "basalt_pillar", chance: 100, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 13000, max: 21000 },
      { item: "primogems", chance: 12, min: 5, max: 20 }
    ]
  },
  {
    name: "Electro Hypostasis",
    element: "electro",
    hpRequired: 9200,
    exp: 2300,
    loot: [
      { item: "lightning_prism", chance: 100, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 13000, max: 21000 },
      { item: "primogems", chance: 12, min: 5, max: 20 }
    ]
  },

  // =========================
  // BOSS
  // =========================
  {
    name: "Maguu Kenki",
    element: "anemo",
    hpRequired: 8000,
    exp: 2000,
    loot: [
      { item: "marionette_core", chance: 100, min: 1, max: 2 },
      { item: "mora", chance: 100, min: 10000, max: 20000 },
      { item: "primogems", chance: 10, min: 5, max: 20 }
    ]
  }
];