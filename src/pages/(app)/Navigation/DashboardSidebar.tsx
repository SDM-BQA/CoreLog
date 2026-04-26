import { Link, useLocation, useNavigate } from "react-router-dom";
import { appConfig } from "../../../@configs/app.config";
import {
  Film,
  BookOpen,
  PenLine,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tv,
  ScrollText,
  Target,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../@store/hooks/store.hooks";
import { clear_user } from "../../../@store/slices/user/user.slice";
import { toast } from "react-toast";

const SIDEBAR_SECTIONS = [
  {
    title: "Collection",
    links: [
      { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
      { label: "Movies", to: "/dashboard/movies", icon: Film },
      { label: "Web Series", to: "/dashboard/series", icon: Tv },
      { label: "Books", to: "/dashboard/books", icon: BookOpen },
      { label: "Journal", to: "/dashboard/journal", icon: PenLine },
      { label: "Poetry", to: "/dashboard/poetry", icon: ScrollText },
      { label: "Target", to: "/dashboard/target", icon: Target },
    ],
  },
];

const BOTTOM_LINKS = [
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (to: string) => {
    if (to === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(to);
  };

  const handleLogout = () => {
    dispatch(clear_user());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <aside
      className={`
        h-screen sticky top-0 flex flex-col bg-surface border-r border-border
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? "w-[72px]" : "w-[240px]"}
      `}
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center gap-3 px-4 pt-5 pb-4 ${collapsed ? "justify-center" : ""}`}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-border group-hover:ring-accent transition-all duration-300 shrink-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <span className="text-text-primary font-bold font-inter text-lg tracking-tight">
              {appConfig.appName}
            </span>
          )}
        </Link>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-border" />

      {/* ── Nav Sections ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-text-secondary text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
                {section.title}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {section.links.map(({ label, to, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={label}
                    to={to}
                    title={collapsed ? label : undefined}
                    className={`
                      relative flex items-center gap-3 rounded-lg transition-all duration-200
                      ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
                      ${
                        active
                          ? "bg-accent/10 text-text-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg/60"
                      }
                    `}
                  >
                    {/* Active bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
                    )}
                    <Icon size={18} className={active ? "text-accent" : ""} />
                    {!collapsed && (
                      <span className="text-sm font-medium">{label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Section ── */}
      <div className="px-3 pb-3 flex flex-col gap-1">
        {/* Divider */}
        <div className="mx-1 h-px bg-border mb-2" />

        {BOTTOM_LINKS.map(({ label, to, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={label}
              to={to}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-3 rounded-lg transition-all duration-200
                ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
                ${
                  active
                    ? "bg-accent/10 text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg/60"
                }
              `}
            >
              <Icon size={18} className={active ? "text-accent" : ""} />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </Link>
          );
        })}

        {/* Log out */}
        <button
          type="button"
          title={collapsed ? "Log out" : undefined}
          onClick={handleLogout}
          className={`
            flex items-center gap-3 rounded-lg transition-all duration-200 text-text-secondary hover:text-error hover:bg-error/10
            ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
          `}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-medium">Log out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`
            flex items-center gap-3 rounded-lg transition-all duration-200 text-text-secondary hover:text-text-primary hover:bg-bg/60 mt-1
            ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
          `}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
