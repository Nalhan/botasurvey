"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { RosterSidebar } from "./roster-sidebar";
import { CompBuilder } from "./comp-builder";
import { cn } from "@/lib/utils";
import { CompReport } from "./comp-report";
import { ProfessionsReport } from "./professions-report";
import { PlayerInfoPanel } from "./player-info-panel";
import { AvailabilityHeatmap } from "./availability-heatmap";
import { WowClass, WOW_CLASSES } from "@/lib/wow-classes";
import { InferSelectModel } from "drizzle-orm";
import { submissions } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { ZamIcon } from "@/components/ui/zam-icon";
import { formatDiscordAvatar } from "@/lib/avatar";

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
    professions: any[]; // Profession selection data
    comments?: string | null;
    discordData?: {
        isInGuild: boolean;
        nickname: string | null;
        roles: string[];
    };
};

export function ReportShell({ initialData }: { initialData: any[] }) {
    // Transform initial data into Player objects
    const allPlayers: Player[] = initialData.map(({ submission, user, discordData, discordId }) => {
        const specs = submission.specs as any[];
        const rankedClasses = specs.sort((a, b) => a.rank - b.rank).map(s => s.classId);

        return {
            id: submission.id,
            name: discordData?.nickname || user?.name || "Unknown",
            userId: user?.id,
            avatar: discordData?.avatar || (discordId && user?.image ? formatDiscordAvatar(discordId, user.image) : user?.image),
            classId: rankedClasses[0], // Default to top choice
            specId: undefined, // Default to no spec selected
            role: "Damage", // Placeholder, will derive from spec
            involvement: submission.involvement,
            availability: submission.availability,
            rankedClasses,
            specs,
            professions: submission.professions as any[] || [],
            comments: submission.comments,
            discordData
        };
    });

    const [roster, setRoster] = useState<Player[]>([]);
    const [playerOverrides, setPlayerOverrides] = useState<Record<string, Partial<Player>>>({});
    const [activeId, setActiveId] = useState<string | null>(null);
    const [infoPlayer, setInfoPlayer] = useState<Player | null>(null);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'roster' | 'professions' | 'heatmap'>('roster');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const saveRoster = async (rosterToSave: Player[], overridesToSave: Record<string, Partial<Player>>) => {
        setIsSaving(true);
        try {
            await fetch('/api/raid-comp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roster: rosterToSave,
                    overrides: overridesToSave
                }),
            });
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error("Failed to save roster", error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        setMounted(true);

        // Fetch saved roster
        const fetchRoster = async () => {
            try {
                const res = await fetch('/api/raid-comp');
                if (res.ok) {
                    const savedData = await res.json();

                    let savedRoster: Player[] = [];
                    let savedOverrides: Record<string, Partial<Player>> = {};

                    // Handle legacy format (array) vs new format (object)
                    if (Array.isArray(savedData)) {
                        savedRoster = savedData;
                    } else if (savedData && typeof savedData === 'object') {
                        savedRoster = savedData.roster || [];
                        savedOverrides = savedData.overrides || {};
                    }

                    if (savedOverrides) {
                        setPlayerOverrides(savedOverrides);
                    }

                    if (savedRoster && Array.isArray(savedRoster)) {
                        // Merge saved state with fresh player data
                        const mergedRoster = (savedRoster as Player[]).map((savedPlayer): Player | null => {
                            const freshPlayer = allPlayers.find(p => p.id === savedPlayer.id);
                            if (!freshPlayer) return null;
                            // Keep saved preferences (class, spec, role) but use fresh profile data
                            const merged: Player = {
                                ...freshPlayer,
                                classId: savedPlayer.classId,
                                specId: savedPlayer.specId,
                                role: savedPlayer.role
                            };
                            return merged;
                        }).filter((p): p is Player => p !== null);

                        setRoster(mergedRoster);
                    }
                }
            } catch (error) {
                console.error("Failed to load roster", error);
            } finally {
                setIsInitialLoad(false);
            }
        };
        fetchRoster();
    }, []);

    // Track unsaved changes when roster or overrides change
    useEffect(() => {
        if (isInitialLoad) return;
        setHasUnsavedChanges(true);
    }, [roster, playerOverrides, isInitialLoad]);

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
                // Apply any cached overrides
                const overrides = playerOverrides[player.id] || {};
                setRoster([...roster, { ...player, ...overrides }]);
            }
        }

        // Dropping back to Sidebar (removing from roster)
        if (over.id === "sidebar-drop-zone") {
            const playerToRemove = roster.find(p => p.id === active.id);
            if (playerToRemove) {
                // Save current settings before removing
                setPlayerOverrides(prev => ({
                    ...prev,
                    [playerToRemove.id]: {
                        classId: playerToRemove.classId,
                        specId: playerToRemove.specId,
                        role: playerToRemove.role
                    }
                }));
                setRoster(roster.filter(p => p.id !== active.id));
            }
        }
    };

    const handleRemoveFromRoster = (playerId: string) => {
        const playerToRemove = roster.find(p => p.id === playerId);
        if (playerToRemove) {
            // Save current settings before removing
            setPlayerOverrides(prev => ({
                ...prev,
                [playerId]: {
                    classId: playerToRemove.classId,
                    specId: playerToRemove.specId,
                    role: playerToRemove.role
                }
            }));
            setRoster(roster.filter(p => p.id !== playerId));
        }
    };

    const handleUpdatePlayer = (playerId: string, updates: Partial<Player>) => {
        // Update both roster and overrides so it reflects everywhere immediately
        setRoster(roster.map(p => p.id === playerId ? { ...p, ...updates } : p));

        // Also update overrides so if they move to sidebar, it persists
        setPlayerOverrides(prev => ({
            ...prev,
            [playerId]: { ...(prev[playerId] || {}), ...updates }
        }));
    };

    // Derived available players (Sidebar)
    const availablePlayers = allPlayers
        .filter(p => !roster.find(r => r.id === p.id))
        .map(p => ({
            ...p,
            ...(playerOverrides[p.id] || {})
        }));

    const activePlayer = allPlayers.find(p => p.id === activeId);

    if (!mounted || isInitialLoad) {
        return (
            <div className="grid lg:grid-cols-[350px_1fr] gap-6 h-full">
                <div className="h-full overflow-hidden flex flex-col bg-card border rounded-lg">
                    <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
                        <div className="h-4 w-32 bg-secondary animate-pulse rounded" />
                    </div>
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 w-full bg-secondary/50 animate-pulse rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="h-full overflow-y-auto space-y-6 pr-2">
                    <div className="h-64 w-full bg-card border rounded-lg animate-pulse" />
                    <div className="h-96 w-full bg-card border rounded-lg animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <DndContext id="report-dnd" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid lg:grid-cols-[350px_1fr] gap-6 h-full">
                <div className="h-full overflow-hidden flex flex-col">
                    <RosterSidebar
                        players={availablePlayers}
                        onOpenInfo={setInfoPlayer}
                        onUpdate={handleUpdatePlayer}
                    />
                </div>

                <div className="h-full overflow-y-auto space-y-6 pr-2">
                    <div className="flex gap-4 border-b pb-2">
                        <button
                            onClick={() => setActiveTab('roster')}
                            className={cn(
                                "text-sm font-medium pb-2 border-b-2 transition-colors flex items-center gap-2",
                                activeTab === 'roster' ? "border-indigo-500 text-indigo-500" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Raid Composition
                            {isSaving && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" title="Saving..." />}
                        </button>
                        <button
                            onClick={() => setActiveTab('professions')}
                            className={cn(
                                "text-sm font-medium pb-2 border-b-2 transition-colors",
                                activeTab === 'professions' ? "border-indigo-500 text-indigo-500" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Professions
                        </button>
                        <button
                            onClick={() => setActiveTab('heatmap')}
                            className={cn(
                                "text-sm font-medium pb-2 border-b-2 transition-colors",
                                activeTab === 'heatmap' ? "border-indigo-500 text-indigo-500" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Availability Heatmap
                        </button>
                    </div>

                    <div className="flex flex-col gap-6 relative">
                        {activeTab === 'roster' && (
                            <div className="absolute top-0 right-0 z-10">
                                <Button
                                    size="sm"
                                    variant={hasUnsavedChanges ? "default" : "outline"}
                                    disabled={isSaving || !hasUnsavedChanges}
                                    onClick={() => saveRoster(roster, playerOverrides)}
                                    className="gap-2"
                                >
                                    {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Changes" : "Saved"}
                                    {isSaving && <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />}
                                </Button>
                            </div>
                        )}

                        {activeTab === 'roster' ? (
                            <>
                                <CompReport roster={roster} />
                                <CompBuilder
                                    roster={roster}
                                    onRemove={handleRemoveFromRoster}
                                    onUpdate={handleUpdatePlayer}
                                    onOpenInfo={setInfoPlayer}
                                />
                            </>
                        ) : activeTab === 'professions' ? (
                            <ProfessionsReport roster={allPlayers} />
                        ) : (
                            <AvailabilityHeatmap players={allPlayers} />
                        )}
                    </div>
                </div>
            </div>

            {infoPlayer && (
                <PlayerInfoPanel player={infoPlayer} onClose={() => setInfoPlayer(null)} />
            )}

            <DragOverlay>
                {activePlayer ? (
                    <div
                        className="p-3 bg-card border rounded-lg shadow-xl w-75 opacity-90 cursor-grabbing touch-none flex flex-col gap-2"
                        style={{ borderLeft: `4px solid ${WOW_CLASSES.find(c => c.id === activePlayer.classId)?.color || 'transparent'}` }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-secondary flex items-center justify-center border relative">
                                {activePlayer.avatar ? (
                                    <Image src={activePlayer.avatar} alt={activePlayer.name} fill className="object-cover" />
                                ) : (
                                    <ZamIcon icon={WOW_CLASSES.find(c => c.id === activePlayer.classId)?.specs.find(s => s.id === activePlayer.specId)?.icon || WOW_CLASSES.find(c => c.id === activePlayer.classId)?.icon || ""} size={32} />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-sm leading-tight truncate">{activePlayer.name}</div>
                                <div className="text-[10px] text-muted-foreground uppercase truncate">
                                    {activePlayer.involvement} • {WOW_CLASSES.find(c => c.id === activePlayer.classId)?.name}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
