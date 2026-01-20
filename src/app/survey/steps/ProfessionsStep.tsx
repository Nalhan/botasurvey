"use client";

import { useSurveyStore, Profession } from "../store";
import { Button } from "@/components/ui/button";
import { WOW_PROFESSIONS, WowProfession } from "@/lib/wow-professions";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trash2, Plus, Info, AlertCircle, Loader2 } from "lucide-react";
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import { ZamIcon } from "@/components/ui/zam-icon";
import { motion, AnimatePresence } from "framer-motion";
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
function SourceProfessionItem({ profession, onAdd, stats }: { profession: WowProfession, onAdd: (id: string) => void, stats?: number }) {
    const isMobile = useIsMobile();
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `source-${profession.id}`,
        data: { profession, type: "source" },
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
            {...dragProps}
        >
            <div className="flex items-center gap-3 grow min-w-0">
                <div className="relative shrink-0 w-8 h-8">
                    <ZamIcon icon={profession.icon} size={32} className="rounded-md shadow-sm" />
                    {stats !== undefined && stats > 0 && (
                        <div className="absolute -bottom-1 -left-1 text-[12px] leading-none text-white font-black bg-indigo-500 px-1 py-0.5 rounded-full border border-background shadow-[0_2px_4px_rgba(0,0,0,0.3)] min-w-3.5 text-center z-10 pointer-events-none">
                            {stats}
                        </div>
                    )}
                </div>
                <div className="font-bold text-sm truncate">{profession.name}</div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd(profession.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-400/10"
            >
                <Plus size={18} />
            </Button>
        </div>
    );
}

// Sortable "Ranked" Item
function RankedProfessionItem({
    profession,
    index,
    total,
    onRemove,
    onMoveUp,
    onMoveDown,
    selectedSpecId,
    onSelectSpec,
    stats,
    specStats
}: {
    profession: WowProfession,
    index: number,
    total: number,
    onRemove: (id: string) => void,
    onMoveUp?: () => void,
    onMoveDown?: () => void,
    selectedSpecId: string | null,
    onSelectSpec: (specId: string) => void,
    stats?: number,
    specStats?: Record<string, number>
}) {
    const isMobile = useIsMobile();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: profession.id,
        data: { profession, type: "ranked" },
        disabled: isMobile
    });
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
                    <div className="flex items-center gap-3 grow min-w-0 mr-2">
                        {/* <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary font-bold text-[10px] shrink-0 border shadow-sm">
                            {index + 1}
                        </div> */}
                        <div className="relative shrink-0 w-8 h-8">
                            <ZamIcon icon={profession.icon} size={32} className="rounded-md shadow-sm" />
                            {stats !== undefined && stats > 0 && (
                                <div className="absolute -bottom-1 -left-1 text-[9px] leading-none text-white font-black bg-indigo-500 px-1.5 py-0.5 rounded-full border border-background shadow-[0_2px_4px_rgba(0,0,0,0.3)] min-w-4 text-center z-10 pointer-events-none">
                                    {stats}
                                </div>
                            )}
                        </div>
                        <div className="font-bold text-lg truncate">{profession.name}</div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
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
                                onRemove(profession.id);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        >
                            <Trash2 size={18} />
                        </Button>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {isExpanded && profession.specs && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <div className="space-y-2 pl-1 md:pl-1 pt-4 border-t mt-3">
                                <p className="text-xs text-muted-foreground mb-2">Select one specialization:</p>
                                {profession.specs.map(spec => (
                                    <div
                                        key={spec.id}
                                        onClick={() => onSelectSpec(spec.id)}
                                        className={cn(
                                            "flex items-center justify-between gap-3 text-sm py-2 px-3 rounded-md cursor-pointer border transition-colors",
                                            selectedSpecId === spec.id
                                                ? "bg-indigo-500/10 border-indigo-500"
                                                : "hover:bg-secondary border-transparent"
                                        )}
                                    >
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="relative shrink-0 w-8 h-8">
                                                <ZamIcon icon={spec.icon} size={32} className="shrink-0 rounded-md shadow-sm" />
                                                {specStats && specStats[spec.id] !== undefined && specStats[spec.id] > 0 && (
                                                    <div className="absolute -bottom-1 -left-1 text-[10px] leading-none text-white font-black bg-indigo-500 px-1 py-0.5 rounded-full border border-background shadow-[0_2px_4px_rgba(0,0,0,0.3)] min-w-3.5 text-center z-10 pointer-events-none">
                                                        {specStats[spec.id]}
                                                    </div>
                                                )}
                                                {spec.recommended && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="absolute -top-1 -right-1 z-20 bg-yellow-500 text-black rounded-full w-4 h-4 flex items-center justify-center shadow-sm cursor-help hover:scale-110 transition-transform">
                                                                <span className="font-bold text-[12px]">!</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-yellow-500 text-black border-yellow-600">
                                                            Recommended Spec
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0 pr-2">
                                                <div className={cn("font-bold text-sm leading-tight", selectedSpecId === spec.id && "text-indigo-500")}>{spec.name}</div>
                                                {spec.desc && <div className="text-[10px] text-muted-foreground opacity-80 mt-0.5 leading-relaxed">{spec.desc}</div>}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                            selectedSpecId === spec.id ? "border-indigo-500 bg-indigo-500" : "border-muted-foreground"
                                        )}>
                                            {selectedSpecId === spec.id && <div className="w-2 h-2 rounded-full bg-white" />}
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
                "rounded-lg border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-30",
                isOver ? "border-indigo-500 bg-indigo-500/5 shadow-inner text-indigo-400" : "border-border/50 bg-secondary/5"
            )}
        >
            <Plus size={24} className={cn("transition-transform", isOver && "scale-110")} />
            <span className="text-sm font-medium">Drop professions here</span>
        </div>
    );
}

export default function ProfessionsStep() {
    const { professions, setProfessions, setProfessionSpec, setStep } = useSurveyStore();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<WowProfession | null>(null);
    const [stats, setStats] = useState<{ professions: Record<string, number>, specs: Record<string, number> } | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };
        fetchStats();
    }, []);


    const availableProfessions = WOW_PROFESSIONS.filter(p => !professions.some(up => up.id === p.id));

    const handleAddProfession = (id: string) => {
        setProfessions([...professions, { id, specId: null }]);
    };

    const handleRemoveProfession = (id: string) => {
        setProfessions(professions.filter(p => p.id !== id));
    };

    const handleSelectSpec = (professionId: string, specId: string) => {
        setProfessionSpec(professionId, specId);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        const data = active.data.current;
        if (data && data.profession) {
            setActiveItem(data.profession);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        if (!over) return;

        // Drop logic
        // Case 1: Source -> Ranked
        if (active.id.toString().startsWith("source-")) {
            const professionId = (active.id as string).replace("source-", "");

            const isOverList = over.id === "ranked-list-droppable";
            const isOverRankedItem = professions.some(p => p.id === (over.id as string));

            if ((isOverList || isOverRankedItem) && !professions.some(p => p.id === professionId)) {
                handleAddProfession(professionId);
            }
            return;
        }

        // Case 2: Reordering Ranked
        if (active.id !== over.id) {
            const oldIndex = professions.findIndex(p => p.id === active.id);
            const newIndex = professions.findIndex(p => p.id === over.id);
            setProfessions(arrayMove(professions, oldIndex, newIndex));
        }
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        setProfessions(arrayMove(professions, index, index - 1));
    };

    const moveDown = (index: number) => {
        if (index === professions.length - 1) return;
        setProfessions(arrayMove(professions, index, index + 1));
    };

    // Calculate counts for display
    const getPhysCount = (profId: string) => stats?.professions[profId] || 0;
    const getSpecCount = (specId: string) => stats?.specs[specId] || 0;


    return (
        <TooltipProvider>
            <DndContext sensors={sensors} id="professions-dnd" onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Select Your Professions</h2>
                        <p className="text-muted-foreground mt-2">
                            Choose the professions you will focus on. Rank them by priority.
                            <br />
                            <span className="text-xs opacity-70">Numbers in parentheses indicate how many others have selected that profession/spec. <br />Only specs that have work order crafts or important cooldowns are listed.
                            </span>
                        </p>
                    </div>

                    <div className="grid md:grid-cols-[280px_1fr] gap-4 md:gap-8 min-h-150 items-start">
                        {/* Available Professions */}
                        <div className="bg-secondary/10 p-4 rounded-xl border border-border/40 shadow-inner min-w-0 overflow-hidden w-full">
                            <h3 className="font-bold mb-4 text-muted-foreground uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                Available Professions
                            </h3>
                            <div className="space-y-2">
                                {availableProfessions.map(p => (
                                    <SourceProfessionItem
                                        key={p.id}
                                        profession={p}
                                        onAdd={handleAddProfession}
                                        stats={getPhysCount(p.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Selected List */}
                        <div className="bg-secondary/20 p-4 rounded-xl min-h-50 flex flex-col border border-border/60 shadow-xl min-w-0 overflow-hidden w-full">
                            <h3 className="font-bold mb-4 text-muted-foreground uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Your Selection
                            </h3>

                            <div className="grow">
                                <SortableContext items={professions.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-4">
                                        {professions.map((profState, index) => {
                                            const p = WOW_PROFESSIONS.find(wp => wp.id === profState.id);
                                            if (!p) return null;
                                            return (
                                                <RankedProfessionItem
                                                    key={p.id}
                                                    profession={p}
                                                    index={index}
                                                    total={professions.length}
                                                    onRemove={handleRemoveProfession}
                                                    onMoveUp={() => moveUp(index)}
                                                    onMoveDown={() => moveDown(index)}
                                                    selectedSpecId={profState.specId}
                                                    onSelectSpec={(specId) => handleSelectSpec(p.id, specId)}
                                                    stats={getPhysCount(p.id)}
                                                    specStats={stats?.specs}
                                                />
                                            );
                                        })}
                                    </div>
                                </SortableContext>
                            </div>

                            {professions.length === 0 && (
                                <div className="mt-4">
                                    <DroppableRankingList />
                                </div>
                            )}
                        </div>
                    </div>

                    <DragOverlay>
                        {activeId && activeItem ? (
                            <div className="p-3 rounded bg-card border shadow-xl flex items-center gap-3" >
                                <ZamIcon icon={activeItem.icon} size={32} className="rounded-md shadow-sm" />
                                <span className="font-bold">{activeItem.name}</span>
                            </div>
                        ) : null}
                    </DragOverlay>

                    <div className="flex justify-between pt-8">
                        <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                        <Button onClick={() => setStep(5)}>
                            {professions.length === 0 ? "Skip" : "Next"}
                        </Button>
                    </div>
                </div>
            </DndContext>
        </TooltipProvider>
    );
}
