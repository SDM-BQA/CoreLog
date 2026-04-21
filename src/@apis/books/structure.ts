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
    user_id
  }
}
`

export const GET_MY_BOOKS_QUERY = `
query Get_my_books {
  get_my_books {
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
    user_id
    created_at
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
  }
}
`

export const DELETE_BOOK_MUTATION = `
mutation Delete_book($id: ID!) {
  delete_book(id: $id)
}
`
