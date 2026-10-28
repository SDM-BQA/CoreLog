import type { ReactNode } from "react";
import { Check, Film, Flame, Lock, PenLine, Star, Target, type LucideIcon } from "lucide-react";

// Decorative UI previews with sample data — they mirror the real dashboard styling.

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div
    aria-hidden="true"
    className={`select-none rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-2xl shadow-black/30 ${className}`}
  >
    {children}
  </div>
);

const WatchlistPreview = () => {
  const rows = [
    { title: "Interstellar", meta: "Sci-Fi · 2014", status: "Watched", rating: 5, poster: "/posters/interstellar.png", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { title: "Blade Runner", meta: "Sci-Fi · 1982", status: "Watching", rating: 4, poster: "/posters/blade-runner.png", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { title: "The Dark Knight", meta: "Action · 2008", status: "Wishlist", rating: 0, poster: "/posters/dark-knight.png", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  ];
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">My Movies</p>
        <div className="flex gap-1.5 text-[11px] font-medium">
          <span className="rounded-md bg-primary/25 px-2 py-1 text-text-primary">All</span>
          <span className="rounded-md px-2 py-1 text-text-secondary">Watching</span>
          <span className="rounded-md px-2 py-1 text-text-secondary">Wishlist</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.title} className="flex items-center gap-3 rounded-xl border border-border bg-bg/60 p-2.5">
            <img src={r.poster} alt="" className="h-14 w-10 rounded-md border border-border object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{r.title}</p>
              <p className="text-xs text-text-secondary">{r.meta}</p>
              <div className="mt-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={11}
                    className={n <= r.rating ? "fill-amber-400 text-amber-400" : "text-border"}
                  />
                ))}
              </div>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${r.badge}`}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const JournalPreview = () => (
  <Card>
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
          <Flame size={16} className="text-orange-400" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text-primary">14 day streak</p>
          <p className="text-[11px] text-text-secondary">Keep it going today</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg/60 px-2.5 py-1 text-[10px] font-medium text-text-secondary">
        <Lock size={10} /> Locked
      </span>
    </div>
    <div className="mb-4 grid grid-cols-7 gap-1.5">
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <div key={i} className="text-center">
          <div
            className={`mx-auto flex h-8 w-full items-center justify-center rounded-lg ${
              i < 6 ? "bg-pink-500/20 text-pink-300" : "border border-dashed border-border text-text-secondary"
            }`}
          >
            {i < 6 ? <Check size={13} /> : null}
          </div>
          <p className="mt-1 text-[10px] text-text-secondary">{d}</p>
        </div>
      ))}
    </div>
    <div className="rounded-xl border border-border bg-bg/60 p-3.5">
      <p className="text-[11px] text-text-secondary">Tuesday evening · Mumbai</p>
      <p className="mt-1 text-sm font-semibold text-text-primary">A quiet walk after the rain</p>
      <div className="mt-2.5 space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-border" />
        <div className="h-1.5 w-11/12 rounded-full bg-border" />
        <div className="h-1.5 w-2/3 rounded-full bg-border" />
      </div>
    </div>
  </Card>
);

const TargetsPreview = () => {
  const goals = [
    { label: "Movies", done: 24, total: 40, bar: "bg-blue-500" },
    { label: "Web series", done: 6, total: 12, bar: "bg-violet-500" },
    { label: "Books", done: 9, total: 24, bar: "bg-emerald-500" },
    { label: "Poetry", done: 15, total: 20, bar: "bg-amber-500" },
  ];
  const months = [30, 55, 40, 70, 50, 85, 60, 95, 45, 75, 65, 90];
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">{new Date().getFullYear()} targets</p>
        <span className="rounded-full bg-primary/25 px-2.5 py-1 text-[10px] font-semibold text-text-primary">
          On track
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {goals.map((g) => (
          <div key={g.label}>
            <div className="mb-1 flex justify-between text-xs text-text-secondary">
              <span>{g.label}</span>
              <span>
                {g.done} / {g.total}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg">
              <div className={`h-full rounded-full ${g.bar}`} style={{ width: `${(g.done / g.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-border bg-bg/60 p-3">
        <p className="mb-2 text-[11px] text-text-secondary">Entries per month</p>
        <div className="flex h-16 items-end gap-1.5">
          {months.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-accent/70" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </Card>
  );
};

interface Row {
  eyebrow: string;
  icon: LucideIcon;
  color: string;
  title: string;
  desc: string;
  points: string[];
  visual: ReactNode;
}

const ROWS: Row[] = [
  {
    eyebrow: "Movies, series & books",
    icon: Film,
    color: "text-blue-400",
    title: "Remember everything you watch and read",
    desc: "Search for a title, and its poster and details fill in for you. Mark it as wishlist, in progress or finished, then rate it while it is fresh.",
    points: ["Wishlist, watching and finished states", "Ratings, notes and genres", "Posters and covers added automatically"],
    visual: <WatchlistPreview />,
  },
  {
    eyebrow: "Journal",
    icon: PenLine,
    color: "text-pink-400",
    title: "A private place to write every day",
    desc: "A calm editor with templates, daily streaks and a map of where you wrote. Add a PIN or biometric lock and the entries stay yours.",
    points: ["Daily writing streaks", "Photos, templates and a journal map", "PIN and biometric lock"],
    visual: <JournalPreview />,
  },
  {
    eyebrow: "Targets & reports",
    icon: Target,
    color: "text-cyan-400",
    title: "Turn logging into progress you can see",
    desc: "Set yearly goals for each category and watch the bars fill. Your dashboard and reports bring everything together in one view.",
    points: ["Yearly goals per category", "One dashboard for all your logs", "Reports you will want to open"],
    visual: <TargetsPreview />,
  },
];

export const FeatureShowcase = () => (
  <div className="flex flex-col gap-24 md:gap-32">
    {ROWS.map((row, i) => (
      <div
        key={row.title}
        className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16"
      >
        <div className={i % 2 === 1 ? "md:order-2" : ""}>
          <p className={`mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${row.color}`}>
            <row.icon size={14} /> {row.eyebrow}
          </p>
          <h3 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{row.title}</h3>
          <p className="mt-4 max-w-md leading-relaxed text-text-secondary">{row.desc}</p>
          <ul className="mt-6 space-y-2.5">
            {row.points.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <Check size={15} className={row.color} /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className={`relative ${i % 2 === 1 ? "md:order-1" : ""}`}>
          <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl" />
          <div className="relative mx-auto w-full max-w-md">{row.visual}</div>
        </div>
      </div>
    ))}
  </div>
);
