"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Player } from "./report-shell";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ScheduleGrid, getActualDay } from "@/components/ui/schedule-grid";

interface AvailabilityHeatmapProps {
    players: Player[];
    className?: string;
}

export function AvailabilityHeatmap({ players, className }: AvailabilityHeatmapProps) {
    const [localTimezone, setLocalTimezone] = useState("UTC");
    const [heatmapDetails, setHeatmapDetails] = useState<Record<string, string[]>>({});

    useEffect(() => {
        setLocalTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    // Aggregate Data
    useEffect(() => {
        const details: Record<string, string[]> = {};

        players.forEach(p => {
            if (!p.availability?.schedule) return;
            const schedule = p.availability.schedule as Record<string, string[]>;

            Object.entries(schedule).forEach(([day, times]) => {
                times.forEach(time => {
                    const key = `${day}-${time}`;
                    if (!details[key]) details[key] = [];
                    details[key].push(p.name);
                });
            });
        });

        setHeatmapDetails(details);
    }, [players]);

    const getDetails = (localToUtc: Record<string, { day: string, time: string }>, displayDay: string, time: string) => {
        const actualDay = getActualDay(displayDay, time);
        const map = localToUtc[`${actualDay}-${time}`];
        if (!map) return [];
        return heatmapDetails[`${map.day}-${map.time}`] || [];
    };

    // Color scale helper
    const getColor = (count: number) => {
        if (count === 0) return "bg-secondary/10 hover:bg-secondary/20";

        const percentage = count / (players.length || 1);

        // Simple thresholding or gradient
        if (percentage < 0.2) return "bg-indigo-500/10 hover:bg-indigo-500/20";
        if (percentage < 0.4) return "bg-indigo-500/30 hover:bg-indigo-500/40";
        if (percentage < 0.6) return "bg-indigo-500/50 hover:bg-indigo-500/60";
        if (percentage < 0.8) return "bg-indigo-500/70 hover:bg-indigo-500/80";
        return "bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20";
    };

    const getTextColor = (count: number) => {
        const percentage = count / (players.length || 1);
        if (percentage >= 0.6) return "text-white";
        return "text-muted-foreground";
    }

    return (
        <ScheduleGrid
            timezone={localTimezone}
            className={className}
            title="Availability Heatmap"
            subtitle={`${players.length} players`}
            renderCell={({ day, time, timeLabel, isRaid, isMidnight, isHourStart, localToUtc }) => {
                const details = getDetails(localToUtc, day, time);
                const count = details.length;

                return (
                    <TooltipProvider key={`${day}-${time}`}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        "h-10 w-8 transition-all duration-150 border-y border-transparent relative flex items-center justify-center first:rounded-l-md last:rounded-r-md group/cell cursor-default",
                                        isMidnight && "border-l-2 border-l-white/20 ml-px",
                                        getColor(count),
                                        isHourStart && count === 0 && !isRaid && !isMidnight && "border-l-border/30",
                                        isRaid && "ring-2 ring-inset ring-cyan-400/40 z-10"
                                    )}
                                >
                                    {count > 0 && (
                                        <span className={cn("text-[10px] font-bold select-none", getTextColor(count))}>
                                            {count}
                                        </span>
                                    )}

                                    {isRaid && count === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                            <span className={cn(
                                                "text-[7px] font-black tracking-widest uppercase -rotate-90 whitespace-nowrap",
                                                "text-cyan-200"
                                            )}>RAID</span>
                                        </div>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs p-2">
                                <div className="font-bold mb-1 border-b pb-1">
                                    {day} {timeLabel}
                                    {isRaid && <span className="ml-2 text-cyan-400 uppercase text-[9px] tracking-wider">Raid Time</span>}
                                </div>
                                {count > 0 ? (
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                                        {details.map(name => (
                                            <div key={name} className="whitespace-nowrap">{name}</div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground italic">No players available</div>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }}
            renderLegend={() => (
                <>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-secondary/20 rounded-sm border border-dashed border-border" />
                        <span className="text-muted-foreground font-medium">0%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-indigo-500/30 rounded-sm" />
                        <span className="text-muted-foreground font-medium">~50%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-indigo-500 rounded-sm shadow-sm" />
                        <span className="text-muted-foreground font-medium">100%</span>
                    </div>
                    <div className="h-4 w-px bg-border mx-2" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 ring-1 ring-cyan-500 ring-inset bg-cyan-500/10 rounded-sm" />
                        <span className="text-muted-foreground font-medium">Scheduled Raid Time</span>
                    </div>
                </>
            )}
        />
    );
}
