"use client";

import { useDraggable } from "@dnd-kit/core";
import { Player } from "./report-shell";
import { cn } from "@/lib/utils";
import { WOW_CLASSES } from "@/lib/wow-classes";
import { GripVertical, Info, X, ChevronDown, Smile, Meh, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZamIcon } from "@/components/ui/zam-icon";
import { RoleIcon } from "@/components/ui/role-icon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { BASE_RAID_SESSIONS } from "@/lib/time";
import { useEffect, useState } from "react";

interface PlayerCardProps {
    player: Player;
    onUpdate: (updates: Partial<Player>) => void;
    onRemove?: () => void;
    onOpenInfo: () => void;
}

export function PlayerCard({ player, onUpdate, onRemove, onOpenInfo }: PlayerCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: player.id,
        data: { player }
    });

    const selectedClass = WOW_CLASSES.find(c => c.id === player.classId);
    const selectedSpec = selectedClass?.specs.find(s => s.id === player.specId);

    // Sort classes by user ranking
    const sortedClasses = [...WOW_CLASSES].sort((a, b) => {
        const rankA = player.rankedClasses.indexOf(a.id);
        const rankB = player.rankedClasses.indexOf(b.id);
        const safeRankA = rankA === -1 ? 999 : rankA;
        const safeRankB = rankB === -1 ? 999 : rankB;
        return safeRankA - safeRankB;
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999, // Ensure dragged item is on top
    } : undefined;

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="p-3 bg-secondary/20 border border-dashed rounded-lg h-[82px] opacity-50" />;
    }

    return (
        <div
            ref={setNodeRef}
            style={{ borderLeftColor: selectedClass?.color, borderLeftWidth: '4px', ...style }}
            {...listeners}
            {...attributes}
            className={cn(
                "group relative border rounded-lg transition-all touch-none select-none bg-card hover:border-indigo-500/30 flex flex-col gap-2 p-3 shadow-sm",
                isDragging ? "opacity-50 cursor-grabbing" : "cursor-grab active:cursor-grabbing",
                "h-auto"
            )}
        >
            {/* Header Area */}
            <div className="flex items-center gap-2">
                {/* Avatar / Class Icon */}
                <div className="relative w-8 h-8 rounded shrink-0 bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border">
                    <div className="w-full h-full overflow-hidden rounded-sm">
                        {player.avatar ? (
                            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            <ZamIcon icon={selectedSpec?.icon || selectedClass?.icon || ""} size={32} />
                        )}
                    </div>

                    {/* Role Badge Overlay */}

                </div>


                <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm leading-tight truncate">{player.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1.5 truncate">
                        <span>{player.involvement}</span>
                        <span className="text-primary/60">• {selectedClass?.name}</span>
                    </div>
                </div>

                {/* Availability */}
                <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} className="shrink-0">
                    <AvailabilityIndicators player={player} />
                </div>



                {/* Actions - Role icon fades out while actions fade in */}
                <div className="relative flex items-center justify-end min-w-10 ml-1">
                    <RoleIcon
                        role={player.role}
                        size={18}
                        className="absolute transition-all duration-200 group-hover:opacity-0 group-hover:scale-75 pointer-events-none"
                    />
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenInfo(); }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="p-1 hover:text-indigo-400 transition-colors text-muted-foreground"
                            title="View Info"
                        >
                            <Info size={14} />
                        </button>
                        {onRemove && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="p-1 hover:text-rose-500 transition-colors text-muted-foreground"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Spec Selection - Sentiment logic moved inside button */}
            <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} className="w-full">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-between text-sm font-normal h-10 px-2 shrink min-w-0">
                            <span className="truncate flex items-center gap-2">
                                {selectedSpec && <ZamIcon icon={selectedSpec.icon} size={24} />}
                                {selectedSpec?.name || "Select Spec..."}
                                {selectedSpec && (() => {
                                    const classData = player.specs.find(s => s.classId === player.classId);
                                    const isRanked = player.rankedClasses.includes(player.classId);
                                    const sentiment = classData?.specs[selectedSpec.id] || 'neutral';

                                    if (!isRanked) return null;

                                    const SentimentIcon =
                                        sentiment === 'like' || sentiment === 'main' ? Smile :
                                            sentiment === 'dislike' ? Frown :
                                                Meh;
                                    const sentimentColor =
                                        sentiment === 'main' ? "text-indigo-500" :
                                            sentiment === 'like' ? "text-emerald-500" :
                                                sentiment === 'dislike' ? "text-rose-500" :
                                                    "text-amber-500";
                                    return <SentimentIcon size={16} className={cn("shrink-0", sentimentColor)} />;
                                })()}
                            </span>
                            <ChevronDown className="w-3 h-3 opacity-50 ml-2 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-50 max-h-75 overflow-y-auto">
                        {sortedClasses.map(wowClass => {
                            const isRanked = player.rankedClasses.includes(wowClass.id);
                            const rank = player.rankedClasses.indexOf(wowClass.id) + 1;

                            return (
                                <div key={wowClass.id}>
                                    <DropdownMenuLabel className="flex items-center justify-between text-xs py-1.5 bg-muted/30">
                                        <span style={{ color: wowClass.color }}>{wowClass.name}</span>
                                        {isRanked && <span className="text-[9px] bg-secondary px-1.5 rounded">Rank #{rank}</span>}
                                    </DropdownMenuLabel>
                                    {wowClass.specs.map(spec => {
                                        const classData = player.specs.find(s => s.classId === wowClass.id);
                                        const sentiment = classData?.specs[spec.id] || 'neutral';

                                        const SentimentIcon =
                                            sentiment === 'like' || sentiment === 'main' ? Smile :
                                                sentiment === 'dislike' ? Frown :
                                                    Meh;

                                        const sentimentColor =
                                            sentiment === 'main' ? "text-indigo-500" :
                                                sentiment === 'like' ? "text-emerald-500" :
                                                    sentiment === 'dislike' ? "text-rose-500" :
                                                        "text-amber-500";

                                        return (
                                            <DropdownMenuItem
                                                key={spec.id}
                                                onClick={() => onUpdate({
                                                    classId: wowClass.id,
                                                    specId: spec.id,
                                                    role: spec.role
                                                })}
                                                className="pl-4 text-xs cursor-pointer flex items-center justify-between group/item"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ZamIcon icon={spec.icon} size={20} />
                                                    <span className={cn(player.specId === spec.id && "font-bold text-primary")}>
                                                        {spec.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isRanked && (
                                                        <>
                                                            <SentimentIcon size={16} className={sentimentColor} />
                                                        </>
                                                    )}
                                                </div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                    <DropdownMenuSeparator />
                                </div>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}


// --- Availability Helpers ---

function AvailabilityIndicators({ player }: { player: Player }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex items-center gap-1 shrink-0 ml-auto">
            {BASE_RAID_SESSIONS.map((session, i) => {
                const status = calculateSessionStatus(player.availability.schedule, session);
                const colorClass = status === 'full' ? 'bg-emerald-500/75' : status === 'partial' ? 'bg-amber-500/75' : 'bg-rose-500/75';

                // Localize session info for the tooltip
                const { localLabel, shortLabel } = mounted ? localizeSession(session) : { localLabel: "", shortLabel: "" };

                return (
                    <TooltipProvider key={i}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "w-6 h-6 rounded-sm flex items-center justify-center text-[9px] font-bold border border-white/25 text-white shadow-sm transition-transform hover:scale-110 cursor-help",
                                    colorClass
                                )}>
                                    {mounted ? shortLabel : ""}
                                </div>
                            </TooltipTrigger>
                            {mounted && (
                                <TooltipContent side="top">
                                    <div className="text-[10px] py-1">
                                        <div className="font-bold uppercase mb-1">{localLabel}</div>
                                        <div className="text-muted-foreground">
                                            {formatAvailabilityTooltip(player.availability.schedule[session.day] || [], session)}
                                        </div>
                                    </div>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                );
            })}
        </div>
    );
}

const DAYS_MAP: Record<string, number> = {
    Sunday: 18, Monday: 19, Tuesday: 20, Wednesday: 21, Thursday: 22, Friday: 23, Saturday: 24
};

function localizeSession(session: any) {
    const [h, m] = session.startTime.split(':').map(Number);
    const day = DAYS_MAP[session.day];
    const date = new Date(Date.UTC(2026, 0, day, h, m));

    return {
        localDay: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date),
        localLabel: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date) + " Raid",
        shortLabel: new Intl.DateTimeFormat('en-US', { weekday: 'narrow' }).format(date)
    };
}

function calculateSessionStatus(schedule: Record<string, string[]>, session: any) {
    if (!schedule) return 'none';
    const slots = schedule[session.day] || [];
    if (slots.length === 0) return 'none';

    // Total slots in session
    const [sH, sM] = session.startTime.split(':').map(Number);
    const [eH, eM] = session.endTime.split(':').map(Number);
    let start = sH * 60 + sM;
    let end = eH * 60 + eM;
    if (end < start) end += 24 * 60;

    let availableCount = 0;
    let totalCount = 0;

    for (let t = start; t < end; t += 30) {
        totalCount++;
        const h = Math.floor((t % (24 * 60)) / 60).toString().padStart(2, '0');
        const m = (t % 60).toString().padStart(2, '0');
        if (slots.includes(`${h}:${m}`)) {
            availableCount++;
        }
    }

    if (availableCount === totalCount) return 'full';
    if (availableCount > 0) return 'partial';
    return 'none';
}

function formatAvailabilityTooltip(playerSlots: string[], session: any) {
    if (playerSlots.length === 0) return "Not available";

    const day = DAYS_MAP[session.day];

    // Determine the required slots for this session
    const [sH, sM] = session.startTime.split(':').map(Number);
    const [eH, eM] = session.endTime.split(':').map(Number);
    let startMin = sH * 60 + sM;
    let endMin = eH * 60 + eM;
    if (endMin < startMin) endMin += 24 * 60;

    // Filter player slots to only those that overlap with the session
    const validSlots = playerSlots.filter(slot => {
        const [h, m] = slot.split(':').map(Number);
        const slotMin = h * 60 + m;
        return slotMin >= startMin && slotMin < endMin;
    });

    if (validSlots.length === 0) return "No overlap with raid time";

    // Convert valid UTC slots to local dates
    const localSlots = validSlots.map(slot => {
        const [h, m] = slot.split(':').map(Number);
        return new Date(Date.UTC(2026, 0, day, h, m));
    }).sort((a, b) => a.getTime() - b.getTime());

    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    const ranges: string[] = [];
    let start: Date | null = null;
    let last: Date | null = null;

    for (let i = 0; i < localSlots.length; i++) {
        const current = localSlots[i];
        if (start === null) {
            start = current;
        } else if (last !== null && current.getTime() !== last.getTime() + 30 * 60 * 1000) {
            // End of range (last + 30m)
            const end = new Date(last.getTime() + 30 * 60 * 1000);
            ranges.push(`${formatter.format(start)} - ${formatter.format(end)}`);
            start = current;
        }
        last = current;
    }

    if (start && last) {
        const end = new Date(last.getTime() + 30 * 60 * 1000);
        ranges.push(`${formatter.format(start)} - ${formatter.format(end)}`);
    }

    return ranges.join(", ");
}
