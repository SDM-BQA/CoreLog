import { apiSlice } from "./api.slice";
import { 
  GET_MY_JOURNALS_QUERY, 
  GET_JOURNAL_STREAK_QUERY,
  GET_JOURNAL_FILTERS_QUERY,
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
    getJournalStreak: builder.query({
      query: () => ({
        document: GET_JOURNAL_STREAK_QUERY,
      }),
      transformResponse: (response: any) => response.get_journal_streak,
      providesTags: [{ type: "JournalStreak", id: "ME" }],
    }),
    getJournalFilters: builder.query({
      query: () => ({
        document: GET_JOURNAL_FILTERS_QUERY,
      }),
      transformResponse: (response: any) => response.get_journal_filters,
      providesTags: [{ type: "Journal", id: "FILTERS" }],
    }),
    createJournal: builder.mutation({
      query: (input) => ({
        document: CREATE_JOURNAL_MUTATION,
        variables: { input },
      }),
      invalidatesTags: [{ type: "Journal", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(journalApi.util.invalidateTags([{ type: "JournalStreak", id: "ME" }]));
        } catch (_e) {}
      },
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(journalApi.util.invalidateTags([{ type: "JournalStreak", id: "ME" }]));
        } catch (_e) {}
      },
    }),
    deleteJournal: builder.mutation({
      query: (id) => ({
        document: DELETE_JOURNAL_MUTATION,
        variables: { id },
      }),
      invalidatesTags: [{ type: "Journal", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(journalApi.util.invalidateTags([{ type: "JournalStreak", id: "ME" }]));
        } catch (_e) {}
      },
    }),
  }),
});

export const { 
  useGetJournalsListQuery, 
  useGetJournalByIdQuery, 
  useGetJournalStreakQuery,
  useGetJournalFiltersQuery,
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useDeleteJournalMutation
} = journalApi;
