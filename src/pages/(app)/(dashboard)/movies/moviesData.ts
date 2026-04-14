export interface Movie {
    id: string;
    title: string;
    year: number;
    genres: string[];
    rating: number;
    review: string;
    poster: string;
    director: string;
    runtime: string;
    language: string;
    addedOn: string;
    status: "Watched" | "Watchlist" | "Rewatching";
}

export const DUMMY_MOVIES: Movie[] = [
    {
        id: "1",
        title: "Inception",
        year: 2010,
        genres: ["Sci-Fi", "Action"],
        rating: 5,
        review:
            "A mind-bending masterpiece that requires multiple viewings to fully grasp the layers of reality. Hans Zimmer's score is absolutely haunting. The way Nolan weaves together multiple dream layers while maintaining emotional stakes is nothing short of genius. DiCaprio delivers one of his best performances as Cobb, a man torn between the world he builds and the one he left behind.",
        poster: "/posters/inception.png",
        director: "Christopher Nolan",
        runtime: "2h 28min",
        language: "English",
        addedOn: "2025-12-15",
        status: "Watched",
    },
    {
        id: "2",
        title: "The Dark Knight",
        year: 2008,
        genres: ["Crime", "Action"],
        rating: 5,
        review:
            "The best superhero movie ever made. Heath Ledger's performance is legendary and redefined what a villain could be in cinema. Every scene with the Joker is electrifying, unpredictable, and deeply unsettling. Nolan elevated the genre to high art with this film, blending real-world themes of chaos, morality, and sacrifice into a gripping crime epic.",
        poster: "/posters/dark-knight.png",
        director: "Christopher Nolan",
        runtime: "2h 32min",
        language: "English",
        addedOn: "2025-11-20",
        status: "Watched",
    },
    {
        id: "3",
        title: "Blade Runner 2049",
        year: 2017,
        genres: ["Sci-Fi", "Drama"],
        rating: 4,
        review:
            "A visual feast for the eyes. The cinematography by Roger Deakins is unmatched — every frame could be a painting. While slow-paced, the emotional payoff in the end is worth every second. Ryan Gosling brings a quiet intensity to K, and the film asks profound questions about identity, memory, and what it means to be human.",
        poster: "/posters/blade-runner.png",
        director: "Denis Villeneuve",
        runtime: "2h 44min",
        language: "English",
        addedOn: "2026-01-08",
        status: "Watched",
    },
    {
        id: "4",
        title: "Interstellar",
        year: 2014,
        genres: ["Sci-Fi", "Adventure"],
        rating: 5,
        review:
            "An emotionally gripping space epic. The docking scene is one of the most intense sequences in cinema history. Nolan at his finest. The relationship between Cooper and Murph anchors the film's grand cosmic scope with raw human emotion. The science is ambitious, the visuals are breathtaking, and the climax is both intellectually satisfying and deeply moving.",
        poster: "/posters/interstellar.png",
        director: "Christopher Nolan",
        runtime: "2h 49min",
        language: "English",
        addedOn: "2026-02-14",
        status: "Watched",
    },
    {
        id: "5",
        title: "The Matrix",
        year: 1999,
        genres: ["Sci-Fi", "Action"],
        rating: 5,
        review:
            "Revolutionary in every sense. The Wachowskis created a genre-defining film that still holds up decades later. Red pill or blue pill? The bullet-time sequences changed action filmmaking forever, and the philosophical underpinnings about simulated reality feel more relevant than ever. Keanu Reeves is perfectly cast as Neo — reluctant, stoic, and iconic.",
        poster: "/posters/inception.png",
        director: "The Wachowskis",
        runtime: "2h 16min",
        language: "English",
        addedOn: "2026-03-01",
        status: "Watched",
    },
    {
        id: "6",
        title: "Parasite",
        year: 2019,
        genres: ["Thriller", "Drama"],
        rating: 5,
        review:
            "A masterclass in storytelling. Bong Joon-ho crafts a razor-sharp social commentary that is equally funny, thrilling, and devastating. The tonal shifts are seamless — you go from laughing to gasping to crying within minutes. The film's architecture, both literal and metaphorical, reveals new layers on every rewatch. Deserved every Oscar it won.",
        poster: "/posters/dark-knight.png",
        director: "Bong Joon-ho",
        runtime: "2h 12min",
        language: "Korean",
        addedOn: "2026-03-22",
        status: "Watched",
    },
];

export const getMovieById = (id: string): Movie | undefined => {
    return DUMMY_MOVIES.find((m) => m.id === id);
};
