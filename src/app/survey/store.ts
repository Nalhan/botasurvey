import { create } from 'zustand'

export type Spec = {
    classId: string; // e.g., "mage"
    specId: string; // e.g., "fire"
    rank: number; // 1-based index in the ranking list
    sentiment: 'like' | 'neutral' | 'dislike';
}

export type Availability = {
    timezone: string;
    schedule: Record<string, string[]>; // Day -> Array of time slots or simplified "Available/Not"
}

interface SurveyState {
    step: number;
    involvement: 'core' | 'fill' | 'heroic' | null;
    availability: Availability | null;
    // Ranked classes. Inside each class, we track spec sentiments.
    // Actually, let's store the list of ranked classes, and a map of spec preferences.
    rankedClasses: string[]; // List of classIds in order.
    specSentiments: Record<string, 'like' | 'neutral' | 'dislike'>; // specId -> sentiment
    comments: string;

    setStep: (step: number) => void;
    setInvolvement: (involvement: 'core' | 'fill' | 'heroic') => void;
    setAvailability: (availability: Availability) => void;
    addRankedClass: (classId: string) => void;
    removeRankedClass: (classId: string) => void;
    updateRankedClasses: (classes: string[]) => void;
    setSpecSentiment: (specId: string, sentiment: 'like' | 'neutral' | 'dislike') => void;
    setComments: (comments: string) => void;
    initialize: (data: Partial<Omit<SurveyState, 'step' | 'initialize' | 'setStep' | 'setInvolvement' | 'setAvailability' | 'addRankedClass' | 'removeRankedClass' | 'updateRankedClasses' | 'setSpecSentiment' | 'setComments'>>) => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
    step: 1,
    involvement: null,
    availability: null,
    rankedClasses: [],
    specSentiments: {},
    comments: "",

    setStep: (step) => set({ step }),
    setInvolvement: (involvement) => set({ involvement }),
    setAvailability: (availability) => set({ availability }),
    addRankedClass: (classId) => set((state) => ({ rankedClasses: [...state.rankedClasses, classId] })),
    removeRankedClass: (classId) => set((state) => ({
        rankedClasses: state.rankedClasses.filter((c) => c !== classId),
        // Optional: cleanup sentiments? Nah, keep them just in case they re-add.
    })),
    updateRankedClasses: (classes) => set({ rankedClasses: classes }),
    setSpecSentiment: (specId, sentiment) => set((state) => ({
        specSentiments: { ...state.specSentiments, [specId]: sentiment }
    })),
    setComments: (comments) => set({ comments }),
    initialize: (data) => set((state) => ({ ...state, ...data })),
}))
