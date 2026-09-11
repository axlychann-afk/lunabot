import { characters } from './character.js';
import { weapons } from './weapon.js';
import { artifacts } from './artifacts.js';

/**
 * Menghitung damage akhir berdasarkan build user
 */
export function calculateDamage(user) {
    const char = characters[user.activeChar];
    if (!char) return { total: 0, isCrit: false, element: "none" };

    let wpType = char.type.replace('-', '_');
    if (wpType === "archer") wpType = "archer"; 
    if (wpType === "mage") wpType = "mage";

    const wpCategory = weapons[wpType];
    if (!wpCategory) {
        return { total: 10, isCrit: false, element: char.elemental };
    }

    const wpData = wpCategory[user.weapon];
    if (!wpData) {
        return { total: 50, isCrit: false, element: char.elemental };
    }
    
    let totalAtk = 100; 
    let bonusDmg = 0;
    let critRate = 0.05;
    let critDmg = 0.50;

    totalAtk += wpData.base_atk;
    if (wpData.sub_stat === "atk") totalAtk += (totalAtk * (wpData.sub_value / 100));
    if (wpData.sub_stat === "crit_rate") critRate += (wpData.sub_value / 100);
    if (wpData.sub_stat === "crit_dmg") critDmg += (wpData.sub_value / 100);

    let artSet = null;
    const targetArt = (user.artifactSet || "").toLowerCase();

    for (let tier in artifacts) {
        const tierData = artifacts[tier];
        const foundKey = Object.keys(tierData).find(k => k.toLowerCase() === targetArt);
        if (foundKey) {
            artSet = tierData[foundKey];
            break;
        }
    }

    if (artSet && user.artifactCount >= 2) {
        if (artSet.two_piece?.includes("ATK +18%")) totalAtk *= 1.18;
        if (artSet.two_piece?.includes("DMG Bonus +15%")) bonusDmg += 0.15;
        if (artSet.two_piece?.includes("Max HP +1000")) totalAtk += 50; 
    }
    
    if (artSet && user.artifactCount >= 4) {
        if (user.artifactSet === "gladiators_finale" && ["sword", "great_sword", "spearman"].includes(wpType)) {
            bonusDmg += 0.35;
        }

        if (artSet.four_piece?.includes("DMG Bonus")) {
            bonusDmg += 0.25;
        }
    }

    let damage = totalAtk * (1 + bonusDmg);
    let isCrit = false;

    if (Math.random() < critRate) {
        damage *= (1 + critDmg);
        isCrit = true;
    }

    return { 
        total: Math.floor(damage), 
        isCrit, 
        element: char.elemental 
    };
}


/**
 * Logika Elemental Reaction Lengkap (Vaporize, Melt, Freeze, Overload, etc.)
 * Berdasarkan data dari character.js dan monsters.js
 */
export function getReaction(charElement, monsterElement) {
    const r = (name, mult, effect = null) => ({ name, mult, effect });

    if (charElement === "hydro" && monsterElement === "pyro") return r("Vaporize 💧🔥", 2.0);
    if (charElement === "pyro" && monsterElement === "hydro") return r("Vaporize 🔥💧", 1.5);
    if (charElement === "pyro" && monsterElement === "cryo") return r("Melt 🔥❄️", 2.0);
    if (charElement === "cryo" && monsterElement === "pyro") return r("Melt ❄️🔥", 1.5);

    if ((charElement === "hydro" && monsterElement === "cryo") || 
        (charElement === "cryo" && monsterElement === "hydro")) {
        return r("Frozen ❄️🧊", 1.0, "Musuh membeku! Tidak bisa menyerang balik selama 1 turn.");
    }

    if ((charElement === "electro" && monsterElement === "pyro") || 
        (charElement === "pyro" && monsterElement === "electro")) {
        return r("Overloaded 💥⚡", 1.25, "Ledakan Pyro! Menghancurkan shield musuh dengan cepat.");
    }

    if ((charElement === "electro" && monsterElement === "cryo") || 
        (charElement === "cryo" && monsterElement === "electro")) {
        return r("Superconduct ❄️⚡", 1.15, "RES Fisik musuh berkurang drastis!");
    }

    if (charElement === "anemo" && ["pyro", "hydro", "cryo", "electro"].includes(monsterElement)) {
        return r("Swirl 🌪️✨", 1.2, "Menyebarkan elemen dan mengurangi RES musuh.");
    }

    if (charElement === "geo" && ["pyro", "hydro", "cryo", "electro"].includes(monsterElement)) {
        return r("Crystallize 💎🛡️", 1.0, "Kamu mendapatkan Shield elemen!");
    }

    if ((charElement === "dendro" && monsterElement === "hydro") || 
        (charElement === "hydro" && monsterElement === "dendro")) {
        return r("Bloom 🌿💧", 1.5, "Muncul Dendro Core di lapangan!");
    }

    if ((charElement === "dendro" && monsterElement === "electro") || 
        (charElement === "electro" && monsterElement === "dendro")) {
        return r("Quicken 🌿⚡", 1.2, "Musuh masuk ke status Catalyze.");
    }

    return r(null, 1.0);
}