"use client";

import { useDraggable } from "@dnd-kit/core";
import { Player } from "./report-shell";
import { cn } from "@/lib/utils";
import { GripVertical, Info } from "lucide-react";
import { BASE_RAID_SESSIONS } from "@/lib/time";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function RosterSidebar({ players, onOpenInfo }: { players: Player[], onOpenInfo: (p: Player) => void }) {
    // Basic sorting: Core > Fill > Heroic > Bench?
    const sortedPlayers = [...players].sort((a, b) => {
        const order = { "Core": 0, "Fill": 1, "Heroic Only": 2 };
        // @ts-ignore
        return (order[a.involvement] || 99) - (order[b.involvement] || 99);
    });

    return (
        <div className="flex flex-col h-full bg-card border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-muted/40 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Available Roster ({players.length})
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {sortedPlayers.map(player => (
                    <DraggablePlayer key={player.id} player={player} onOpenInfo={onOpenInfo} />
                ))}
            </div>
        </div>
    );
}

function DraggablePlayer({ player, onOpenInfo }: { player: Player, onOpenInfo: (p: Player) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: player.id,
        data: { player }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "p-3 rounded border bg-background hover:border-indigo-500/50 transition-colors flex items-center justify-between group cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50"
            )}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <GripVertical className="text-muted-foreground w-4 h-4 shrink-0" />

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-primary/10">
                    {player.avatar ? (
                        <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center font-bold text-xs uppercase text-primary/70">
                            {player.name[0]}
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm leading-tight truncate">{player.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{player.involvement}</div>
                </div>

                {/* Availability Indicators */}
                <AvailabilityIndicators player={player} />
            </div>

            <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onOpenInfo(player);
                }}
                className="ml-2 p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
            >
                <Info className="w-4 h-4" />
            </button>
        </div>
    );
}

function AvailabilityIndicators({ player }: { player: Player }) {
    return (
        <div className="flex items-center gap-1 shrink-0 ml-auto mr-2">
            {BASE_RAID_SESSIONS.map((session, i) => {
                const status = calculateSessionStatus(player.availability.schedule, session);
                const colorClass = status === 'full' ? 'bg-emerald-500' : status === 'partial' ? 'bg-amber-500' : 'bg-rose-500/30';

                // Localize session info for the tooltip
                const { localDay, localLabel, shortLabel } = localizeSession(session);

                return (
                    <TooltipProvider key={i}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-transform hover:scale-110 cursor-help",
                                    colorClass
                                )}>
                                    {shortLabel}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <div className="text-[10px] py-1">
                                    <div className="font-bold uppercase mb-1">{localLabel}</div>
                                    <div className="text-muted-foreground">
                                        {formatAvailabilityTooltip(player.availability.schedule[session.day] || [], session)}
                                    </div>
                                </div>
                            </TooltipContent>
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
        // Handle slot wrapping if session wraps (e.g. 01:00 is > 23:00 visually but numerically less?)
        // Assuming single day UTC sessions for now based on BASE_RAID_SESSIONS
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
