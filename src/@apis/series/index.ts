import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils"
import { CREATE_SERIES_MUTATION, GET_MY_SERIES_QUERY, GET_SERIES_QUERY, UPDATE_SERIES_MUTATION, DELETE_SERIES_MUTATION, GET_SERIES_FILTERS_QUERY } from "./structure"

export interface SeriesInput {
    title: string;
    creator: string;
    description?: string;
    genres: string[];
    release_year: string;
    seasons: number;
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
    platform?: string;
    page?: number;
    limit?: number;
}

export interface SeriesPage {
    series: SeriesInput[];
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
}

export const get_series_filters_query = async (): Promise<SeriesFilters> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: { query: GET_SERIES_FILTERS_QUERY }
    })
    check_graphql_error(data)
    return data.data.get_series_filters
}
