import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils";
import {
    CREATE_JOURNAL_MUTATION,
    GET_MY_JOURNALS_QUERY,
    GET_JOURNAL_QUERY,
    UPDATE_JOURNAL_MUTATION,
    DELETE_JOURNAL_MUTATION,
} from "./structure";

export interface JournalInput {
    title: string;
    content: string;
    description?: string;
    journal_type: string;
    mood?: string;
    location?: string;
    photos?: string[];
    video?: string;
    tags?: string[];
    date: string;
    time?: string;
    is_favorite?: boolean;
}

export interface JournalFilter {
    search?: string;
    journal_type?: string;
    mood?: string;
    is_favorite?: boolean;
    tags?: string[];
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
}

export interface Journal {
    _id: string;
    title: string;
    content: string;
    description?: string;
    journal_type: string;
    mood?: string;
    location: string;
    photos: string[];
    video?: string;
    tags: string[];
    date: string;
    time: string;
    is_favorite: boolean;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface JournalPage {
    journals: Journal[];
    total_count: number;
    current_page: number;
    per_page: number;
    page_count: number;
    has_next_page: boolean;
}

export const create_journal_mutation = async (input: JournalInput): Promise<{ _id: string; title: string; date: string }> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: CREATE_JOURNAL_MUTATION, variables: { input } } });
    check_graphql_error(data);
    return data.data.create_journal;
};

export const get_my_journals_query = async (filter?: JournalFilter): Promise<JournalPage> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_MY_JOURNALS_QUERY, variables: { filter } } });
    check_graphql_error(data);
    return data.data.get_my_journals;
};

export const get_journal_query = async (id: string): Promise<Journal> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_JOURNAL_QUERY, variables: { id } } });
    check_graphql_error(data);
    return data.data.get_journal;
};

export const update_journal_mutation = async (id: string, input: Partial<JournalInput>): Promise<Journal> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: UPDATE_JOURNAL_MUTATION, variables: { id, input } } });
    check_graphql_error(data);
    return data.data.update_journal;
};

export const delete_journal_mutation = async (id: string): Promise<boolean> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: DELETE_JOURNAL_MUTATION, variables: { id } } });
    check_graphql_error(data);
    return data.data.delete_journal;
};
