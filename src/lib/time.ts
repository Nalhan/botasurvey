export interface RaidSession {
    day: string; // "Tuesday", "Sunday" etc.
    startTime: string; // "21:30"
    endTime: string; // "00:30" (next day)
}

export const BASE_RAID_SESSIONS: RaidSession[] = [
    { day: "Wednesday", startTime: "02:30", endTime: "05:30" }, // Tue 9:30 PM EST
    { day: "Monday", startTime: "02:30", endTime: "05:30" },    // Sun 9:30 PM EST
];

/**
 * Formats a timezone for display (e.g., "EST (UTC-05:00)")
 */
export function formatTimezoneDisplay(timezone: string): string {
    try {
        const now = new Date();

        // Get colloquial name (short timezone name)
        const shortName = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            timeZoneName: "short",
        })
            .formatToParts(now)
            .find((p) => p.type === "timeZoneName")?.value || timezone;

        // Get UTC offset
        const offsetFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            timeZoneName: "shortOffset",
        });
        const offset = offsetFormatter
            .formatToParts(now)
            .find((p) => p.type === "timeZoneName")?.value || "";

        // Convert shortOffset like "GMT-5" to "UTC-05:00"
        const formattedOffset = offset
            .replace("GMT", "UTC")
            .replace(/([+-])(\d)$/, "$10$2:00") // UTC-5 -> UTC-05:00
            .replace(/([+-])(\d{2})$/, "$1$2:00"); // UTC-05 -> UTC-05:00

        return `${shortName} (${formattedOffset})`;
    } catch (e) {
        return timezone;
    }
}

/**
 * Converts server raid times to the target timezone
 */
export function getLocalizedRaidTimes(targetTimezone: string): string {
    const result: string[] = [];

    for (const session of BASE_RAID_SESSIONS) {
        const daysMap: Record<string, number> = {
            Sunday: 18,
            Monday: 19,
            Tuesday: 20,
            Wednesday: 21,
            Thursday: 22,
            Friday: 23,
            Saturday: 24,
        };

        const dayDate = daysMap[session.day] || 20;

        // Construct the start/end times in UTC
        const utcStart = new Date(`2026-01-${dayDate}T${session.startTime}:00Z`);

        // Handle end time wrapping to next day if necessary
        const [startH] = session.startTime.split(":").map(Number);
        const [endH] = session.endTime.split(":").map(Number);
        let endDayDate = dayDate;
        if (endH < startH) endDayDate++;

        const utcEnd = new Date(`2026-01-${endDayDate}T${session.endTime}:00Z`);

        const options: Intl.DateTimeFormatOptions = {
            timeZone: targetTimezone,
            weekday: 'short',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);

        const startText = formatter.format(utcStart);
        const endText = new Intl.DateTimeFormat('en-US', {
            timeZone: targetTimezone,
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(utcEnd);

        result.push(`${startText} - ${endText}`);
    }

    return result.sort().join(", ");
}
