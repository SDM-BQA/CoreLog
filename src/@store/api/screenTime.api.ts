import { apiSlice } from "./api.slice";
import {
  DELETE_SCREEN_TIME_ENTRY_MUTATION,
  GET_SCREEN_TIME_ENTRIES_QUERY,
  GET_SCREEN_TIME_SUMMARY_QUERY,
  PARSE_SCREEN_TIME_IMAGE_MUTATION,
  SAVE_SCREEN_TIME_ENTRY_MUTATION,
} from "../../@apis/screen-time/structure";

export const screenTimeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getScreenTimeEntries: builder.query({
      query: ({ date_from, date_to }: { date_from?: string; date_to?: string } = {}) => ({
        document: GET_SCREEN_TIME_ENTRIES_QUERY,
        variables: { date_from, date_to },
      }),
      transformResponse: (response: any) => response.get_screen_time_entries,
      providesTags: [{ type: "ScreenTime", id: "LIST" }],
    }),
    getScreenTimeSummary: builder.query({
      query: ({ date_from, date_to }: { date_from?: string; date_to?: string } = {}) => ({
        document: GET_SCREEN_TIME_SUMMARY_QUERY,
        variables: { date_from, date_to },
      }),
      transformResponse: (response: any) => response.get_screen_time_summary,
      providesTags: [{ type: "ScreenTime", id: "SUMMARY" }],
    }),
    parseScreenTimeImage: builder.mutation({
      query: ({ image_base64 }: { image_base64: string }) => ({
        document: PARSE_SCREEN_TIME_IMAGE_MUTATION,
        variables: { image_base64 },
      }),
      transformResponse: (response: any) => response.parse_screen_time_image,
    }),
    saveScreenTimeEntry: builder.mutation({
      query: ({
        entry_date,
        categories,
        apps,
        raw_text,
        total_minutes,
      }: {
        entry_date: string;
        categories?: Array<{ name: string; minutes: number }>;
        apps: Array<{ app_name: string; minutes: number }>;
        raw_text?: string;
        total_minutes?: number;
      }) => ({
        document: SAVE_SCREEN_TIME_ENTRY_MUTATION,
        variables: { entry_date, categories, apps, raw_text, total_minutes },
      }),
      transformResponse: (response: any) => response.save_screen_time_entry,
      invalidatesTags: [{ type: "ScreenTime", id: "LIST" }, { type: "ScreenTime", id: "SUMMARY" }],
    }),
    deleteScreenTimeEntry: builder.mutation({
      query: ({ entry_date }: { entry_date: string }) => ({
        document: DELETE_SCREEN_TIME_ENTRY_MUTATION,
        variables: { entry_date },
      }),
      transformResponse: (response: any) => response.delete_screen_time_entry,
      invalidatesTags: [{ type: "ScreenTime", id: "LIST" }, { type: "ScreenTime", id: "SUMMARY" }],
    }),
  }),
});

export const {
  useGetScreenTimeEntriesQuery,
  useGetScreenTimeSummaryQuery,
  useParseScreenTimeImageMutation,
  useSaveScreenTimeEntryMutation,
  useDeleteScreenTimeEntryMutation,
} = screenTimeApi;
