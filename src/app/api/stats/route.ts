import { auth } from "@/auth";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const allSubmissions = await db.select({
            specs: submissions.specs,
            professions: submissions.professions
        }).from(submissions);

        const stats = {
            professions: {} as Record<string, number>,
            specs: {} as Record<string, number>
        };

        allSubmissions.forEach(sub => {
            // Count professions
            if (sub.professions) {
                const professions = sub.professions as { id: string; specId: string | null }[];
                professions.forEach(p => {
                    stats.professions[p.id] = (stats.professions[p.id] || 0) + 1;
                    if (p.specId) {
                        stats.specs[p.specId] = (stats.specs[p.specId] || 0) + 1;
                    }
                });
            }
        });

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Fetch stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
