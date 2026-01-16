"use client";

import { Player } from "./report-shell";
import { CLASS_TIER_TOKENS, getCapabilities, RaidBuff, RaidUtility, TierToken } from "@/lib/raid-data";
import { cn } from "@/lib/utils";
import { Check, X, Shield, Sword, Heart } from "lucide-react";

export function CompReport({ roster }: { roster: Player[] }) {
    // 1. Role Counts
    const roleCounts = { Tank: 0, Healer: 0, Damage: 0 };
    roster.forEach(p => {
        if (p.role === "Tank") roleCounts.Tank++;
        else if (p.role === "Healer") roleCounts.Healer++;
        else roleCounts.Damage++;
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

    // 3. Tier Tokens
    const tierCounts: Record<TierToken, number> = {
        [TierToken.Zenith]: 0,
        [TierToken.Dreadful]: 0,
        [TierToken.Mystic]: 0,
        [TierToken.Venerated]: 0,
    };

    roster.forEach(p => {
        if (!p.classId) return;
        const token = CLASS_TIER_TOKENS[p.classId];
        if (token) tierCounts[token]++;
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

                {/* Tier Tokens */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground">Tier Tokens</h3>
                    <div className="space-y-1">
                        {Object.values(TierToken).map(token => (
                            <div key={token} className="text-xs">
                                <div className="flex justify-between mb-0.5">
                                    <span>{token.split(' ')[0]}</span>
                                    <span className="font-mono">{tierCounts[token]}</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all"
                                        style={{ width: `${(tierCounts[token] / Math.max(1, roster.length)) * 100}%` }}
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
