import { apiSlice } from "./api.slice";
import { 
  GET_MY_JOURNALS_QUERY, 
  GET_JOURNAL_QUERY, 
  CREATE_JOURNAL_MUTATION,
  UPDATE_JOURNAL_MUTATION,
  DELETE_JOURNAL_MUTATION
} from "../../@apis/journal/structure";

export const journalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getJournalsList: builder.query({
      query: (filter) => ({
        document: GET_MY_JOURNALS_QUERY,
        variables: { filter },
      }),
      transformResponse: (response: any) => response.get_my_journals,
      providesTags: (result) =>
        result
          ? [
              ...result.journals.map(({ _id }: any) => ({ type: "Journal" as const, id: _id })),
              { type: "Journal", id: "LIST" },
            ]
          : [{ type: "Journal", id: "LIST" }],
    }),
    getJournalById: builder.query({
      query: (id) => ({
        document: GET_JOURNAL_QUERY,
        variables: { id },
      }),
      transformResponse: (response: any) => response.get_journal,
      providesTags: (_result, _error, id) => [{ type: "Journal", id }],
    }),
    createJournal: builder.mutation({
      query: (input) => ({
        document: CREATE_JOURNAL_MUTATION,
        variables: { input },
      }),
      invalidatesTags: [{ type: "Journal", id: "LIST" }],
    }),
    updateJournal: builder.mutation({
      query: ({ id, input }) => ({
        document: UPDATE_JOURNAL_MUTATION,
        variables: { id, input },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Journal", id },
        { type: "Journal", id: "LIST" },
      ],
    }),
    deleteJournal: builder.mutation({
      query: (id) => ({
        document: DELETE_JOURNAL_MUTATION,
        variables: { id },
      }),
      invalidatesTags: [{ type: "Journal", id: "LIST" }],
    }),
  }),
});

export const { 
  useGetJournalsListQuery, 
  useGetJournalByIdQuery, 
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useDeleteJournalMutation
} = journalApi;
