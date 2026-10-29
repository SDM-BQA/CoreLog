import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom";
import { get_auth_string } from "../@utils/storage.utils";
import { Home } from "./(app)/Home";
import NotFoundPage from "./(app)/Not-Found";
import Login from "./(app)/Auth/Login";
import SignUp from "./(app)/Auth/SignUp/SignUp";
import ForgotPassword from "./(app)/Auth/ForgotPassword";
import DashboardHome from "./(app)/(dashboard)/Dashboard-Home/DashboardHome";
import AppLayout from "./(app)/Layout/APPLayout";
import DashboardLayout from "./(app)/Layout/DashboardLayout";
import AddMovie from "./(app)/(dashboard)/movies/AddMovie";
import MoviesList from "./(app)/(dashboard)/movies/MoviesList";
import MovieDetail from "./(app)/(dashboard)/movies/MovieDetail";
import BooksList from "./(app)/(dashboard)/books/BooksList";
import AddBook from "./(app)/(dashboard)/books/AddBook";
import BookDetail from "./(app)/(dashboard)/books/BookDetail";
import SeriesList from "./(app)/(dashboard)/series/SeriesList";
import AddSeries from "./(app)/(dashboard)/series/AddSeries";
import SeriesDetail from "./(app)/(dashboard)/series/SeriesDetail";
import Journal from "./(app)/(dashboard)/journal/Journal";
import AddJournal from "./(app)/(dashboard)/journal/AddJournal";
import JournalDetail from "./(app)/(dashboard)/journal/JournalDetail";
import JournalLayout from "./(app)/(dashboard)/journal/JournalLayout";
import PoetryList from "./(app)/(dashboard)/poetry/PoetryList";
import AddPoem from "./(app)/(dashboard)/poetry/AddPoem";
import PoetryDetail from "./(app)/(dashboard)/poetry/PoetryDetail";
import MusicHub from "./(app)/(dashboard)/music/MusicHub";
import AddMusic from "./(app)/(dashboard)/music/AddMusic";
import SongDetail from "./(app)/(dashboard)/music/SongDetail";
import AlbumDetail from "./(app)/(dashboard)/music/AlbumDetail";
import PlaylistDetail from "./(app)/(dashboard)/music/PlaylistDetail";
import CreatePlaylist from "./(app)/(dashboard)/music/CreatePlaylist";
import Settings from "./(app)/(dashboard)/settings/Settings";
import TargetPage from "./(app)/(dashboard)/target/TargetPage";
import { Pricing } from "./(app)/Pricing";
import ScreenTime from "./(app)/(dashboard)/screen-time/ScreenTime";
import Report from "./(app)/(dashboard)/report/Report";
const Pages = () => {
    return RouterProvider({ router });
};

export default Pages;

/** Calls back once the router has finished its initial loaders (i.e. the first real screen can render). */
export const onRouterReady = (callback: () => void) => {
    if (router.state.initialized) {
        callback();
        return;
    }
    const unsubscribe = router.subscribe((state) => {
        if (state.initialized) {
            unsubscribe();
            callback();
        }
    });
};

const router = createBrowserRouter([
    {
        path: "/",
        Component: AppLayout,
        children: [
            {
                index: true,
                Component: Home,
                // Signed-in users never see the marketing page: redirect before anything renders
                loader: () => (get_auth_string("token") ? redirect("/dashboard") : null),
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
                path: "/auth/forgot-password",
                Component: ForgotPassword,
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
            {
                path: "series",
                Component: SeriesList,
            },
            {
                path: "series/add-series",
                Component: AddSeries,
            },
            {
                path: "series/:id",
                Component: SeriesDetail,
            },
            {
                path: "journal",
                Component: JournalLayout,
                children: [
                    { index: true, Component: Journal },
                    { path: "add-entry", Component: AddJournal },
                    { path: "edit-entry/:id", Component: AddJournal },
                    { path: ":id", Component: JournalDetail },
                ],
            },
            {
                path: "poetry",
                Component: PoetryList,
            },
            {
                path: "poetry/add-poem",
                Component: AddPoem,
            },
            {
                path: "poetry/:id",
                Component: PoetryDetail,
            },
            {
                path: "music",
                Component: MusicHub,
            },
            {
                path: "music/add",
                Component: AddMusic,
            },
            {
                path: "music/song/:id",
                Component: SongDetail,
            },
            {
                path: "music/album/:id",
                Component: AlbumDetail,
            },
            {
                path: "music/playlist/create",
                Component: CreatePlaylist,
            },
            {
                path: "music/playlist/:id",
                Component: PlaylistDetail,
            },
            {
                path: "settings",
                Component: Settings,
            },
            {
                path: "target",
                Component: TargetPage,
            },
            {
                path: "screen-time",
                Component: ScreenTime,
            },
            {
                path: "report",
                Component: Report,
            },
        ],
    },
    {
        path: "*",
        Component: NotFoundPage,
    },
]);
