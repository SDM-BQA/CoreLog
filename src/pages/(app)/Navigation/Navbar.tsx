import { Link, useLocation } from "react-router-dom";
import { appConfig } from "../../../@configs/app.config";

const NAV_LINKS = [
  { label: "Features", to: "/" },
  { label: "Community", to: "/about" },
  { label: "Pricing", to: "/pricing" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3">
      {/* Glass pill container */}
      <div className="mx-auto bg-bg-secondary/70 backdrop-blur-xl border border-border rounded-xl shadow-lg px-4 md:px-6 py-3 flex items-center justify-between gap-3 md:gap-8 max-w-full">
        {/* Logo  */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-border group-hover:ring-border-secondary transition-all duration-300">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-text-primary font-semibold font-inter text-base tracking-tight hidden sm:block">
            {appConfig.appName}
          </span>
        </Link>

        {/* ── Nav links — centered ── */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, to }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={label}
                to={to}
                className={`
                  relative px-4 py-1.5 text-sm rounded-lg font-medium transition-all duration-200
                  ${
                    isActive
                      ? "text-text-primary bg-surface"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
                  }
                `}
              >
                {label}
                {/* Active dot indicator */}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Auth ── */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/auth/login"
            className="px-4 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-all duration-200"
          >
            Log in
          </Link>
          <Link
            to="/auth/signup"
            className="px-4 py-1.5 text-sm font-semibold text-text-primary bg-primary hover:bg-primary/80 rounded-lg transition-all duration-200 shadow-sm"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
