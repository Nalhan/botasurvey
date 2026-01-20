"use client";

import { Player } from "./report-shell";
import { WOW_PROFESSIONS } from "@/lib/wow-professions";
import { ZamIcon } from "@/components/ui/zam-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProfessionsReport({ roster }: { roster: Player[] }) {
    // Calculate stats based on current roster
    const stats = {
        professions: {} as Record<string, number>,
        specs: {} as Record<string, Player[]>
    };

    roster.forEach(player => {
        if (player.professions && Array.isArray(player.professions)) {
            player.professions.forEach((p: any) => {
                stats.professions[p.id] = (stats.professions[p.id] || 0) + 1;
                if (p.specId) {
                    if (!stats.specs[p.specId]) {
                        stats.specs[p.specId] = [];
                    }
                    stats.specs[p.specId].push(player);
                }
            });
        }
    });

    // Sort professions by popularity
    const sortedProfessions = WOW_PROFESSIONS.map(p => ({
        ...p,
        count: stats.professions[p.id] || 0
    })).sort((a, b) => b.count - a.count);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedProfessions.map(prof => (
                <Card key={prof.id} className={prof.count === 0 ? "opacity-50" : ""}>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <ZamIcon icon={prof.icon} size={32} />
                        <div className="flex flex-col">
                            <CardTitle className="text-lg">{prof.name}</CardTitle>
                            <span className="text-sm text-muted-foreground">{prof.count} players</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {prof.specs && prof.specs.length > 0 && (
                            <div className="space-y-3 mt-2">
                                {prof.specs.map(spec => {
                                    const specPlayers = stats.specs[spec.id] || [];
                                    const specCount = specPlayers.length;
                                    const percentage = prof.count > 0 ? (specCount / prof.count) * 100 : 0;

                                    return (
                                        <div key={spec.id} className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <ZamIcon icon={spec.icon} size={16} />
                                                    <span className="font-medium">{spec.name}</span>
                                                    {spec.recommended && (
                                                        <span className="text-[10px] bg-yellow-500/20 text-yellow-600 px-1 rounded">Rec</span>
                                                    )}
                                                </div>
                                                <span className="text-muted-foreground font-bold">{specCount}</span>
                                            </div>
                                            <Progress value={percentage} className="h-1" />
                                            {specCount > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {specPlayers.map(p => (
                                                        <div key={p.id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary truncate max-w-25" title={p.name}>
                                                            {p.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {(!prof.specs || prof.specs.length === 0) && (
                            <p className="text-xs text-muted-foreground italic">No specialized specs available.</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
