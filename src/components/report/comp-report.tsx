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
    const activeUtilities: Record<RaidUtility, number> = {} as any;

    roster.forEach(p => {
        if (!p.classId) return;
        const caps = getCapabilities(p.classId, p.specId);

        caps.buffs.forEach(b => activeBuffs.add(b));
        caps.utilities.forEach(u => {
            activeUtilities[u] = (activeUtilities[u] || 0) + 1;
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
        RaidUtility.Gateway,
        RaidUtility.RallyingCry,
        RaidUtility.Darkness,
        RaidUtility.AntiMagicZone,
    ];

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Buff Coverage */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground">Buff Coverage</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {allBuffs.map(buff => {
                            const isActive = activeBuffs.has(buff);
                            return (
                                <div key={buff} className={cn("text-xs flex items-center gap-1.5", isActive ? "text-foreground" : "text-muted-foreground/50")}>
                                    {isActive ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />}
                                    {buff}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Utility Counts */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground">Key Utility</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            RaidUtility.Bloodlust,
                            RaidUtility.CombatRes,
                            RaidUtility.MassDispel,
                            RaidUtility.Gateway,
                            RaidUtility.RallyingCry,
                            RaidUtility.Innervate,
                            RaidUtility.Darkness
                        ].map(util => {
                            // @ts-ignore - TS doesn't like enum values sometimes if strict
                            const count = activeUtilities[util] || 0;
                            return (
                                <div key={util} className={cn("text-xs flex items-center justify-between pr-2", count > 0 ? "text-foreground" : "text-muted-foreground/50")}>
                                    <span>{util}</span>
                                    <span className={cn("font-mono font-bold", count > 0 ? "text-indigo-400" : "")}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Armor Distribution */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Armor Types</h3>
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
                    <div className="space-y-1">
                        {Object.values(ArmorType).map(armor => (
                            <div key={armor} className="text-xs">
                                <div className="flex justify-between mb-0.5">
                                    <span>{armor}</span>
                                    <span className="font-mono">{armorCounts[armor]}</span>
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
