import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "../Navigation/DashboardSidebar";
import { ToastContainer } from "react-toast";
import { useAppSelector } from "../../../@store/hooks/store.hooks";

const DashboardLayout = () => {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

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
