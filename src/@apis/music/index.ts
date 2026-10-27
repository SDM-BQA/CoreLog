import { axios_graphql_service_auth, check_graphql_error } from "../../@utils/api.utils";
import {
    CREATE_SONG_MUTATION,
    GET_MY_SONGS_QUERY,
    GET_SONG_QUERY,
    UPDATE_SONG_MUTATION,
    DELETE_SONG_MUTATION,
    CREATE_ALBUM_MUTATION,
    GET_MY_ALBUMS_QUERY,
    GET_ALBUM_QUERY,
    UPDATE_ALBUM_MUTATION,
    DELETE_ALBUM_MUTATION,
    CREATE_PLAYLIST_MUTATION,
    GET_MY_PLAYLISTS_QUERY,
    GET_PLAYLIST_QUERY,
    UPDATE_PLAYLIST_MUTATION,
    DELETE_PLAYLIST_MUTATION,
    ADD_TO_PLAYLIST_MUTATION,
    REMOVE_FROM_PLAYLIST_MUTATION,
    GET_MUSIC_FILTERS_QUERY,
} from "./structure";

// ─── Song ───────────────────────────────────────────────────────────────────

export interface SongInput {
    title: string;
    artist: string;
    artist_type: "solo" | "band";
    album_name?: string;
    cover_image?: string;
    description?: string;
    genres: string[];
    release_year: string;
    duration_ms?: number;
    language: string;
    platform: string;
    status: "wishlist" | "listened";
    rating: number;
    review?: string;
    preview_url?: string;
    itunes_id?: string;
    started_from?: string;
    finished_on?: string | null;
}

export interface Song extends SongInput {
    _id: string;
    created_at: string;
}

export interface SongFilter {
    search?: string;
    genres?: string[];
    status?: string[];
    rating?: number;
    artists?: string[];
    languages?: string[];
    platforms?: string[];
    page?: number;
    limit?: number;
}

export interface SongPage {
    songs: Song[];
    total_count: number;
    current_page: number;
    per_page: number;
    page_count: number;
    has_next_page: boolean;
}

export const create_song_mutation = async (input: SongInput) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: CREATE_SONG_MUTATION, variables: { input } } });
    check_graphql_error(data);
    return data.data.create_song;
};

export const get_my_songs_query = async (filter?: SongFilter): Promise<SongPage> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_MY_SONGS_QUERY, variables: { filter } } });
    check_graphql_error(data);
    return data.data.get_my_songs;
};

export const get_song_query = async (id: string): Promise<Song> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_SONG_QUERY, variables: { id } } });
    check_graphql_error(data);
    return data.data.get_song;
};

export const update_song_mutation = async (id: string, input: Partial<SongInput>) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: UPDATE_SONG_MUTATION, variables: { id, input } } });
    check_graphql_error(data);
    return data.data.update_song;
};

export const delete_song_mutation = async (id: string) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: DELETE_SONG_MUTATION, variables: { id } } });
    check_graphql_error(data);
    return data.data.delete_song;
};

// ─── Album ──────────────────────────────────────────────────────────────────

export interface AlbumInput {
    title: string;
    artist: string;
    artist_type: "solo" | "band";
    cover_image?: string;
    description?: string;
    genres: string[];
    release_year: string;
    total_tracks?: number;
    language: string;
    platform: string;
    status: "wishlist" | "listened";
    rating: number;
    review?: string;
    itunes_id?: string;
}

export interface Album extends AlbumInput {
    _id: string;
    created_at: string;
}

export interface AlbumFilter {
    search?: string;
    genres?: string[];
    status?: string[];
    rating?: number;
    artists?: string[];
    languages?: string[];
    platforms?: string[];
    page?: number;
    limit?: number;
}

export interface AlbumPage {
    albums: Album[];
    total_count: number;
    current_page: number;
    per_page: number;
    page_count: number;
    has_next_page: boolean;
}

export const create_album_mutation = async (input: AlbumInput) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: CREATE_ALBUM_MUTATION, variables: { input } } });
    check_graphql_error(data);
    return data.data.create_album;
};

export const get_my_albums_query = async (filter?: AlbumFilter): Promise<AlbumPage> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_MY_ALBUMS_QUERY, variables: { filter } } });
    check_graphql_error(data);
    return data.data.get_my_albums;
};

export const get_album_query = async (id: string): Promise<Album> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_ALBUM_QUERY, variables: { id } } });
    check_graphql_error(data);
    return data.data.get_album;
};

export const update_album_mutation = async (id: string, input: Partial<AlbumInput>) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: UPDATE_ALBUM_MUTATION, variables: { id, input } } });
    check_graphql_error(data);
    return data.data.update_album;
};

export const delete_album_mutation = async (id: string) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: DELETE_ALBUM_MUTATION, variables: { id } } });
    check_graphql_error(data);
    return data.data.delete_album;
};

// ─── Playlist ───────────────────────────────────────────────────────────────

export interface PlaylistSmartFilter {
    artist?: string;
    genre?: string;
    year?: string;
}

export interface PlaylistItem {
    item_id: string;
    item_type: "song" | "album";
    added_at: string;
}

export interface PlaylistInput {
    name: string;
    description?: string;
    type: "manual" | "smart";
    smart_filter?: PlaylistSmartFilter;
}

export interface Playlist extends PlaylistInput {
    _id: string;
    items: PlaylistItem[];
    created_at: string;
}

export const create_playlist_mutation = async (input: PlaylistInput) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: CREATE_PLAYLIST_MUTATION, variables: { input } } });
    check_graphql_error(data);
    return data.data.create_playlist;
};

export const get_my_playlists_query = async (): Promise<Playlist[]> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_MY_PLAYLISTS_QUERY } });
    check_graphql_error(data);
    return data.data.get_my_playlists;
};

export const get_playlist_query = async (id: string): Promise<Playlist> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_PLAYLIST_QUERY, variables: { id } } });
    check_graphql_error(data);
    return data.data.get_playlist;
};

export const update_playlist_mutation = async (id: string, input: Partial<PlaylistInput>) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: UPDATE_PLAYLIST_MUTATION, variables: { id, input } } });
    check_graphql_error(data);
    return data.data.update_playlist;
};

export const delete_playlist_mutation = async (id: string) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: DELETE_PLAYLIST_MUTATION, variables: { id } } });
    check_graphql_error(data);
    return data.data.delete_playlist;
};

export const add_to_playlist_mutation = async (playlist_id: string, item_id: string, item_type: string) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: ADD_TO_PLAYLIST_MUTATION, variables: { playlist_id, item_id, item_type } },
    });
    check_graphql_error(data);
    return data.data.add_to_playlist;
};

export const remove_from_playlist_mutation = async (playlist_id: string, item_id: string) => {
    const service = axios_graphql_service_auth();
    const { data } = await service({
        data: { query: REMOVE_FROM_PLAYLIST_MUTATION, variables: { playlist_id, item_id } },
    });
    check_graphql_error(data);
    return data.data.remove_from_playlist;
};

// ─── Filters ────────────────────────────────────────────────────────────────

export interface MusicFilters {
    genres: string[];
    statuses: string[];
    languages: string[];
    platforms: string[];
    artists: string[];
    years: string[];
}

export const get_music_filters_query = async (): Promise<MusicFilters> => {
    const service = axios_graphql_service_auth();
    const { data } = await service({ data: { query: GET_MUSIC_FILTERS_QUERY } });
    check_graphql_error(data);
    return data.data.get_music_filters;
};

// ─── iTunes API ─────────────────────────────────────────────────────────────

export interface ItunesTrack {
    trackId: number;
    trackName: string;
    artistName: string;
    collectionName: string;
    artworkUrl100: string;
    releaseDate: string;
    primaryGenreName: string;
    trackTimeMillis: number;
    previewUrl: string;
}

export interface ItunesAlbum {
    collectionId: number;
    collectionName: string;
    artistName: string;
    artworkUrl100: string;
    releaseDate: string;
    primaryGenreName: string;
    trackCount: number;
}

export const search_itunes_songs = async (query: string): Promise<ItunesTrack[]> => {
    if (query.length < 2) return [];
    try {
        const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10&country=us`
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json.results || [];
    } catch {
        return [];
    }
};

export const search_itunes_albums = async (query: string): Promise<ItunesAlbum[]> => {
    if (query.length < 2) return [];
    try {
        const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=10&country=us`
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json.results || [];
    } catch {
        return [];
    }
};

export const get_itunes_artwork = (url: string, size = 500) =>
    url.replace("100x100bb", `${size}x${size}bb`);
