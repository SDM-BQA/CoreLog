export const CREATE_MOVIE_MUTATION = `
  mutation CreateMovie($input: CreateMovieInput!) {
    create_movie(input: $input) {
      _id
      title
      poster_image
      created_at
    }
  }
`;

export const GET_MY_MOVIES_QUERY = `
  query GetMyMovies($filter: MovieFilter) {
    get_my_movies(filter: $filter) {
      movies {
        _id
        title
        director
        poster_image
        rating
        genres
        status
        release_year
        runtime
        language
        origin_country
        platform
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

export const GET_MOVIE_QUERY = `
  query GetMovie($id: ID!) {
    get_movie(id: $id) {
      _id
      title
      director
      description
      genres
      release_year
      runtime
      language
      origin_country
      status
      rating
      review
      poster_image
      platform
      started_from
      finished_on
      created_at
    }
  }
`;

export const UPDATE_MOVIE_MUTATION = `
  mutation UpdateMovie($id: ID!, $input: UpdateMovieInput!) {
    update_movie(id: $id, input: $input) {
      _id
      title
      director
      description
      genres
      release_year
      runtime
      language
      origin_country
      status
      rating
      review
      poster_image
      platform
      started_from
      finished_on
    }
  }
`;

export const DELETE_MOVIE_MUTATION = `
  mutation DeleteMovie($id: ID!) {
    delete_movie(id: $id)
  }
`;

export const GET_MOVIE_FILTERS_QUERY = `
  query GetMovieFilters {
    get_movie_filters {
      genres
      statuses
      languages
      platforms
      directors
    }
  }
`;
