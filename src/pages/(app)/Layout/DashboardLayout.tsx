// (app)/Layout.tsx
import { Outlet } from "react-router-dom";
import DashboardHome from "../(dashboard)/Dashboard-Home/DashboardHome";

const DashboardLayout = () => {
  return (
    <>
      <DashboardHome />
      <Outlet />
    </>
  );
};

export default DashboardLayout;
