import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./(app)/Home";
import NotFoundPage from "./(app)/Not-Found";


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
        path: "*",
        Component: NotFoundPage
    }
]);