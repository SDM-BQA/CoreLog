import { apiSlice } from "./api.slice";
import {
    GET_MY_SONGS_QUERY,
    GET_SONG_QUERY,
    CREATE_SONG_MUTATION,
    UPDATE_SONG_MUTATION,
    DELETE_SONG_MUTATION,
    GET_MY_ALBUMS_QUERY,
    GET_ALBUM_QUERY,
    CREATE_ALBUM_MUTATION,
    UPDATE_ALBUM_MUTATION,
    DELETE_ALBUM_MUTATION,
    GET_MY_PLAYLISTS_QUERY,
    GET_PLAYLIST_QUERY,
    CREATE_PLAYLIST_MUTATION,
    UPDATE_PLAYLIST_MUTATION,
    DELETE_PLAYLIST_MUTATION,
    ADD_TO_PLAYLIST_MUTATION,
    REMOVE_FROM_PLAYLIST_MUTATION,
    GET_MUSIC_FILTERS_QUERY,
} from "../../@apis/music/structure";

export const musicApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ─── Songs ─────────────────────────────────────────────────────────
        getSongsList: builder.query({
            query: (filter) => ({ document: GET_MY_SONGS_QUERY, variables: { filter } }),
            transformResponse: (response: any) => response.get_my_songs,
            providesTags: (result) =>
                result
                    ? [
                          ...result.songs.map(({ _id }: any) => ({ type: "Songs" as const, id: _id })),
                          { type: "Songs", id: "LIST" },
                      ]
                    : [{ type: "Songs", id: "LIST" }],
        }),
        getSongById: builder.query({
            query: (id) => ({ document: GET_SONG_QUERY, variables: { id } }),
            transformResponse: (response: any) => response.get_song,
            providesTags: (_result, _error, id) => [{ type: "Songs", id }],
        }),
        createSong: builder.mutation({
            query: (input) => ({ document: CREATE_SONG_MUTATION, variables: { input } }),
            invalidatesTags: [{ type: "Songs", id: "LIST" }],
        }),
        updateSong: builder.mutation({
            query: ({ id, input }) => ({ document: UPDATE_SONG_MUTATION, variables: { id, input } }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Songs", id },
                { type: "Songs", id: "LIST" },
            ],
        }),
        deleteSong: builder.mutation({
            query: (id) => ({ document: DELETE_SONG_MUTATION, variables: { id } }),
            invalidatesTags: [{ type: "Songs", id: "LIST" }],
        }),

        // ─── Albums ────────────────────────────────────────────────────────
        getAlbumsList: builder.query({
            query: (filter) => ({ document: GET_MY_ALBUMS_QUERY, variables: { filter } }),
            transformResponse: (response: any) => response.get_my_albums,
            providesTags: (result) =>
                result
                    ? [
                          ...result.albums.map(({ _id }: any) => ({ type: "Albums" as const, id: _id })),
                          { type: "Albums", id: "LIST" },
                      ]
                    : [{ type: "Albums", id: "LIST" }],
        }),
        getAlbumById: builder.query({
            query: (id) => ({ document: GET_ALBUM_QUERY, variables: { id } }),
            transformResponse: (response: any) => response.get_album,
            providesTags: (_result, _error, id) => [{ type: "Albums", id }],
        }),
        createAlbum: builder.mutation({
            query: (input) => ({ document: CREATE_ALBUM_MUTATION, variables: { input } }),
            invalidatesTags: [{ type: "Albums", id: "LIST" }],
        }),
        updateAlbum: builder.mutation({
            query: ({ id, input }) => ({ document: UPDATE_ALBUM_MUTATION, variables: { id, input } }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Albums", id },
                { type: "Albums", id: "LIST" },
            ],
        }),
        deleteAlbum: builder.mutation({
            query: (id) => ({ document: DELETE_ALBUM_MUTATION, variables: { id } }),
            invalidatesTags: [{ type: "Albums", id: "LIST" }],
        }),

        // ─── Playlists ─────────────────────────────────────────────────────
        getMyPlaylists: builder.query({
            query: () => ({ document: GET_MY_PLAYLISTS_QUERY }),
            transformResponse: (response: any) => response.get_my_playlists,
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }: any) => ({ type: "Playlists" as const, id: _id })),
                          { type: "Playlists", id: "LIST" },
                      ]
                    : [{ type: "Playlists", id: "LIST" }],
        }),
        getPlaylistById: builder.query({
            query: (id) => ({ document: GET_PLAYLIST_QUERY, variables: { id } }),
            transformResponse: (response: any) => response.get_playlist,
            providesTags: (_result, _error, id) => [{ type: "Playlists", id }],
        }),
        createPlaylist: builder.mutation({
            query: (input) => ({ document: CREATE_PLAYLIST_MUTATION, variables: { input } }),
            invalidatesTags: [{ type: "Playlists", id: "LIST" }],
        }),
        updatePlaylist: builder.mutation({
            query: ({ id, input }) => ({ document: UPDATE_PLAYLIST_MUTATION, variables: { id, input } }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Playlists", id },
                { type: "Playlists", id: "LIST" },
            ],
        }),
        deletePlaylist: builder.mutation({
            query: (id) => ({ document: DELETE_PLAYLIST_MUTATION, variables: { id } }),
            invalidatesTags: [{ type: "Playlists", id: "LIST" }],
        }),
        addToPlaylist: builder.mutation({
            query: ({ playlist_id, item_id, item_type }) => ({
                document: ADD_TO_PLAYLIST_MUTATION,
                variables: { playlist_id, item_id, item_type },
            }),
            invalidatesTags: (_result, _error, { playlist_id }) => [{ type: "Playlists", id: playlist_id }],
        }),
        removeFromPlaylist: builder.mutation({
            query: ({ playlist_id, item_id }) => ({
                document: REMOVE_FROM_PLAYLIST_MUTATION,
                variables: { playlist_id, item_id },
            }),
            invalidatesTags: (_result, _error, { playlist_id }) => [{ type: "Playlists", id: playlist_id }],
        }),

        // ─── Filters ───────────────────────────────────────────────────────
        getMusicFilters: builder.query({
            query: () => ({ document: GET_MUSIC_FILTERS_QUERY }),
            transformResponse: (response: any) => response.get_music_filters,
        }),
    }),
});

export const {
    useGetSongsListQuery,
    useGetSongByIdQuery,
    useCreateSongMutation,
    useUpdateSongMutation,
    useDeleteSongMutation,
    useGetAlbumsListQuery,
    useGetAlbumByIdQuery,
    useCreateAlbumMutation,
    useUpdateAlbumMutation,
    useDeleteAlbumMutation,
    useGetMyPlaylistsQuery,
    useGetPlaylistByIdQuery,
    useCreatePlaylistMutation,
    useUpdatePlaylistMutation,
    useDeletePlaylistMutation,
    useAddToPlaylistMutation,
    useRemoveFromPlaylistMutation,
    useGetMusicFiltersQuery,
} = musicApi;
