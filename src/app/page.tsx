import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ClipboardList, Shield, Sword, BarChart3, ChevronRight } from "lucide-react";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function Home() {
  const session = await auth();
  let submission = null;

  if (session?.user?.id) {
    submission = await db.query.submissions.findFirst({
      where: eq(submissions.userId, session.user.id),
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background -z-10" />

      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl bg-linear-to-r from-indigo-500 to-yellow-300 bg-clip-text text-transparent pb-1 leading-tight">
            IronBota Survey Midnight Season 1
          </h1>
          <p className="text-muted-foreground">
            {session
              ? `Welcome back, ${session.user?.name?.split(' ')[0]}`
              : "Sign in to set your availability and class preferences for the upcoming season."
            }
          </p>
        </div>

        {!session ? (
          // Unauthenticated View
          <div className="space-y-8">
            {/* <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 text-sm text-left p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-medium">Easy Scheduling</p>
                  <p className="text-muted-foreground text-xs">Input your raid times seamlessly.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-left p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <Sword size={20} />
                </div>
                <div>
                  <p className="font-medium">Class Preferences</p>
                  <p className="text-muted-foreground text-xs">Rank your favorite specs.</p>
                </div>
              </div>
            </div> */}

            <form
              action={async () => {
                "use server";
                await signIn("discord", { redirectTo: "/" });
              }}
            >
              <Button variant="premium" size="lg" className="w-full text-lg shadow-lg shadow-indigo-500/20">
                Login with Discord
              </Button>
            </form>
          </div>
        ) : (
          // Authenticated Dashboard View
          <div className="grid gap-4">
            {/* Status Card */}
            <div className={cn(
              "p-6 rounded-xl border backdrop-blur-sm text-left relative overflow-hidden group transition-all hover:border-indigo-500/50",
              submission ? "bg-emerald-500/10 border-emerald-500/20" : "bg-card/50 border-border"
            )}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold flex items-center gap-2">
                    {submission ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-emerald-400">Submission Received</span>
                      </>
                    ) : (
                      <>
                        <ClipboardList className="w-5 h-5 text-muted-foreground" />
                        <span>No Submission Yet</span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {submission
                      ? "Your availability and preferences are recorded. You can update them at any time."
                      : "Please complete the survey to maximize your chances of getting your preferred raid spot."
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/survey">
                  <Button className={cn("w-full group-hover:translate-x-1 transition-transform", submission ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-indigo-600 hover:bg-indigo-500")}>
                    {submission ? "Edit Submission" : "Start Survey"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Raid Report Link */}
            <Link href="/report">
              <div className="p-4 rounded-xl border bg-card/30 hover:bg-card/50 transition-colors text-left flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-violet-400 transition-colors">Raid Roster Report</p>
                    <p className="text-xs text-muted-foreground">View guild-wide availability and stats</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
