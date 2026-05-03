import { apiSlice } from "./api.slice";
import { 
  GET_MY_POEMS_QUERY, 
  GET_POEM_QUERY, 
  CREATE_POEM_MUTATION,
  UPDATE_POEM_MUTATION,
  DELETE_POEM_MUTATION
} from "../../@apis/poetry/structure";

export const poetryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPoemsList: builder.query({
      query: (filter) => ({
        document: GET_MY_POEMS_QUERY,
        variables: { filter },
      }),
      transformResponse: (response: any) => response.get_my_poems,
      providesTags: (result) =>
        result
          ? [
              ...result.poems.map(({ _id }: any) => ({ type: "Poetry" as const, id: _id })),
              { type: "Poetry", id: "LIST" },
            ]
          : [{ type: "Poetry", id: "LIST" }],
    }),
    getPoemById: builder.query({
      query: (id) => ({
        document: GET_POEM_QUERY,
        variables: { id },
      }),
      transformResponse: (response: any) => response.get_poem,
      providesTags: (_result, _error, id) => [{ type: "Poetry", id }],
    }),
    createPoem: builder.mutation({
      query: (input) => ({
        document: CREATE_POEM_MUTATION,
        variables: { input },
      }),
      invalidatesTags: [{ type: "Poetry", id: "LIST" }],
    }),
    updatePoem: builder.mutation({
      query: ({ id, input }) => ({
        document: UPDATE_POEM_MUTATION,
        variables: { id, input },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Poetry", id },
        { type: "Poetry", id: "LIST" },
      ],
    }),
    deletePoem: builder.mutation({
      query: (id) => ({
        document: DELETE_POEM_MUTATION,
        variables: { id },
      }),
      invalidatesTags: [{ type: "Poetry", id: "LIST" }],
    }),
  }),
});

export const { 
  useGetPoemsListQuery, 
  useGetPoemByIdQuery, 
  useCreatePoemMutation,
  useUpdatePoemMutation,
  useDeletePoemMutation
} = poetryApi;
