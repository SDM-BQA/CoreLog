export const CREATE_POEM_MUTATION = `
  mutation CreatePoem($input: CreatePoemInput!) {
    create_poem(input: $input) {
      _id
      title
      cover_image
      created_at
    }
  }
`;

export const GET_MY_POEMS_QUERY = `
  query GetMyPoems($filter: PoemFilter) {
    get_my_poems(filter: $filter) {
      poems {
        _id
        title
        content
        language
        poem_type
        mood
        atmosphere
        tags
        cover_image
        status
        created_at
        updated_at
      }
      total_count
      current_page
      page_count
      has_next_page
    }
  }
`;

export const GET_POEM_QUERY = `
  query GetPoem($id: ID!) {
    get_poem(id: $id) {
      _id
      title
      content
      language
      poem_type
      mood
      atmosphere
      tags
      cover_image
      status
      created_at
      updated_at
    }
  }
`;

export const UPDATE_POEM_MUTATION = `
  mutation UpdatePoem($id: ID!, $input: UpdatePoemInput!) {
    update_poem(id: $id, input: $input) {
      _id
      title
      content
      language
      poem_type
      mood
      atmosphere
      tags
      cover_image
      status
      created_at
      updated_at
    }
  }
`;

export const DELETE_POEM_MUTATION = `
  mutation DeletePoem($id: ID!) {
    delete_poem(id: $id)
  }
`;
