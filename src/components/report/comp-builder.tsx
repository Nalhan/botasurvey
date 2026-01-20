"use client";

import { useDroppable } from "@dnd-kit/core";
import { Player } from "./report-shell";
import { cn } from "@/lib/utils";
import { PlayerCard } from "./player-card";

export function CompBuilder({ roster, onRemove, onUpdate, onOpenInfo }: {
    roster: Player[],
    onRemove: (id: string) => void,
    onUpdate: (id: string, updates: Partial<Player>) => void,
    onOpenInfo: (p: Player) => void
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: "roster-drop-zone",
    });

    const sortedRoster = [...roster].sort((a, b) => {
        const order = { Tank: 0, Healer: 1, Damage: 2 };
        const aOrder = order[a.role as keyof typeof order] ?? 3;
        const bOrder = order[b.role as keyof typeof order] ?? 3;
        return aOrder - bOrder;
    });

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold px-1">Raid Composition ({roster.length})</h2>
            <div
                ref={setNodeRef}
                className={cn(
                    "min-h-[200px] border-2 border-dashed rounded-xl p-4 transition-colors grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3",
                    isOver ? "border-indigo-500 bg-indigo-500/10" : "border-border/50 bg-card/20"
                )}
            >
                {sortedRoster.map(player => (
                    <PlayerCard
                        key={player.id}
                        player={player}
                        onRemove={() => onRemove(player.id)}
                        onUpdate={(u) => onUpdate(player.id, u)}
                        onOpenInfo={() => onOpenInfo(player)}
                    />
                ))}

                {roster.length === 0 && (
                    <div className="col-span-full h-full flex items-center justify-center text-muted-foreground py-12">
                        Drag players here to build your roster
                    </div>
                )}
            </div>
        </div>
    );
}

