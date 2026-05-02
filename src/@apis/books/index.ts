import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils"
import { CREATE_BOOK_MUTATION, GET_MY_BOOKS_QUERY, GET_BOOK_QUERY, UPDATE_BOOK_MUTATION, DELETE_BOOK_MUTATION, GET_BOOK_FILTERS_QUERY, GET_BOOK_LOGS_QUERY, ADD_BOOK_LOG_MUTATION, DELETE_BOOK_LOG_MUTATION } from "./structure"

export interface BookInput {
    title: string;
    author: string;
    description?: string;
    genres: string[];
    publication_year: string;
    status: string;
    rating?: number;
    review?: string;
    cover_image?: string;
    page_count?: number;
    publisher?: string;
    language?: string;
    started_from?: string;
    finished_on?: string;
    series_name?: string;
    series_number?: number;
}

export const create_book_mutation = async (input: BookInput) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: CREATE_BOOK_MUTATION,
            variables: { input }
        }
    })
    check_graphql_error(data)
    return data.data.create_book
}

export interface BookFilter {
    search?: string;
    genres?: string[];
    status?: string[];
    rating?: number;
    author?: string;
    page?: number;
    limit?: number;
}

export interface BookPage {
    books: (BookInput & { _id: string; created_at: string })[];
    total_count: number;
    current_page: number;
    per_page: number;
    page_count: number;
    has_next_page: boolean;
}

export const get_my_books_query = async (filter?: BookFilter): Promise<BookPage> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: GET_MY_BOOKS_QUERY,
            variables: { filter }
        }
    })
    check_graphql_error(data)
    return data.data.get_my_books
}

export const get_book_query = async (id: string) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: GET_BOOK_QUERY,
            variables: { id }
        }
    })
    check_graphql_error(data)
    return data.data.get_book
}

export const update_book_mutation = async (id: string, input: Partial<BookInput>) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: UPDATE_BOOK_MUTATION,
            variables: { id, input }
        }
    })
    check_graphql_error(data)
    return data.data.update_book
}

export const delete_book_mutation = async (id: string) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: DELETE_BOOK_MUTATION,
            variables: { id }
        }
    })
    check_graphql_error(data)
    return data.data.delete_book
}

export interface BookFilters {
    genres: string[];
    statuses: string[];
    authors: string[];
}

export const get_book_filters_query = async (): Promise<BookFilters> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: { query: GET_BOOK_FILTERS_QUERY }
    })
    check_graphql_error(data)
    return data.data.get_book_filters
}

export const search_external_books_api = async (query: string) => {
    const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${API_KEY}`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Google Books API Error:", errorData);
            return [];
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error("Network error fetching books:", error);
        return [];
    }
}

export interface BookLog {
    _id: string;
    book_id: string;
    date: string;
    pages_read: number;
    current_page: number;
    note?: string;
    created_at: string;
}

export interface BookLogInput {
    date: string;
    pages_read: number;
    current_page: number;
    note?: string;
}

export const get_book_logs_query = async (book_id: string): Promise<BookLog[]> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: { query: GET_BOOK_LOGS_QUERY, variables: { book_id } }
    })
    check_graphql_error(data)
    return data.data.get_book_logs
}

export const add_book_log_mutation = async (book_id: string, input: BookLogInput): Promise<BookLog> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: { query: ADD_BOOK_LOG_MUTATION, variables: { book_id, input } }
    })
    check_graphql_error(data)
    return data.data.add_book_log
}

export const delete_book_log_mutation = async (id: string): Promise<boolean> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: { query: DELETE_BOOK_LOG_MUTATION, variables: { id } }
    })
    check_graphql_error(data)
    return data.data.delete_book_log
}
