import { Outlet } from "react-router-dom";
import DashboardSidebar from "../Navigation/DashboardSidebar";
import { ToastContainer } from "react-toast";

const DashboardLayout = () => {
  return (
    <div className="bg-bg h-screen flex flex-row overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>
      <ToastContainer delay={3000} />
    </div>
  );
};

export default DashboardLayout;
