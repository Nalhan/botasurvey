"use client";

import { Player } from "./report-shell";
import { CLASS_ARMOR_TYPES, getCapabilities, RaidBuff, RaidUtility, ArmorType } from "@/lib/raid-data";
import { cn } from "@/lib/utils";
import { Check, X, Shield, Sword, Heart, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { WOW_CLASSES } from "@/lib/wow-classes";
import { ZamIcon } from "@/components/ui/zam-icon";

export function CompReport({ roster }: { roster: Player[] }) {
    // 1. Role Counts
    const roleCounts = { Tank: 0, Healer: 0, Damage: 0 };
    const classCounts: Record<string, number> = {};

    roster.forEach(p => {
        if (p.role === "Tank") roleCounts.Tank++;
        else if (p.role === "Healer") roleCounts.Healer++;
        else roleCounts.Damage++;

        if (p.classId) {
            classCounts[p.classId] = (classCounts[p.classId] || 0) + 1;
        }
    });

    // 2. Buffs & Utilities
    const activeBuffs = new Set<RaidBuff>();
    const buffCounts: Record<RaidBuff, number> = {} as any;
    const buffContributors: Record<RaidBuff, { name: string, icon: string }[]> = {} as any;
    const activeUtilities: Record<RaidUtility, number> = {} as any;
    const utilityContributors: Record<RaidUtility, { name: string, icon: string }[]> = {} as any;
    const utilityClassContributors: Record<RaidUtility, Set<string>> = {} as any;

    roster.forEach(p => {
        if (!p.classId) return;
        const caps = getCapabilities(p.classId, p.specId);
        const name = p.name || p.classId;

        // Find spec icon from WOW_CLASSES
        const wowClass = WOW_CLASSES.find(c => c.id === p.classId);
        let specIcon = wowClass?.icon || "";
        if (wowClass && p.specId) {
            const spec = wowClass.specs.find(s => s.id === p.specId);
            if (spec) specIcon = spec.icon;
        }

        caps.buffs.forEach(b => {
            activeBuffs.add(b);
            buffCounts[b] = (buffCounts[b] || 0) + 1;
            if (!buffContributors[b]) buffContributors[b] = [];
            buffContributors[b].push({ name, icon: specIcon });
        });
        caps.utilities.forEach(u => {
            activeUtilities[u] = (activeUtilities[u] || 0) + 1;
            if (!utilityContributors[u]) utilityContributors[u] = [];
            utilityContributors[u].push({ name, icon: specIcon });

            if (!utilityClassContributors[u]) utilityClassContributors[u] = new Set();
            utilityClassContributors[u].add(p.classId!);
        });
    });

    // 3. Armor Types
    const armorCounts: Record<ArmorType, number> = {
        [ArmorType.Cloth]: 0,
        [ArmorType.Leather]: 0,
        [ArmorType.Mail]: 0,
        [ArmorType.Plate]: 0,
    };

    roster.forEach(p => {
        if (!p.classId) return;
        const armor = CLASS_ARMOR_TYPES[p.classId];
        if (armor) armorCounts[armor]++;
    });

    // Define all buffs to show checklist
    const allBuffs = Object.values(RaidBuff);
    const essentialUtilities = [
        RaidUtility.Bloodlust,
        RaidUtility.CombatRes,
        RaidUtility.MassDispel,
        RaidUtility.WarlockKit,
        RaidUtility.RallyingCry,
        RaidUtility.Darkness,
        RaidUtility.AMZ,
    ];

    const renderContributors = (names: { name: string, icon: string }[]) => {
        if (!names || names.length === 0) return null;
        // Use a Map to keep unique name-icon pairs
        const uniqueEntries = Array.from(
            new Map(names.map(item => [item.name, item.icon])).entries()
        ).sort((a, b) => a[0].localeCompare(b[0]));

        return (
            <div className="mt-1.5 pt-1.5 border-t border-white/10">
                <div className="text-[10px] uppercase text-muted-foreground mb-1 font-bold">Contributors:</div>
                <div className="flex flex-col gap-1">
                    {uniqueEntries.map(([name, icon], i) => (
                        <div key={i} className="text-xs flex items-center gap-1.5">
                            <ZamIcon icon={icon} size={12} className="rounded-xs" />
                            <span>{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-card border rounded-lg p-4 space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-between border-b pb-4">
                <div className="flex gap-4">
                    <RoleBadge icon={Shield} count={roleCounts.Tank} target={2} color="text-blue-400 bg-blue-500/10" />
                    <RoleBadge icon={Heart} count={roleCounts.Healer} target={4} color="text-green-400 bg-green-500/10" />
                    <RoleBadge icon={Sword} count={roleCounts.Damage} target={14} color="text-red-400 bg-red-500/10" />
                    <div className="text-sm font-bold ml-2 self-center text-muted-foreground">
                        Total: {roster.length} / 20
                    </div>
                </div>
            </div>

            {/* Class Counts Row */}
            <div className="flex flex-wrap gap-2 pb-2">
                {WOW_CLASSES.map(wowClass => {
                    const count = classCounts[wowClass.id] || 0;
                    return (
                        <div
                            key={wowClass.id}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all",
                                count > 0
                                    ? "bg-secondary/40 border-secondary-foreground/10 text-foreground"
                                    : "opacity-20 grayscale border-transparent text-muted-foreground"
                            )}
                            title={wowClass.name}
                        >
                            <ZamIcon icon={wowClass.icon} size={16} />
                            <span className="text-xs font-bold leading-none">{count}</span>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Column 1: Buff Coverage & Slows */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">
                            Buff Coverage
                            <span className="text-[10px] font-normal lowercase opacity-70">({activeBuffs.size}/{allBuffs.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 gap-1">
                            {[
                                { id: RaidBuff.AttackPower, icon: 'ability_warrior_battleshout', label: '5% Attack Power' },
                                { id: RaidBuff.Intellect, icon: 'spell_holy_magicalsentry', label: '3% Intellect' },
                                { id: RaidBuff.Stamina, icon: 'spell_holy_wordfortitude', label: '5% Stamina' },
                                { id: RaidBuff.Versatility, icon: 'spell_nature_regeneration', label: '3% Versatility' },
                                { id: RaidBuff.DamageReduction, icon: 'spell_holy_devotionaura', label: '3% DR (Devo)' },
                                { id: RaidBuff.MagicDamage, icon: 'ability_demonhunter_empowerwards', label: '5% Magic Dmg' },
                                { id: RaidBuff.PhysicalDamage, icon: 'ability_monk_sparring', label: '5% Phys Dmg' },
                                { id: RaidBuff.MovementCDR, icon: 'ability_evoker_blessingofthebronze', label: '15% Movement CDR' },
                                { id: RaidBuff.HuntersMark, icon: 'ability_hunter_snipershot', label: "5% Damage" },
                                { id: RaidBuff.AtrophicPoison, icon: 'ability_rogue_nervesofsteel', label: '3% DR (Poison)' },
                                { id: RaidBuff.Skyfury, icon: 'spell_nature_windfury', label: 'Skyfury' },
                            ].map(buff => {
                                const isActive = activeBuffs.has(buff.id as RaidBuff);
                                return (
                                    <TooltipProvider key={buff.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "text-xs flex items-center justify-between pr-2 py-0.5 cursor-help",
                                                    isActive ? "text-foreground" : "text-muted-foreground/30"
                                                )}>
                                                    <div className="flex items-center gap-2">
                                                        <ZamIcon icon={buff.icon} size={16} className={cn("rounded-xs", isActive ? "" : "grayscale opacity-50")} />
                                                        <span>{buff.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {buff.id === RaidBuff.HuntersMark && isActive && buffCounts[buff.id] > 0 && (
                                                            <span className="text-[10px] font-mono font-bold text-emerald-500">x{buffCounts[buff.id]}</span>
                                                        )}
                                                        {isActive ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5" />}
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <div className="text-xs font-medium">{buff.label}</div>
                                                {isActive && renderContributors(buffContributors[buff.id])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={cn("text-xs flex items-center justify-between pr-2 py-0.5 cursor-help", activeUtilities[RaidUtility.MortalWounds] > 0 ? "text-foreground" : "text-muted-foreground/30")}>
                                            <div className="flex items-center gap-2">
                                                <ZamIcon icon="ability_warrior_savageblow" size={16} className={cn("rounded-xs", activeUtilities[RaidUtility.MortalWounds] > 0 ? "" : "grayscale opacity-50")} />
                                                <span>50% Heal Reduction (Mortal Wounds)</span>
                                            </div>
                                            {activeUtilities[RaidUtility.MortalWounds] > 0 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5" />}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <div className="text-xs font-medium">50% Heal Reduction (Mortal Wounds)</div>
                                        {activeUtilities[RaidUtility.MortalWounds] > 0 && renderContributors(utilityContributors[RaidUtility.MortalWounds])}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={cn("text-xs flex items-center justify-between pr-2 py-0.5 cursor-help", activeUtilities[RaidUtility.MeleeSlowStack] > 0 ? "text-foreground" : "text-muted-foreground/30")}>
                                            <div className="flex items-center gap-2">
                                                <ZamIcon icon="spell_shadow_curseofmannoroth" size={16} className={cn("rounded-xs", activeUtilities[RaidUtility.MeleeSlowStack] > 0 ? "" : "grayscale opacity-50")} />
                                                <span>Attack Speed Slows</span>
                                            </div>
                                            <span className={cn(
                                                "font-mono font-bold",
                                                (utilityClassContributors[RaidUtility.MeleeSlowStack]?.size || 0) >= 3
                                                    ? "text-emerald-500"
                                                    : activeUtilities[RaidUtility.MeleeSlowStack] > 0
                                                        ? "text-amber-500"
                                                        : ""
                                            )}>
                                                {Math.min(3, utilityClassContributors[RaidUtility.MeleeSlowStack]?.size || 0)} / 3
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <div className="text-xs font-medium">Attack Speed Slows</div>
                                        {activeUtilities[RaidUtility.MeleeSlowStack] > 0 && renderContributors(utilityContributors[RaidUtility.MeleeSlowStack])}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>

                {/* Column 2: Raid CDs & Movement */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Major Raid CDs</h3>
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: RaidUtility.AMZ, icon: 'spell_deathknight_antimagiczone', label: 'AMZ' },
                                { id: RaidUtility.Darkness, icon: 'ability_demonhunter_darkness', label: 'Darkness' },
                                { id: RaidUtility.RallyingCry, icon: 'ability_warrior_rallyingcry', label: 'Rallying Cry' },
                                { id: RaidUtility.AuraMastery, icon: 'spell_holy_auramastery', label: 'Aura Mastery' },
                                { id: RaidUtility.SpiritLink, icon: 'spell_shaman_spiritlink', label: 'Spirit Link' },
                                { id: RaidUtility.Barrier, icon: 'spell_holy_powerwordbarrier', label: 'Barrier' },
                                { id: RaidUtility.Hymn, icon: 'spell_holy_divinehymn', label: 'Hymn' },
                                { id: RaidUtility.Rewind, icon: 'ability_evoker_rewind', label: 'Rewind' },
                            ].map(cd => {
                                const count = activeUtilities[cd.id as RaidUtility] || 0;
                                return (
                                    <TooltipProvider key={cd.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "relative p-1 rounded-md border transition-all hover:scale-105 active:scale-95 cursor-default",
                                                    count > 0 ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/10" : "opacity-20 grayscale border-transparent"
                                                )}>
                                                    <ZamIcon icon={cd.icon} size={24} className="rounded-sm" />
                                                    {count > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <div className="text-xs font-medium">{cd.label}</div>
                                                {count > 0 && renderContributors(utilityContributors[cd.id as RaidUtility])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Raid Movement</h3>
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: RaidUtility.Roar, icon: 'spell_druid_stampedingroar_cat', label: 'Stampeding Roar' },
                                { id: RaidUtility.WindRush, icon: 'ability_shaman_windwalktotem', label: 'Wind Rush' },
                                { id: RaidUtility.TimeSpiral, icon: 'ability_evoker_timespiral', label: 'Time Spiral' },
                                { id: RaidUtility.WarlockKit, icon: 'spell_warlock_demonicportal_purple', label: 'Gateway' },
                            ].map(cd => {
                                const count = activeUtilities[cd.id as RaidUtility] || 0;
                                return (
                                    <TooltipProvider key={cd.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "relative p-1 rounded-md border transition-all hover:scale-105 active:scale-95 cursor-default",
                                                    count > 0 ? "bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/10" : "opacity-20 grayscale border-transparent"
                                                )}>
                                                    <ZamIcon icon={cd.icon} size={24} className="rounded-sm" />
                                                    {count > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-cyan-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <div className="text-xs font-medium">{cd.label}</div>
                                                {count > 0 && renderContributors(utilityContributors[cd.id as RaidUtility])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Movement Externals</h3>
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: RaidUtility.TigersLust, icon: 'ability_monk_tigerslust', label: "Tiger's Lust" },
                                { id: RaidUtility.BlessingOfFreedom, icon: 'spell_holy_sealofvalor', label: 'Blessing of Freedom' },
                                { id: RaidUtility.LeapOfFaith, icon: 'priest_spell_leapoffaith_a', label: 'Leap of Faith' },
                                { id: RaidUtility.Rescue, icon: 'ability_evoker_flywithme', label: 'Rescue' },
                                { id: RaidUtility.SpatialParadox, icon: 'ability_evoker_stretchtime', label: 'Spatial Paradox' },
                            ].map(cd => {
                                const count = activeUtilities[cd.id as RaidUtility] || 0;
                                return (
                                    <TooltipProvider key={cd.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "relative p-1 rounded-md border transition-all hover:scale-105 active:scale-95 cursor-default",
                                                    count > 0 ? "bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/10" : "opacity-20 grayscale border-transparent"
                                                )}>
                                                    <ZamIcon icon={cd.icon} size={24} className="rounded-sm" />
                                                    {count > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <div className="text-xs font-medium">{cd.label}</div>
                                                {count > 0 && renderContributors(utilityContributors[cd.id as RaidUtility])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Column 3: Utility, Support & Security */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Key Utility</h3>
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: RaidUtility.Bloodlust, icon: 'spell_nature_bloodlust', label: 'Bloodlust' },
                                { id: RaidUtility.CombatRes, icon: 'spell_nature_reincarnation', label: 'Combat Res' },
                            ].map(util => {
                                const count = activeUtilities[util.id as RaidUtility] || 0;
                                return (
                                    <TooltipProvider key={util.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "relative p-1 rounded-md border transition-all hover:scale-105 active:scale-95 cursor-default",
                                                    count > 0 ? "bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-500/10" : "opacity-20 grayscale border-transparent"
                                                )}>
                                                    <ZamIcon icon={util.icon} size={24} className="rounded-sm" />
                                                    {count > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <div className="text-xs font-medium">{util.label}</div>
                                                {count > 0 && renderContributors(utilityContributors[util.id as RaidUtility])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Support</h3>
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: RaidUtility.Augmentation, icon: 'classicon_evoker_augmentation', label: 'Augmentation Buffs' },
                                { id: RaidUtility.SourceOfMagic, icon: 'ability_evoker_blue_01', label: 'Source of Magic' },
                                { id: RaidUtility.PowerInfusion, icon: 'spell_holy_powerinfusion', label: 'Power Infusion' },
                                { id: RaidUtility.Innervate, icon: 'spell_nature_lightning', label: 'Innervate' },
                            ].map(util => {
                                const count = activeUtilities[util.id as RaidUtility] || 0;
                                return (
                                    <TooltipProvider key={util.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "relative p-1 rounded-md border transition-all hover:scale-105 active:scale-95 cursor-default",
                                                    count > 0 ? "bg-violet-500/10 border-violet-500/30 ring-1 ring-violet-500/10" : "opacity-20 grayscale border-transparent"
                                                )}>
                                                    <ZamIcon icon={util.icon} size={24} className="rounded-sm" />
                                                    {count > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <div className="text-xs font-medium">{util.label}</div>
                                                {count > 0 && renderContributors(utilityContributors[util.id as RaidUtility])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Immunities</h3>
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: RaidUtility.DivineShield, icon: 'spell_holy_divineshield', label: 'Divine Shield' },
                                { id: RaidUtility.IceBlock, icon: 'spell_frost_frost', label: 'Ice Block' },
                                { id: RaidUtility.Turtle, icon: 'ability_hunter_pet_turtle', label: 'Aspect of the Turtle' },
                                { id: RaidUtility.Cloak, icon: 'spell_shadow_nethercloak', label: 'Cloak of Shadows' },
                                { id: RaidUtility.BoP, icon: 'spell_holy_sealofprotection', label: 'Blessing of Protection' },
                                { id: RaidUtility.BoS, icon: 'spell_holy_blessingofprotection', label: 'Blessing of Spellwarding' },
                            ].map(imm => {
                                const count = activeUtilities[imm.id as RaidUtility] || 0;
                                return (
                                    <TooltipProvider key={imm.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "relative p-1 rounded-md border transition-all hover:scale-105 active:scale-95 cursor-default",
                                                    count > 0 ? "bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/10" : "opacity-20 grayscale border-transparent"
                                                )}>
                                                    <ZamIcon icon={imm.icon} size={24} className="rounded-sm" />
                                                    {count > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <div className="text-xs font-medium">{imm.label}</div>
                                                {count > 0 && renderContributors(utilityContributors[imm.id as RaidUtility])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">External CDs</h3>
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: RaidUtility.Ironbark, icon: 'spell_druid_ironbark', label: 'Ironbark' },
                                { id: RaidUtility.PainSupp, icon: 'spell_holy_painsupression', label: 'Pain Supp' },
                                { id: RaidUtility.GuardianSpirit, icon: 'spell_holy_guardianspirit', label: 'Guardian Spirit' },
                                { id: RaidUtility.Sacrifice, icon: 'spell_holy_sealofsacrifice', label: 'Sacrifice' },
                                { id: RaidUtility.TimeDilation, icon: 'ability_evoker_timedilation', label: 'Time Dilation' },
                                { id: RaidUtility.LifeCocoon, icon: 'ability_monk_chicocoon', label: 'Life Cocoon' },
                            ].map(cd => {
                                const count = activeUtilities[cd.id as RaidUtility] || 0;
                                return (
                                    <TooltipProvider key={cd.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "relative p-1 rounded-md border transition-all hover:scale-105 active:scale-95 cursor-default",
                                                    count > 0 ? "bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/10" : "opacity-20 grayscale border-transparent"
                                                )}>
                                                    <ZamIcon icon={cd.icon} size={24} className="rounded-sm" />
                                                    {count > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <div className="text-xs font-medium">{cd.label}</div>
                                                {count > 0 && renderContributors(utilityContributors[cd.id as RaidUtility])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Column 4: Dispels & CC */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Dispel Coverage</h3>
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: RaidUtility.MassDispel, icon: 'spell_arcane_massdispel', label: 'Mass Dispel' },
                                { id: RaidUtility.Revival, icon: 'spell_monk_revival', label: 'Revival' },
                                { id: RaidUtility.CurseDispel, icon: 'spell_nature_removecurse', label: 'Curse' },
                                { id: RaidUtility.PoisonDispel, icon: 'spell_nature_nullifypoison', label: 'Poison' },
                                { id: RaidUtility.DiseaseDispel, icon: 'spell_holy_nullifydisease', label: 'Disease' },
                                { id: RaidUtility.Soothe, icon: 'ability_hunter_beastsoothe', label: 'Soothe' },
                            ].map(dispel => {
                                const count = activeUtilities[dispel.id as RaidUtility] || 0;
                                return (
                                    <TooltipProvider key={dispel.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "relative p-1 rounded-md border transition-all hover:scale-105 active:scale-95 cursor-default",
                                                    count > 0 ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/10" : "opacity-20 grayscale border-transparent"
                                                )}>
                                                    <ZamIcon icon={dispel.icon} size={24} className="rounded-sm" />
                                                    {count > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <div className="text-xs font-medium">{dispel.label}</div>
                                                {count > 0 && renderContributors(utilityContributors[dispel.id as RaidUtility])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Crowd Control</h3>
                        <div className="grid grid-cols-1 gap-1">
                            {[
                                { id: RaidUtility.AoeStun, icon: 'ability_monk_legsweep', label: 'AOE Stuns' },
                                { id: RaidUtility.Knock, icon: 'ability_racial_wingbuffet', label: 'Knockbacks' },
                                { id: RaidUtility.AoeGrip, icon: 'ability_deathknight_aoedeathgrip', label: 'AOE Grips' },
                                { id: RaidUtility.Sucks, icon: 'spell_druid_ursolsvortex', label: 'Sucks' },
                                { id: RaidUtility.OppressingRoar, icon: 'ability_evoker_oppressingroar', label: 'Oppressing Roar' },
                                { id: RaidUtility.StStun, icon: 'spell_holy_sealofmight', label: 'ST Stuns' },
                                { id: RaidUtility.Grip, icon: 'spell_deathknight_strangulate', label: 'Grips' },
                                { id: RaidUtility.Slow, icon: 'spell_nature_strengthofearthtotem02', label: 'Slows' },
                                { id: RaidUtility.HardCC, icon: 'spell_nature_polymorph', label: 'Hard CC' },
                            ].map(util => {
                                const count = activeUtilities[util.id as RaidUtility] || 0;
                                return (
                                    <TooltipProvider key={util.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "text-xs flex items-center justify-between pr-2 py-0.5 cursor-help",
                                                    count > 0 ? "text-foreground" : "text-muted-foreground/30"
                                                )}>
                                                    <div className="flex items-center gap-2">
                                                        <ZamIcon icon={util.icon} size={16} className={cn("rounded-xs", count > 0 ? "" : "grayscale opacity-50")} />
                                                        <span>{util.label}</span>
                                                    </div>
                                                    {count > 0 ? (
                                                        <span className="text-[10px] font-mono font-bold text-emerald-500">x{count}</span>
                                                    ) : (
                                                        <X className="w-3.5 h-3.5" />
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <div className="text-xs font-medium">{util.label}</div>
                                                {count > 0 && renderContributors(utilityContributors[util.id as RaidUtility])}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Armor Distribution - Moved to bottom full width for better layout */}
            <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground">Armor Distribution</h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-50 text-[11px]">
                                In Midnight, tier tokens are grouped by armor type.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.values(ArmorType).map(armor => (
                        <div key={armor} className="text-xs space-y-1">
                            <div className="flex justify-between mb-0.5">
                                <span className="text-muted-foreground opacity-80">{armor}</span>
                                <span className="font-mono font-bold">{armorCounts[armor]}</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all"
                                    style={{ width: `${(armorCounts[armor] / Math.max(1, roster.length)) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RoleBadge({ icon: Icon, count, target, color }: { icon: any, count: number, target: number, color: string }) {
    return (
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent", color, count > target && "border-amber-500/50 text-amber-500")}>
            <Icon size={16} />
            <span className="font-mono font-bold">{count}</span>
            <span className="text-xs opacity-50">/ {target}</span>
        </div>
    );
}
