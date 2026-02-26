"use server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { updateGuildMember, getGuildMember } from "@/lib/discord";
import { revalidateTag } from "next/cache";

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

export async function removeRoleFromAllDiscordMembers(roleId: string) {
    const session = await auth();
    const isUserAdmin = await isAdmin(session);

    if (!isUserAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    const { listGuildMembers, updateGuildMemberRoles } = await import("@/lib/discord");

    const membersMap = await listGuildMembers();
    const members = Array.from(membersMap.entries());

    const membersWithRole = members.filter(([_, data]) => data.roles.includes(roleId));

    if (membersWithRole.length === 0) {
        return { success: true, count: 0 };
    }

    const batchSize = 5;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < membersWithRole.length; i += batchSize) {
        const batch = membersWithRole.slice(i, i + batchSize);
        const results = await Promise.all(
            batch.map(async ([userId, data]) => {
                const newRoles = data.roles.filter(r => r !== roleId);
                return await updateGuildMemberRoles(userId, newRoles);
            })
        );

        results.forEach(r => {
            if (r) successCount++;
            else failCount++;
        });

        if (i + batchSize < membersWithRole.length) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    return {
        success: failCount === 0,
        count: successCount,
        failed: failCount,
        error: failCount > 0 ? `Failed to update ${failCount} members` : undefined
    };
}

export async function refreshDiscordCache() {
    const session = await auth();
    const isUserAdmin = await isAdmin(session);

    if (!isUserAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    revalidateTag('discord');

    return { success: true };
}
