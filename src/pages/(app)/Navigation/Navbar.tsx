import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { appConfig } from "../../../@configs/app.config";

const NAV_LINKS = [
  { label: "Features", to: "/#features" },
  { label: "Pricing", to: "/#pricing" },
];

const SECTION_IDS = NAV_LINKS.map(({ to }) => to.split("#")[1]);

const Navbar = () => {
  const location = useLocation();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Scroll-spy: the section crossing a line near the top third of the screen is "active"
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const probe = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const id of SECTION_IDS) {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        if (rect && rect.top <= probe && rect.bottom > probe) {
          current = id;
          break;
        }
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3">
      {/* Glass pill container */}
      <div className="mx-auto bg-bg-secondary/40 backdrop-blur-2xl backdrop-saturate-150 border border-border/60 shadow-[0_8px_32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between gap-3 md:gap-8 max-w-full">
        {/* Logo  */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src="/logo.png"
              alt={`${appConfig.appName} logo`}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-text-primary font-semibold font-inter text-base tracking-tight hidden sm:block">
            {appConfig.appName}
          </span>
        </Link>

        {/* ── Nav links — centered ── */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, to }) => {
            const isActive = activeId !== null && to.endsWith(`#${activeId}`);
            return (
              <Link
                key={label}
                to={to}
                onClick={() => {
                  if (to.includes("#") && location.pathname === "/")
                    document
                      .getElementById(to.split("#")[1])
                      ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`
                  relative px-4 py-1.5 pb-2.5 text-sm rounded-lg font-medium transition-colors duration-200
                  ${
                    isActive
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
                  }
                `}
              >
                {label}
                {/* Active section dot */}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,242,255,0.9)] transition-all duration-300 ${
                    isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  }`}
                />
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
