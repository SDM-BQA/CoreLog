import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils";

const axiosBaseQuery = (): BaseQueryFn<{
  document: string;
  variables?: any;
}> => async ({ document, variables }) => {
  try {
    const service = axios_graphql_service_auth();
    const { data } = await service({
      data: {
        query: document,
        variables,
      },
    });
    
    // This will handle the auto-logout and throw if there are GraphQL errors
    check_graphql_error(data);
    
    return { data: data.data };
  } catch (axiosError: any) {
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data || axiosError.message,
      },
    };
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Series", "Movies", "Books", "Poetry", "Journal"],
  endpoints: () => ({}),
});
