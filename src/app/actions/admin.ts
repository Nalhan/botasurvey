"use server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { updateGuildMember, getGuildMember } from "@/lib/discord";

interface DiscordChange {
    userId: string;
    nick: string | null | undefined;
    roles: string[] | undefined;
}

export async function applyDiscordChanges(userId: string, changes: { nick?: string | null; roles?: string[] }) {
    const session = await auth();
    const isUserAdmin = await isAdmin(session);

    if (!isUserAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    // We assume userId passed here is the Discord User ID, as that's what updateGuildMember expects
    // If the frontend passes the internal DB ID, we'd need to look it up, but the admin UI will likely operate on Discord IDs.
    const success = await updateGuildMember(userId, changes);

    if (!success) {
        return { success: false, error: "Failed to update Discord member" };
    }

    return { success: true };
}

export async function bulkApplyDiscordChanges(changes: DiscordChange[]) {
    const session = await auth();
    const isUserAdmin = await isAdmin(session);

    if (!isUserAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    const results = await Promise.all(changes.map(async (change) => {
        const success = await updateGuildMember(change.userId, {
            nick: change.nick,
            roles: change.roles
        });
        return { userId: change.userId, success };
    }));

    const failures = results.filter(r => !r.success);

    if (failures.length > 0) {
        return {
            success: false,
            error: `Failed to update ${failures.length} members`,
            details: failures
        };
    }

    return { success: true };
}

export async function deleteUser(userId: string) {
    const session = await auth();
    const isUserAdmin = await isAdmin(session);

    if (!isUserAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const { db } = await import("@/db");
        const { users } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");

        await db.delete(users).where(eq(users.id, userId));
        return { success: true };
    } catch (e) {
        console.error("Failed to delete user:", e);
        return { success: false, error: "Failed to delete user" };
    }
}
