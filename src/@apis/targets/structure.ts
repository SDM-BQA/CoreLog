export const GET_MY_TARGET_QUERY = `
  query GetMyTarget($year: Int) {
    get_my_target(year: $year) {
      _id
      year
      movies
      series
      books
      poems
    }
  }
`;

export const GET_TARGET_PROGRESS_QUERY = `
  query GetTargetProgress($year: Int) {
    get_target_progress(year: $year) {
      movies
      series
      books
      poems
    }
  }
`;

export const SET_TARGET_MUTATION = `
  mutation SetTarget($input: TargetInput!) {
    set_target(input: $input) {
      _id
      year
      movies
      series
      books
      poems
    }
  }
`;

export const DELETE_TARGET_MUTATION = `
  mutation DeleteTarget($id: ID!) {
    delete_target(id: $id)
  }
`;
