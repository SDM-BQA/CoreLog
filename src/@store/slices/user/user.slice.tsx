import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { get_string, set_string, delete_string } from "../../../@utils/storage.utils";

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email_id: string;
  profile_pic?: string;
  gender?: string;
  mobile_no?: string;
  user_name?: string;
}

interface UserState {
  user: User | null;
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  userId: get_string("userId"),
  accessToken: get_string("token"),
  refreshToken: get_string("refreshToken"),
  isAuthenticated: !!get_string("token"),
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
      state.userId = action.payload.user._id;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;

      // Persist only IDs and tokens
      set_string("userId", action.payload.user._id);
      set_string("token", action.payload.accessToken);
      set_string("refreshToken", action.payload.refreshToken);
      // Remove full user object if it was there
      delete_string("user");
    },
    clear_user: (state) => {
      state.user = null;
      state.userId = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // Remove from localStorage
      delete_string("user");
      delete_string("userId");
      delete_string("token");
      delete_string("refreshToken");
    },
    update_user: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      } else {
        state.user = action.payload as User;
      }
    },
  },
});

export const { set_user, clear_user, update_user } = user_slice.actions;
export default user_slice.reducer;
