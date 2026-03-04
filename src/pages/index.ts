import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./(app)/Home";
import NotFoundPage from "./(app)/Not-Found";
import Login from "./(app)/Auth/Login";
import SignUp from "./(app)/Auth/SignUp/SignUp";
import DashboardHome from "./(app)/(dashboard)/Dashboard-Home/DashboardHome";
import AppLayout from "./(app)/Layout/APPLayout";
import DashboardLayout from "./(app)/Layout/DashboardLayout";
const Pages = () => {
    return RouterProvider({ router });
};

export default Pages;

const router = createBrowserRouter([
    {
        path: "/",
        Component: AppLayout,
        children: [
            {
                index: true,
                Component: Home,
            },
            {
                path: "/auth/login",
                Component: Login,
            },
            {
                path: "/auth/signup",
                Component: SignUp,
            },
            {
                path: "*",
                Component: NotFoundPage,
            },
        ],
    },
    {
        path: "/dashboard",
        Component: DashboardLayout,
        children: [
            {
                index: true,
                Component: DashboardHome,
            }
        ],

    }
]);
