export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    date: string; // ISO format
    mood: "Happy" | "Neutral" | "Sad" | "Excited" | "Anxious" | "Peaceful";
    tags: string[];
    isFavorite: boolean;
}

export const DUMMY_JOURNAL_ENTRIES: JournalEntry[] = [
    {
        id: "1",
        title: "A Productive Day at the Park",
        content: "Spent most of the afternoon working from the central park today. The weather was absolutely perfect—about 22 degrees with a light breeze. I managed to finish the core logic for the new tracker modules and even had some time to sketch in my notebook. Being surrounded by greenery really helps me focus differently than being in the office.",
        date: "2026-04-18T10:30:00Z",
        mood: "Peaceful",
        tags: ["nature", "work", "productivity"],
        isFavorite: true
    },
    {
        id: "2",
        title: "Reflections on Inception",
        content: "Just rewatched Inception for the nth time. Every time I watch it, I pick up on something new. Today I was particularly struck by the score—Hans Zimmer is truly a genius. I wrote a long review in my movies section, but here I want to focus on how the 'kick' mechanic is such a great metaphor for overcoming mental blocks.",
        date: "2026-04-17T22:15:00Z",
        mood: "Excited",
        tags: ["movies", "philosophy"],
        isFavorite: false
    },
    {
        id: "3",
        title: "Feeling a bit overwhelmed",
        content: "The workload this week is starting to pile up. I have three different projects hitting major milestones on Friday. I need to get better at delegating or at least breaking things down into smaller chunks. Taking tonight off to just read and relax.",
        date: "2026-04-15T08:00:00Z",
        mood: "Anxious",
        tags: ["work", "stress", "resolution"],
        isFavorite: false
    },
    {
        id: "4",
        title: "New Reading Goal",
        content: "Decided to aim for two books a month. Started 'The Midnight Library' and I'm already hooked. The concept of all the lives we didn't live is so poignant. It makes me wonder about my own 'what ifs' but in a way that feels hopeful rather than regretful.",
        date: "2026-04-12T20:45:00Z",
        mood: "Happy",
        tags: ["reading", "goals", "books"],
        isFavorite: true
    }
];

export const MOOD_EMOJIS: Record<string, string> = {
    Happy: "😊",
    Neutral: "😐",
    Sad: "😢",
    Excited: "🤩",
    Anxious: "😰",
    Peaceful: "🧘"
};

export const MOOD_COLORS: Record<string, string> = {
    Happy: "text-yellow-500 bg-yellow-500/10",
    Neutral: "text-gray-500 bg-gray-500/10",
    Sad: "text-blue-500 bg-blue-500/10",
    Excited: "text-orange-500 bg-orange-500/10",
    Anxious: "text-purple-500 bg-purple-500/10",
    Peaceful: "text-emerald-500 bg-emerald-500/10"
};
