import { apiSlice } from "./api.slice";
import { 
  GET_MY_BOOKS_QUERY, 
  GET_BOOK_QUERY, 
  CREATE_BOOK_MUTATION,
  UPDATE_BOOK_MUTATION,
  DELETE_BOOK_MUTATION,
  GET_BOOK_FILTERS_QUERY,
  GET_BOOK_LOGS_QUERY,
  ADD_BOOK_LOG_MUTATION,
  DELETE_BOOK_LOG_MUTATION
} from "../../@apis/books/structure";

export const booksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBooksList: builder.query({
      query: (filter) => ({
        document: GET_MY_BOOKS_QUERY,
        variables: { filter },
      }),
      transformResponse: (response: any) => response.get_my_books,
      providesTags: (result) =>
        result
          ? [
              ...result.books.map(({ _id }: any) => ({ type: "Books" as const, id: _id })),
              { type: "Books", id: "LIST" },
            ]
          : [{ type: "Books", id: "LIST" }],
    }),
    getBookById: builder.query({
      query: (id) => ({
        document: GET_BOOK_QUERY,
        variables: { id },
      }),
      transformResponse: (response: any) => response.get_book,
      providesTags: (_result, _error, id) => [{ type: "Books", id }],
    }),
    getBookFilters: builder.query({
      query: () => ({
        document: GET_BOOK_FILTERS_QUERY,
      }),
      transformResponse: (response: any) => response.get_book_filters,
    }),
    createBook: builder.mutation({
      query: (input) => ({
        document: CREATE_BOOK_MUTATION,
        variables: { input },
      }),
      invalidatesTags: [{ type: "Books", id: "LIST" }],
    }),
    updateBook: builder.mutation({
      query: ({ id, input }) => ({
        document: UPDATE_BOOK_MUTATION,
        variables: { id, input },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Books", id },
        { type: "Books", id: "LIST" },
      ],
    }),
    deleteBook: builder.mutation({
      query: (id) => ({
        document: DELETE_BOOK_MUTATION,
        variables: { id },
      }),
      invalidatesTags: [{ type: "Books", id: "LIST" }],
    }),
    getBookLogs: builder.query({
      query: (book_id) => ({
        document: GET_BOOK_LOGS_QUERY,
        variables: { book_id },
      }),
      transformResponse: (response: any) => response.get_book_logs,
      providesTags: (_result, _error, book_id) => [{ type: "Books", id: `LOGS_${book_id}` }],
    }),
    addBookLog: builder.mutation({
      query: ({ book_id, input }) => ({
        document: ADD_BOOK_LOG_MUTATION,
        variables: { book_id, input },
      }),
      invalidatesTags: (_result, _error, { book_id }) => [
        { type: "Books", id: `LOGS_${book_id}` },
        { type: "Books", id: book_id },
      ],
    }),
    deleteBookLog: builder.mutation({
      query: ({ id }) => ({
        document: DELETE_BOOK_LOG_MUTATION,
        variables: { id },
      }),
      invalidatesTags: (_result, _error, { book_id }) => [
        { type: "Books", id: `LOGS_${book_id}` },
        { type: "Books", id: book_id },
      ],
    }),
  }),
});

export const { 
  useGetBooksListQuery, 
  useGetBookByIdQuery, 
  useGetBookFiltersQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetBookLogsQuery,
  useAddBookLogMutation,
  useDeleteBookLogMutation
} = booksApi;
