export const CREATE_SERIES_MUTATION = `
  mutation CreateSeries($input: CreateSeriesInput!) {
    create_series(input: $input) {
      _id
      title
      creator
      poster_image
      created_at
    }
  }
`;

export const GET_MY_SERIES_QUERY = `
  query GetMySeries($filter: SeriesFilter) {
    get_my_series(filter: $filter) {
      series {
        _id
        title
        creator
        poster_image
        rating
        genres
        status
        release_year
        seasons
        episodes
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

export const GET_SERIES_QUERY = `
  query GetSeries($id: ID!) {
    get_series(id: $id) {
      _id
      title
      creator
      description
      genres
      release_year
      seasons
      episodes
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

export const UPDATE_SERIES_MUTATION = `
  mutation UpdateSeries($id: ID!, $input: UpdateSeriesInput!) {
    update_series(id: $id, input: $input) {
      _id
      title
      creator
      description
      genres
      release_year
      seasons
      episodes
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

export const DELETE_SERIES_MUTATION = `
  mutation DeleteSeries($id: ID!) {
    delete_series(id: $id)
  }
`;

export const GET_SERIES_FILTERS_QUERY = `
  query GetSeriesFilters {
    get_series_filters {
      genres
      statuses
      creators
      platforms
    }
  }
`;
