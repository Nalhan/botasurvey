"use client";

import { useState } from "react";
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { RosterSidebar } from "./roster-sidebar";
import { CompBuilder } from "./comp-builder";
import { CompReport } from "./comp-report";
import { PlayerInfoPanel } from "./player-info-panel";
import { WowClass, WOW_CLASSES } from "@/lib/wow-classes";
import { InferSelectModel } from "drizzle-orm";
import { submissions } from "@/db/schema";

export type Submission = InferSelectModel<typeof submissions>;

export type Player = {
    id: string; // submission id
    name: string;
    userId: string;
    avatar?: string;
    classId: string; // Current selected class
    specId?: string; // Current selected spec
    role: string;
    involvement: string;
    availability: any;
    rankedClasses: string[]; // List of class IDs in preference order
    specs: any[]; // Full spec data from submission
};

export function ReportShell({ initialData }: { initialData: any[] }) {
    // Transform initial data into Player objects
    const allPlayers: Player[] = initialData.map(({ submission, user }) => {
        const specs = submission.specs as any[];
        const rankedClasses = specs.sort((a, b) => a.rank - b.rank).map(s => s.classId);

        return {
            id: submission.id,
            name: user?.name || "Unknown",
            userId: user?.id,
            avatar: user?.image,
            classId: rankedClasses[0], // Default to top choice
            specId: undefined, // Default to no spec selected
            role: "Damage", // Placeholder, will derive from spec
            involvement: submission.involvement,
            availability: submission.availability,
            rankedClasses,
            specs
        };
    });

    const [roster, setRoster] = useState<Player[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [infoPlayer, setInfoPlayer] = useState<Player | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Dropping into the Roster (Comp Builder)
        if (over.id === "roster-drop-zone") {
            const player = allPlayers.find(p => p.id === active.id);
            if (player && !roster.find(p => p.id === player.id)) {
                setRoster([...roster, { ...player }]);
            }
        }

        // Dropping back to Sidebar (removing from roster)
        if (over.id === "sidebar-drop-zone" && roster.find(p => p.id === active.id)) {
            setRoster(roster.filter(p => p.id !== active.id));
        }
    };

    const handleRemoveFromRoster = (playerId: string) => {
        setRoster(roster.filter(p => p.id !== playerId));
    };

    const handleUpdatePlayer = (playerId: string, updates: Partial<Player>) => {
        setRoster(roster.map(p => p.id === playerId ? { ...p, ...updates } : p));
    };

    const activePlayer = allPlayers.find(p => p.id === activeId);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid lg:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-100px)]">
                <div className="h-full overflow-hidden flex flex-col">
                    <RosterSidebar
                        players={allPlayers.filter(p => !roster.find(r => r.id === p.id))}
                        onOpenInfo={setInfoPlayer}
                    />
                </div>

                <div className="h-full overflow-y-auto space-y-6 pr-2">
                    <CompReport roster={roster} />
                    <CompBuilder
                        roster={roster}
                        onRemove={handleRemoveFromRoster}
                        onUpdate={handleUpdatePlayer}
                        onOpenInfo={setInfoPlayer}
                    />
                </div>
            </div>

            {infoPlayer && (
                <PlayerInfoPanel player={infoPlayer} onClose={() => setInfoPlayer(null)} />
            )}

            <DragOverlay>
                {activePlayer ? (
                    <div className="p-3 bg-card border rounded-lg shadow-xl w-[300px] opacity-80 cursor-grabbing">
                        <div className="font-bold">{activePlayer.name}</div>
                        <div className="text-xs text-muted-foreground">{activePlayer.involvement}</div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
