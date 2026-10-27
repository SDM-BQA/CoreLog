export const CREATE_SONG_MUTATION = `
  mutation CreateSong($input: CreateSongInput!) {
    create_song(input: $input) {
      _id
      title
      cover_image
      created_at
    }
  }
`;

export const GET_MY_SONGS_QUERY = `
  query GetMySongs($filter: SongFilter) {
    get_my_songs(filter: $filter) {
      songs {
        _id
        title
        artist
        artist_type
        album_name
        cover_image
        rating
        genres
        status
        release_year
        duration_ms
        language
        platform
        preview_url
        started_from
        finished_on
        created_at
      }
      total_count
      current_page
      page_count
      has_next_page
    }
  }
`;

export const GET_SONG_QUERY = `
  query GetSong($id: ID!) {
    get_song(id: $id) {
      _id
      title
      artist
      artist_type
      album_name
      cover_image
      description
      genres
      release_year
      duration_ms
      language
      platform
      status
      rating
      review
      preview_url
      itunes_id
      started_from
      finished_on
      created_at
    }
  }
`;

export const UPDATE_SONG_MUTATION = `
  mutation UpdateSong($id: ID!, $input: UpdateSongInput!) {
    update_song(id: $id, input: $input) {
      _id
      title
      artist
      artist_type
      album_name
      cover_image
      description
      genres
      release_year
      duration_ms
      language
      platform
      status
      rating
      review
      preview_url
      started_from
      finished_on
    }
  }
`;

export const DELETE_SONG_MUTATION = `
  mutation DeleteSong($id: ID!) {
    delete_song(id: $id)
  }
`;

export const CREATE_ALBUM_MUTATION = `
  mutation CreateAlbum($input: CreateAlbumInput!) {
    create_album(input: $input) {
      _id
      title
      cover_image
      created_at
    }
  }
`;

export const GET_MY_ALBUMS_QUERY = `
  query GetMyAlbums($filter: AlbumFilter) {
    get_my_albums(filter: $filter) {
      albums {
        _id
        title
        artist
        artist_type
        cover_image
        rating
        genres
        status
        release_year
        total_tracks
        language
        platform
        itunes_id
        created_at
      }
      total_count
      current_page
      page_count
      has_next_page
    }
  }
`;

export const GET_ALBUM_QUERY = `
  query GetAlbum($id: ID!) {
    get_album(id: $id) {
      _id
      title
      artist
      artist_type
      cover_image
      description
      genres
      release_year
      total_tracks
      language
      platform
      status
      rating
      review
      itunes_id
      created_at
    }
  }
`;

export const UPDATE_ALBUM_MUTATION = `
  mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
    update_album(id: $id, input: $input) {
      _id
      title
      artist
      artist_type
      cover_image
      description
      genres
      release_year
      total_tracks
      language
      platform
      status
      rating
      review
    }
  }
`;

export const DELETE_ALBUM_MUTATION = `
  mutation DeleteAlbum($id: ID!) {
    delete_album(id: $id)
  }
`;

export const CREATE_PLAYLIST_MUTATION = `
  mutation CreatePlaylist($input: CreatePlaylistInput!) {
    create_playlist(input: $input) {
      _id
      name
      description
      type
      created_at
    }
  }
`;

export const GET_MY_PLAYLISTS_QUERY = `
  query GetMyPlaylists {
    get_my_playlists {
      _id
      name
      description
      type
      smart_filter {
        artist
        genre
        year
      }
      items {
        item_id
        item_type
        added_at
      }
      created_at
    }
  }
`;

export const GET_PLAYLIST_QUERY = `
  query GetPlaylist($id: ID!) {
    get_playlist(id: $id) {
      _id
      name
      description
      type
      smart_filter {
        artist
        genre
        year
      }
      items {
        item_id
        item_type
        added_at
      }
      created_at
    }
  }
`;

export const UPDATE_PLAYLIST_MUTATION = `
  mutation UpdatePlaylist($id: ID!, $input: UpdatePlaylistInput!) {
    update_playlist(id: $id, input: $input) {
      _id
      name
      description
      type
      smart_filter {
        artist
        genre
        year
      }
      items {
        item_id
        item_type
        added_at
      }
    }
  }
`;

export const DELETE_PLAYLIST_MUTATION = `
  mutation DeletePlaylist($id: ID!) {
    delete_playlist(id: $id)
  }
`;

export const ADD_TO_PLAYLIST_MUTATION = `
  mutation AddToPlaylist($playlist_id: ID!, $item_id: ID!, $item_type: String!) {
    add_to_playlist(playlist_id: $playlist_id, item_id: $item_id, item_type: $item_type) {
      _id
      items {
        item_id
        item_type
        added_at
      }
    }
  }
`;

export const REMOVE_FROM_PLAYLIST_MUTATION = `
  mutation RemoveFromPlaylist($playlist_id: ID!, $item_id: ID!) {
    remove_from_playlist(playlist_id: $playlist_id, item_id: $item_id) {
      _id
      items {
        item_id
        item_type
        added_at
      }
    }
  }
`;

export const GET_MUSIC_FILTERS_QUERY = `
  query GetMusicFilters {
    get_music_filters {
      genres
      statuses
      languages
      platforms
      artists
      years
    }
  }
`;
