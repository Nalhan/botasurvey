import { auth } from "@/auth";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const existing = await db.query.submissions.findFirst({
            where: eq(submissions.userId, session.user.id),
        });

        if (!existing) {
            return NextResponse.json(null);
        }

        // Transform back to store format
        const specs = existing.specs as any[];
        const rankedClasses = specs.sort((a, b) => a.rank - b.rank).map(s => s.classId);
        const specSentiments: Record<string, string> = {};

        specs.forEach(classData => {
            Object.entries(classData.specs).forEach(([specId, sentiment]) => {
                specSentiments[`${classData.classId}-${specId}`] = sentiment as string;
            });
        });

        return NextResponse.json({
            involvement: existing.involvement,
            availability: existing.availability,
            rankedClasses,
            specSentiments,
            comments: existing.comments
        });
    } catch (error) {
        console.error("Fetch submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { involvement, availability, rankedClasses, specSentiments, comments } = body;

        // Basic validation
        if (!involvement) {
            return NextResponse.json({ error: "Missing involvement" }, { status: 400 });
        }

        // Construct specs blob for storage
        const specsData = rankedClasses.map((classId: string, index: number) => ({
            classId,
            rank: index + 1,
            specs: Object.entries(specSentiments)
                .filter(([key]) => key.startsWith(classId + "-"))
                .reduce((acc, [key, val]) => {
                    const specId = key.split("-")[1];
                    acc[specId] = val as string;
                    return acc;
                }, {} as Record<string, string>)
        }));

        // Check for existing
        const existing = await db.query.submissions.findFirst({
            where: eq(submissions.userId, session.user.id),
        });

        if (existing) {
            await db.update(submissions)
                .set({
                    involvement,
                    availability,
                    specs: specsData,
                    comments,
                    createdAt: new Date(),
                })
                .where(eq(submissions.id, existing.id));
        } else {
            await db.insert(submissions).values({
                userId: session.user.id,
                involvement,
                availability,
                specs: specsData,
                comments,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
