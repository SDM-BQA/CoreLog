import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Film,
  BookOpen,
  Tv,
  Plus,
  ChevronRight,
  Star,
  Play,
  PenLine,
  ScrollText,
  Target as TargetIcon,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAppSelector } from "../../../../@store/hooks/store.hooks";
import { get_dashboard_stats_query, type DashboardStats } from "../../../../@apis/users";
import { get_my_movies_query } from "../../../../@apis/movies";
import { get_my_series_query } from "../../../../@apis/series";
import { get_my_books_query } from "../../../../@apis/books";
import { get_my_poems_query } from "../../../../@apis/poetry";
import { get_my_journals_query } from "../../../../@apis/journal";
import { get_my_target_query, get_target_progress_query, type Target, type TargetProgress } from "../../../../@apis/targets";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { formatDate } from "../../../../@utils/date.utils";

type MediaItem =
  | { type: "Movie";  title: string; _id: string; cover: string; status: string; rating?: number; created_at?: string; genres?: string[] }
  | { type: "Series"; title: string; _id: string; cover: string; status: string; rating?: number; created_at?: string; total_seasons?: number }
  | { type: "Book";   title: string; _id: string; cover: string; status: string; rating?: number; created_at?: string; author?: string }
  | { type: "Poem";   title: string; _id: string; cover: string; status: string; rating?: number; created_at?: string; mood?: string };

// ── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_STYLE: Record<string, { badge: string; bar: string; text: string; bg: string }> = {
  Movie:  { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",   bar: "bg-blue-500",    text: "text-blue-400",    bg: "bg-blue-500/10" },
  Series: { badge: "bg-violet-500/10 text-violet-400 border-violet-500/20", bar: "bg-violet-500", text: "text-violet-400", bg: "bg-violet-500/10" },
  Book:   { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", bar: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  Poem:   { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",  bar: "bg-amber-500",   text: "text-amber-400",   bg: "bg-amber-500/10" },
};

const itemPath = (item: MediaItem) =>
  item.type === "Movie"  ? `/dashboard/movies/${item._id}`  :
  item.type === "Series" ? `/dashboard/series/${item._id}`  :
  item.type === "Poem"   ? `/dashboard/poetry/${item._id}`  :
  `/dashboard/books/${item._id}`;

const timeGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const fmtDate = () =>
  formatDate(new Date(), { weekday: "long", month: "long", day: "numeric" });

// ── Component ─────────────────────────────────────────────────────────────────
const DashboardHome = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { user } = useAppSelector((state) => state.user);

  const [stats,          setStats]          = useState<DashboardStats | null>(null);
  const [journalCount,   setJournalCount]   = useState(0);
  const [recentItems,    setRecentItems]    = useState<MediaItem[]>([]);
  const [inProgressItems,setInProgressItems]= useState<MediaItem[]>([]);
  const [yearlyTarget,   setYearlyTarget]   = useState<Target | null>(null);
  const [yearlyProgress, setYearlyProgress] = useState<TargetProgress | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, tgt, prog, movRes, serRes, bookRes, poeRes, jrnRes] = await Promise.all([
          get_dashboard_stats_query(),
          get_my_target_query(new Date().getFullYear()),
          get_target_progress_query(new Date().getFullYear()),
          get_my_movies_query({ limit: 8 }),
          get_my_series_query({ limit: 8 }),
          get_my_books_query({ limit: 8 }),
          get_my_poems_query({ limit: 8 }),
          get_my_journals_query({ limit: 1, page: 1 }),
        ]);
        setStats(s);
        setJournalCount(jrnRes.total_count);
        setYearlyTarget(tgt);
        setYearlyProgress(prog);

        const all: MediaItem[] = [
          ...movRes.movies.map(m => ({ ...m, type: "Movie"  as const, cover: get_full_image_url(m.poster_image, "movie") })),
          ...serRes.series.map(s => ({ ...s, type: "Series" as const, cover: get_full_image_url(s.poster_image, "series") })),
          ...bookRes.books.map(b => ({ ...b, type: "Book"   as const, cover: get_full_image_url(b.cover_image, "book") })),
          ...poeRes.poems.map(p => ({ ...p, type: "Poem"   as const, cover: get_full_image_url(p.cover_image, "poem") })),
        ].sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());

        setRecentItems(all.slice(0, 6));
        setInProgressItems(
          all.filter(i => ["watching", "reading", "draft", "rewatching"].includes(i.status)).slice(0, 5)
        );
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      }
    })();
  }, []);

  const totalItems = useMemo(() =>
    (stats?.movies ?? 0) + (stats?.series ?? 0) + (stats?.books ?? 0) +
    (stats?.poems ?? 0) + journalCount,
    [stats, journalCount]
  );

  const statCards = [
    { label: "Movies",   count: stats?.movies          ?? 0, icon: Film,       color: "text-blue-400",    bg: "bg-blue-500/10",    border: "hover:border-blue-500/40",   to: "/dashboard/movies"  },
    { label: "Series",   count: stats?.series          ?? 0, icon: Tv,         color: "text-violet-400",  bg: "bg-violet-500/10",  border: "hover:border-violet-500/40", to: "/dashboard/series"  },
    { label: "Books",    count: stats?.books           ?? 0, icon: BookOpen,   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/40",to: "/dashboard/books"   },
    { label: "Poetry",   count: stats?.poems           ?? 0, icon: ScrollText, color: "text-amber-400",   bg: "bg-amber-500/10",   border: "hover:border-amber-500/40",  to: "/dashboard/poetry"  },
    { label: "Journal",  count: journalCount,                 icon: PenLine,    color: "text-pink-400",    bg: "bg-pink-500/10",    border: "hover:border-pink-500/40",   to: "/dashboard/journal" },
  ];

  const goalCats = [
    { key: "movies" as const,  label: "Movies",     bar: "bg-blue-500" },
    { key: "series" as const,  label: "Web Series", bar: "bg-violet-500" },
    { key: "books"  as const,  label: "Books",      bar: "bg-emerald-500" },
    { key: "poems"  as const,  label: "Poetry",     bar: "bg-amber-500" },
  ].filter(c => yearlyTarget?.[c.key]);

  const hasGoals = goalCats.length > 0;
  const year = new Date().getFullYear();

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-text-secondary text-sm">{fmtDate()}</p>
            <h1 className="text-text-primary text-3xl font-black tracking-tight">
              {timeGreeting()}, {user?.first_name || user?.user_name || "there"} 👋
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              {totalItems > 0
                ? `You've logged ${totalItems} entr${totalItems === 1 ? "y" : "ies"} across your collection.`
                : "Start building your personal media universe."}
            </p>
          </div>

          {/* Add button */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsAddOpen(v => !v)}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-background px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={18} strokeWidth={3} />
              Add To Collection
            </button>
            {isAddOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAddOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-200">
                  {[
                    { to: "/dashboard/movies/add-movie",  icon: Film,       label: "Add Movie",        color: "text-blue-400",   bg: "bg-blue-500/10" },
                    { to: "/dashboard/series/add-series", icon: Tv,         label: "Add Web Series",   color: "text-violet-400", bg: "bg-violet-500/10" },
                    { to: "/dashboard/books/add-book",    icon: BookOpen,   label: "Add Book",         color: "text-emerald-400",bg: "bg-emerald-500/10" },
                    { to: "/dashboard/poetry/add-poem",   icon: ScrollText, label: "Compose Poem",     color: "text-amber-400",  bg: "bg-amber-500/10" },
                    { to: "/dashboard/journal",           icon: PenLine,    label: "Add Journal Entry",color: "text-pink-400",   bg: "bg-pink-500/10" },
                  ].map(({ to, icon: Icon, label, color, bg }) => (
                    <Link key={to} to={to} onClick={() => setIsAddOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg transition-colors">
                      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                        <Icon size={14} className={color} />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{label}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <Link key={s.label} to={s.to}
              className={`group bg-surface border border-border ${s.border} rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-md`}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-text-primary text-3xl font-black leading-none">{s.count}</p>
                <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
              <ArrowRight size={14} className="text-text-secondary/20 group-hover:text-accent group-hover:translate-x-0.5 transition-all mt-auto" />
            </Link>
          ))}
        </div>

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="xl:col-span-8 flex flex-col gap-6">

            {/* Yearly Goals */}
            {hasGoals && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-text-primary text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <TargetIcon size={15} className="text-accent" />
                    {year} Goals
                  </h2>
                  <Link to="/dashboard/target" className="flex items-center gap-1 text-accent text-xs font-bold hover:underline">
                    View all <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {goalCats.map(({ key, label, bar }) => {
                    const goal = yearlyTarget![key]!;
                    const done = yearlyProgress?.[key] ?? 0;
                    const pct  = Math.min(100, Math.round((done / goal) * 100));
                    return (
                      <div key={key} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-text-primary text-sm font-semibold">{label}</span>
                          <span className="text-text-secondary text-xs tabular-nums">
                            <span className="text-text-primary font-bold">{done}</span> / {goal}
                          </span>
                        </div>
                        <div className="h-2 bg-bg border border-border rounded-full overflow-hidden">
                          <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-text-secondary/50 text-[10px]">{pct}% complete</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In Progress */}
            {inProgressItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-text-primary text-sm font-black uppercase tracking-widest">Continue Watching / Reading</h2>
                  <span className="text-text-secondary/40 text-[10px] font-bold uppercase tracking-widest">{inProgressItems.length} active</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-1 custom-scrollbar">
                  {inProgressItems.map((item, i) => {
                    const s = TYPE_STYLE[item.type];
                    return (
                      <Link key={i} to={itemPath(item)}
                        className="group shrink-0 w-[130px] flex flex-col gap-2.5">
                        <div className="w-full aspect-[2/3] rounded-xl overflow-hidden border border-border/50 bg-surface relative">
                          {item.cover
                            ? <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : <div className={`w-full h-full ${s.bg} flex items-center justify-center`}><Layers size={28} className={s.text} /></div>
                          }
                          {/* Resume overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                              <Play size={14} className="text-background fill-background ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${s.badge} mb-1`}>{item.type}</span>
                          <p className="text-text-primary text-xs font-semibold leading-tight line-clamp-2">{item.title}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent additions */}
            {recentItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-text-primary text-sm font-black uppercase tracking-widest">New Additions</h2>
                </div>
                <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
                  {recentItems.map((item, i) => {
                    const s = TYPE_STYLE[item.type];
                    return (
                      <Link key={i} to={itemPath(item)}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg/50 transition-colors group">
                        <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-border/50 bg-bg">
                          {item.cover
                            ? <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                            : <div className={`w-full h-full ${s.bg} flex items-center justify-center`}><Layers size={14} className={s.text} /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary text-sm font-semibold truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-[10px] font-bold ${s.text}`}>{item.type}</span>
                            <span className="text-text-secondary/30">·</span>
                            <span className="text-[10px] font-semibold text-text-secondary capitalize">{item.status.replace(/_/g, " ")}</span>
                            <span className="text-text-secondary/30">·</span>
                            <span className="text-text-secondary/60 text-[10px]">
                              {formatDate(item.created_at, { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                        {item.rating ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <Star size={11} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-text-primary text-xs font-bold">{item.rating}</span>
                          </div>
                        ) : (
                          <ChevronRight size={14} className="text-text-secondary/20 group-hover:text-accent transition-colors shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!inProgressItems.length && !recentItems.length && (
              <div className="bg-surface border border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Sparkles size={28} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-text-primary font-bold">Your collection is empty</h3>
                  <p className="text-text-secondary text-sm mt-1">Start adding movies, books, series or poems.</p>
                </div>
                <button onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-background px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                  <Plus size={16} />
                  Add Your First Item
                </button>
              </div>
            )}
          </div>

          {/* ── Right column ────────────────────────────────────────────── */}
          <div className="xl:col-span-4 flex flex-col gap-4">

            {/* Quick navigation */}
            <div className="bg-surface border border-border rounded-2xl p-2 flex flex-col gap-0.5">
              {[
                { to: "/dashboard/movies",  icon: Film,       label: "Movies",    color: "text-blue-400",    bg: "bg-blue-500/10" },
                { to: "/dashboard/series",  icon: Tv,         label: "Series",    color: "text-violet-400",  bg: "bg-violet-500/10" },
                { to: "/dashboard/books",   icon: BookOpen,   label: "Books",     color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { to: "/dashboard/poetry",  icon: ScrollText, label: "Poetry",    color: "text-amber-400",   bg: "bg-amber-500/10" },
                { to: "/dashboard/journal", icon: PenLine,    label: "Journal",   color: "text-pink-400",    bg: "bg-pink-500/10" },
                { to: "/dashboard/target",  icon: TargetIcon, label: "Goals",     color: "text-accent",      bg: "bg-accent/10" },
              ].map(({ to, icon: Icon, label, color, bg }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg transition-colors group">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={13} className={color} />
                  </div>
                  <span className="text-text-secondary text-sm font-medium flex-1 group-hover:text-text-primary transition-colors">{label}</span>
                  <ChevronRight size={13} className="text-text-secondary/20 group-hover:text-accent transition-colors" />
                </Link>
              ))}
            </div>

            {/* Premium card */}
            <div className="bg-gradient-to-br from-accent to-accent/70 rounded-2xl p-6 flex flex-col gap-3 shadow-lg shadow-accent/20">
              <div className="w-9 h-9 rounded-xl bg-background/20 flex items-center justify-center">
                <Sparkles size={16} className="text-background" />
              </div>
              <div>
                <h3 className="text-background text-base font-black">CoreLog Premium</h3>
                <p className="text-background/70 text-xs mt-1 leading-relaxed">
                  Advanced stats, public profile, and API integrations.
                </p>
              </div>
              <Link to="/pricing"
                className="mt-1 w-full py-2.5 bg-background text-accent text-center rounded-xl text-sm font-bold hover:bg-background/90 transition-colors">
                Explore Plans
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
