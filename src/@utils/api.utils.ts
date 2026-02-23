import axios from "axios";
import { delete_string, get_string, set_string } from "./storage.utils";
import { api_configs } from "../@configs/api.configs";

export const get_token = (): string | undefined => {
    return get_string("token") || undefined;
};
export const remove_token = (): void => {
    delete_string("token");
};
export const set_token = (token: string): void => {
    set_string("token", token);
};

export const get_headers = (authorization: boolean = true) => {
    const client_headers = {
        [api_configs.client_id.name]: api_configs.client_id.value,
        [api_configs.client_secret.name]: api_configs.client_secret.value,
        [api_configs.client_type.name]: api_configs.client_type.value,
    }
    const headers = {
        ...client_headers
    }
    if (authorization) {
        const token = get_token()
        if (!token) {
            throw new Error("Token not found can't set Authorization Header")
        }
        headers["Authorization"] = `${api_configs.token_type} ${token}`
    }
    return headers
}

export const axios_graphql_service_auth = () => {
    return axios.create({
        baseURL: api_configs.graphql_base_url,
        headers: get_headers(true),
        method: "POST",
    })
}

export const axios_graphql_service_no_auth = () => {
    return axios.create({
        baseURL: api_configs.graphql_base_url,
        headers: get_headers(false),
        method: "POST",
    })
}


export const check_graphql_error = (data: GraphqlServerErrorResponse) => {
    if (data.errors && data.errors.length > 0) {
        const error_title = `${data.errors[0].extensions?.code || "GRAPHQL_ERROR"}`
        const error_message = `${data.errors[0].message}`
        throw new Error(`${error_title}: ${error_message}`)
    }
}


interface GraphqlServerErrorResponse {
    errors: {
        message: string;
        extensions: {
            code: string;
        };
    }[];
}


// export const axios_rest_service_auth = (headers: any = {}) =>
//     axios.create({
//         baseURL: api_configs.rest_base_url,
//         headers: {
//             ...get_headers(true),
//             ...headers,
//         },
//     });