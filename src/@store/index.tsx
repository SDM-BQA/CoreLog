import { configureStore } from "@reduxjs/toolkit";
import user_reducer from "./slices/user/user.slice";
import { apiSlice } from "./api/api.slice";

export const store = configureStore({
  reducer: {
    user: user_reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// infer types from store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
