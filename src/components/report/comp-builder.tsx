"use client";

import { useDroppable } from "@dnd-kit/core";
import { Player } from "./report-shell";
import { cn } from "@/lib/utils";
import { WOW_CLASSES } from "@/lib/wow-classes";
import { X, ChevronDown, Info } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ZamIcon } from "@/components/ui/zam-icon";

export function CompBuilder({ roster, onRemove, onUpdate, onOpenInfo }: {
    roster: Player[],
    onRemove: (id: string) => void,
    onUpdate: (id: string, updates: Partial<Player>) => void,
    onOpenInfo: (p: Player) => void
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: "roster-drop-zone",
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
                {roster.map(player => (
                    <RosterCard
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

function RosterCard({ player, onRemove, onUpdate, onOpenInfo }: {
    player: Player,
    onRemove: () => void,
    onUpdate: (updates: Partial<Player>) => void,
    onOpenInfo: () => void
}) {
    const selectedClass = WOW_CLASSES.find(c => c.id === player.classId);
    const selectedSpec = selectedClass?.specs.find(s => s.id === player.specId);

    // Sort classes by user ranking
    const sortedClasses = [...WOW_CLASSES].sort((a, b) => {
        const rankA = player.rankedClasses.indexOf(a.id);
        const rankB = player.rankedClasses.indexOf(b.id);

        // If not in ranking list, push to bottom
        const safeRankA = rankA === -1 ? 999 : rankA;
        const safeRankB = rankB === -1 ? 999 : rankB;

        return safeRankA - safeRankB;
    });

    return (
        <div
            className="p-3 bg-card border rounded-lg shadow-sm group hover:border-indigo-500/30 transition-all flex flex-col gap-3 relative"
            style={{ borderLeftColor: selectedClass?.color, borderLeftWidth: '4px' }}
        >
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onOpenInfo}
                    className="p-1 hover:text-indigo-400 transition-colors"
                    title="View Info"
                >
                    <Info size={14} />
                </button>
                <button
                    onClick={onRemove}
                    className="p-1 hover:text-rose-500 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex items-center gap-2 pr-10">
                {/* Avatar or Class Icon */}
                {selectedClass && (
                    <div className="relative w-8 h-8 rounded shrink-0 overflow-hidden text-black/50">
                        <ZamIcon icon={selectedSpec?.icon || selectedClass.icon} size={32} />
                    </div>
                )}
                <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{player.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase truncate">
                        {selectedClass?.name} {selectedSpec ? `- ${selectedSpec.name}` : ""}
                    </div>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between text-xs font-normal h-8">
                        <span className="truncate">{selectedSpec?.name || "Select Spec..."}</span>
                        <ChevronDown className="w-3 h-3 opacity-50 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
                    {sortedClasses.map(wowClass => {
                        const isRanked = player.rankedClasses.includes(wowClass.id);
                        const rank = player.rankedClasses.indexOf(wowClass.id) + 1;

                        return (
                            <div key={wowClass.id}>
                                <DropdownMenuLabel className="flex items-center justify-between text-xs py-1.5 bg-muted/30">
                                    <span style={{ color: wowClass.color }}>{wowClass.name}</span>
                                    {isRanked && <span className="text-[9px] bg-secondary px-1.5 rounded">Rank #{rank}</span>}
                                </DropdownMenuLabel>
                                {wowClass.specs.map(spec => (
                                    <DropdownMenuItem
                                        key={spec.id}
                                        onClick={() => onUpdate({
                                            classId: wowClass.id,
                                            specId: spec.id,
                                            role: spec.role
                                        })}
                                        className="pl-4 text-xs cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ZamIcon icon={spec.icon} size={16} />
                                            {spec.name}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                            </div>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
