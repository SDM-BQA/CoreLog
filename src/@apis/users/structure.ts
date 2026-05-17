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
    plan
    inner_circle_email
    inner_circle_started_at
    inner_circle_expires_at
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
    plan
    inner_circle_email
    inner_circle_started_at
    inner_circle_expires_at
  }
}
`

export const CHECK_EMAIL_EXISTS_QUERY = `
query Check_email_exists($email: String!) {
  check_email_exists(email: $email)
}
`

export const CHECK_USERNAME_EXISTS_QUERY = `
query Check_username_exists($username: String!) {
  check_username_exists(username: $username)
}
`


export const CREATE_USER_ACCOUNT_MUTATION = `
mutation Create_user_account($input: CreateUserInput!) {
  create_user_account(input: $input) {
    accessToken
    refreshToken
    user {
      _id
      first_name
      last_name
      email_id
      profile_pic
      mobile_no
      user_name
      gender
      plan
      inner_circle_email
      inner_circle_started_at
      inner_circle_expires_at
    }
  }
}`
export const SEND_OTP_MUTATION = `
mutation Send_otp($email: String!) {
  send_otp(email: $email)
}
`

export const SEND_JOURNAL_PIN_RESET_OTP_MUTATION = `
mutation Send_journal_pin_reset_otp($email: String!) {
  send_journal_pin_reset_otp(email: $email)
}
`

export const VERIFY_OTP_MUTATION = `
mutation Verify_otp($email: String!, $otp: String!) {
  verify_otp(email: $email, otp: $otp)
}
`

export const LOGIN_USER_ACCOUNT_MUTATION = `
mutation Login_user_account($emailId: String!, $password: String!) {
  login_user_account(email_id: $emailId, password: $password) {
    accessToken
    refreshToken
    user {
      _id
      first_name
      last_name
      email_id
      profile_pic
      mobile_no
      user_name
      gender
      plan
      inner_circle_email
      inner_circle_started_at
      inner_circle_expires_at
    }
  }
}
`
export const UPDATE_USER_ACCOUNT_MUTATION = `
mutation Update_user_account($id: ID!, $input: UpdateUserInput!) {
  update_user_account(id: $id, input: $input) {
    _id
    first_name
    last_name
    email_id
    profile_pic
    mobile_no
    user_name
    gender
    plan
    inner_circle_email
    inner_circle_started_at
    inner_circle_expires_at
  }
}
`


export const GET_DASHBOARD_STATS_QUERY = `
query Get_dashboard_stats {
  get_dashboard_stats {
    movies
    series
    books
    poems
    journal_entries
  }
}
`

export const GET_INNER_CIRCLE_STATUS_QUERY = `
query Get_inner_circle_status {
  get_inner_circle_status {
    plan
    is_active
    started_at
    expires_at
    days_left
    renewal_cycle
    email
  }
}
`

export const SEND_INNER_CIRCLE_OTP_MUTATION = `
mutation Send_inner_circle_otp($email: String!) {
  send_inner_circle_otp(email: $email)
}
`

export const VERIFY_INNER_CIRCLE_OTP_MUTATION = `
mutation Verify_inner_circle_otp($email: String!, $otp: String!) {
  verify_inner_circle_otp(email: $email, otp: $otp) {
    plan
    is_active
    started_at
    expires_at
    days_left
    renewal_cycle
    email
  }
}
`

export const CANCEL_INNER_CIRCLE_MEMBERSHIP_MUTATION = `
mutation Cancel_inner_circle_membership($email: String!, $otp: String!) {
  cancel_inner_circle_membership(email: $email, otp: $otp) {
    plan
    is_active
    started_at
    expires_at
    days_left
    renewal_cycle
    email
  }
}
`
