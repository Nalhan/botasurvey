"use client";

import { useDroppable } from "@dnd-kit/core";
import { Player } from "./report-shell";
import { cn } from "@/lib/utils";
import { UserPlus } from "lucide-react";
import { PlayerCard } from "./player-card";

export function RosterSidebar({ players, onOpenInfo, onUpdate }: {
    players: Player[],
    onOpenInfo: (p: Player) => void,
    onUpdate: (id: string, updates: Partial<Player>) => void
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: "sidebar-drop-zone",
    });

    // Basic sorting: Core > Fill > Heroic > Bench?
    const sortedPlayers = [...players].sort((a, b) => {
        const order = { "Core": 0, "Fill": 1, "Heroic Only": 2 };
        // @ts-ignore
        return (order[a.involvement] || 99) - (order[b.involvement] || 99);
    });

    return (
        <div className="flex flex-col h-full bg-card border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-muted/40 font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Available Roster ({players.length})</span>
                {isOver && <UserPlus className="w-4 h-4 text-indigo-500 animate-bounce" />}
            </div>
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 overflow-y-auto p-2 space-y-2 transition-colors",
                    isOver ? "bg-indigo-500/5 shadow-inner" : ""
                )}
            >
                {sortedPlayers.length === 0 && !isOver && (
                    <div className="text-center py-8 text-muted-foreground text-xs italic">
                        All players assigned to roster
                    </div>
                )}
                {sortedPlayers.map(player => (
                    <PlayerCard
                        key={player.id}
                        player={player}
                        onOpenInfo={() => onOpenInfo(player)}
                        onUpdate={(u) => onUpdate(player.id, u)}
                    />
                ))}
            </div>
        </div>
    );
}

