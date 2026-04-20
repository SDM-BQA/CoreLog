import axios from "axios";
import { delete_string, get_string, set_string } from "./storage.utils";
import { api_configs } from "../@configs/api.configs";
import { toSentenceCase } from "./case.utils";


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
    const headers: Record<string, string> = {
        ...client_headers,
        "apollo-require-preflight": "true"
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
        // Return only the error message in sentence case
        const error_message = toSentenceCase(data.errors[0].message);
        throw new Error(error_message);
    }
}


export const get_full_image_url = (path: string | undefined): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;

    // Handle extension mismatch for default profile photo
    let correctedPath = path;
    if (path === "/profile_pic.png") {
        correctedPath = "/profile_pic.jpg";
    }

    return `${api_configs.server_url}${correctedPath}`;
};


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