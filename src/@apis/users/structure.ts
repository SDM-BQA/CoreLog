export const LIST_USERS_QUERY = `
query Get_all_user_accounts {
  get_all_user_accounts {
    _id
    first_name
    last_name
    email_id
    profile_pic
    mobile_no
    user_name
    gender
  }
}
`
export const GET_USER_ACCOUNT_QUERY = `
query Get_user_account($getUserAccountId: ID!) {
  get_user_account(id: $getUserAccountId) {
    _id
    first_name
    last_name
    email_id
    profile_pic
    mobile_no
    user_name
    gender
  }
}
`