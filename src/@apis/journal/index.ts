import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils";
import {
    CREATE_JOURNAL_MUTATION,
    GET_MY_JOURNALS_QUERY,
    GET_JOURNAL_STREAK_QUERY,
    GET_JOURNAL_QUERY,
    UPDATE_JOURNAL_MUTATION,
    DELETE_JOURNAL_MUTATION,
    GET_JOURNAL_TEMPLATES_QUERY,
    CREATE_JOURNAL_TEMPLATE_MUTATION,
    UPDATE_JOURNAL_TEMPLATE_MUTATION,
    DELETE_JOURNAL_TEMPLATE_MUTATION,
} from "./structure";

export interface JournalExpenseItem {
    id: string;
    amount: number;
    note: string;
    category?: string;
}

export interface JournalTemplateBlock {
    id: string;
    type: string;
    title: string;
    items?: JournalExpenseItem[];
}

export interface SavedJournalTemplate {
    _id: string;
    name: string;
    content: string;
    category?: string;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SavedJournalTemplateInput {
    name: string;
    content: string;
    category?: string;
}

export interface JournalInput {
    title: string;
    content: string;
    description?: string;
    journal_type: string;
    mood?: string;
    location?: string;
    location_address?: string;
    location_city?: string;
    location_lat?: number;
    location_lng?: number;
    photos?: string[];
    video?: string;
    tags?: string[];
    template_blocks?: JournalTemplateBlock[];
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
    location_address?: string;
    location_city?: string;
    location_lat?: number;
    location_lng?: number;
    photos: string[];
    video?: string;
    tags: string[];
    template_blocks: JournalTemplateBlock[];
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

export interface JournalStreak {
    current_streak: number;
    longest_streak: number;
    total_active_days: number;
    active_days_this_month: number;
    last_entry_date?: string;
    streak_updated_at?: string;
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

export const get_journal_streak_query = async (): Promise<JournalStreak> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_JOURNAL_STREAK_QUERY } });
    check_graphql_error(data);
    return data.data.get_journal_streak;
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

export const get_journal_templates_query = async (): Promise<SavedJournalTemplate[]> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_JOURNAL_TEMPLATES_QUERY } });
    check_graphql_error(data);
    return data.data.get_journal_templates;
};

export const create_journal_template_mutation = async (input: SavedJournalTemplateInput): Promise<SavedJournalTemplate> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: CREATE_JOURNAL_TEMPLATE_MUTATION, variables: { input } } });
    check_graphql_error(data);
    return data.data.create_journal_template;
};

export const update_journal_template_mutation = async (id: string, input: SavedJournalTemplateInput): Promise<SavedJournalTemplate> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: UPDATE_JOURNAL_TEMPLATE_MUTATION, variables: { id, input } } });
    check_graphql_error(data);
    return data.data.update_journal_template;
};

export const delete_journal_template_mutation = async (id: string): Promise<boolean> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: DELETE_JOURNAL_TEMPLATE_MUTATION, variables: { id } } });
    check_graphql_error(data);
    return data.data.delete_journal_template;
};
