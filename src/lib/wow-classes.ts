export type WowSpec = {
    id: string;
    name: string;
    icon: string;
    role: 'Tank' | 'Healer' | 'Damage';
    mainStat: 'intellect' | 'other';
    melee: boolean;
    displayName?: string;
}

export type WowClass = {
    id: string;
    name: string;
    color: string;
    icon: string;
    specs: WowSpec[];
}

export const WOW_CLASSES: WowClass[] = [
    {
        id: "death_knight",
        name: "Death Knight",
        color: "#C41F3B",
        icon: "classicon_deathknight",
        specs: [
            { id: "blood", name: "Blood", icon: "spell_deathknight_bloodpresence", role: 'Tank', mainStat: 'other', melee: true },
            { id: "frost", name: "Frost", icon: "spell_deathknight_frostpresence", role: 'Damage', mainStat: 'other', melee: true },
            { id: "unholy", name: "Unholy", icon: "spell_deathknight_unholypresence", role: 'Damage', mainStat: 'other', melee: true }
        ]
    },
    {
        id: "demon_hunter",
        name: "Demon Hunter",
        color: "#A330C9",
        icon: "classicon_demonhunter",
        specs: [
            { id: "havoc", name: "Havoc", icon: "ability_demonhunter_specdps", role: 'Damage', mainStat: 'other', melee: true },
            { id: "vengeance", name: "Vengeance", icon: "ability_demonhunter_spectank", role: 'Tank', mainStat: 'other', melee: true, displayName: 'VDH' },
            { id: "devourer", name: "Devourer", icon: "classicon_demonhunter_void", role: 'Damage', mainStat: 'intellect', melee: false }
        ]
    },
    {
        id: "druid",
        name: "Druid",
        color: "#FF7D0A",
        icon: "classicon_druid",
        specs: [
            { id: "balance", name: "Balance", icon: "spell_nature_starfall", role: 'Damage', mainStat: 'intellect', melee: false },
            { id: "feral", name: "Feral", icon: "ability_druid_catform", role: 'Damage', mainStat: 'other', melee: true },
            { id: "guardian", name: "Guardian", icon: "ability_racial_bearform", role: 'Tank', mainStat: 'other', melee: true },
            { id: "restoration", name: "Restoration", icon: "spell_nature_healingtouch", role: 'Healer', mainStat: 'intellect', melee: false, displayName: 'Resto Druid' }
        ]
    },
    {
        id: "evoker",
        name: "Evoker",
        color: "#33937F",
        icon: "classicon_evoker",
        specs: [
            { id: "augmentation", name: "Augmentation", icon: "classicon_evoker_augmentation", role: 'Damage', mainStat: 'intellect', melee: false },
            { id: "devastation", name: "Devastation", icon: "classicon_evoker_devastation", role: 'Damage', mainStat: 'intellect', melee: false },
            { id: "preservation", name: "Preservation", icon: "classicon_evoker_preservation", role: 'Healer', mainStat: 'intellect', melee: false }
        ]
    },
    {
        id: "hunter",
        name: "Hunter",
        color: "#ABD473",
        icon: "classicon_hunter",
        specs: [
            { id: "beast_mastery", name: "Beast Mastery", icon: "ability_hunter_bestialdiscipline", role: 'Damage', mainStat: 'other', melee: false },
            { id: "marksmanship", name: "Marksmanship", icon: "ability_hunter_focusedaim", role: 'Damage', mainStat: 'other', melee: false },
            { id: "survival", name: "Survival", icon: "ability_hunter_camouflage", role: 'Damage', mainStat: 'other', melee: true }
        ]
    },
    {
        id: "mage",
        name: "Mage",
        color: "#69CCF0",
        icon: "classicon_mage",
        specs: [
            { id: "arcane", name: "Arcane", icon: "spell_holy_magicalsentry", role: 'Damage', mainStat: 'intellect', melee: false },
            { id: "fire", name: "Fire", icon: "spell_fire_firebolt02", role: 'Damage', mainStat: 'intellect', melee: false },
            { id: "frost", name: "Frost", icon: "spell_frost_frostbolt02", role: 'Damage', mainStat: 'intellect', melee: false }
        ]
    },
    {
        id: "monk",
        name: "Monk",
        color: "#00FF96",
        icon: "classicon_monk",
        specs: [
            { id: "brewmaster", name: "Brewmaster", icon: "spell_monk_brewmaster_spec", role: 'Tank', mainStat: 'other', melee: true },
            { id: "mistweaver", name: "Mistweaver", icon: "spell_monk_mistweaver_spec", role: 'Healer', mainStat: 'intellect', melee: true },
            { id: "windwalker", name: "Windwalker", icon: "spell_monk_windwalker_spec", role: 'Damage', mainStat: 'other', melee: true }
        ]
    },
    {
        id: "paladin",
        name: "Paladin",
        color: "#F58CBA",
        icon: "classicon_paladin",
        specs: [
            { id: "holy", name: "Holy", icon: "spell_holy_holybolt", role: 'Healer', mainStat: 'intellect', melee: true, displayName: 'Holy Paladin' },
            { id: "protection", name: "Protection", icon: "ability_paladin_shieldofthetemplar", role: 'Tank', mainStat: 'other', melee: true, displayName: 'Prot Paladin' },
            { id: "retribution", name: "Retribution", icon: "spell_holy_auraoflight", role: 'Damage', mainStat: 'other', melee: true }
        ]
    },
    {
        id: "priest",
        name: "Priest",
        color: "#FFFFFF",
        icon: "classicon_priest",
        specs: [
            { id: "discipline", name: "Discipline", icon: "spell_holy_powerwordshield", role: 'Healer', mainStat: 'intellect', melee: false },
            { id: "holy", name: "Holy", icon: "spell_holy_guardianspirit", role: 'Healer', mainStat: 'intellect', melee: false, displayName: 'Holy Priest' },
            { id: "shadow", name: "Shadow", icon: "spell_shadow_shadowwordpain", role: 'Damage', mainStat: 'intellect', melee: false }
        ]
    },
    {
        id: "rogue",
        name: "Rogue",
        color: "#FFF569",
        icon: "classicon_rogue",
        specs: [
            { id: "assassination", name: "Assassination", icon: "ability_rogue_eviscerate", role: 'Damage', mainStat: 'other', melee: true },
            { id: "outlaw", name: "Outlaw", icon: "ability_rogue_waylay", role: 'Damage', mainStat: 'other', melee: true },
            { id: "subtlety", name: "Subtlety", icon: "ability_stealth", role: 'Damage', mainStat: 'other', melee: true }
        ]
    },
    {
        id: "shaman",
        name: "Shaman",
        color: "#0070DE",
        icon: "classicon_shaman",
        specs: [
            { id: "elemental", name: "Elemental", icon: "spell_nature_lightning", role: 'Damage', mainStat: 'intellect', melee: false },
            { id: "enhancement", name: "Enhancement", icon: "spell_shaman_improvedstormstrike", role: 'Damage', mainStat: 'other', melee: true },
            { id: "restoration", name: "Restoration", icon: "spell_nature_magicimmunity", role: 'Healer', mainStat: 'intellect', melee: false, displayName: 'Resto Shaman' }
        ]
    },
    {
        id: "warlock",
        name: "Warlock",
        color: "#9482C9",
        icon: "classicon_warlock",
        specs: [
            { id: "affliction", name: "Affliction", icon: "spell_shadow_deathcoil", role: 'Damage', mainStat: 'intellect', melee: false },
            { id: "demonology", name: "Demonology", icon: "spell_shadow_metamorphosis", role: 'Damage', mainStat: 'intellect', melee: false },
            { id: "destruction", name: "Destruction", icon: "spell_shadow_rainoffire", role: 'Damage', mainStat: 'intellect', melee: false }
        ]
    },
    {
        id: "warrior",
        name: "Warrior",
        color: "#C79C6E",
        icon: "classicon_warrior",
        specs: [
            { id: "arms", name: "Arms", icon: "ability_warrior_savageblow", role: 'Damage', mainStat: 'other', melee: true },
            { id: "fury", name: "Fury", icon: "ability_warrior_innerrage", role: 'Damage', mainStat: 'other', melee: true },
            { id: "protection", name: "Protection", icon: "ability_warrior_defensivestance", role: 'Tank', mainStat: 'other', melee: true }
        ]
    },
];
