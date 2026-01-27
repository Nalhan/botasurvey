import { Session } from "next-auth";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function isAdmin(session: Session | null): Promise<boolean> {
    if (!session?.user?.id) return false;

    const adminIds = process.env.ADMIN_DISCORD_IDS?.split(',').map(id => id.trim()) || [];

    if (adminIds.length === 0) return false;

    // We need to look up the Discord Account ID for this user
    const account = await db.query.accounts.findFirst({
        where: and(
            eq(accounts.userId, session.user.id),
            eq(accounts.provider, 'discord')
        )
    });

    if (!account?.providerAccountId) return false;

    return adminIds.includes(account.providerAccountId);
}
