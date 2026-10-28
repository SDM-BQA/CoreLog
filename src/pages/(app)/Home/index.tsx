import { useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Film,
  Flame,
  Music,
  PenLine,
  ScrollText,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { useAppSelector } from "../../../@store/hooks/store.hooks";
import { useServerStatus, type ServerStatus } from "../../../@hooks/useServerStatus";
import { appConfig } from "../../../@configs/app.config";
import { PricingSection } from "../Pricing/PricingSection";
import { DashboardMockup } from "./DashboardMockup";
import { FeatureShowcase } from "./FeatureShowcase";
import { MoreFeatures } from "./MoreFeatures";

const STATUS_UI: Record<ServerStatus, { label: string; dot: string }> = {
  checking: { label: "Checking status…", dot: "bg-text-secondary animate-pulse" },
  operational: { label: "All systems operational", dot: "bg-secondary" },
  degraded: { label: "Experiencing issues", dot: "bg-amber-400" },
  unreachable: { label: "Service unreachable", dot: "bg-error" },
};

const CATEGORIES: { label: string; icon: LucideIcon; color: string }[] = [
  { label: "Movies", icon: Film, color: "text-blue-400" },
  { label: "Series", icon: Tv, color: "text-violet-400" },
  { label: "Books", icon: BookOpen, color: "text-emerald-400" },
  { label: "Poetry", icon: ScrollText, color: "text-amber-400" },
  { label: "Music", icon: Music, color: "text-rose-400" },
  { label: "Journal", icon: PenLine, color: "text-pink-400" },
];

type FooterLink = { label: string; href: string } | { label: string; to: string };

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", to: "/auth/login" },
      { label: "Sign up", to: "/auth/signup" },
    ],
  },
];

export const Home = () => {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const serverStatus = useServerStatus();
  const { hash } = useLocation();

  // Scroll to in-page sections (e.g. /#pricing) when arriving from another page
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans overflow-x-hidden">
      <main className="flex-grow pt-16">
        {/* ───────── Hero ───────── */}
        <section className="relative overflow-hidden px-6 pt-16 md:pt-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-48 left-1/2 h-[480px] w-[900px] max-w-full -translate-x-1/2 rounded-full bg-primary/30 blur-[150px]" />
            <div
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
                maskImage: "radial-gradient(ellipse 55% 50% at 50% 0%, #000 30%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 55% 50% at 50% 0%, #000 30%, transparent 100%)",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
            <a
              href="/#pricing"
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 py-1.5 pl-3 pr-2 text-xs text-text-secondary backdrop-blur transition-colors hover:border-border-secondary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Free to start · No credit card
              <ArrowRight size={13} className="text-text-primary" />
            </a>

            <h1 className="text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-[4.25rem]">
              Log everything
              <br />
              you{" "}
              <span className="bg-gradient-to-r from-blue-300 via-accent to-secondary bg-clip-text text-transparent">
                watch, read &amp; feel
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-text-secondary md:text-lg">
              {appConfig.appName} brings your movies, series, books, music, poetry and journal into one
              calm workspace, with streaks and yearly targets to keep you going.
            </p>

            <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/auth/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-text-primary shadow-lg shadow-primary/30 transition-all hover:bg-accent sm:w-auto"
              >
                Start logging for free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="/#features"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface/60 px-7 py-3.5 text-sm font-semibold transition-colors hover:border-border-secondary sm:w-auto"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative z-10 mx-auto mt-14 max-w-5xl md:mt-16">
            <div className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
            <div className="absolute -inset-x-8 -top-8 bottom-0 rounded-[2.5rem] bg-gradient-to-b from-primary/25 to-transparent blur-3xl" />
            <div className="relative rounded-t-2xl border border-b-0 border-border bg-surface p-2 pb-0 shadow-2xl md:rounded-t-[1.75rem]">
              <div className="flex items-center gap-1.5 px-3 pb-2 pt-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="relative h-[400px] overflow-hidden rounded-t-xl border border-b-0 border-border bg-bg sm:h-[460px] md:h-[500px] md:rounded-t-[1.25rem]">
                <DashboardMockup />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Category strip */}
        <section className="border-y border-border bg-surface/30 px-6 py-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <p className="text-sm text-text-secondary">Six things you love, one log.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {CATEGORIES.map(({ label, icon: Icon, color }) => (
                <span key={label} className="inline-flex items-center gap-2 text-sm font-medium">
                  <Icon size={16} className={color} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Features ───────── */}
        <section id="features" className="scroll-mt-16 px-6 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-20 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Features</p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                Built for the way you actually log
              </h2>
              <p className="mt-4 text-text-secondary">
                Quick to add, calm to look at, and rewarding to come back to.
              </p>
            </div>

            <FeatureShowcase />
          </div>
        </section>

        {/* More */}
        <section className="border-y border-border bg-surface/30 px-6 py-24 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">And more</p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Every corner of your life has a place
              </h2>
            </div>
            <MoreFeatures />
          </div>
        </section>

        {/* ───────── Pricing ───────── */}
        <PricingSection />

        {/* ───────── Final CTA ───────── */}
        <section className="px-6 pb-24 md:pb-32">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-surface">
            {/* Backdrop */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/40 blur-[110px]" />
              <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-secondary/10 blur-[110px]" />
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                  maskImage: "radial-gradient(ellipse 70% 90% at 100% 0%, #000 20%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse 70% 90% at 100% 0%, #000 20%, transparent 100%)",
                }}
              />
            </div>

            <div className="relative grid grid-cols-1 items-center gap-12 p-8 sm:p-12 md:grid-cols-2 md:gap-8 md:p-16">
              <div className="text-center md:text-left">
                <h2 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
                  Your next favourite
                  <br className="hidden md:block" /> thing deserves a log.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-balance text-base leading-relaxed text-text-secondary md:mx-0 md:text-lg">
                  Sign up in under a minute and add your first movie, book or thought.
                </p>

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:justify-start">
                  <Link
                    to="/auth/signup"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-text-primary shadow-lg shadow-primary/30 transition-all hover:bg-accent"
                  >
                    Create free account
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-bg/60 px-7 py-3.5 text-sm font-semibold transition-colors hover:border-border-secondary"
                  >
                    Log in
                  </Link>
                </div>

                <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-secondary md:justify-start">
                  {["Free to start", "No credit card", "Works on any device"].map((t) => (
                    <li key={t} className="inline-flex items-center gap-1.5">
                      <Check size={14} className="text-secondary" /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decorative preview (sample data) */}
              <div aria-hidden="true" className="relative mx-auto hidden h-72 w-full max-w-md select-none md:block">
                <div className="absolute right-0 top-0 w-[88%] rounded-2xl border border-border bg-bg/80 p-4 shadow-2xl shadow-black/40 backdrop-blur">
                  <p className="mb-3 text-xs font-semibold text-text-primary">Recently added</p>
                  <div className="grid grid-cols-4 gap-2.5">
                    {["interstellar", "blade-runner", "dark-knight", "inception"].map((n) => (
                      <img
                        key={n}
                        src={`/posters/${n}.png`}
                        alt=""
                        className="aspect-[2/3] w-full rounded-md border border-border object-cover"
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-[68%] rounded-2xl border border-border bg-surface p-4 shadow-2xl shadow-black/40">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
                      <Flame size={18} className="text-orange-400" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">14 day streak</p>
                      <p className="text-[11px] text-text-secondary">Keep it going today</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <span
                        key={i}
                        className={`h-2 flex-1 rounded-full ${i < 6 ? "bg-pink-400/70" : "bg-border"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute -right-2 bottom-8 rounded-xl border border-border bg-surface px-4 py-3 shadow-xl shadow-black/40">
                  <p className="text-2xl font-black leading-none text-text-primary">128</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-400">Movies</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-border px-6 pt-14 pb-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt={`${appConfig.appName} logo`} className="h-9 w-9 object-contain" />
              <span className="text-xl font-semibold tracking-tight">{appConfig.appName}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
              Your personal log for movies, series, books, music, poetry and journal entries.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {"to" in l ? (
                      <Link to={l.to} className="transition-colors hover:text-text-primary">
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className="transition-colors hover:text-text-primary">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-text-secondary sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {appConfig.appName}. All rights reserved.
          </p>
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STATUS_UI[serverStatus].dot}`} />
            {STATUS_UI[serverStatus].label}
          </span>
        </div>
      </footer>
    </div>
  );
};
