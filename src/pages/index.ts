import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./(app)/Home";
import NotFoundPage from "./(app)/Not-Found";
import Login from "./(app)/Auth/Login";
import SignUp from "./(app)/Auth/SignUp";


const Pages = () => {
    return RouterProvider({ router });
};

export default Pages;

const router = createBrowserRouter([
    {
        path: "/",
        Component: Home
    },
    {
        path: "/auth/login",
        Component: Login
    },
    {
        path: "/auth/signup",
        Component: SignUp
    },
    {
        path: "*",
        Component: NotFoundPage
    }
]);