import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./(app)/Home";
import NotFoundPage from "./(app)/Not-Found";
import Login from "./(app)/Auth/Login";
import SignUp from "./(app)/Auth/SignUp/SignUp";
import DashboardHome from "./(app)/(dashboard)/Dashboard-Home/DashboardHome";
import AppLayout from "./(app)/Layout/APPLayout";
import DashboardLayout from "./(app)/Layout/DashboardLayout";
import AddMovie from "./(app)/(dashboard)/movies/AddMovie";
import MoviesList from "./(app)/(dashboard)/movies/MoviesList";
import MovieDetail from "./(app)/(dashboard)/movies/MovieDetail";
import BooksList from "./(app)/(dashboard)/books/BooksList";
import AddBook from "./(app)/(dashboard)/books/AddBook";
import BookDetail from "./(app)/(dashboard)/books/BookDetail";
import { Pricing } from "./(app)/Pricing";
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
                path: "/pricing",
                Component: Pricing,
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
            },
            {
                path: "movies",
                Component: MoviesList,
            },
            {
                path: "movies/:id",
                Component: MovieDetail,
            },
            {
                path: "movies/add-movie",
                Component: AddMovie,
            },
            {
                path: "books",
                Component: BooksList,
            },
            {
                path: "books/add-book",
                Component: AddBook,
            },
            {
                path: "books/:id",
                Component: BookDetail,
            },
        ],
    },
    {
        path: "*",
        Component: NotFoundPage,
    },
]);
