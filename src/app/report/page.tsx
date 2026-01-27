import { auth } from "@/auth";
import { db } from "@/db";
import { submissions, users, accounts } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ReportShell } from "@/components/report/report-shell";
import { getGuildMember } from "@/lib/discord";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Shield } from "lucide-react";
import { isAdmin } from "@/lib/admin";

export default async function ReportPage() {
    const session = await auth();
    if (!session) redirect("/");

    const isUserAdmin = await isAdmin(session);

    // Fetch all submissions with user info and discord ID
    const rawData = await db.select({
        submission: submissions,
        user: users,
        discordId: accounts.providerAccountId
    })
        .from(submissions)
        .leftJoin(users, eq(submissions.userId, users.id))
        .leftJoin(accounts, and(
            eq(users.id, accounts.userId),
            eq(accounts.provider, 'discord')
        ))
        .orderBy(desc(submissions.createdAt));

    // Hydrate with live Discord data
    const data = await Promise.all(rawData.map(async (row) => {
        let discordData = null;
        if (row.discordId) {
            discordData = await getGuildMember(row.discordId);
        }
        return {
            ...row,
            discordData
        };
    }));

    return (
        <div className="container mx-auto py-6 px-4 max-w-[1600px]">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Raid Composition Report</h1>
                    <p className="text-muted-foreground text-sm">Drag players from the sidebar to build your roster.</p>
                </div>
                <div className="flex gap-2">
                    {isUserAdmin && (
                        <Link href="/admin">
                            <Button variant="ghost" className="gap-2">
                                <Shield className="w-4 h-4 text-rose-500" />
                                Admin Panel
                            </Button>
                        </Link>
                    )}
                    <Link href="/">
                        <Button variant="outline" className="gap-2">
                            <Home className="w-4 h-4" />
                            Home
                        </Button>
                    </Link>
                </div>
            </div>

            <ReportShell initialData={data} />
        </div>
    );
}
