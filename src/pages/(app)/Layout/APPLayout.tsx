// (app)/Layout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../Navigation/Navbar";

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default AppLayout;
