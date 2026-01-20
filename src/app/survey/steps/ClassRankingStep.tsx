"use client";

import { useSurveyStore } from "../store";
import { Button } from "@/components/ui/button";
import { WOW_CLASSES, WowClass } from "@/lib/wow-classes";
import { cn } from "@/lib/utils";
import { Smile, Frown, Meh, ChevronDown, ChevronUp, ChevronRight, Trash2, Plus, Shield, Swords } from "lucide-react";
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { ZamIcon } from "@/components/ui/zam-icon";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

// Draggable "Source" Item
function SourceClassItem({ wowClass, onAdd }: { wowClass: WowClass, onAdd: (id: string) => void }) {
    const isMobile = useIsMobile();
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `source-${wowClass.id}`,
        data: { wowClass, type: "source" },
        disabled: isMobile
    });

    if (isDragging) {
        return <div className="p-3 mb-2 rounded border border-dashed border-muted opacity-50 bg-muted/20 h-12"></div>
    }

    const dragProps = isMobile ? {} : { ...listeners, ...attributes };

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "p-3 mb-2 rounded bg-card border flex items-center justify-between group",
                !isMobile ? "hover:border-indigo-500 cursor-grab active:cursor-grabbing touch-none" : "border-border"
            )}
            style={{ borderLeftColor: wowClass.color, borderLeftWidth: "4px" }}
            {...dragProps}
        >
            <div className="flex items-center gap-2 grow min-w-0 mr-2">
                <ZamIcon icon={wowClass.icon} size={32} className="shrink-0 rounded-md shadow-sm" />
                <span className="font-medium truncate">{wowClass.name}</span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd(wowClass.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-400/10"
            >
                <Plus size={18} />
            </Button>
        </div>
    );
}

function RoleIndicator({ role }: { role: 'Tank' | 'Healer' | 'Damage' }) {
    const size = "w-7 h-7";
    const iconSize = 16;
    switch (role) {
        case 'Tank':
            return <div className={cn(size, "bg-blue-600 rounded-md flex items-center justify-center shadow-sm border border-white/10 shrink-0")}><Shield size={iconSize} className="text-white" /></div>;
        case 'Healer':
            return <div className={cn(size, "bg-green-600 rounded-md flex items-center justify-center shadow-sm border border-white/10 shrink-0")}><Plus size={iconSize} className="text-white stroke-4" /></div>;
        case 'Damage':
            return <div className={cn(size, "bg-red-600 rounded-md flex items-center justify-center shadow-sm border border-white/10 shrink-0")}><Swords size={iconSize} className="text-white" /></div>;
        default:
            return null;
    }
}

// Sortable "Ranked" Item
function RankedClassItem({
    wowClass,
    index,
    total,
    onRemove,
    onMoveUp,
    onMoveDown
}: {
    wowClass: WowClass,
    index: number,
    total: number,
    onRemove: (id: string) => void,
    onMoveUp?: () => void,
    onMoveDown?: () => void
}) {
    const isMobile = useIsMobile();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: wowClass.id,
        data: { wowClass, type: "ranked" },
        disabled: isMobile
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

    const dragProps = isMobile ? {} : { ...listeners, ...attributes };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "bg-card border rounded-lg mb-4 shadow-sm relative group overflow-hidden",
                !isMobile ? "cursor-grab active:cursor-grabbing touch-none" : "touch-pan-y"
            )}
            {...dragProps}
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 grow min-w-0 mr-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary font-bold text-[10px] shrink-0">
                            {index + 1}
                        </div>
                        <ZamIcon icon={wowClass.icon} size={32} className="shrink-0 rounded-md shadow-sm" />
                        <h3 className="font-bold text-base truncate" style={{ color: wowClass.color }}>{wowClass.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Mobile Reorder Controls */}
                        <div className="flex flex-row md:hidden mr-1 bg-secondary/50 rounded-md overflow-hidden border">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveUp?.();
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                disabled={index === 0}
                                className="h-10 w-10 p-0 text-muted-foreground border-r rounded-none"
                            >
                                <ChevronUp size={24} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveDown?.();
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                disabled={index === total - 1}
                                className="h-10 w-10 p-0 text-muted-foreground rounded-none"
                            >
                                <ChevronDown size={24} />
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(wowClass.id);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        >
                            <Trash2 size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="h-9 w-9 p-0 text-muted-foreground"
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
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <div className="space-y-4 pl-1 md:pl-1 pt-4 border-t mt-3">
                                {wowClass.specs.map(spec => (
                                    <div key={spec.id} className="flex items-center justify-between gap-3 text-sm py-2">
                                        <div className="flex items-center gap-3 min-w-0 grow mr-2">
                                            {/* <RoleIndicator role={spec.role} /> */}
                                            <ZamIcon icon={spec.icon} size={32} className="shrink-0 rounded-md shadow-sm" />
                                            <span className="font-bold truncate text-sm">{spec.name}</span>
                                        </div>
                                        <div className="flex gap-1.5 bg-secondary px-2 py-2 rounded-xl border shrink-0">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => setSpecSentiment(`${wowClass.id}-${spec.id}`, 'like')}
                                                        className={cn("p-1 rounded-md transition-all active:scale-95", specSentiments[`${wowClass.id}-${spec.id}`] === 'like' ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "hover:bg-green-500/20 text-muted-foreground")}
                                                    >
                                                        <Smile size={18} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-green-600 text-white border-green-700">
                                                    <p>I want to play this spec</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => setSpecSentiment(`${wowClass.id}-${spec.id}`, 'neutral')}
                                                        className={cn("p-1 rounded-md transition-all active:scale-95", (!specSentiments[`${wowClass.id}-${spec.id}`] || specSentiments[`${wowClass.id}-${spec.id}`] === 'neutral') ? "bg-yellow-500/20 text-yellow-500 font-bold" : "hover:bg-yellow-500/20 text-muted-foreground")}
                                                    >
                                                        <Meh size={18} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-yellow-600 text-white border-yellow-700">
                                                    <p>I can play this if needed</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => setSpecSentiment(`${wowClass.id}-${spec.id}`, 'dislike')}
                                                        className={cn("p-1 rounded-md transition-all active:scale-95", specSentiments[`${wowClass.id}-${spec.id}`] === 'dislike' ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "hover:bg-red-500/20 text-muted-foreground")}
                                                    >
                                                        <Frown size={18} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-red-600 text-white border-red-700">
                                                    <p>I prefer not to play this</p>
                                                </TooltipContent>
                                            </Tooltip>
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
                "rounded-lg border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-[120px]",
                isOver ? "border-indigo-500 bg-indigo-500/5 shadow-inner text-indigo-400" : "border-border/50 bg-secondary/5"
            )}
        >
            <Plus size={24} className={cn("transition-transform", isOver && "scale-110")} />
            <span className="text-sm font-medium">Drop classes here</span>
        </div>
    );
}

export default function ClassRankingStep() {
    const { rankedClasses, addRankedClass, removeRankedClass, updateRankedClasses, setStep } = useSurveyStore();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<WowClass | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

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
                addRankedClass(classId);
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

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newClasses = arrayMove(rankedClasses, index, index - 1);
        updateRankedClasses(newClasses);
    };

    const moveDown = (index: number) => {
        if (index === rankedClasses.length - 1) return;
        const newClasses = arrayMove(rankedClasses, index, index + 1);
        updateRankedClasses(newClasses);
    };

    return (
        <TooltipProvider>
            <DndContext sensors={sensors} id="class-ranking-dnd" onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Rank your class preferences</h2>
                        <p className="text-muted-foreground mt-2">Drag classes or tap the plus icon to add them to your ranking. Set your preference for each spec.</p>
                    </div>

                    <div className="grid md:grid-cols-[280px_1fr] gap-4 md:gap-8 min-h-[600px] items-start">
                        {/* Available Classes */}
                        <div className="bg-secondary/10 p-4 rounded-xl border border-border/40 shadow-inner">
                            <h3 className="font-bold mb-4 text-muted-foreground uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                Available Classes
                            </h3>
                            <div className="space-y-2">
                                {availableClasses.map(c => (
                                    <SourceClassItem
                                        key={c.id}
                                        wowClass={c}
                                        onAdd={addRankedClass}
                                    />
                                ))}
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
                                            return (
                                                <RankedClassItem
                                                    key={id}
                                                    wowClass={c}
                                                    index={index}
                                                    total={rankedClasses.length}
                                                    onRemove={removeRankedClass}
                                                    onMoveUp={() => moveUp(index)}
                                                    onMoveDown={() => moveDown(index)}
                                                />
                                            );
                                        })}
                                    </div>
                                </SortableContext>
                            </div>

                            {rankedClasses.length === 0 && (
                                <div className="mt-4">
                                    <DroppableRankingList />
                                </div>
                            )}
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
        </TooltipProvider>
    );
}
