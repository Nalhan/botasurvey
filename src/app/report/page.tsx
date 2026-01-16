import { auth } from "@/auth";
import { db } from "@/db";
import { submissions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ReportShell } from "@/components/report/report-shell";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default async function ReportPage() {
    const session = await auth();
    if (!session) redirect("/");

    // Fetch all submissions with user info
    const data = await db.select({
        submission: submissions,
        user: users
    })
        .from(submissions)
        .leftJoin(users, eq(submissions.userId, users.id))
        .orderBy(desc(submissions.createdAt));

    return (
        <div className="container mx-auto py-6 px-4 max-w-[1600px]">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Raid Composition Report</h1>
                    <p className="text-muted-foreground text-sm">Drag players from the sidebar to build your roster.</p>
                </div>
                <Link href="/">
                    <Button variant="outline" className="gap-2">
                        <Home className="w-4 h-4" />
                        Home
                    </Button>
                </Link>
            </div>

            <ReportShell initialData={data} />
        </div>
    );
}
