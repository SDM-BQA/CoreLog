import { configureStore } from "@reduxjs/toolkit";
import user_reducer from "./slices/user/user.slice";

export const store = configureStore({
  reducer: {
    user: user_reducer,
    // add more slices here
  },
});

// infer types from store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
