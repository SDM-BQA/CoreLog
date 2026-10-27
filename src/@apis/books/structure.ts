export const CREATE_BOOK_MUTATION = `
mutation Create_book($input: CreateBookInput!) {
  create_book(input: $input) {
    _id
    title
    author
    description
    genres
    publication_year
    status
    rating
    review
    cover_image
    page_count
    publisher
    language
    started_from
    finished_on
    series_name
    series_number
    user_id
  }
}
`

export const GET_MY_BOOKS_QUERY = `
query Get_my_books($filter: BookFilterInput) {
  get_my_books(filter: $filter) {
    books {
      _id
      title
      author
      description
      genres
      publication_year
      status
      rating
      review
      cover_image
      page_count
      publisher
      language
      started_from
      finished_on
      series_name
      series_number
      user_id
      created_at
    }
    total_count
    current_page
    per_page
    page_count
    has_next_page
  }
}
`

export const GET_BOOK_QUERY = `
query Get_book($id: ID!) {
  get_book(id: $id) {
    _id
    title
    author
    description
    genres
    publication_year
    status
    rating
    review
    cover_image
    page_count
    publisher
    language
    started_from
    finished_on
    series_name
    series_number
    user_id
    created_at
  }
}
`

export const UPDATE_BOOK_MUTATION = `
mutation Update_book($id: ID!, $input: UpdateBookInput!) {
  update_book(id: $id, input: $input) {
    _id
    title
    author
    description
    genres
    publication_year
    status
    rating
    review
    cover_image
    page_count
    publisher
    language
    started_from
    finished_on
    series_name
    series_number
  }
}
`

export const DELETE_BOOK_MUTATION = `
mutation Delete_book($id: ID!) {
  delete_book(id: $id)
}
`

export const GET_BOOK_FILTERS_QUERY = `
query Get_book_filters {
  get_book_filters {
    genres
    statuses
    authors
  }
}
`

export const GET_BOOK_LOGS_QUERY = `
query Get_book_logs($book_id: ID!) {
  get_book_logs(book_id: $book_id) {
    _id
    book_id
    date
    pages_read
    current_page
    note
    created_at
  }
}
`

export const ADD_BOOK_LOG_MUTATION = `
mutation Add_book_log($book_id: ID!, $input: BookLogInput!) {
  add_book_log(book_id: $book_id, input: $input) {
    _id
    book_id
    date
    pages_read
    current_page
    note
    created_at
  }
}
`

export const DELETE_BOOK_LOG_MUTATION = `
mutation Delete_book_log($id: ID!) {
  delete_book_log(id: $id)
}
`
