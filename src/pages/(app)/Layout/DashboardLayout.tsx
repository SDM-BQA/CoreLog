import { Outlet } from "react-router-dom";
import DashboardSidebar from "../Navigation/DashboardSidebar";

const DashboardLayout = () => {
  return (
    <div className="bg-bg h-screen flex flex-row overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
