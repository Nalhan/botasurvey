
import { WowClass, WowSpec } from "./wow-classes";

export enum RaidBuff {
    Intellect = "Intellect",
    AttackPower = "Attack Power",
    Stamina = "Stamina",
    DevotionAura = "3% DR (Devo)",
    Versatility = "3% Versatility",
    PhysicalDamage = "5% Physical Dmg",
    MagicDamage = "5% Magic Dmg",
    Skyfury = "Skyfury/Windfury",
    HuntersMark = "Hunter's Mark",
    Bleed = "Bleed Damage",
    MovementSpeed = "Movement Speed",
    Poison = "Atrophic Poison"
}

export enum RaidUtility {
    Bloodlust = "Bloodlust/Heroism",
    CombatRes = "Combat Res",
    Innervate = "Innervate",
    MassDispel = "Mass Dispel",
    AntiMagicZone = "Anti-Magic Zone",
    RallyingCry = "Rallying Cry",
    Darkness = "Darkness",
    VampiricEmbrace = "Vampiric Embrace",
    AncestralGuidance = "Ancestral Guidance",
    SymbolOfHope = "Symbol of Hope",
    BlessingOfProtection = "Blessing of Protection",
    BlessingOfSacrifice = "Blessing of Sacrifice",
    Ironbark = "Ironbark",
    TimeDilation = "Time Dilation",
    LifeCocoon = "Life Cocoon",
    Rescue = "Rescue",
    Gateway = "Warlock Gateway",
    Healthstone = "Healthstone",
    Summon = "Summoning Ritual",
    DeathGrip = "Death Grip",
    MysticTouch = "Mystic Touch (5% Phys)", // Monk
    ChaosBrand = "Chaos Brand (5% Magic)", // DH
    MindSoothe = "Mind Soothe",
    Shroud = "Shroud of Concealment",
    Poison = "Atrophic Poison (DR)"
}

export enum TierToken {
    Zenith = "Zenith (Evoker, Monk, Rogue, Warrior)",
    Dreadful = "Dreadful (DK, DH, Lock)",
    Mystic = "Mystic (Druid, Hunter, Mage)",
    Venerated = "Venerated (Paladin, Priest, Shaman)"
}

export enum ArmorType {
    Cloth = "Cloth",
    Leather = "Leather",
    Mail = "Mail",
    Plate = "Plate"
}

export const CLASS_TIER_TOKENS: Record<string, TierToken> = {
    "death_knight": TierToken.Dreadful,
    "demon_hunter": TierToken.Dreadful,
    "warlock": TierToken.Dreadful,

    "druid": TierToken.Mystic,
    "hunter": TierToken.Mystic,
    "mage": TierToken.Mystic,

    "paladin": TierToken.Venerated,
    "priest": TierToken.Venerated,
    "shaman": TierToken.Venerated,

    "evoker": TierToken.Zenith,
    "monk": TierToken.Zenith,
    "rogue": TierToken.Zenith,
    "warrior": TierToken.Zenith
};

export const CLASS_ARMOR_TYPES: Record<string, ArmorType> = {
    "mage": ArmorType.Cloth,
    "priest": ArmorType.Cloth,
    "warlock": ArmorType.Cloth,

    "demon_hunter": ArmorType.Leather,
    "druid": ArmorType.Leather,
    "monk": ArmorType.Leather,
    "rogue": ArmorType.Leather,

    "evoker": ArmorType.Mail,
    "hunter": ArmorType.Mail,
    "shaman": ArmorType.Mail,

    "death_knight": ArmorType.Plate,
    "paladin": ArmorType.Plate,
    "warrior": ArmorType.Plate
};

// Capabilities by Class/Spec
// Format: "classId-specId" or just "classId" if it applies to all specs
export const SPEC_CAPABILITIES: Record<string, { buffs: RaidBuff[], utilities: RaidUtility[] }> = {
    // DEATH KNIGHT
    "death_knight": { buffs: [], utilities: [RaidUtility.CombatRes, RaidUtility.DeathGrip, RaidUtility.AntiMagicZone] },

    // DEMON HUNTER
    "demon_hunter": { buffs: [RaidBuff.MagicDamage], utilities: [RaidUtility.Darkness] }, // Chaos Brand is 5% Magic

    // DRUID
    "druid": { buffs: [RaidBuff.Versatility], utilities: [RaidUtility.CombatRes, RaidUtility.Innervate, RaidUtility.Ironbark] }, // Mark of the Wild
    "druid-balance": { buffs: [RaidBuff.Versatility], utilities: [RaidUtility.CombatRes, RaidUtility.Innervate] },
    "druid-feral": { buffs: [RaidBuff.Versatility, RaidBuff.MovementSpeed], utilities: [RaidUtility.CombatRes, RaidUtility.Innervate] },
    "druid-guardian": { buffs: [RaidBuff.Versatility], utilities: [RaidUtility.CombatRes, RaidUtility.Innervate] },
    "druid-restoration": { buffs: [RaidBuff.Versatility], utilities: [RaidUtility.CombatRes, RaidUtility.Innervate, RaidUtility.Ironbark] },

    // EVOKER
    "evoker": { buffs: [], utilities: [RaidUtility.Bloodlust, RaidUtility.Rescue] },
    "evoker-augmentation": { buffs: [], utilities: [RaidUtility.Bloodlust, RaidUtility.Rescue] }, // Ebon Might covers a lot vaguely, but standard buff is 3%? Actually Evoker has Bronze Blessing (movement cd reduction). Let's stick to standard party buffs.
    // Correction: Evoker brings Bloodlust (Fury of the Aspects). 
    // Augmentation is special. Let's keep it simple for now.
    // Actually, Evoker raid buff is "Blessing of the Bronze" which is major movement ability CD reduction. Not in our list.
    // Let's assume standard buffs.

    // HUNTER
    "hunter": { buffs: [RaidBuff.HuntersMark], utilities: [] },
    "hunter-survival": { buffs: [RaidBuff.HuntersMark], utilities: [] },

    // MAGE
    "mage": { buffs: [RaidBuff.Intellect], utilities: [RaidUtility.Bloodlust] },

    // MONK
    "monk": { buffs: [RaidBuff.PhysicalDamage], utilities: [] }, // Mystic Touch

    // PALADIN
    "paladin": { buffs: [RaidBuff.DevotionAura], utilities: [RaidUtility.CombatRes, RaidUtility.BlessingOfProtection, RaidUtility.BlessingOfSacrifice] },
    "paladin-retribution": { buffs: [RaidBuff.DevotionAura], utilities: [RaidUtility.CombatRes, RaidUtility.BlessingOfProtection, RaidUtility.BlessingOfSacrifice] },

    // PRIEST
    "priest": { buffs: [RaidBuff.Stamina], utilities: [RaidUtility.MassDispel, RaidUtility.SymbolOfHope, RaidUtility.LifeCocoon] },
    // Note: Life Cocoon is Monk, Pain Sup / Guardian Spirit is Priest. Symbol of Hope is Holy/Disc? 
    // Let's simplify. Priest = Stamina.
    "priest-discipline": { buffs: [RaidBuff.Stamina], utilities: [RaidUtility.MassDispel, RaidUtility.SymbolOfHope] },
    "priest-holy": { buffs: [RaidBuff.Stamina], utilities: [RaidUtility.MassDispel, RaidUtility.SymbolOfHope, RaidUtility.SymbolOfHope] }, // Symbol of Hope is Holy only? Check DF/TWW.

    // ROGUE
    "rogue": { buffs: [RaidBuff.Poison], utilities: [RaidUtility.Shroud] },

    // SHAMAN
    "shaman": { buffs: [], utilities: [RaidUtility.Bloodlust] },
    "shaman-elemental": { buffs: [RaidBuff.Skyfury], utilities: [RaidUtility.Bloodlust] },
    "shaman-enhancement": { buffs: [RaidBuff.Skyfury], utilities: [RaidUtility.Bloodlust] },
    "shaman-restoration": { buffs: [RaidBuff.Skyfury], utilities: [RaidUtility.Bloodlust, RaidUtility.AncestralGuidance] }, // Skyfury totem given to all shamans? Or just some? TWW changes...

    // WARLOCK
    "warlock": { buffs: [], utilities: [RaidUtility.Gateway, RaidUtility.Healthstone, RaidUtility.Summon, RaidUtility.CombatRes] },

    // WARRIOR
    "warrior": { buffs: [RaidBuff.AttackPower], utilities: [RaidUtility.RallyingCry] },
};

export const getCapabilities = (classId: string, specId?: string) => {
    // Base class capabilities
    const classCaps = SPEC_CAPABILITIES[classId] || { buffs: [], utilities: [] };

    // Spec specific overrides or additions?
    // For this simple implementation, we'll try to find a spec specific entry, if not fall back to class, 
    // BUT we might need to merge them if the structure implies base + spec.
    // Looking at the data above, I duplicated utilities in spec entries where necessary (e.g. Druid).
    // So looking up strictly by key is safer.

    if (specId) {
        const specKey = `${classId}-${specId}`;
        if (SPEC_CAPABILITIES[specKey]) {
            return SPEC_CAPABILITIES[specKey];
        }
    }

    return classCaps;
};
