"use client";

import { useSurveyStore } from "./store";
import { AnimatePresence, motion } from "framer-motion";
import InvolvementStep from "./steps/InvolvementStep";
import AvailabilityStep from "./steps/AvailabilityStep";
import ClassRankingStep from "./steps/ClassRankingStep";
import ReviewStep from "./steps/ReviewStep";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function SurveyPage() {
    const { step, initialize } = useSurveyStore();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        const fetchExisting = async () => {
            try {
                const res = await fetch("/api/submit");
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        initialize(data);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch existing survey:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExisting();
    }, [initialize]);

    if (!mounted || isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

    return (
        <main className="container max-w-4xl mx-auto py-12 px-4">
            <div className="mb-8">
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <p className="text-right text-xs text-muted-foreground mt-2">Step {step} of 4</p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[400px]"
                >
                    {step === 1 && <InvolvementStep />}
                    {step === 2 && <AvailabilityStep />}
                    {step === 3 && <ClassRankingStep />}
                    {step === 4 && <ReviewStep />}
                </motion.div>
            </AnimatePresence>
        </main>
    );
}
