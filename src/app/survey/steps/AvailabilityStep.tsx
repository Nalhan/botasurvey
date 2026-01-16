"use client";

import { useSurveyStore } from "../store";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Clock, Globe, Bug } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimezoneDisplay, getLocalizedRaidTimes } from "@/lib/time";
import { ScheduleGrid } from "@/components/ui/schedule-grid";

const RAID_DAYS = ["Tuesday", "Sunday"];

const TEST_TIMEZONES = [
    { label: "Eastern Time (Server)", value: "America/New_York" },
    { label: "Pacific Time", value: "America/Los_Angeles" },
    { label: "UTC", value: "UTC" },
    { label: "London", value: "Europe/London" },
    { label: "Paris", value: "Europe/Paris" },
    { label: "Tokyo", value: "Asia/Tokyo" },
    { label: "Sydney", value: "Australia/Sydney" },
];

export default function AvailabilityStep() {
    const { availability, setAvailability, setStep } = useSurveyStore();
    const [localTimezone, setLocalTimezone] = useState(availability?.timezone || "UTC");
    const [showDebug, setShowDebug] = useState(false);

    // Simple state for local availability input. 
    // Map day -> type -> string
    // Map day -> type -> string
    const [schedule, setSchedule] = useState<Record<string, string[]>>(availability?.schedule || {});

    useEffect(() => {
        if (!availability?.timezone) {
            // Detect timezone only if not already set
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            setLocalTimezone(tz);
        }
    }, [availability?.timezone]);

    const handleNext = () => {
        setAvailability({
            timezone: localTimezone,
            schedule
        });
        setStep(3);
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <div>
                    <h2 className="text-2xl font-bold">When can you play?</h2>
                    <div className="flex flex-col items-center justify-center gap-1 mt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe size={16} />
                            <p>Your Timezone: <span className="text-indigo-400 font-medium">{formatTimezoneDisplay(localTimezone)}</span></p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={16} />
                            <p>Localized Raid times: <span className="text-indigo-400 font-medium">{getLocalizedRaidTimes(localTimezone)}</span></p>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDebug(!showDebug)}
                        className="text-xs text-muted-foreground hover:text-indigo-400"
                    >
                        <Bug size={12} className="mr-1" />
                        {showDebug ? "Hide Debug" : "Fix/Test Timezone"}
                    </Button>

                    {showDebug && (
                        <div className="mt-4 p-4 bg-accent/30 rounded-lg border border-indigo-500/20 max-w-sm mx-auto animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mb-2">Test Different Timezones</label>
                            <select
                                value={localTimezone}
                                onChange={(e) => setLocalTimezone(e.target.value)}
                                className="w-full bg-background border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Auto-Detected</option>
                                {TEST_TIMEZONES.map(tz => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-muted-foreground mt-2 italic"> This helper is for testing or fixing auto-detection issues.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* <div className="border rounded-lg p-1 overflow-hidden"> */}
            {/* <div className="bg-indigo-500/10 p-3 text-sm text-center border-b mb-1 flex items-center justify-center gap-2">
                    <span className="font-bold text-indigo-400">Instructions:</span>
                    <span className="text-muted-foreground">Click and drag to paint your available times.</span>
                </div> */}
            <div>
                <ScheduleGrid value={schedule} onChange={setSchedule} timezone={localTimezone} />
            </div>
            {/* </div> */}
            {/* 
            <p className="text-xs text-muted-foreground text-center">
                * Please mark yourself as 'Available' if you can make the raid times.
            </p> */}

            <div className="flex justify-between pt-8">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleNext} size="lg">Next</Button>
            </div>
        </div>
    );
}
