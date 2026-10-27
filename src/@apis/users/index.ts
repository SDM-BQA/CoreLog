import { axios_graphql_service_auth, axios_graphql_service_no_auth, check_graphql_error } from "../../@utils/api.utils"
import { api_configs } from "../../@configs/api.configs"
import { CREATE_USER_ACCOUNT_MUTATION, LIST_USERS_QUERY, SEND_OTP_MUTATION, VERIFY_OTP_MUTATION, LOGIN_USER_ACCOUNT_MUTATION, CHECK_EMAIL_EXISTS_QUERY, CHECK_USERNAME_EXISTS_QUERY, GET_USER_ACCOUNT_QUERY, UPDATE_USER_ACCOUNT_MUTATION, GET_DASHBOARD_STATS_QUERY, SEND_JOURNAL_PIN_RESET_OTP_MUTATION, GET_INNER_CIRCLE_STATUS_QUERY, SEND_INNER_CIRCLE_OTP_MUTATION, VERIFY_INNER_CIRCLE_OTP_MUTATION, CANCEL_INNER_CIRCLE_MEMBERSHIP_MUTATION } from "./structure"

export const get_dashboard_stats_query = async (): Promise<DashboardStats> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: GET_DASHBOARD_STATS_QUERY,
            variables: {}
        }
    })
    check_graphql_error(data)
    return data.data.get_dashboard_stats
}

export interface DashboardStats {
    movies: number;
    series: number;
    books: number;
    poems: number;
    journal_entries: number;
}

export interface InnerCircleStatus {
    plan: "free" | "inner_circle";
    is_active: boolean;
    started_at?: string | null;
    expires_at?: string | null;
    days_left: number;
    renewal_cycle: "monthly";
    email?: string | null;
}
import axios from "axios";
import { get_headers } from "../../@utils/api.utils"

export const get_all_user_accounts_query = async () => {
    try {
        const service = axios_graphql_service_no_auth()
        const { data } = await service({
            data: {
                query: LIST_USERS_QUERY,
                variables: {}
            }
        })
        check_graphql_error(data)
        return data.data.get_all_user_accounts
    } catch (error) {
        console.log(error)
        return []
    }
}

export const get_inner_circle_status_query = async (): Promise<InnerCircleStatus> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: GET_INNER_CIRCLE_STATUS_QUERY,
            variables: {}
        }
    })
    check_graphql_error(data)
    return data.data.get_inner_circle_status
}

export const send_inner_circle_otp_mutation = async (email: string): Promise<boolean> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: SEND_INNER_CIRCLE_OTP_MUTATION,
            variables: { email }
        }
    })
    check_graphql_error(data)
    return data.data.send_inner_circle_otp
}

export const verify_inner_circle_otp_mutation = async (email: string, otp: string): Promise<InnerCircleStatus> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: VERIFY_INNER_CIRCLE_OTP_MUTATION,
            variables: { email, otp }
        }
    })
    check_graphql_error(data)
    return data.data.verify_inner_circle_otp
}

export const cancel_inner_circle_membership_mutation = async (email: string, otp: string): Promise<InnerCircleStatus> => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: CANCEL_INNER_CIRCLE_MEMBERSHIP_MUTATION,
            variables: { email, otp }
        }
    })
    check_graphql_error(data)
    return data.data.cancel_inner_circle_membership
}

export const check_email_exists_query = async (email: string) => {
    const service = axios_graphql_service_no_auth()
    const { data } = await service({
        data: {
            query: CHECK_EMAIL_EXISTS_QUERY,
            variables: { email }
        }
    })
    check_graphql_error(data)
    return data.data.check_email_exists
}

export const check_username_exists_query = async (username: string) => {
    const service = axios_graphql_service_no_auth()
    const { data } = await service({
        data: {
            query: CHECK_USERNAME_EXISTS_QUERY,
            variables: { username }
        }
    })
    check_graphql_error(data)
    return data.data.check_username_exists
}

export const get_user_account_query = async (id: string) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: GET_USER_ACCOUNT_QUERY,
            variables: { getUserAccountId: id }
        }
    })
    check_graphql_error(data)
    const user = data.data.get_user_account;
    console.log("🔍 API Response (get_user_account):", user);
    return user
}

export const update_user_account_mutation = async (id: string, input: UpdateUserInput) => {
    const service = axios_graphql_service_auth()
    const { data } = await service({
        data: {
            query: UPDATE_USER_ACCOUNT_MUTATION,
            variables: { id, input }
        }
    })
    check_graphql_error(data)
    return data.data.update_user_account
}


export const upload_image_api = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const { data } = await axios.post(`${api_configs.rest_base_url}/upload`, formData, {
        headers: {
            ...get_headers(false),
            "Content-Type": "multipart/form-data",
            "apollo-require-preflight": "" // Clear the preflight for non-graphql routes
        },
    });
    return data.url;
};



export const create_user_account_mutation = async (input: CreateUserAccountMutationParams) => {
    const service = axios_graphql_service_no_auth()
    const { data } = await service({
        data: {
            query: CREATE_USER_ACCOUNT_MUTATION,
            variables: { input }
        }
    })
    check_graphql_error(data)
    return data.data.create_user_account
}

export const send_journal_pin_reset_otp_mutation = async (email: string) => {
    const service = axios_graphql_service_no_auth()
    const { data } = await service({
        data: {
            query: SEND_JOURNAL_PIN_RESET_OTP_MUTATION,
            variables: { email }
        }
    })
    check_graphql_error(data)
    return data.data.send_journal_pin_reset_otp
}

export const send_otp_mutation = async (email: string) => {
    const service = axios_graphql_service_no_auth()
    const { data } = await service({
        data: {
            query: SEND_OTP_MUTATION,
            variables: { email }
        }
    })
    check_graphql_error(data)
    return data.data.send_otp
}

export const verify_otp_mutation = async (email: string, otp: string) => {
    const service = axios_graphql_service_no_auth()
    const { data } = await service({
        data: {
            query: VERIFY_OTP_MUTATION,
            variables: { email, otp }
        }
    })
    check_graphql_error(data)
    return data.data.verify_otp
}

export const login_user_account_mutation = async (input: LoginUserAccountMutationParams) => {
    const service = axios_graphql_service_no_auth()
    const { data } = await service({
        data: {
            query: LOGIN_USER_ACCOUNT_MUTATION,
            variables: { emailId: input.email_id, password: input.password }
        }
    })
    check_graphql_error(data)
    return data.data.login_user_account
}


interface LoginUserAccountMutationParams {
    email_id: string
    password: string
}




interface CreateUserAccountMutationParams {
    first_name: string
    last_name: string
    email_id: string
    mobile_no: string
    profile_pic?: string
    user_name?: string
    password: string
    gender: string
}

interface UpdateUserInput {
    first_name?: string
    last_name?: string
    email_id?: string
    mobile_no?: string
    profile_pic?: string
    gender?: string
    user_name?: string
}
