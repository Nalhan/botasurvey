import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { submissions, users, accounts, raidCompositions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCachedGuildRoles, getGuildMembersData } from "@/lib/discord";
import { AdminDashboard } from "./admin-dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, ShieldAlert, ChevronLeft } from "lucide-react";

export default async function AdminPage() {
    const session = await auth();
    const isUserAdmin = await isAdmin(session);

    if (!isUserAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <ShieldAlert className="w-16 h-16 text-rose-500" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <Link href="/">
                    <Button variant="outline">Return Home</Button>
                </Link>
            </div>
        );
    }

    // 1. Fetch DB data and roles in parallel
    const [rawUsers, guildRoles, raidComp] = await Promise.all([
        db.select({
            user: users,
            submission: submissions,
            discordId: accounts.providerAccountId
        })
            .from(users)
            .leftJoin(submissions, eq(users.id, submissions.userId))
            .leftJoin(accounts, and(
                eq(users.id, accounts.userId),
                eq(accounts.provider, 'discord')
            )),
        getCachedGuildRoles(),
        db.select().from(raidCompositions).where(eq(raidCompositions.id, 1))
    ]);

    // 2. Fetch Discord data for specific IDs found
    const discordIds = rawUsers.filter(r => r.discordId).map(r => r.discordId!);
    const discordMembersMap = await getGuildMembersData(discordIds);

    const roster = raidComp.length > 0 ? raidComp[0].rosterData : [];
    const roleMappings = raidComp.length > 0 ? raidComp[0].roleMappings : {};

    // Combine it all for the client component
    const adminData = rawUsers.map(row => {
        const discordInfo = row.discordId ? discordMembersMap[row.discordId] : null;
        return {
            internalId: row.user.id,
            name: row.user.name,
            avatar: row.user.image,
            submission: row.submission,
            discordId: row.discordId,
            discordData: discordInfo || null
        };
    });

    return (
        <div className="container mx-auto py-6 px-4 max-w-400">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-muted-foreground text-sm">Manage Discord roles and sync server state.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/report">
                        <Button variant="outline" className="gap-2">
                            <ChevronLeft className="w-4 h-4" />
                            Back to Report
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="gap-2">
                            <Home className="w-4 h-4" />
                            Home
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="space-y-6">
                <AdminDashboard
                    adminData={adminData}
                    guildRoles={guildRoles}
                    roster={roster as any[]}
                    initialRoleMappings={roleMappings as Record<string, string>}
                />
            </div>
        </div>
    );
}
