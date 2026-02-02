"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { BASE_RAID_SESSIONS } from "@/lib/time";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Generate all time slots starting from 12:00 (Noon)
export const TIME_SLOTS = [
    ...Array.from({ length: 12 }, (_, i) => i + 12).flatMap(h => [`${h.toString().padStart(2, '0')}:00`, `${h.toString().padStart(2, '0')}:30`]),
    ...Array.from({ length: 12 }, (_, i) => i).flatMap(h => [`${h.toString().padStart(2, '0')}:00`, `${h.toString().padStart(2, '0')}:30`])
];

export const getActualDay = (displayDay: string, time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) {
        const index = DAYS.indexOf(displayDay);
        return DAYS[(index + 1) % 7];
    }
    return displayDay;
};

interface ScheduleGridProps {
    value?: Record<string, string[]>;
    onChange?: (value: Record<string, string[]>) => void;
    timezone: string;
    className?: string;
    readOnly?: boolean;
    renderCell?: (props: {
        day: string;
        time: string;
        actualDay: string;
        timeLabel: string;
        isRaid: boolean;
        isMidnight: boolean;
        isHourStart: boolean;
        localToUtc: Record<string, { day: string, time: string }>;
    }) => React.ReactNode;
    renderLegend?: () => React.ReactNode;
    title?: string;
    subtitle?: string;
}

export function ScheduleGrid({
    value = {},
    onChange,
    timezone,
    className,
    readOnly,
    renderCell,
    renderLegend,
    title = "Availability Grid",
    subtitle
}: ScheduleGridProps) {
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [action, setAction] = useState<'add' | 'remove'>('add');
    const gridRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Pre-calculate the mapping from [LocalDay][LocalTime] -> { day: UTCDay, time: UTCTime }
    const [localToUtc, setLocalToUtc] = useState<Record<string, { day: string, time: string }>>({});
    const [raidSlots, setRaidSlots] = useState<Set<string>>(new Set());
    const [raidColumns, setRaidColumns] = useState<Set<number>>(new Set());
    const [raidOffscreen, setRaidOffscreen] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });

    useEffect(() => {
        const map: Record<string, { day: string, time: string }> = {};
        const raidSet = new Set<string>();

        // Iterate UTC week (start somewhat before to account for shifts)
        const start = new Date("2023-12-31T00:00:00Z");

        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // 30 min steps for 9 days (enough buffer)
        for (let i = 0; i < 48 * 9; i++) {
            const utcTime = new Date(start.getTime() + i * 30 * 60000);

            // Format to target timezone
            const parts = formatter.formatToParts(utcTime);
            // parts: weekday, hour, minute
            const localDay = parts.find(p => p.type === 'weekday')?.value;
            let localH = parts.find(p => p.type === 'hour')?.value;
            if (localH === '24') localH = '00'; // Intl quirk sometimes
            const localM = parts.find(p => p.type === 'minute')?.value;

            if (localDay && localH && localM) {
                const localKey = `${localDay}-${localH}:${localM}`;

                // UTC keys
                const utcDay = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: 'long' }).format(utcTime);
                const utcH = utcTime.getUTCHours().toString().padStart(2, '0');
                const utcM = utcTime.getUTCMinutes().toString().padStart(2, '0');
                const utcVal = { day: utcDay, time: `${utcH}:${utcM}` };

                // Store only if it's within our logical week (Mon-Sun)
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
                        // Simple check, assumes sessions don't wrap heavily or weirdly (e.g. 23:30->01:30 is handled by next day logic usually, but here we iterate linearly)
                        // Actually, BASE_RAID_SESSIONS are relative to UTC day.
                        // If it wraps, we need to care... but usually it doesn't cross midnight UTC for US/EU times unless specifically set.
                        // Actually, our BASE_RAID_SESSIONS hardcode simple ranges.
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

    }, [timezone]);


    const isSelected = useCallback((displayDay: string, time: string) => {
        const actualDay = getActualDay(displayDay, time);
        const utc = localToUtc[`${actualDay}-${time}`];
        if (!utc) return false;
        return value[utc.day]?.includes(utc.time) || false;
    }, [value, localToUtc]);

    const handleInteract = (displayDay: string, time: string, forceAction?: 'add' | 'remove') => {
        if (readOnly || !onChange) return;
        const actualDay = getActualDay(displayDay, time);
        const utc = localToUtc[`${actualDay}-${time}`];
        if (!utc) return;

        const currentSelected = isSelected(displayDay, time);
        const currentAction = forceAction ?? (currentSelected ? 'remove' : 'add');

        if (forceAction === undefined) {
            setAction(currentAction);
        } else if (currentAction !== action) {
            return;
        }

        const currentDaySlots = value[utc.day] || [];
        // Ensure unique
        const currentSet = new Set(currentDaySlots);
        let newDaySlots: string[];

        if (currentAction === 'add') {
            currentSet.add(utc.time);
            newDaySlots = Array.from(currentSet);
        } else {
            currentSet.delete(utc.time);
            newDaySlots = Array.from(currentSet);
        }

        onChange({
            ...value,
            [utc.day]: newDaySlots
        });
    };

    const handleMouseDown = (day: string, time: string) => {
        setIsMouseDown(true);
        handleInteract(day, time);
    };

    const handleMouseEnter = (day: string, time: string) => {
        if (isMouseDown) {
            handleInteract(day, time, action);
        }
    };

    const checkRaidOffscreen = useCallback(() => {
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
            // Position: padding (16) + labels (100) + gap (1) + index * (slot (32) + gap (1))
            const leftPos = 16 + 100 + 1 + index * 33;
            const rightPos = leftPos + 32;

            if (rightPos < scrollLeft + 40) offLeft = true;
            if (leftPos > scrollRight - 40) offRight = true;
        });

        setRaidOffscreen(prev => {
            if (prev.left === offLeft && prev.right === offRight) return prev;
            return { left: offLeft, right: offRight };
        });
    }, [raidColumns]);

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsMouseDown(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        const scrollContainer = scrollContainerRef.current;
        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0 && scrollContainer) {
                // Check if we can actually scroll horizontally
                const canScrollHorizontally = scrollContainer.scrollWidth > scrollContainer.clientWidth;
                if (canScrollHorizontally) {
                    e.preventDefault();
                    scrollContainer.scrollLeft += e.deltaY;
                }
            }
        };

        if (scrollContainer) {
            scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
            scrollContainer.addEventListener('scroll', checkRaidOffscreen);
            window.addEventListener('resize', checkRaidOffscreen);
            // Initial check
            setTimeout(checkRaidOffscreen, 100);
        }

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            if (scrollContainer) {
                scrollContainer.removeEventListener('wheel', handleWheel);
                scrollContainer.removeEventListener('scroll', checkRaidOffscreen);
            }
            window.removeEventListener('resize', checkRaidOffscreen);
        };
    }, [checkRaidOffscreen]);

    const [is24Hour, setIs24Hour] = useState(false);

    const formatTimeLabel = (time: string, format24: boolean) => {
        if (format24) return time;
        const [h, m] = time.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    return (
        <div className={cn("select-none bg-card rounded-xl border shadow-xl overflow-hidden", className)} ref={gridRef}>
            <div className="flex items-center justify-between p-4 border-b bg-secondary/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-foreground">{title}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Local: {timezone}{subtitle ? ` • ${subtitle}` : ''}</p>
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
                        <div className="grid grid-cols-[100px_repeat(48,1fr)] gap-[1px] mb-4">
                            <div />
                            {TIME_SLOTS.map((time, i) => {
                                const isHourStart = time.endsWith("00");
                                return (
                                    <div key={time} className="relative h-10 w-8">
                                        {isHourStart && (
                                            <div className="absolute left-0 bottom-0 flex flex-col items-start translate-x-[-0.5px]">
                                                <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap -rotate-45 origin-bottom-left ml-[2px] mb-[2px]">
                                                    {formatTimeLabel(time, is24Hour)}
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
                        <div className="space-y-[4px]">
                            {DAYS.map(day => (
                                <div key={day} className="grid grid-cols-[100px_repeat(48,1fr)] gap-[1px] group">
                                    <div className="flex items-center pr-3">
                                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                            {day.slice(0, 3)}
                                        </span>
                                    </div>

                                    {TIME_SLOTS.map(time => {
                                        const actualDay = getActualDay(day, time);
                                        const selected = isSelected(day, time);
                                        const isRaid = raidSlots.has(`${actualDay}-${time}`);
                                        const isHourStart = time.endsWith("00");
                                        const isMidnight = time === "00:00";

                                        if (renderCell) {
                                            return renderCell({
                                                day,
                                                time,
                                                actualDay,
                                                timeLabel: formatTimeLabel(time, is24Hour),
                                                isRaid,
                                                isMidnight,
                                                isHourStart,
                                                localToUtc
                                            });
                                        }

                                        return (
                                            <div
                                                key={`${day}-${time}`}
                                                onMouseDown={() => handleMouseDown(day, time)}
                                                onMouseEnter={() => handleMouseEnter(day, time)}
                                                className={cn(
                                                    "h-10 w-8 cursor-pointer transition-all duration-150 border-y border-transparent relative first:rounded-l-md last:rounded-r-md",
                                                    isMidnight && "border-l-2 border-l-white/20 ml-[1px]",
                                                    isRaid
                                                        ? selected
                                                            ? "bg-emerald-500 border-emerald-400 z-10 scale-[1.02] shadow-lg shadow-emerald-500/20"
                                                            : "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20"
                                                        : selected
                                                            ? "bg-indigo-500 border-indigo-400 z-10 scale-[1.02] shadow-lg shadow-indigo-500/20"
                                                            : "bg-secondary/20 hover:bg-secondary/40",
                                                    isHourStart && !selected && !isRaid && !isMidnight && "border-l-border/30"
                                                )}
                                            >
                                                {isRaid && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                                        <span className={cn(
                                                            "text-[7px] font-black tracking-tighter uppercase -rotate-90 whitespace-nowrap",
                                                            selected ? "text-white/90" : "text-rose-600/60"
                                                        )}>RAID</span>
                                                    </div>
                                                )}
                                            </div>
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
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute left-0 top-15 bottom-4 z-20 pointer-events-none flex items-center"
                        >
                            <button
                                onClick={() => {
                                    const container = scrollContainerRef.current;
                                    if (container) {
                                        const raidIndices = Array.from(raidColumns).sort((a, b) => a - b);
                                        const firstRaidIndex = raidIndices[0];
                                        const targetScroll = 16 + 100 + 1 + firstRaidIndex * 33 - 150;
                                        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
                                    }
                                }}
                                className="pointer-events-auto bg-rose-500 text-white text-[10px] font-bold py-4 px-1 rounded-r-xl shadow-2xl shadow-rose-500/40 border border-l-0 border-white/20 flex flex-col items-center gap-2 hover:bg-rose-400 transition-colors group/hint"
                            >
                                <ChevronLeft className="w-3 h-3 group-hover/hint:-translate-x-0.5 transition-transform" />
                                <span className="[writing-mode:vertical-lr] rotate-180 uppercase tracking-widest font-black text-[8px]">Raid</span>
                            </button>
                        </motion.div>
                    )}
                    {raidOffscreen.right && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="absolute right-0 top-15 bottom-4 z-20 pointer-events-none flex items-center"
                        >
                            <button
                                onClick={() => {
                                    const container = scrollContainerRef.current;
                                    if (container) {
                                        const raidIndices = Array.from(raidColumns).sort((a, b) => b - a);
                                        const lastRaidIndex = raidIndices[0];
                                        const targetScroll = 16 + 100 + 1 + lastRaidIndex * 33 - (container.clientWidth - 150);
                                        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
                                    }
                                }}
                                className="pointer-events-auto bg-rose-500 text-white text-[10px] font-bold py-4 px-1 rounded-l-xl shadow-2xl shadow-rose-500/40 border border-r-0 border-white/20 flex flex-col items-center gap-2 hover:bg-rose-400 transition-colors group/hint"
                            >
                                <ChevronRight className="w-3 h-3 group-hover/hint:translate-x-0.5 transition-transform" />
                                <span className="[writing-mode:vertical-lr] uppercase tracking-widest font-black text-[8px]">Raid</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-3 border-t bg-secondary/10 flex gap-4 text-[10px] items-center justify-center">
                {renderLegend ? renderLegend() : (
                    <>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-indigo-500 rounded-sm shadow-sm" />
                            <span className="text-muted-foreground font-medium">Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm shadow-sm" />
                            <span className="text-muted-foreground font-medium">Raid Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-rose-500/20 border border-rose-500/30 rounded-sm" />
                            <span className="text-muted-foreground font-medium">Raid Time</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
