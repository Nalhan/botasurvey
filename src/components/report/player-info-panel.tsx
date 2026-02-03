"use client";

import Image from "next/image";
import { Player } from "./report-shell";
import { X, Calendar, Trophy, MessageSquare, Smile, Meh, Frown, Hammer } from "lucide-react";
import { WOW_CLASSES } from "@/lib/wow-classes";
import { WOW_PROFESSIONS } from "@/lib/wow-professions";
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
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 relative">
                            {player.avatar ? (
                                <Image src={player.avatar} alt={player.name} fill className="object-cover" />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...player.specs].sort((a, b) => a.rank - b.rank).map((classPref, i) => {
                                const wowClass = WOW_CLASSES.find(c => c.id === classPref.classId);
                                if (!wowClass) return null;

                                return (
                                    <div key={i} className="flex flex-col gap-2 p-3 rounded-lg border bg-background/50 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: wowClass.color }} />
                                        <div className="flex items-center gap-3">
                                            <div className="font-mono text-muted-foreground mr-1 text-sm">#{i + 1}</div>
                                            <ZamIcon icon={wowClass.icon} size={32} />
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm tracking-tight" style={{ color: wowClass.color }}>{wowClass.name}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-1 pl-8 mt-1 border-l ml-3 border-white/5">
                                            {wowClass.specs.map(spec => {
                                                const sentiment = classPref.specs[spec.id] || 'neutral';
                                                return (
                                                    <div key={spec.id} className="flex items-center justify-between gap-2 text-[11px] py-0.5">
                                                        <div className="flex items-center gap-2 opacity-80 group">
                                                            <ZamIcon icon={spec.icon} size={16} />
                                                            <span>{spec.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/30 border border-white/5">
                                                            {sentiment === 'like' && <><Smile size={12} className="text-green-400" /> <span className="text-green-400/80 font-medium">Prefer</span></>}
                                                            {sentiment === 'neutral' && <><Meh size={12} className="text-yellow-400" /> <span className="text-yellow-400/80 font-medium">Fine</span></>}
                                                            {sentiment === 'dislike' && <><Frown size={12} className="text-red-400" /> <span className="text-red-400/80 font-medium">Avoid</span></>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Professions */}
                    {player.professions && player.professions.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4 text-cyan-400">
                                <Hammer size={20} />
                                <h3 className="font-bold uppercase tracking-tight">Professions</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {player.professions.map((prof, i) => {
                                    const profession = WOW_PROFESSIONS.find(p => p.id === prof.id);
                                    const spec = profession?.specs?.find(s => s.id === prof.specId);
                                    return (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-background/50">
                                            <ZamIcon icon={spec?.icon || profession?.icon || ""} size={32} />
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm truncate">{profession?.name}</div>
                                                <div className="text-[10px] uppercase opacity-70 text-cyan-400 font-medium">{spec?.name || "No Specialization"}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

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
                                disableScroll={true}
                            />
                        </div>
                    </section>

                    {/* Comments */}
                    {player.comments && (
                        <section>
                            <div className="flex items-center gap-2 mb-4 text-amber-400">
                                <MessageSquare size={20} />
                                <h3 className="font-bold uppercase tracking-tight">Notes / Comments</h3>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50 border italic text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                &quot;{player.comments}&quot;
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
