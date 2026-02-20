import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email_id: string;
  profile_pic?: string;
  gender?: string;
  mobile_number?: string;
}

interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const user_slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    set_user: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clear_user: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    update_user: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { set_user, clear_user, update_user } = user_slice.actions;
export default user_slice.reducer;
