import { Outlet } from "react-router-dom";
import Navbar from "../Navigation/Navbar";
import { ToastContainer } from "react-toast";

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <ToastContainer delay={3000} />
    </>
  );
};

export default AppLayout;
