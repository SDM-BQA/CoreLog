import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navigation/Navbar";
import { ToastContainer } from "react-toast";

const AppLayout = () => {
  // Auth pages have their own top bar
  const isAuthRoute = useLocation().pathname.startsWith("/auth");

  return (
    <>
      {!isAuthRoute && <Navbar />}
      <Outlet />
      <ToastContainer delay={3000} />
    </>
  );
};

export default AppLayout;
