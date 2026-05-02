import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils";
import {
    GET_MY_TARGET_QUERY,
    GET_TARGET_PROGRESS_QUERY,
    SET_TARGET_MUTATION,
    DELETE_TARGET_MUTATION,
} from "./structure";

export interface Target {
    _id: string;
    year: number;
    movies?: number;
    series?: number;
    books?: number;
    poems?: number;
}

export interface TargetProgress {
    movies: number;
    series: number;
    books: number;
    poems: number;
}

export interface TargetInput {
    year: number;
    movies?: number;
    series?: number;
    books?: number;
    poems?: number;
}

export const get_my_target_query = async (year?: number): Promise<Target | null> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_MY_TARGET_QUERY, variables: { year } } });
    check_graphql_error(data);
    return data.data.get_my_target ?? null;
};

export const get_target_progress_query = async (year?: number): Promise<TargetProgress> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_TARGET_PROGRESS_QUERY, variables: { year } } });
    check_graphql_error(data);
    return data.data.get_target_progress;
};

export const set_target_mutation = async (input: TargetInput): Promise<Target> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: SET_TARGET_MUTATION, variables: { input } } });
    check_graphql_error(data);
    return data.data.set_target;
};

export const delete_target_mutation = async (id: string): Promise<boolean> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: DELETE_TARGET_MUTATION, variables: { id } } });
    check_graphql_error(data);
    return data.data.delete_target;
};
