import { axios_graphql_service_no_auth, check_graphql_error } from "../../@utils/api.utils"

import { LIST_USERS_QUERY } from "./structure"

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