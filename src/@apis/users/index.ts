import { axios_graphql_service_no_auth, check_graphql_error } from "../../@utils/api.utils"

import { CREATE_USER_ACCOUNT_MUTATION, LIST_USERS_QUERY } from "./structure"

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


interface CreateUserAccountMutationParams {
    first_name: string
    last_name: string
    email_id: string
    mobile_no: string
    profile_pic?: File | null
    user_name?: string
    password: string
    gender: string
}