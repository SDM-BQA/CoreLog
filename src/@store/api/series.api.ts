import { apiSlice } from "./api.slice";
import { 
  GET_MY_SERIES_QUERY, 
  GET_SERIES_QUERY, 
  CREATE_SERIES_MUTATION,
  UPDATE_SERIES_MUTATION,
  DELETE_SERIES_MUTATION,
  GET_SERIES_FILTERS_QUERY,
  GET_SERIES_LOGS_QUERY,
  ADD_SERIES_LOG_MUTATION,
  DELETE_SERIES_LOG_MUTATION
} from "../../@apis/series/structure";

export const seriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSeriesList: builder.query({
      query: (filter) => ({
        document: GET_MY_SERIES_QUERY,
        variables: { filter },
      }),
      transformResponse: (response: any) => response.get_my_series,
      providesTags: (result) =>
        result
          ? [
              ...result.series.map(({ _id }: any) => ({ type: "Series" as const, id: _id })),
              { type: "Series", id: "LIST" },
            ]
          : [{ type: "Series", id: "LIST" }],
    }),
    getSeriesById: builder.query({
      query: (id) => ({
        document: GET_SERIES_QUERY,
        variables: { id },
      }),
      transformResponse: (response: any) => response.get_series,
      providesTags: (_result, _error, id) => [{ type: "Series", id }],
    }),
    getSeriesFilters: builder.query({
      query: () => ({
        document: GET_SERIES_FILTERS_QUERY,
      }),
      transformResponse: (response: any) => response.get_series_filters,
    }),
    createSeries: builder.mutation({
      query: (input) => ({
        document: CREATE_SERIES_MUTATION,
        variables: { input },
      }),
      invalidatesTags: [{ type: "Series", id: "LIST" }],
    }),
    updateSeries: builder.mutation({
      query: ({ id, input }) => ({
        document: UPDATE_SERIES_MUTATION,
        variables: { id, input },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Series", id },
        { type: "Series", id: "LIST" },
      ],
    }),
    deleteSeries: builder.mutation({
      query: (id) => ({
        document: DELETE_SERIES_MUTATION,
        variables: { id },
      }),
      invalidatesTags: [{ type: "Series", id: "LIST" }],
    }),
    getSeriesLogs: builder.query({
      query: (series_id) => ({
        document: GET_SERIES_LOGS_QUERY,
        variables: { series_id },
      }),
      transformResponse: (response: any) => response.get_series_logs,
      providesTags: (_result, _error, series_id) => [{ type: "Series", id: `LOGS_${series_id}` }],
    }),
    addSeriesLog: builder.mutation({
      query: ({ series_id, input }) => ({
        document: ADD_SERIES_LOG_MUTATION,
        variables: { series_id, input },
      }),
      invalidatesTags: (_result, _error, { series_id }) => [
        { type: "Series", id: `LOGS_${series_id}` },
        { type: "Series", id: series_id },
      ],
    }),
    deleteSeriesLog: builder.mutation({
      query: ({ id }) => ({
        document: DELETE_SERIES_LOG_MUTATION,
        variables: { id },
      }),
      invalidatesTags: (_result, _error, { series_id }) => [
        { type: "Series", id: `LOGS_${series_id}` },
        { type: "Series", id: series_id },
      ],
    }),
  }),
});

export const { 
  useGetSeriesListQuery, 
  useGetSeriesByIdQuery, 
  useGetSeriesFiltersQuery,
  useCreateSeriesMutation,
  useUpdateSeriesMutation,
  useDeleteSeriesMutation,
  useGetSeriesLogsQuery,
  useAddSeriesLogMutation,
  useDeleteSeriesLogMutation
} = seriesApi;
