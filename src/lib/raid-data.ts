
import { WowClass, WowSpec } from "./wow-classes";

export enum RaidBuff {
    AttackPower = "Attack Power",
    Intellect = "Intellect",
    Stamina = "Stamina",
    Versatility = "Versatility",
    DamageReduction = "3% DR (Devo)",
    MagicDamage = "5% Magic Dmg",
    PhysicalDamage = "5% Phys Dmg",
    MovementCDR = "Movement CDR",
    HuntersMark = "Hunter's Mark",
    AtrophicPoison = "Atrophic Poison",
    Skyfury = "Skyfury/Windfury"
}

export enum RaidUtility {
    Bloodlust = "Bloodlust/Heroism",
    CombatRes = "Combat Res",
    MortalWounds = "Mortal Wounds",
    Soothe = "Enrage Dispel",
    MeleeSlowStack = "Melee Slow (Stacking)",

    // Group Utility
    WarlockKit = "Gateway/Healthstone",
    Roar = "Stampeding Roar",
    WindRush = "Wind Rush Totem",
    TimeSpiral = "Time Spiral",
    MassDispel = "Mass Dispel",
    MassInvis = "Mass Invisibility/Shroud",

    // Support
    PowerInfusion = "Power Infusion",
    Innervate = "Innervate",
    SymbolOfHope = "Symbol of Hope",
    ManaTide = "Mana Tide Totem",
    SourceOfMagic = "Source of Magic",
    Augmentation = "Augmentation Prescence",

    // Raid CDs
    AMZ = "Anti-Magic Zone",
    Darkness = "Darkness",
    RallyingCry = "Rallying Cry",
    AuraMastery = "Aura Mastery",
    SpiritLink = "Spirit Link Totem",
    Revival = "Revival",
    Barrier = "Pain Barrier",
    Hymn = "Divine Hymn",
    Rewind = "Rewind",
    Zephyr = "Zephyr",

    // External CDs
    Ironbark = "Ironbark",
    PainSupp = "Pain Suppression",
    GuardianSpirit = "Guardian Spirit",
    Sacrifice = "Blessing of Sacrifice",
    TimeDilation = "Time Dilation",
    LifeCocoon = "Life Cocoon",

    // Movement Externals
    TigersLust = "Tiger's Lust",
    BlessingOfFreedom = "Blessing of Freedom",
    LeapOfFaith = "Leap of Faith",
    Rescue = "Rescue",
    SpatialParadox = "Spatial Paradox",

    // Immunities
    DivineShield = "Divine Shield",
    IceBlock = "Ice Block",
    Turtle = "Aspect of the Turtle",
    Cloak = "Cloak of Shadows",
    BoP = "Blessing of Protection",
    BoS = "Blessing of Spellwarding",

    // Dispels
    MagicDispel = "Magic Dispel",
    PoisonDispel = "Poison Dispel",
    CurseDispel = "Curse Dispel",
    DiseaseDispel = "Disease Dispel",

    // CC & Control
    AoeStun = "AOE Stun",
    StStun = "Single Target Stun",
    Knock = "Knockbacks",
    Grip = "Grips",
    AoeGrip = "AOE Grips / Pulls",
    Sucks = "Sucks",
    Slow = "Slows",
    HardCC = "Hard CC",
    OppressingRoar = "Oppressing Roar"
}

export enum ArmorType {
    Cloth = "Cloth",
    Leather = "Leather",
    Mail = "Mail",
    Plate = "Plate"
}

export enum TierToken {
    Zenith = "Zenith (Evoker, Monk, Rogue, Warrior)",
    Dreadful = "Dreadful (DK, DH, Lock)",
    Mystic = "Mystic (Druid, Hunter, Mage)",
    Venerated = "Venerated (Paladin, Priest, Shaman)"
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

export enum MainStat {
    Intellect = "Intellect",
    Agility = "Agility",
    Strength = "Strength"
}

export const SPEC_MAIN_STATS: Record<string, MainStat> = {

    // Death Knight
    "death_knight": MainStat.Strength,

    // Demon Hunter
    "demon_hunter": MainStat.Agility,
    "demon_hunter-devourer": MainStat.Intellect, // Custom spec in this codebase? "Devourer"? Let's support it if it's there.

    // Druid
    "druid-balance": MainStat.Intellect,
    "druid-restoration": MainStat.Intellect,
    "druid-feral": MainStat.Agility,
    "druid-guardian": MainStat.Agility,

    // Evoker
    "evoker": MainStat.Intellect,

    // Hunter
    "hunter": MainStat.Agility,

    // Mage
    "mage": MainStat.Intellect,

    // Monk
    "monk-mistweaver": MainStat.Intellect,
    "monk-brewmaster": MainStat.Agility,
    "monk-windwalker": MainStat.Agility,

    // Paladin
    "paladin-holy": MainStat.Intellect,
    "paladin-protection": MainStat.Strength,
    "paladin-retribution": MainStat.Strength,

    // Priest
    "priest": MainStat.Intellect,

    // Rogue
    "rogue": MainStat.Agility,

    // Shaman
    "shaman-elemental": MainStat.Intellect,
    "shaman-restoration": MainStat.Intellect,
    "shaman-enhancement": MainStat.Agility,

    // Warlock
    "warlock": MainStat.Intellect,

    // Warrior
    "warrior": MainStat.Strength
};

// Capabilities by Class/Spec
// Format: "classId-specId" or just "classId" if it applies to all specs
export const SPEC_CAPABILITIES: Record<string, { buffs: RaidBuff[], utilities: RaidUtility[] }> = {
    // DEATH KNIGHT
    "death_knight": {
        buffs: [],
        utilities: [RaidUtility.CombatRes, RaidUtility.AMZ, RaidUtility.MeleeSlowStack, RaidUtility.MagicDispel, RaidUtility.Grip, RaidUtility.StStun, RaidUtility.Slow]
    },
    "death_knight-blood": {
        buffs: [],
        utilities: [RaidUtility.AoeGrip]
    },

    // DEMON HUNTER
    "demon_hunter": {
        buffs: [RaidBuff.MagicDamage],
        utilities: [RaidUtility.Darkness, RaidUtility.AoeStun, RaidUtility.HardCC, RaidUtility.Slow, RaidUtility.Grip]
    },
    "demon_hunter-havoc": {
        buffs: [],
        utilities: [RaidUtility.MortalWounds]
    },
    "demon_hunter-vengeance": {
        buffs: [],
        utilities: [RaidUtility.AoeGrip]
    },

    // DRUID
    "druid": {
        buffs: [RaidBuff.Versatility],
        utilities: [RaidUtility.CombatRes, RaidUtility.Roar, RaidUtility.Soothe, RaidUtility.PoisonDispel, RaidUtility.CurseDispel, RaidUtility.Knock, RaidUtility.Slow, RaidUtility.HardCC, RaidUtility.Sucks, RaidUtility.StStun]
    },
    "druid-restoration": {
        buffs: [],
        utilities: [RaidUtility.Innervate, RaidUtility.Ironbark, RaidUtility.MagicDispel]
    },

    // EVOKER
    "evoker": {
        buffs: [RaidBuff.MovementCDR],
        utilities: [RaidUtility.Bloodlust, RaidUtility.Zephyr, RaidUtility.TimeSpiral, RaidUtility.Rescue, RaidUtility.SpatialParadox, RaidUtility.SourceOfMagic, RaidUtility.PoisonDispel, RaidUtility.CurseDispel, RaidUtility.MagicDispel, RaidUtility.Knock, RaidUtility.Slow, RaidUtility.HardCC, RaidUtility.OppressingRoar]
    },
    "evoker-preservation": {
        buffs: [],
        utilities: [RaidUtility.Soothe, RaidUtility.Rewind, RaidUtility.TimeDilation]
    },
    "evoker-augmentation": {
        buffs: [],
        utilities: [RaidUtility.Soothe, RaidUtility.Augmentation]
    },

    // HUNTER
    "hunter": {
        buffs: [RaidBuff.HuntersMark],
        utilities: [RaidUtility.Bloodlust, RaidUtility.Soothe, RaidUtility.MortalWounds, RaidUtility.Turtle, RaidUtility.Knock, RaidUtility.HardCC, RaidUtility.Slow, RaidUtility.StStun]
    },

    // MAGE
    "mage": {
        buffs: [RaidBuff.Intellect],
        utilities: [RaidUtility.Bloodlust, RaidUtility.MassInvis, RaidUtility.CurseDispel, RaidUtility.IceBlock, RaidUtility.Slow, RaidUtility.HardCC, RaidUtility.Knock]
    },

    // MONK
    "monk": {
        buffs: [RaidBuff.PhysicalDamage],
        utilities: [RaidUtility.PoisonDispel, RaidUtility.DiseaseDispel, RaidUtility.Soothe, RaidUtility.TigersLust, RaidUtility.AoeStun, RaidUtility.Knock, RaidUtility.HardCC]
    },
    "monk-mistweaver": {
        buffs: [],
        utilities: [RaidUtility.Revival, RaidUtility.LifeCocoon, RaidUtility.MagicDispel]
    },
    "monk-windwalker": {
        buffs: [],
        utilities: [RaidUtility.StStun]
    },

    // PALADIN
    "paladin": {
        buffs: [RaidBuff.DamageReduction],
        utilities: [RaidUtility.CombatRes, RaidUtility.Sacrifice, RaidUtility.BlessingOfFreedom, RaidUtility.PoisonDispel, RaidUtility.DiseaseDispel, RaidUtility.DivineShield, RaidUtility.BoP, RaidUtility.HardCC, RaidUtility.Slow, RaidUtility.StStun]
    },
    "paladin-holy": {
        buffs: [],
        utilities: [RaidUtility.AuraMastery, RaidUtility.MagicDispel]
    },
    "paladin-protection": {
        buffs: [],
        utilities: [RaidUtility.BoS]
    },

    // PRIEST
    "priest": {
        buffs: [RaidBuff.Stamina],
        utilities: [RaidUtility.MassDispel, RaidUtility.PowerInfusion, RaidUtility.LeapOfFaith, RaidUtility.DiseaseDispel, RaidUtility.HardCC, RaidUtility.Slow]
    },
    "priest-discipline": {
        buffs: [],
        utilities: [RaidUtility.Barrier, RaidUtility.PainSupp, RaidUtility.MagicDispel]
    },
    "priest-holy": {
        buffs: [],
        utilities: [RaidUtility.Hymn, RaidUtility.GuardianSpirit, RaidUtility.SymbolOfHope, RaidUtility.MagicDispel, RaidUtility.StStun]
    },

    // ROGUE
    "rogue": {
        buffs: [RaidBuff.AtrophicPoison],
        utilities: [RaidUtility.MassInvis, RaidUtility.MeleeSlowStack, RaidUtility.MortalWounds, RaidUtility.Soothe, RaidUtility.Cloak, RaidUtility.HardCC, RaidUtility.Slow, RaidUtility.StStun]
    },

    // SHAMAN
    "shaman": {
        buffs: [RaidBuff.Skyfury],
        utilities: [RaidUtility.Bloodlust, RaidUtility.WindRush, RaidUtility.CurseDispel, RaidUtility.AoeStun, RaidUtility.Knock, RaidUtility.Slow, RaidUtility.HardCC]
    },
    "shaman-restoration": {
        buffs: [],
        utilities: [RaidUtility.SpiritLink, RaidUtility.ManaTide, RaidUtility.MagicDispel]
    },

    // WARLOCK
    "warlock": {
        buffs: [],
        utilities: [RaidUtility.CombatRes, RaidUtility.WarlockKit, RaidUtility.MeleeSlowStack, RaidUtility.MagicDispel, RaidUtility.AoeStun, RaidUtility.HardCC, RaidUtility.Slow]
    },
    "warlock-demonology": {
        buffs: [],
        utilities: [RaidUtility.StStun]
    },

    // WARRIOR
    "warrior": {
        buffs: [RaidBuff.AttackPower],
        utilities: [RaidUtility.RallyingCry, RaidUtility.AoeStun, RaidUtility.Slow, RaidUtility.StStun]
    },
    "warrior-arms": {
        buffs: [],
        utilities: [RaidUtility.MortalWounds, RaidUtility.Sucks]
    },
    "warrior-fury": {
        buffs: [],
        utilities: [RaidUtility.Sucks]
    },
};

export const getCapabilities = (classId: string, specId?: string) => {
    // Base class capabilities
    const classCaps = SPEC_CAPABILITIES[classId] || { buffs: [], utilities: [] };

    if (specId) {
        const specKey = `${classId}-${specId}`;
        const specCaps = SPEC_CAPABILITIES[specKey];

        if (specCaps) {
            return {
                buffs: Array.from(new Set([...classCaps.buffs, ...specCaps.buffs])),
                utilities: Array.from(new Set([...classCaps.utilities, ...specCaps.utilities]))
            };
        }
    }

    return classCaps;
};
