import { useState, type ReactNode } from "react";
import {
  Film,
  Tv,
  BookOpen,
  ScrollText,
  PenLine,
  LayoutDashboard,
  Music,
  Target,
  Plus,
  Star,
  Flame,
  Check,
  type LucideIcon,
} from "lucide-react";
import { appConfig } from "../../../@configs/app.config";

// Interactive preview of the real dashboard. All data below is sample data.

type TabId = "dashboard" | "movies" | "series" | "books" | "poetry" | "music" | "journal" | "target";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "movies", label: "Movies", icon: Film },
  { id: "series", label: "Series", icon: Tv },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "poetry", label: "Poetry", icon: ScrollText },
  { id: "music", label: "Music", icon: Music },
  { id: "journal", label: "Journal", icon: PenLine },
  { id: "target", label: "Target", icon: Target },
];

const STATS = [
  { label: "Movies", count: 128, meta: "38% of collection", icon: Film, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Series", count: 42, meta: "12% of collection", icon: Tv, color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Books", count: 56, meta: "17% of collection", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Poetry", count: 31, meta: "9% of collection", icon: ScrollText, color: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Journal", count: 79, meta: "14 day streak", icon: PenLine, color: "text-pink-400", bg: "bg-pink-500/10" },
];

const GOALS = [
  { label: "Movies", done: 24, total: 40, bar: "bg-blue-500" },
  { label: "Web Series", done: 6, total: 12, bar: "bg-violet-500" },
  { label: "Books", done: 9, total: 24, bar: "bg-emerald-500" },
  { label: "Poetry", done: 15, total: 20, bar: "bg-amber-500" },
];

const POSTERS = [
  { title: "Interstellar", src: "/posters/interstellar.png" },
  { title: "Blade Runner", src: "/posters/blade-runner.png" },
  { title: "The Dark Knight", src: "/posters/dark-knight.png" },
  { title: "Inception", src: "/posters/inception.png" },
];

const BADGE = {
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const Panel = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-border bg-surface p-3 sm:p-4 ${className}`}>{children}</div>
);

const Stars = ({ n }: { n: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={11} className={i <= n ? "fill-amber-400 text-amber-400" : "text-border"} />
    ))}
  </div>
);

const Row = ({
  lead,
  title,
  meta,
  right,
}: {
  lead: ReactNode;
  title: string;
  meta?: string;
  right?: ReactNode;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-bg/60 p-2.5">
    {lead}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-text-primary">{title}</p>
      {meta && <p className="truncate text-xs text-text-secondary">{meta}</p>}
    </div>
    {right}
  </div>
);

const Badge = ({ tone, children }: { tone: keyof typeof BADGE; children: ReactNode }) => (
  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${BADGE[tone]}`}>
    {children}
  </span>
);

const Initial = ({ letter, tone }: { letter: string; tone: string }) => (
  <span className={`flex h-12 w-10 shrink-0 items-center justify-center rounded-md border border-border text-sm font-bold ${tone}`}>
    {letter}
  </span>
);

/* ───────── Views ───────── */

const DashboardView = () => (
  <>
    <div className="flex items-end justify-between gap-3 rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-bg p-3 sm:p-5">
      <div className="min-w-0">
        <p className="text-[10px] text-text-secondary sm:text-xs">Wednesday, October 28</p>
        <p className="truncate text-base font-black tracking-tight text-text-primary sm:text-2xl">Good evening, Alex</p>
        <p className="mt-1 hidden text-xs text-text-secondary sm:block">You have logged 336 entries. Keep the streak alive.</p>
      </div>
      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-bold text-white sm:text-xs">
        <Plus size={12} strokeWidth={3} /> Add To Collection
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-5">
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className={`flex-col gap-2 rounded-xl border border-border bg-surface p-2.5 sm:p-3 ${i > 2 ? "hidden lg:flex" : "flex"}`}
        >
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}>
            <s.icon size={14} className={s.color} />
          </div>
          <div>
            <p className="text-lg font-black leading-none text-text-primary sm:text-2xl">{s.count}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-text-secondary sm:text-[10px]">{s.label}</p>
            <p className="mt-1 text-[9px] text-text-secondary/70">{s.meta}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid min-h-0 grid-cols-12 gap-2 sm:gap-3">
      <Panel className="col-span-12 sm:col-span-7">
        <p className="mb-3 text-xs font-bold text-text-primary">{new Date().getFullYear()} Goals</p>
        <div className="flex flex-col gap-2.5">
          {GOALS.map((g) => (
            <div key={g.label}>
              <div className="mb-1 flex justify-between text-[10px] text-text-secondary">
                <span>{g.label}</span>
                <span>
                  {g.done} / {g.total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bg">
                <div className={`h-full rounded-full ${g.bar}`} style={{ width: `${(g.done / g.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="col-span-5 hidden sm:block">
        <p className="mb-3 text-xs font-bold text-text-primary">Recently Added</p>
        <div className="grid grid-cols-4 gap-2">
          {POSTERS.map((r) => (
            <div key={r.title} className="min-w-0">
              <img src={r.src} alt="" className="aspect-[2/3] w-full rounded-md border border-border object-cover" />
              <p className="mt-1 truncate text-[9px] font-medium text-text-primary">{r.title}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  </>
);

const MoviesView = () => {
  const items = [
    { ...POSTERS[0], meta: "Sci-Fi · 2014", status: "Watched", tone: "green" as const, r: 5 },
    { ...POSTERS[1], meta: "Sci-Fi · 1982", status: "Watching", tone: "blue" as const, r: 4 },
    { ...POSTERS[2], meta: "Action · 2008", status: "Watched", tone: "green" as const, r: 5 },
    { ...POSTERS[3], meta: "Sci-Fi · 2010", status: "Wishlist", tone: "amber" as const, r: 0 },
  ];
  return (
    <Panel className="flex flex-col gap-2.5">
      {items.map((m) => (
        <Row
          key={m.title}
          lead={<img src={m.src} alt="" className="h-12 w-8 rounded-md border border-border object-cover" />}
          title={m.title}
          meta={m.meta}
          right={
            <div className="flex flex-col items-end gap-1.5">
              <Badge tone={m.tone}>{m.status}</Badge>
              <Stars n={m.r} />
            </div>
          }
        />
      ))}
    </Panel>
  );
};

const SeriesView = () => {
  const items = [
    { t: "Breaking Bad", meta: "Season 4 · Episode 7", p: 78, status: "Watching", tone: "blue" as const, l: "B" },
    { t: "Dark", meta: "3 seasons · Completed", p: 100, status: "Watched", tone: "green" as const, l: "D" },
    { t: "The Bear", meta: "Season 2 · Episode 2", p: 35, status: "Watching", tone: "blue" as const, l: "T" },
    { t: "Severance", meta: "Added this week", p: 0, status: "Wishlist", tone: "amber" as const, l: "S" },
  ];
  return (
    <Panel className="flex flex-col gap-2.5">
      {items.map((s) => (
        <Row
          key={s.t}
          lead={<Initial letter={s.l} tone="bg-violet-500/10 text-violet-300" />}
          title={s.t}
          meta={s.meta}
          right={
            <div className="flex w-24 flex-col items-end gap-1.5">
              <Badge tone={s.tone}>{s.status}</Badge>
              <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${s.p}%` }} />
              </div>
            </div>
          }
        />
      ))}
    </Panel>
  );
};

const BooksView = () => {
  const items = [
    { t: "Atomic Habits", a: "James Clear", p: 72 },
    { t: "The Alchemist", a: "Paulo Coelho", p: 35 },
    { t: "Sapiens", a: "Yuval Noah Harari", p: 100 },
    { t: "Deep Work", a: "Cal Newport", p: 0 },
  ];
  return (
    <Panel className="flex flex-col gap-2.5">
      {items.map((b) => (
        <Row
          key={b.t}
          lead={<Initial letter={b.t[0]} tone="bg-emerald-500/10 text-emerald-300" />}
          title={b.t}
          meta={b.a}
          right={
            <div className="w-24 text-right">
              <p className="mb-1 text-[10px] text-text-secondary">{b.p === 100 ? "Finished" : b.p === 0 ? "Wishlist" : `${b.p}%`}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${b.p}%` }} />
              </div>
            </div>
          }
        />
      ))}
    </Panel>
  );
};

const PoetryView = () => {
  const items = [
    { t: "Quiet Rain", mood: "Reflective", body: "The rain keeps its own time, and so do I." },
    { t: "Last Train", mood: "Nostalgic", body: "Every window is a small, moving memory." },
    { t: "Morning Light", mood: "Hopeful", body: "Today arrives without asking permission." },
  ];
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {items.map((p) => (
        <Panel key={p.t}>
          <p className="text-sm font-semibold text-text-primary">{p.t}</p>
          <p className="mt-2 font-serif text-xs italic leading-relaxed text-text-secondary">&ldquo;{p.body}&rdquo;</p>
          <span className="mt-3 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
            {p.mood}
          </span>
        </Panel>
      ))}
    </div>
  );
};

const MusicView = () => {
  const lists = [
    { t: "Late Night Drive", n: "12 songs", h: ["h-2", "h-4", "h-3", "h-5"] },
    { t: "Rainy Day", n: "8 songs", h: ["h-3", "h-5", "h-2", "h-4"] },
    { t: "Focus Mode", n: "21 songs", h: ["h-4", "h-2", "h-5", "h-3"] },
    { t: "Road Trip", n: "16 songs", h: ["h-5", "h-3", "h-4", "h-2"] },
  ];
  return (
    <Panel className="flex flex-col gap-2.5">
      {lists.map((p) => (
        <Row
          key={p.t}
          lead={
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/15">
              <span className="flex h-5 items-end gap-0.5">
                {p.h.map((h, i) => (
                  <span key={i} className={`w-1 rounded-sm bg-rose-400 ${h}`} />
                ))}
              </span>
            </span>
          }
          title={p.t}
          meta={p.n}
        />
      ))}
    </Panel>
  );
};

const JournalView = () => (
  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5">
    <Panel className="sm:col-span-2">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
          <Flame size={18} className="text-orange-400" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text-primary">14 day streak</p>
          <p className="text-[11px] text-text-secondary">Longest: 31 days</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center">
            <div
              className={`mx-auto flex h-7 items-center justify-center rounded-md ${
                i < 6 ? "bg-pink-500/20 text-pink-300" : "border border-dashed border-border"
              }`}
            >
              {i < 6 && <Check size={12} />}
            </div>
            <p className="mt-1 text-[9px] text-text-secondary">{d}</p>
          </div>
        ))}
      </div>
    </Panel>
    <Panel className="flex flex-col gap-2.5 sm:col-span-3">
      {[
        { d: "Tue, Oct 27", t: "A quiet walk after the rain", m: "Mumbai" },
        { d: "Mon, Oct 26", t: "Finished the last chapter", m: "Home" },
        { d: "Sun, Oct 25", t: "Notes from a slow Sunday", m: "Pune" },
      ].map((e) => (
        <div key={e.t} className="rounded-xl border border-border bg-bg/60 p-3">
          <p className="text-[10px] text-text-secondary">
            {e.d} · {e.m}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-text-primary">{e.t}</p>
        </div>
      ))}
    </Panel>
  </div>
);

const TargetView = () => (
  <Panel>
    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm font-bold text-text-primary">{new Date().getFullYear()} targets</p>
      <span className="rounded-full bg-primary/25 px-2.5 py-1 text-[10px] font-semibold text-text-primary">On track</span>
    </div>
    <div className="flex flex-col gap-4">
      {GOALS.map((g) => (
        <div key={g.label}>
          <div className="mb-1.5 flex justify-between text-xs text-text-secondary">
            <span>{g.label}</span>
            <span>
              {g.done} / {g.total} · {Math.round((g.done / g.total) * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg">
            <div className={`h-full rounded-full ${g.bar}`} style={{ width: `${(g.done / g.total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  </Panel>
);

const VIEWS: Record<TabId, () => ReactNode> = {
  dashboard: DashboardView,
  movies: MoviesView,
  series: SeriesView,
  books: BooksView,
  poetry: PoetryView,
  music: MusicView,
  journal: JournalView,
  target: TargetView,
};

const TITLES: Partial<Record<TabId, string>> = {
  movies: "My Movies",
  series: "My Series",
  books: "My Books",
  poetry: "My Poetry",
  music: "Music",
  journal: "Journal",
  target: "Targets",
};

export const DashboardMockup = () => {
  const [active, setActive] = useState<TabId>("dashboard");
  const View = VIEWS[active];

  return (
    <div className="flex h-full w-full text-left">
      {/* Sidebar (desktop) */}
      <aside
        role="tablist"
        aria-orientation="vertical"
        aria-label="Dashboard preview sections"
        className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border bg-surface/60 p-3 md:flex"
      >
        <div className="flex items-center gap-2 px-2 pb-3">
          <img src="/logo.png" alt="" className="h-6 w-6 object-contain" />
          <span className="text-sm font-semibold text-text-primary">{appConfig.appName}</span>
        </div>
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(id)}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                on
                  ? "bg-primary/20 text-text-primary"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary"
              }`}
            >
              <Icon size={14} className={on ? "text-accent" : ""} />
              {label}
            </button>
          );
        })}
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Tabs (mobile) */}
        <div
          role="tablist"
          aria-label="Dashboard preview sections"
          className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-border bg-surface/60 px-3 py-2 md:hidden [scrollbar-width:none]"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const on = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  on
                    ? "border-primary/50 bg-primary/25 text-text-primary"
                    : "border-border text-text-secondary"
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>

        <div key={active} className="flex min-h-0 flex-1 animate-[fadeIn_.25s_ease-out] flex-col gap-3 overflow-hidden p-3 sm:gap-4 sm:p-5">
          {active !== "dashboard" && (
            <div className="flex items-center justify-between">
              <p className="text-base font-black tracking-tight text-text-primary sm:text-xl">{TITLES[active]}</p>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-bold text-white sm:text-xs">
                <Plus size={12} strokeWidth={3} /> Add
              </div>
            </div>
          )}
          <View />
        </div>
      </div>
    </div>
  );
};
