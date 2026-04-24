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
        const error_message = data.errors[0].message;

        // Auto logout if token is expired or invalid
        if (error_message === "Invalid or expired token" || error_message === "Authentication required") {
            delete_string("token");
            delete_string("userId");
            delete_string("refreshToken");
            window.location.href = "/auth/login";
        }

        // Return only the error message in sentence case
        const formatted_message = toSentenceCase(error_message);
        throw new Error(formatted_message);
    }
}


export const get_full_image_url = (path: string | undefined, type: "book" | "user" | "series" | "movie" = "user"): string => {
    if (!path) {
        let defaultPath = "/profile_pic.jpg";
        if (type === "book") defaultPath = "/default_book_cover.png";
        if (type === "series") defaultPath = "/default_series_cover.png";
        if (type === "movie") defaultPath = "/default_series_cover.png"; // Using series cover for now until movie cover is made
        return `${api_configs.server_url}${defaultPath}`;
    }
    
    if (path.startsWith("http")) return path;

    // Handle extension mismatch for default profile photo
    let correctedPath = path;
    if (path === "/profile_pic.png") {
        correctedPath = "/profile_pic.jpg";
    }

    return `${api_configs.server_url}${correctedPath}`;
};

export const get_rating_level = (rating: number): string => {
    if (rating === 0) return "Not Rated";
    if (rating >= 4.8) return "Masterpiece";
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Great";
    if (rating >= 3.5) return "Good";
    if (rating >= 3.0) return "Decent";
    if (rating >= 2.5) return "Average";
    if (rating >= 1.5) return "Poor";
    return "Awful";
};

export const get_language_name = (code: string | undefined): string => {
    if (!code) return "N/A";
    try {
        const langNames = new Intl.DisplayNames(['en'], { type: 'language' });
        return langNames.of(code.toLowerCase()) || code.toUpperCase();
    } catch (e) {
        return code.toUpperCase();
    }
};

export const get_country_name = (code: string | undefined): string => {
    if (!code) return "N/A";
    try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        // Handle multiple countries if separated by comma
        return code.split(',').map(c => {
            const trimmed = c.trim().toUpperCase();
            return regionNames.of(trimmed) || trimmed;
        }).join(', ');
    } catch (e) {
        return code.toUpperCase();
    }
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