"use client";

import { useSurveyStore } from "../store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ZamIcon } from "@/components/ui/zam-icon";
import { WOW_CLASSES } from "@/lib/wow-classes";
import { WOW_PROFESSIONS } from "@/lib/wow-professions";
import { cn } from "@/lib/utils";

export default function ReviewStep() {
    const { involvement, availability, rankedClasses, specSentiments, professions, comments, setComments, setStep } = useSurveyStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    involvement,
                    availability,
                    rankedClasses,
                    specSentiments,
                    professions,
                    comments
                })
            });

            if (res.ok) {
                // Success
                // router.push("/success"); // Or just show success state here.
                // alert("Survey Submitted Successfully!"); // Placeholder for now
                // Maybe reset store?
                router.push("/report");
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Error submitting.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Almost done!</h2>
                <p className="text-muted-foreground mt-2">Anything else we should know?</p>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-medium">Additional Comments</label>
                <textarea
                    className="w-full min-h-[150px] p-4 rounded-lg bg-card border resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="I can play tank if needed, but prefer dps..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                />
            </div>

            <div className="bg-secondary/10 p-6 rounded-xl space-y-6 border border-border/50">
                <h3 className="font-bold text-lg border-b border-border pb-2">Application Summary</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground block mb-1">Role</span>
                        <span className="font-medium capitalize px-2 py-1 rounded bg-secondary">{involvement}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block mb-1">Timezone</span>
                        <span className="font-medium px-2 py-1 rounded bg-secondary">{availability?.timezone}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <span className="text-muted-foreground text-sm block">Ranked Classes & Preferences</span>
                    <div className="space-y-3">
                        {rankedClasses.map((id, index) => {
                            const wowClass = WOW_CLASSES.find(c => c.id === id);
                            if (!wowClass) return null;
                            return (
                                <div key={id} className="flex flex-col gap-2 p-3 rounded-lg bg-card border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                                            {index + 1}
                                        </div>
                                        <ZamIcon icon={wowClass.icon} size={20} />
                                        <span className="font-bold" style={{ color: wowClass.color }}>{wowClass.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pl-7">
                                        {wowClass.specs.map(spec => {
                                            const sentiment = specSentiments[`${wowClass.id}-${spec.id}`] || 'neutral';
                                            return (
                                                <div key={spec.id} className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 text-[10px]">
                                                    <ZamIcon icon={spec.icon} size={14} />
                                                    <span>{spec.name}</span>
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        sentiment === 'like' ? "bg-green-500" : sentiment === 'dislike' ? "bg-red-500" : "bg-yellow-500"
                                                    )} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {rankedClasses.length === 0 && <p className="text-sm italic text-muted-foreground">No classes ranked.</p>}
                    </div>
                </div>

                <div className="space-y-3">
                    <span className="text-muted-foreground text-sm block">Professions</span>
                    <div className="space-y-3">
                        {professions.map((p, index) => {
                            const prof = WOW_PROFESSIONS.find(wp => wp.id === p.id);
                            if (!prof) return null;
                            const spec = prof.specs?.find(s => s.id === p.specId);
                            return (
                                <div key={p.id} className="flex flex-col gap-2 p-3 rounded-lg bg-card border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                                            {index + 1}
                                        </div>
                                        <ZamIcon icon={prof.icon} size={20} />
                                        <span className="font-bold">{prof.name}</span>
                                    </div>
                                    {spec && (
                                        <div className="pl-7 text-xs text-muted-foreground flex items-center gap-1.5">
                                            <ZamIcon icon={spec.icon} size={14} />
                                            <span>{spec.name}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {professions.length === 0 && <p className="text-sm italic text-muted-foreground">No professions selected.</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-8">
                <Button variant="ghost" onClick={() => setStep(4)}>Back</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="bg-green-600 hover:bg-green-700">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Survey
                </Button>
            </div>
        </div>
    );
}
