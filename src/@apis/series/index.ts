import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils"
import { CREATE_SERIES_MUTATION, GET_MY_SERIES_QUERY, GET_SERIES_QUERY, UPDATE_SERIES_MUTATION, DELETE_SERIES_MUTATION, GET_SERIES_FILTERS_QUERY, GET_SERIES_LOGS_QUERY, ADD_SERIES_LOG_MUTATION, DELETE_SERIES_LOG_MUTATION } from "./structure"

export interface SeriesInput {
    title: string;
    creator: string;
    description?: string;
    genres: string[];
    release_year: string;
    seasons: number;
    seasons_watched?: number;
    episodes: number;
    language: string;
    origin_country: string;
    status: string;
    rating?: number;
    review?: string;
    poster_image?: string;
    platform?: string;
    started_from?: string;
    finished_on?: string;
}

export const create_series_mutation = async (input: SeriesInput) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: CREATE_SERIES_MUTATION,
            variables: { input }
        }
    })
    check_graphql_error(data)
    return data.data.create_series
}

export interface SeriesFilter {
    search?: string;
    genres?: string[];
    status?: string[];
    rating?: number;
    creator?: string;
    platforms?: string[];
    page?: number;
    limit?: number;
}

export interface SeriesPage {
    series: (SeriesInput & { _id: string, created_at: string })[];
    total_count: number;
    current_page: number;
    per_page: number;
    page_count: number;
    has_next_page: boolean;
}

export const get_my_series_query = async (filter?: SeriesFilter): Promise<SeriesPage> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: GET_MY_SERIES_QUERY,
            variables: { filter }
        }
    })
    check_graphql_error(data)
    return data.data.get_my_series
}

export const get_series_query = async (id: string) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: GET_SERIES_QUERY,
            variables: { id }
        }
    })
    check_graphql_error(data)
    return data.data.get_series
}

export const update_series_mutation = async (id: string, input: Partial<SeriesInput>) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: UPDATE_SERIES_MUTATION,
            variables: { id, input }
        }
    })
    check_graphql_error(data)
    return data.data.update_series
}

export const delete_series_mutation = async (id: string) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: DELETE_SERIES_MUTATION,
            variables: { id }
        }
    })
    check_graphql_error(data)
    return data.data.delete_series
}

export interface SeriesFilters {
    genres: string[];
    statuses: string[];
    creators: string[];
    platforms: string[];
}

export const get_series_filters_query = async (): Promise<SeriesFilters> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: { query: GET_SERIES_FILTERS_QUERY }
    })
    check_graphql_error(data)
    return data.data.get_series_filters
}

export interface SeriesLog {
    _id: string;
    series_id: string;
    user_id: string;
    date: string;
    episodes_watched: number;
    current_episode: number;
    note?: string;
    created_at?: string;
}

export interface SeriesLogInput {
    date: string;
    episodes_watched: number;
    current_episode: number;
    note?: string;
}

export const get_series_logs_query = async (series_id: string): Promise<SeriesLog[]> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: { query: GET_SERIES_LOGS_QUERY, variables: { series_id } }
    })
    check_graphql_error(data)
    return data.data.get_series_logs
}

export const add_series_log_mutation = async (series_id: string, input: SeriesLogInput): Promise<SeriesLog> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: { query: ADD_SERIES_LOG_MUTATION, variables: { series_id, input } }
    })
    check_graphql_error(data)
    return data.data.add_series_log
}

export const delete_series_log_mutation = async (id: string): Promise<boolean> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: { query: DELETE_SERIES_LOG_MUTATION, variables: { id } }
    })
    check_graphql_error(data)
    return data.data.delete_series_log
}

export const search_external_series_api = async (query: string) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    
    // Log to console so you can verify the key is loaded
    console.log("TMDB Key Loaded (Series):", API_KEY ? "Yes" : "No");

    if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY_HERE") {
        console.warn("TMDB API Key missing. Please add VITE_TMDB_API_KEY to your .env file.");
        return [];
    }
    
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("TMDB Series API Error:", errorData);
            return [];
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Network error fetching series:", error);
        return [];
    }
}

export const fetch_external_series_details_api = async (id: number) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY_HERE") return null;

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`
        );
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching series details:", error);
        return null;
    }
}

export const fetch_external_series_providers_api = async (id: number) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY_HERE") return null;

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${id}/watch/providers?api_key=${API_KEY}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.results?.IN || data.results?.US || null; // Prefer India, fallback to US
    } catch (error) {
        console.error("Error fetching series providers:", error);
        return null;
    }
}
