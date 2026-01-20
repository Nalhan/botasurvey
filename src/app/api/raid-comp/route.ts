import { NextResponse } from 'next/server';
import { db } from '@/db';
import { raidCompositions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const comps = await db.select().from(raidCompositions).where(eq(raidCompositions.id, 1));

        if (comps.length === 0) {
            return NextResponse.json(null);
        }

        return NextResponse.json({
            roster: comps[0].rosterData,
            overrides: comps[0].playerOverrides || {}
        });
    } catch (error) {
        console.error('Failed to fetch raid comp:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { roster, overrides } = body;

        const existing = await db.select().from(raidCompositions).where(eq(raidCompositions.id, 1));

        if (existing.length === 0) {
            await db.insert(raidCompositions).values({
                id: 1,
                name: 'Main Roster',
                rosterData: roster,
                playerOverrides: overrides || {},
                updatedAt: new Date()
            });
        } else {
            await db.update(raidCompositions)
                .set({
                    rosterData: roster,
                    playerOverrides: overrides || {},
                    updatedAt: new Date()
                })
                .where(eq(raidCompositions.id, 1));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save raid comp:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
