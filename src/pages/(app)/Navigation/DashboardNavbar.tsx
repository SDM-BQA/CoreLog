import { Link, useLocation } from "react-router-dom";
import { appConfig } from "../../../@configs/app.config";
import {
  LayoutDashboard,
  Film,
  BarChart3,
  Settings,
  Bell,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const DASHBOARD_LINKS = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "Movies", to: "/dashboard/movies/add-movie", icon: Film },
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

const DashboardNavbar = () => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (to: string) => {
    if (to === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="sticky top-0 z-50 px-4 py-2.5">
      {/* Glass pill container — same style as main Navbar */}
      <div className="mx-auto bg-bg-secondary/70 backdrop-blur-xl border border-border rounded-xl shadow-lg px-5 py-2.5 flex items-center justify-between gap-6">
        {/* ── Logo ── */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-border group-hover:ring-border-secondary transition-all duration-300">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-text-primary font-semibold font-inter text-base tracking-tight">
            {appConfig.appName}
          </span>
        </Link>

        {/* ── Nav Links — centered ── */}
        <div className="flex items-center gap-1">
          {DASHBOARD_LINKS.map(({ label, to, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={label}
                to={to}
                className={`
                  relative flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all duration-200
                  ${
                    active
                      ? "text-text-primary bg-surface"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
                  }
                `}
              >
                <Icon size={15} className={active ? "text-accent" : ""} />
                {label}
                {/* Active dot indicator */}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right side: Search, Notifications, Profile ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search */}
          <button
            type="button"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface/60 transition-all duration-200"
            title="Search"
          >
            <Search size={17} />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface/60 transition-all duration-200"
            title="Notifications"
          >
            <Bell size={17} />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent ring-2 ring-bg-secondary/70" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1.5" />

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-surface/60 transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-full bg-accent/20 border border-border flex items-center justify-center">
                <User size={14} className="text-accent" />
              </div>
              <span className="text-text-primary text-sm font-medium hidden sm:inline">
                User
              </span>
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={15} />
                  Settings
                </Link>
                <div className="h-px bg-border" />
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-bg transition-colors"
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
