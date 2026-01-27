"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { BASE_RAID_SESSIONS } from "@/lib/time";
import { Player } from "./report-shell";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = [
    ...Array.from({ length: 12 }, (_, i) => i + 12).flatMap(h => [`${h.toString().padStart(2, '0')}:00`, `${h.toString().padStart(2, '0')}:30`]),
    ...Array.from({ length: 12 }, (_, i) => i).flatMap(h => [`${h.toString().padStart(2, '0')}:00`, `${h.toString().padStart(2, '0')}:30`])
];

const getActualDay = (displayDay: string, time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) {
        const index = DAYS.indexOf(displayDay);
        return DAYS[(index + 1) % 7];
    }
    return displayDay;
};

interface AvailabilityHeatmapProps {
    players: Player[];
    className?: string;
}

export function AvailabilityHeatmap({ players, className }: AvailabilityHeatmapProps) {
    const [localTimezone, setLocalTimezone] = useState("UTC");

    useEffect(() => {
        setLocalTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const [localToUtc, setLocalToUtc] = useState<Record<string, { day: string, time: string }>>({});
    const [heatmapDetails, setHeatmapDetails] = useState<Record<string, string[]>>({});
    const [maxCount, setMaxCount] = useState(0);

    const [raidSlots, setRaidSlots] = useState<Set<string>>(new Set());
    const [raidColumns, setRaidColumns] = useState<Set<number>>(new Set());
    const [raidOffscreen, setRaidOffscreen] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [is24Hour, setIs24Hour] = useState(false);

    // Calculate Local -> UTC mapping and Raid Slots
    useEffect(() => {
        const map: Record<string, { day: string, time: string }> = {};
        const raidSet = new Set<string>();

        const start = new Date("2023-12-31T00:00:00Z"); // Start around a known Sunday

        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: localTimezone,
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // 30 min steps for 9 days
        for (let i = 0; i < 48 * 9; i++) {
            const utcTime = new Date(start.getTime() + i * 30 * 60000);
            const parts = formatter.formatToParts(utcTime);
            const localDay = parts.find(p => p.type === 'weekday')?.value;
            let localH = parts.find(p => p.type === 'hour')?.value;
            if (localH === '24') localH = '00';
            const localM = parts.find(p => p.type === 'minute')?.value;

            if (localDay && localH && localM) {
                const localKey = `${localDay}-${localH}:${localM}`;

                const utcDay = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: 'long' }).format(utcTime);
                const utcH = utcTime.getUTCHours().toString().padStart(2, '0');
                const utcM = utcTime.getUTCMinutes().toString().padStart(2, '0');
                const utcVal = { day: utcDay, time: `${utcH}:${utcM}` };

                if (DAYS.includes(localDay)) {
                    map[localKey] = utcVal;
                }

                // Check Raid
                for (const session of BASE_RAID_SESSIONS) {
                    if (utcDay === session.day) {
                        const t = utcTime.getUTCHours() * 60 + utcTime.getUTCMinutes();
                        const [sH, sM] = session.startTime.split(':').map(Number);
                        const [eH, eM] = session.endTime.split(':').map(Number);
                        const startMin = sH * 60 + sM;
                        const endMin = eH * 60 + eM;

                        // Identify if raid wraps to next day (e.g. 23:00 -> 02:00)
                        // Simple check: if endMin < startMin, we handle differently or assume raid sessions don't wrap in a way that breaks this simple logic 
                        // (BASE_RAID_SESSIONS are day-aligned in UTC usually or simple enough)
                        // Actually, let's use the logic from schedule-grid roughly

                        // Fix for wrapping sessions if needed. The provided BASE_RAID_SESSIONS are simple.
                        // Wed 02:30 -> 05:30.

                        // If t is in range
                        if (t >= startMin && t < endMin) {
                            if (DAYS.includes(localDay)) {
                                raidSet.add(localKey);
                            }
                        }
                    }
                }
            }
        }

        setLocalToUtc(map);
        setRaidSlots(raidSet);

        // Calculate raid columns
        const raidCols = new Set<number>();
        TIME_SLOTS.forEach((time, index) => {
            if (DAYS.some(day => {
                const actualDay = getActualDay(day, time);
                return raidSet.has(`${actualDay}-${time}`);
            })) {
                raidCols.add(index);
            }
        });
        setRaidColumns(raidCols);

    }, [localTimezone]);

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
        setMaxCount(players.length > 0 ? players.length : 1);
        // Or setMaxCount(max) if we want relative heat.
        // Usually showing relative to total Roster is better.
        // Let's use max for scaling colors if participation is low, but usually we want to see "Can we raid?"
        // If we have 20 players, and max avail is 5, we shouldn't show it as "hot" green. It's bad.
        // So normalizing against `players.length` is correct.

    }, [players]);

    const getDetails = (displayDay: string, time: string) => {
        const actualDay = getActualDay(displayDay, time);
        const map = localToUtc[`${actualDay}-${time}`];
        if (!map) return [];
        return heatmapDetails[`${map.day}-${map.time}`] || [];
    };

    const formatTimeLabel = (time: string) => {
        if (is24Hour) return time;
        const [h, m] = time.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    // Scroll hint logic
    const checkRaidOffscreen = () => {
        const container = scrollContainerRef.current;
        if (!container || raidColumns.size === 0) {
            setRaidOffscreen({ left: false, right: false });
            return;
        }

        const { scrollLeft, clientWidth, scrollWidth } = container;
        const scrollRight = scrollLeft + clientWidth;

        if (scrollWidth <= clientWidth) {
            setRaidOffscreen({ left: false, right: false });
            return;
        }

        let offLeft = false;
        let offRight = false;
        const raidIndices = Array.from(raidColumns);

        raidIndices.forEach(index => {
            const leftPos = 16 + 100 + 1 + index * 33;
            const rightPos = leftPos + 32;
            if (rightPos < scrollLeft + 40) offLeft = true;
            if (leftPos > scrollRight - 40) offRight = true;
        });

        setRaidOffscreen(prev => {
            if (prev.left === offLeft && prev.right === offRight) return prev;
            return { left: offLeft, right: offRight };
        });
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', checkRaidOffscreen);
        window.addEventListener('resize', checkRaidOffscreen);
        setTimeout(checkRaidOffscreen, 100);

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0 && container) {
                const canScrollHorizontally = container.scrollWidth > container.clientWidth;
                if (canScrollHorizontally) {
                    e.preventDefault();
                    container.scrollLeft += e.deltaY;
                }
            }
        };
        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('scroll', checkRaidOffscreen);
            window.removeEventListener('resize', checkRaidOffscreen);
            container.removeEventListener('wheel', handleWheel);
        }
    }, [raidColumns]);


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
        <div className={cn("select-none bg-card rounded-xl border shadow-xl overflow-hidden", className)}>
            <div className="flex items-center justify-between p-4 border-b bg-secondary/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-foreground">Availability Heatmap</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            Based on {players.length} players • Local: {localTimezone}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIs24Hour(!is24Hour)}
                    className="px-3 py-1.5 rounded-md bg-secondary/50 hover:bg-indigo-500/10 text-[10px] font-bold text-muted-foreground hover:text-indigo-400 transition-all border border-border/50"
                >
                    {is24Hour ? "24H FORMAT" : "12H FORMAT"}
                </button>
            </div>

            <div className="relative group/grid">
                <div className="overflow-x-auto custom-scrollbar" ref={scrollContainerRef}>
                    <div className="min-w-max p-4 pr-8">
                        {/* Time Header Row */}
                        <div className="grid grid-cols-[100px_repeat(48,1fr)] gap-px mb-4">
                            <div />
                            {TIME_SLOTS.map((time, i) => {
                                const isHourStart = time.endsWith("00");
                                return (
                                    <div key={time} className="relative h-10 w-8">
                                        {isHourStart && (
                                            <div className="absolute left-0 bottom-0 flex flex-col items-start translate-x-[-0.5px]">
                                                <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap -rotate-45 origin-bottom-left ml-0.5 mb-0.5">
                                                    {formatTimeLabel(time)}
                                                </span>
                                                <div className="w-px h-2 bg-border/80" />
                                            </div>
                                        )}
                                        {!isHourStart && (
                                            <div className="absolute left-0 bottom-0 w-px h-1 bg-border/30 translate-x-[-0.5px]" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Day Rows */}
                        <div className="space-y-1">
                            {DAYS.map(day => (
                                <div key={day} className="grid grid-cols-[100px_repeat(48,1fr)] gap-px group">
                                    <div className="flex items-center pr-3">
                                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                            {day.slice(0, 3)}
                                        </span>
                                    </div>

                                    {TIME_SLOTS.map(time => {
                                        const actualDay = getActualDay(day, time);
                                        const details = getDetails(day, time);
                                        const count = details.length;
                                        const isRaid = raidSlots.has(`${actualDay}-${time}`);
                                        const isHourStart = time.endsWith("00");
                                        const isMidnight = time === "00:00";

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
                                                            {day} {formatTimeLabel(time)}
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
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll Hints */}
                <AnimatePresence>
                    {raidOffscreen.left && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onClick={() => {
                                const container = scrollContainerRef.current;
                                if (container) {
                                    const raidIndices = Array.from(raidColumns).sort((a, b) => a - b);
                                    const firstRaidIndex = raidIndices[0];
                                    const targetScroll = 16 + 100 + 1 + firstRaidIndex * 33 - 150;
                                    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
                                }
                            }}
                            className="absolute left-0 top-15 bottom-4 z-20 bg-rose-500 text-white text-[10px] font-bold py-4 px-1 rounded-r-xl shadow-2xl shadow-rose-500/40 border border-l-0 border-white/20 flex flex-col items-center gap-2 hover:bg-rose-400 transition-colors group/hint"
                        >
                            <ChevronLeft className="w-3 h-3 group-hover/hint:-translate-x-0.5 transition-transform" />
                            <span className="[writing-mode:vertical-lr] rotate-180 uppercase tracking-widest font-black text-[8px]">Raid</span>
                        </motion.button>
                    )}
                    {raidOffscreen.right && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={() => {
                                const container = scrollContainerRef.current;
                                if (container) {
                                    const raidIndices = Array.from(raidColumns).sort((a, b) => b - a);
                                    const lastRaidIndex = raidIndices[0];
                                    const targetScroll = 16 + 100 + 1 + lastRaidIndex * 33 - (container.clientWidth - 150);
                                    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
                                }
                            }}
                            className="absolute right-0 top-15 bottom-4 z-20 bg-rose-500 text-white text-[10px] font-bold py-4 px-1 rounded-l-xl shadow-2xl shadow-rose-500/40 border border-r-0 border-white/20 flex flex-col items-center gap-2 hover:bg-rose-400 transition-colors group/hint"
                        >
                            <ChevronRight className="w-3 h-3 group-hover/hint:translate-x-0.5 transition-transform" />
                            <span className="[writing-mode:vertical-lr] uppercase tracking-widest font-black text-[8px]">Raid</span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-3 border-t bg-secondary/10 flex gap-4 text-[10px] items-center justify-center">
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
            </div>
        </div>
    );
}
