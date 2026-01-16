"use client";

import { useSurveyStore } from "../store";
import { Button } from "@/components/ui/button";
import { WOW_CLASSES, WowClass } from "@/lib/wow-classes";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Minus, ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react";
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { ZamIcon } from "@/components/ui/zam-icon";
import { motion, AnimatePresence } from "framer-motion";

// Draggable "Source" Item
function SourceClassItem({ wowClass }: { wowClass: WowClass }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `source-${wowClass.id}`,
        data: { wowClass, type: "source" }
    });

    if (isDragging) {
        return <div className="p-3 mb-2 rounded border border-dashed border-muted opacity-50 bg-muted/20 h-12"></div>
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="p-3 mb-2 rounded bg-card border hover:border-indigo-500 cursor-grab active:cursor-grabbing flex items-center gap-2"
            style={{ borderLeftColor: wowClass.color, borderLeftWidth: "4px" }}
        >
            <ZamIcon icon={wowClass.icon} size={24} />
            <span className="font-medium">{wowClass.name}</span>
        </div>
    );
}

// Sortable "Ranked" Item
function RankedClassItem({ wowClass, index, onRemove }: { wowClass: WowClass, index: number, onRemove: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: wowClass.id,
        data: { wowClass, type: "ranked" }
    });
    const { specSentiments, setSpecSentiment } = useSurveyStore();
    const [isExpanded, setIsExpanded] = useState(true);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return <div style={style} className="opacity-0 h-40"></div>
    }

    return (
        <div ref={setNodeRef} style={style} className="bg-card border rounded-lg mb-4 shadow-sm relative group overflow-hidden">
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 cursor-grab active:cursor-grabbing flex-grow" {...listeners} {...attributes}>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary font-bold text-sm">
                            {index + 1}
                        </div>
                        <ZamIcon icon={wowClass.icon} size={32} />
                        <h3 className="font-bold text-lg" style={{ color: wowClass.color }}>{wowClass.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(wowClass.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        >
                            <Trash2 size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-8 w-8 p-0 text-muted-foreground"
                        >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </Button>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-2 pl-11 pt-2 border-t mt-2">
                                {wowClass.specs.map(spec => (
                                    <div key={spec.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <ZamIcon icon={spec.icon} size={20} />
                                            <span>{spec.name}</span>
                                        </div>
                                        <div className="flex gap-1 bg-secondary/50 rounded p-1">
                                            <button
                                                onClick={() => setSpecSentiment(`${wowClass.id}-${spec.id}`, 'like')}
                                                className={cn("p-1.5 rounded transition-colors hover:bg-green-500/20", specSentiments[`${wowClass.id}-${spec.id}`] === 'like' && "bg-green-500 text-white")}
                                            >
                                                <ThumbsUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => setSpecSentiment(`${wowClass.id}-${spec.id}`, 'neutral')}
                                                className={cn("p-1.5 rounded transition-colors hover:bg-yellow-500/20", (!specSentiments[`${wowClass.id}-${spec.id}`] || specSentiments[`${wowClass.id}-${spec.id}`] === 'neutral') && "bg-yellow-500/20 text-yellow-500")}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <button
                                                onClick={() => setSpecSentiment(`${wowClass.id}-${spec.id}`, 'dislike')}
                                                className={cn("p-1.5 rounded transition-colors hover:bg-red-500/20", specSentiments[`${wowClass.id}-${spec.id}`] === 'dislike' && "bg-red-500 text-white")}
                                            >
                                                <ThumbsDown size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Droppable container for the ranked list
function DroppableRankingList() {
    const { setNodeRef, isOver } = useDroppable({
        id: "ranked-list-droppable",
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "rounded-lg border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground",
                isOver ? "border-indigo-500 bg-indigo-500/5 shadow-inner text-indigo-400" : "border-border/50 bg-secondary/5"
            )}
        >
            <Plus size={24} className={cn("transition-transform", isOver && "scale-110")} />
            <span className="text-sm font-medium">Drop here to add to ranking</span>
        </div>
    );
}

export default function ClassRankingStep() {
    const { rankedClasses, updateRankedClasses, removeRankedClass, setStep } = useSurveyStore();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<WowClass | null>(null);

    const availableClasses = WOW_CLASSES.filter(c => !rankedClasses.includes(c.id));

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        const data = active.data.current;
        if (data && data.wowClass) {
            setActiveItem(data.wowClass);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        if (!over) return;

        // Drop logic
        // Case 1: Source -> Ranked (Drop on sortable list or placeholder)
        if (active.id.toString().startsWith("source-")) {
            const classId = (active.id as string).replace("source-", "");

            // Check if we dropped over the list or a ranked item
            const isOverList = over.id === "ranked-list-droppable";
            const isOverRankedItem = rankedClasses.includes(over.id as string);

            if ((isOverList || isOverRankedItem) && !rankedClasses.includes(classId)) {
                updateRankedClasses([...rankedClasses, classId]);
            }
            return;
        }

        // Case 2: Reordering Ranked
        if (active.id !== over.id) {
            const oldIndex = rankedClasses.indexOf(active.id as string);
            const newIndex = rankedClasses.indexOf(over.id as string);
            updateRankedClasses(arrayMove(rankedClasses, oldIndex, newIndex));
        }
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Rank your text preferences</h2>
                    <p className="text-muted-foreground mt-2">Drag classes from the left to your ranking on the right. Then set your preference per spec.</p>
                </div>

                <div className="grid md:grid-cols-[280px_1fr] gap-8 min-h-[600px] items-start">
                    {/* Available Classes */}
                    <div className="bg-secondary/10 p-4 rounded-xl border border-border/40 shadow-inner">
                        <h3 className="font-bold mb-4 text-muted-foreground uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Available Classes
                        </h3>
                        <div className="space-y-2">
                            {availableClasses.map(c => <SourceClassItem key={c.id} wowClass={c} />)}
                        </div>
                    </div>

                    {/* Ranked List */}
                    <div className="bg-secondary/20 p-4 rounded-xl min-h-[200px] flex flex-col border border-border/60 shadow-xl">
                        <h3 className="font-bold mb-4 text-muted-foreground uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Your Ranking
                        </h3>

                        <div className="flex-grow">
                            <SortableContext items={rankedClasses} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4">
                                    {rankedClasses.map((id, index) => {
                                        const c = WOW_CLASSES.find(wc => wc.id === id);
                                        if (!c) return null;
                                        return <RankedClassItem key={id} wowClass={c} index={index} onRemove={removeRankedClass} />
                                    })}
                                </div>
                            </SortableContext>
                        </div>

                        <div className="mt-4">
                            <DroppableRankingList />
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeId && activeItem ? (
                        <div className="p-3 rounded bg-card border shadow-xl flex items-center gap-2" style={{ borderLeftColor: activeItem.color, borderLeftWidth: "4px" }}>
                            <ZamIcon icon={activeItem.icon} size={24} />
                            <span className="font-medium">{activeItem.name}</span>
                        </div>
                    ) : null}
                </DragOverlay>

                <div className="flex justify-between pt-8">
                    <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                    <Button onClick={() => setStep(4)} disabled={rankedClasses.length === 0}>Next</Button>
                </div>
            </div>
        </DndContext>
    );
}
