"use client";

import { useSurveyStore } from "../store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, Sword, Users } from "lucide-react";

export default function InvolvementStep() {
    const { involvement, setInvolvement, setStep } = useSurveyStore();

    const options = [
        {
            id: "core",
            title: "Core Raider",
            description: "Consistent attendance, higher performance expectations, filling core composition requirements.",
            icon: Sword,
            color: "text-red-400 bg-red-400/10",
        },
        {
            id: "fill",
            title: "Fill / Backup",
            description: "Willing to help when available, but can't commit to the full schedule.",
            icon: Shield,
            color: "text-blue-400 bg-blue-400/10",
        },
        {
            id: "heroic",
            title: "Heroic Only / Casual",
            description: "Just here for heroic and keys, not interested in mythic raid.",
            icon: Users,
            color: "text-green-400 bg-green-400/10",
        },
    ] as const;

    const handleNext = () => {
        if (!involvement) return;
        if (involvement === "heroic") {
            setStep(4); // Skip to end
        } else {
            setStep(2);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold">How involved do you want to be?</h2>
                <p className="text-muted-foreground mt-2">Select the role that best fits your schedule and goals.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {options.map((option) => {
                    const Icon = option.icon;
                    const isSelected = involvement === option.id;
                    return (
                        <div
                            key={option.id}
                            onClick={() => setInvolvement(option.id)}
                            className={cn(
                                "relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 md:hover:scale-105 hover:border-indigo-500/50 bg-card",
                                isSelected ? "border-indigo-500 shadow-lg shadow-indigo-500/20 bg-indigo-500/5" : "border-border"
                            )}
                        >
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors", option.color)}>
                                <Icon size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{option.title}</h3>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-end pt-8">
                <Button onClick={handleNext} disabled={!involvement} size="lg" className="w-full md:w-auto">
                    Next
                </Button>
            </div>
        </div>
    );
}
