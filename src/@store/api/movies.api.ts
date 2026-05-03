import { apiSlice } from "./api.slice";
import { 
  GET_MY_MOVIES_QUERY, 
  GET_MOVIE_QUERY, 
  CREATE_MOVIE_MUTATION,
  UPDATE_MOVIE_MUTATION,
  DELETE_MOVIE_MUTATION,
  GET_MOVIE_FILTERS_QUERY 
} from "../../@apis/movies/structure";

export const moviesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMoviesList: builder.query({
      query: (filter) => ({
        document: GET_MY_MOVIES_QUERY,
        variables: { filter },
      }),
      transformResponse: (response: any) => response.get_my_movies,
      providesTags: (result) =>
        result
          ? [
              ...result.movies.map(({ _id }: any) => ({ type: "Movies" as const, id: _id })),
              { type: "Movies", id: "LIST" },
            ]
          : [{ type: "Movies", id: "LIST" }],
    }),
    getMovieById: builder.query({
      query: (id) => ({
        document: GET_MOVIE_QUERY,
        variables: { id },
      }),
      transformResponse: (response: any) => response.get_movie,
      providesTags: (_result, _error, id) => [{ type: "Movies", id }],
    }),
    getMovieFilters: builder.query({
      query: () => ({
        document: GET_MOVIE_FILTERS_QUERY,
      }),
      transformResponse: (response: any) => response.get_movie_filters,
    }),
    createMovie: builder.mutation({
      query: (input) => ({
        document: CREATE_MOVIE_MUTATION,
        variables: { input },
      }),
      invalidatesTags: [{ type: "Movies", id: "LIST" }],
    }),
    updateMovie: builder.mutation({
      query: ({ id, input }) => ({
        document: UPDATE_MOVIE_MUTATION,
        variables: { id, input },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Movies", id },
        { type: "Movies", id: "LIST" },
      ],
    }),
    deleteMovie: builder.mutation({
      query: (id) => ({
        document: DELETE_MOVIE_MUTATION,
        variables: { id },
      }),
      invalidatesTags: [{ type: "Movies", id: "LIST" }],
    }),
  }),
});

export const { 
  useGetMoviesListQuery, 
  useGetMovieByIdQuery, 
  useGetMovieFiltersQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation
} = moviesApi;
