export type SeriesStatus = "Watched" | "Watchlist" | "Watching" | "Rewatching" | "NotFinished";

export interface Series {
    id: string;
    title: string;
    year: number;
    genres: string[];
    rating: number;
    review: string;
    poster: string;
    creator: string;
    seasons: number;
    status: SeriesStatus;
    addedOn: string;
}

export const DUMMY_SERIES: Series[] = [
    {
        id: "1",
        title: "Breaking Bad",
        year: 2008,
        genres: ["Crime", "Drama", "Thriller"],
        rating: 5,
        review: "Arguably the greatest television series ever made. Walter White's transformation from a mild-mannered chemistry teacher to a ruthless drug kingpin is a masterclass in character development.",
        poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3",
        creator: "Vince Gilligan",
        seasons: 5,
        status: "Watched",
        addedOn: "2026-04-10"
    },
    {
        id: "2",
        title: "Stranger Things",
        year: 2016,
        genres: ["Sci-Fi", "Horror", "Drama"],
        rating: 4.5,
        review: "A perfect blend of 80s nostalgia and modern storytelling. The kids' chemistry is amazing and the supernatural elements keep you on the edge of your seat.",
        poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3",
        creator: "The Duffer Brothers",
        seasons: 4,
        status: "Watched",
        addedOn: "2026-04-12"
    },
    {
        id: "3",
        title: "The Bear",
        year: 2022,
        genres: ["Drama", "Comedy"],
        rating: 5,
        review: "Intense, chaotic, and incredibly well-acted. It captures the pressure-cooker environment of a professional kitchen perfectly while dealing with grief and family.",
        poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3",
        creator: "Christopher Storer",
        seasons: 2,
        status: "Watched",
        addedOn: "2026-04-15"
    }
];

export const getSeriesById = (id: string): Series | undefined => {
    return DUMMY_SERIES.find((s) => s.id === id);
};
