"use client";

import { Player } from "./report-shell";
import { X, Calendar, Trophy, MessageSquare } from "lucide-react";
import { WOW_CLASSES } from "@/lib/wow-classes";
import { ZamIcon } from "@/components/ui/zam-icon";
import { ScheduleGrid } from "@/components/ui/schedule-grid";

export function PlayerInfoPanel({ player, onClose }: { player: Player, onClose: () => void }) {
    if (!player) return null;

    // Use a small version of ScheduleGrid if possible, or a simplified view
    // For now, let's show the key data points clearly.

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-card border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                            {player.avatar ? (
                                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-secondary flex items-center justify-center font-bold text-xl uppercase">
                                    {player.name[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{player.name}</h2>
                            <p className="text-muted-foreground text-sm uppercase tracking-wider">{player.involvement} Member</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Class Rankings */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-indigo-400">
                            <Trophy size={20} />
                            <h3 className="font-bold uppercase tracking-tight">Class Preferences</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {player.specs.sort((a, b) => a.rank - b.rank).map((spec, i) => {
                                const wowClass = WOW_CLASSES.find(c => c.id === spec.classId);
                                const specData = wowClass?.specs.find(s => s.id === spec.specId);
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-background/50">
                                        <div className="font-mono text-muted-foreground mr-1 text-sm">#{i + 1}</div>
                                        <ZamIcon icon={specData?.icon || wowClass?.icon || ""} size={32} />
                                        <div className="min-w-0">
                                            <div className="font-bold text-sm truncate">{specData?.name || wowClass?.name}</div>
                                            <div className="text-[10px] uppercase opacity-70" style={{ color: wowClass?.color }}>{wowClass?.name}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Availability */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-emerald-400">
                            <Calendar size={20} />
                            <h3 className="font-bold uppercase tracking-tight">Availability ({player.availability.timezone})</h3>
                        </div>
                        <div className="border rounded-xl bg-background/50 overflow-hidden">
                            <ScheduleGrid
                                value={player.availability.schedule}
                                onChange={() => { }}
                                timezone={player.availability.timezone}
                                readOnly={true}
                            />
                        </div>
                    </section>

                    {/* Comments */}
                    {player.specs[0]?.comments && (
                        <section>
                            <div className="flex items-center gap-2 mb-4 text-amber-400">
                                <MessageSquare size={20} />
                                <h3 className="font-bold uppercase tracking-tight">Notes / Comments</h3>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50 border italic text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                "{player.specs[0].comments}"
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
