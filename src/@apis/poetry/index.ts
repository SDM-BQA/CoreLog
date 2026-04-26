import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils";
import {
    CREATE_POEM_MUTATION,
    GET_MY_POEMS_QUERY,
    GET_POEM_QUERY,
    UPDATE_POEM_MUTATION,
    DELETE_POEM_MUTATION,
} from "./structure";

export interface PoemInput {
    title: string;
    content: string;
    language: string;
    poem_type: string;
    mood?: string;
    atmosphere?: string;
    tags?: string[];
    cover_image?: string;
    status: string;
    created_at?: string;
}

export interface PoemFilter {
    search?: string;
    language?: string;
    poem_type?: string;
    status?: string;
    tags?: string[];
    page?: number;
    limit?: number;
}

export interface Poem {
    _id: string;
    title: string;
    content: string;
    language: string;
    poem_type: string;
    mood?: string;
    atmosphere?: string;
    tags?: string[];
    cover_image?: string;
    status: string;
    created_at: string;
    updated_at?: string;
}

export interface PoemPage {
    poems: Poem[];
    total_count: number;
    current_page: number;
    page_count: number;
    has_next_page: boolean;
}

export const create_poem_mutation = async (input: PoemInput): Promise<{ _id: string; title: string; created_at: string }> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: CREATE_POEM_MUTATION, variables: { input } }
    });
    check_graphql_error(data);
    return data.data.create_poem;
};

export const get_my_poems_query = async (filter?: PoemFilter): Promise<PoemPage> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: GET_MY_POEMS_QUERY, variables: { filter } }
    });
    check_graphql_error(data);
    return data.data.get_my_poems;
};

export const get_poem_query = async (id: string): Promise<Poem> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: GET_POEM_QUERY, variables: { id } }
    });
    check_graphql_error(data);
    return data.data.get_poem;
};

export const update_poem_mutation = async (id: string, input: Partial<PoemInput>): Promise<Poem> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: UPDATE_POEM_MUTATION, variables: { id, input } }
    });
    check_graphql_error(data);
    return data.data.update_poem;
};

export const delete_poem_mutation = async (id: string): Promise<boolean> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: DELETE_POEM_MUTATION, variables: { id } }
    });
    check_graphql_error(data);
    return data.data.delete_poem;
};
