import { useEffect } from "react";
import Pages from "./pages";
import { useAppDispatch, useAppSelector } from "./@store/hooks/store.hooks";
import { get_user_account_query } from "./@apis/users";
import { update_user, clear_user } from "./@store/slices/user/user.slice";

export const App = () => {
  const dispatch = useAppDispatch();
  const { userId, isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    const revalidate = async () => {
      if (isAuthenticated && userId) {
        try {
          const freshUser = await get_user_account_query(userId);
          if (freshUser) {
            console.log("✅ Session Revalidated. Fresh User Data:", freshUser);
            dispatch(update_user(freshUser));
          }
        } catch (error) {
          console.error("Session revalidation failed:", error);
          const error_message = (error as Error).message;
          if (
            error_message === "Invalid or expired token" ||
            error_message === "Authentication required" ||
            error_message === "User not found"
          ) {
            dispatch(clear_user());
          }
        }
      }
    };

    revalidate();
  }, []);

  return <Pages />;
};
