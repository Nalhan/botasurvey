export type WowProfession = {
    id: string;
    name: string;
    icon: string;
    specs?: WowProfessionSpec[];
};

/**
 * @param id unique identifier for the profession spec
 * @param name name of the profession spec
 * @param desc description of the profession spec
 * @param recommended continue to recommend if other specs are already filled
 * @param icon any valid wow icon name
 */
export type WowProfessionSpec = {
    id: string;
    name: string;
    desc?: string;
    recommended?: boolean;
    icon: string;

}

export const WOW_PROFESSIONS: WowProfession[] = [
    {
        id: "blacksmithing",
        name: "Blacksmithing",
        icon: "ui_profession_blacksmithing",
        specs: [
            {
                id: "craftsmithing",
                name: "Craftsmithing",
                desc: "Crafting tools, accessories, and tool stones",
                icon: "inv_10_specialization_blacksmithing_weaponsmithing_color2"
            },
            {
                id: "armorsmithing_left",
                name: "Armorsmithing: Chest/Legs/Shields",
                desc: "Unlock recipes for plate chest, legs, and shields",
                icon: "inv_10_specialization_blacksmithing_largeplatearmor_color2"
            },
            {
                id: "armorsmithing_right",
                name: "Armorsmithing: Hands/Wrists/Belts",
                desc: "Unlock recipes for plate hands, wrists, and belts",
                icon: "inv_10_specialization_blacksmithing_finearmor_color2"
            },
            {
                id: "armorsmithing_center",
                name: "Armorsmithing: Head/Shoulders/Feet",
                desc: "Unlock recipes for plate head, shoulders, and feet",
                icon: "inv_10_specialization_blacksmithing_sculptedarmor_color2"
            },
            {
                id: "weaponsmithing_left",
                name: "Weaponsmithing: Swords/Daggers",
                desc: "Unlock recipes for swords and daggers",
                icon: "inv_10_specialization_blacksmithing_blades_color2"
            },
            {
                id: "weaponsmithing_right",
                name: "Weaponsmithing: Maces/Axes/Polearms",
                desc: "Unlock recipes for maces, axes, and polearms",
                icon: "inv_10_specialization_blacksmithing_hafted_color2"
            },
        ]
    },
    {
        id: "alchemy",
        name: "Alchemy",
        icon: "ui_profession_alchemy",
        specs: [
            {
                id: "potions",
                name: "Potion Prowess",
                desc: "Unlocks potion recipes and the ability to craft potion cauldrons.",
                icon: "inv_12_profession_alchemy_alhemyspecializations_potions-"
            },
            {
                id: "flasks",
                name: "Fluent in Flasks",
                desc: "Unlocks flask recipes and the ability to craft flask cauldrons.",
                icon: "inv_12_profession_alchemy_alhemyspecializations_flasks"
            },
            {
                id: "transmutes",
                name: "Transmutation Authority",
                desc: "Unlocks daily transmute for reagent that is used to craft cauldrons.",
                recommended: true,
                icon: "inv_12_profession_alchemy_alhemyspecializations_transmutation"
            }
        ]
    },
    {
        id: "enchanting",
        name: "Enchanting",
        icon: "ui_profession_enchanting",
        specs: [
            {
                id: "transitories_tonics_tools",
                name: "Transitories, Tonics & Tools: Outstanding Outfits",
                desc: "Unlocks recipes for crafting wands and enchanting rods.",
                icon: "inv_12_profession_enchanting_transitoriestonicsandtools"
            },
            {
                id: "disenchanting_delegate",
                name: "Disenchanting Delegate",
                desc: "Get more yield from disenchanting gear.",
                icon: "inv_12_profession_enchanting_disenchantingdelegate"
            }
        ]

    },
    {
        id: "engineering",
        name: "Engineering",
        icon: "ui_profession_engineering",
        specs: [
            {
                id: "market_mobility",
                name: "Market Mobility",
                desc: "Unlocks recipes for crafting tools and accessories.",
                icon: "inv_misc_profession_book_engineering"
            },
            {
                id: "combat_analytics_goggles",
                name: "Combat Analytics: Goggles",
                desc: "Unlocks recipes for crafting single stat goggles (engineering only).",
                icon: "inv_mechagon_blueprints"
            },
            {
                id: "combat_analytics_bracers",
                name: "Combat Analytics: Bracers",
                desc: "Unlocks recipes for crafting single stat bracers.",
                icon: "inv_mechagon_blueprints"
            },
            {
                id: "combat_analytics_boots",
                name: "Combat Analytics: Boots",
                desc: "Unlocks recipes for crafting single stat boots.",
                icon: "inv_mechagon_blueprints"
            },
            {
                id: "combat_analytics_guns",
                name: "Combat Analytics: Guns",
                desc: "Unlocks recipes for crafting guns.",
                icon: "inv_mechagon_blueprints"
            }
        ]
    },
    {
        id: "inscription",
        name: "Inscription",
        icon: "ui_profession_inscription",
        specs: [
            {
                id: "blueprints_field",
                name: "Blueprints: Field Research",
                desc: "Unlocks recipes for crafting Staves, Bows, and caster off-hands.",
                icon: "70_inscription_steamy_romance_novel_kit"
            },
            {
                id: "blueprints_market",
                name: "Blueprints: Market Research",
                desc: "Unlocks recipes for crafting crafter tools.",
                icon: "70_inscription_steamy_romance_novel_kit"
            },
            {
                id: "darkmoon_curiosity",
                name: "Darkmoon Curiosity",
                desc: "Unlocks recipes for crafting Darkmoon trinkets and embellishments.",
                icon: "inv_darkmoon_eye"
            }
        ]
    },
    {
        id: "jewelcrafting",
        name: "Jewelcrafting",
        icon: "ui_profession_jewelcrafting",
        specs: [
            {
                id: "alluring_accessories_rings",
                name: "Alluring Accessories: Rings",
                desc: "Unlocks recipes for crafting rings.",
                icon: "inv_misc_profession_book_engineering"
            },
            {
                id: "alluring_accessories_necklaces",
                name: "Alluring Accessories: Necklaces",
                desc: "Unlocks recipes for crafting necklaces.",
                icon: "inv_misc_profession_book_engineering"
            },
            {
                id: "alluring_accessories_tools",
                name: "Alluring Accessories: Tools",
                desc: "Unlocks recipes for crafting tools.",
                icon: "inv_misc_profession_book_engineering"
            }
        ]
    },
    {
        id: "leatherworking",
        name: "Leatherworking",
        icon: "ui_profession_leatherworking",
        specs: [
            {
                id: "lasting_leather_left",
                name: "Lasting Leather: Chest/Head/Shoulder/Wrist",
                desc: "Unlocks recipes for crafting leather chest, head, shoulder, and wrist pieces.",
                icon: "inv_12_profession_leatherworking_leatherworking_specializations_securelyshaped"
            },
            {
                id: "lasting_leather_right",
                name: "Lasting Leather: Hands/Feet/Legs/Waist",
                desc: "Unlocks recipes for crafting leather leg, feet, hand, and waist pieces.",
                icon: "inv_12_profession_leatherworking_leatherworking_specializations_embroideredensembles"
            },
            {
                id: "safeguarding_scales_left",
                name: "Safeguarding Scales: Chest/Head/Shoulder/Wrist",
                desc: "Unlocks recipes for crafting mail chest, head, shoulder, and wrist pieces.",
                icon: "inv_12_profession_leatherworking_leatherworking_specializations_bolsteredbulwarks"
            },
            {
                id: "safeguarding_scales_right",
                name: "Safeguarding Scales: Hands/Feet/Legs/Waist",
                desc: "Unlocks recipes for crafting mail leg, feet, hand, and waist pieces.",
                icon: "inv_12_profession_leatherworking_leatherworking_specializations_advancedarmor"
            },
            {
                id: "flawless_fortes_left",
                name: "Flawless Fortes: Artisanal Accessories",
                desc: "Unlocks recipes for crafting profession equipment.",
                icon: "inv_helm_armor_skinning_a_01"
            }
        ]
    },
    {
        id: "tailoring",
        name: "Tailoring",
        icon: "ui_profession_tailoring",
        specs: [
            {
                id: "sindorei_finery_left",
                name: "Sin'dorei Finery: Hands/Feet/Head",
                desc: "Unlocks recipes for crafting cloth head, hands, and feet pieces.",
                icon: "inv_12_tailoring_spellthread_blue_spellthread"
            },
            {
                id: "sindorei_finery_center",
                name: "Sin'dorei Finery: Belt/Bracer/Shoulder",
                desc: "Unlocks recipes for crafting cloth belt, bracer, and shoulder pieces.",
                icon: "inv_12_tailoring_spellthread_orange_spellthread"
            },
            {
                id: "sindorei_finery_right",
                name: "Sin'dorei Finery: Chest/Legs/Cloak",
                desc: "Unlocks recipes for crafting cloth chest, legs, and cloak pieces.",
                icon: "inv_12_tailoring_spellthread_pink_spellthread"
            }
        ]
    }
];
