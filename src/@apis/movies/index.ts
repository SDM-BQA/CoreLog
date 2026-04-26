import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils";
import {
    CREATE_MOVIE_MUTATION,
    GET_MY_MOVIES_QUERY,
    GET_MOVIE_QUERY,
    UPDATE_MOVIE_MUTATION,
    DELETE_MOVIE_MUTATION,
    GET_MOVIE_FILTERS_QUERY,
} from "./structure";

export interface MovieInput {
    title: string;
    director?: string;
    description?: string;
    genres: string[];
    release_year: string;
    runtime: number;
    language: string;
    origin_country: string;
    status: string;
    rating: number;
    review?: string;
    poster_image?: string;
    platform: string;
    started_from?: string;
    finished_on?: string;
}

export const create_movie_mutation = async (input: MovieInput) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: CREATE_MOVIE_MUTATION, variables: { input } }
    });
    check_graphql_error(data);
    return data.data.create_movie;
};

export interface MovieFilter {
    search?: string;
    genres?: string[];
    status?: string[];
    rating?: number;
    directors?: string[];
    languages?: string[];
    platforms?: string[];
    page?: number;
    limit?: number;
}

export interface MoviePage {
    movies: (MovieInput & { _id: string; created_at: string })[];
    total_count: number;
    current_page: number;
    per_page: number;
    page_count: number;
    has_next_page: boolean;
}

export const get_my_movies_query = async (filter?: MovieFilter): Promise<MoviePage> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: GET_MY_MOVIES_QUERY, variables: { filter } }
    });
    check_graphql_error(data);
    return data.data.get_my_movies;
};

export const get_movie_query = async (id: string) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: GET_MOVIE_QUERY, variables: { id } }
    });
    check_graphql_error(data);
    return data.data.get_movie;
};

export const update_movie_mutation = async (id: string, input: Partial<MovieInput>) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: UPDATE_MOVIE_MUTATION, variables: { id, input } }
    });
    check_graphql_error(data);
    return data.data.update_movie;
};

export const delete_movie_mutation = async (id: string) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: DELETE_MOVIE_MUTATION, variables: { id } }
    });
    check_graphql_error(data);
    return data.data.delete_movie;
};

export interface MovieFilters {
    genres: string[];
    statuses: string[];
    languages: string[];
    platforms: string[];
    directors: string[];
}

export const get_movie_filters_query = async (): Promise<MovieFilters> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: GET_MOVIE_FILTERS_QUERY }
    });
    check_graphql_error(data);
    return data.data.get_movie_filters;
};

export const search_external_movies_api = async (query: string) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY_HERE") return [];
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false`
        );
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Network error fetching movies:", error);
        return [];
    }
};

export const fetch_external_movie_details_api = async (id: number) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY_HERE") return null;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
    }
};

export const fetch_external_movie_providers_api = async (id: number) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY_HERE") return null;
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${API_KEY}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.results?.IN || data.results?.US || null;
    } catch (error) {
        console.error("Error fetching movie providers:", error);
        return null;
    }
};
