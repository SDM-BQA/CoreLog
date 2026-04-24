export const search_external_movies_api = async (query: string) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

    // Log to console so you can verify the key is loaded
    console.log("TMDB Key Loaded:", API_KEY ? "Yes (starts with " + API_KEY.slice(0, 4) + "...)" : "No");
    if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY_HERE") {
        console.warn("Please replace 'YOUR_TMDB_API_KEY_HERE' in your .env file with your actual key.");
        return [];
    }

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("TMDB API Error:", errorData);
            return [];
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Network error fetching movies:", error);
        return [];
    }
}

export const fetch_external_movie_providers_api = async (id: number) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY_HERE") return null;

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${API_KEY}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.results?.IN || data.results?.US || null; // Prefer India, fallback to US
    } catch (error) {
        console.error("Error fetching movie providers:", error);
        return null;
    }
}
