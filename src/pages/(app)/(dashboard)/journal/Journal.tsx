import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilterDropdown from "../../../../@components/@smart/FilterDropdown";
import {
  Calendar as CalendarIcon,
  Search,
  Plus,
  Star,
  Tag,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Quote,
  BookOpen,
  MapPin,
  Clock,
  Loader2,
  RefreshCw,
  FileText,
  User,
  DollarSign,
  Plane,
  Heart,
  Briefcase,
  Sparkles,
  Moon,
  Lightbulb,
  MoreHorizontal,
} from "lucide-react";
import { get_my_journals_query, type Journal } from "../../../../@apis/journal";
import { get_full_image_url } from "../../../../@utils/api.utils";

// ── Mood & Type config ───────────────────────────────────────────────────────
const MOOD_MAP: Record<string, { emoji: string; color: string }> = {
  happy:       { emoji: "😊", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  calm:        { emoji: "😌", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  sad:         { emoji: "😔", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  anxious:     { emoji: "😟", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  excited:     { emoji: "🤩", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  grateful:    { emoji: "🙏", color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  angry:       { emoji: "😤", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  melancholic: { emoji: "🌧️", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  hopeful:     { emoji: "🌱", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  overwhelmed: { emoji: "😵", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  content:     { emoji: "☺️", color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  confused:    { emoji: "🤔", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

const TYPE_MAP: Record<string, { icon: React.ElementType; label: string; badge: string; dot: string }> = {
  personal:  { icon: User,         label: "Personal",  badge: "bg-violet-500/10 border-violet-500/20 text-violet-400",  dot: "bg-violet-500" },
  plan:      { icon: FileText,     label: "Plan",      badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",        dot: "bg-blue-500" },
  finance:   { icon: DollarSign,   label: "Finance",   badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", dot: "bg-emerald-500" },
  travel:    { icon: Plane,        label: "Travel",    badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",     dot: "bg-amber-500" },
  health:    { icon: Heart,        label: "Health",    badge: "bg-rose-500/10 border-rose-500/20 text-rose-400",        dot: "bg-rose-500" },
  work:      { icon: Briefcase,    label: "Work",      badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",        dot: "bg-cyan-500" },
  gratitude: { icon: Sparkles,     label: "Gratitude", badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400", dot: "bg-yellow-500" },
  dream:     { icon: Moon,         label: "Dream",     badge: "bg-purple-500/10 border-purple-500/20 text-purple-400", dot: "bg-purple-500" },
  ideas:     { icon: Lightbulb,    label: "Ideas",     badge: "bg-orange-500/10 border-orange-500/20 text-orange-400", dot: "bg-orange-500" },
  other:     { icon: MoreHorizontal, label: "Other",   badge: "bg-slate-500/10 border-slate-500/20 text-slate-400",    dot: "bg-slate-500" },
};

const FEED_PAGE_SIZE = 12;

const stripHtml = (html: string) => {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent || el.innerText || "";
};

const fmt12h = (time?: string) => {
  if (!time) return "";
  const [hh, mm] = time.split(":").map(Number);
  const ampm = hh >= 12 ? "PM" : "AM";
  return `${String(hh % 12 || 12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${ampm}`;
};

// ── Main component ───────────────────────────────────────────────────────────
const Journal = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [search, setSearch]           = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [view, setView]               = useState<"feed" | "calendar" | "trends">("feed");
  const [visibleCount, setVisibleCount] = useState(FEED_PAGE_SIZE);
  const [calMonth, setCalMonth]       = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() };
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await get_my_journals_query({ limit: 200, page: 1 });
      setJournals(res.journals);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load journals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (typeDropRef.current && !typeDropRef.current.contains(e.target as Node)) setTypeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return journals.filter((j) => {
      if (q && !j.title.toLowerCase().includes(q) && !stripHtml(j.content).toLowerCase().includes(q) && !j.tags.some(t => t.toLowerCase().includes(q))) return false;
      if (selectedMood && j.mood !== selectedMood) return false;
      if (selectedType && j.journal_type !== selectedType) return false;
      return true;
    });
  }, [journals, search, selectedMood, selectedType]);

  const sortedFiltered = useMemo(() =>
    [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [filtered]
  );

  const groupedEntries = useMemo(() => {
    const visible = sortedFiltered.slice(0, visibleCount);
    const groups: { key: string; label: string; entries: typeof visible }[] = [];
    const map = new Map<string, typeof visible>();
    visible.forEach((j) => {
      const d = new Date(j.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) {
        const arr: typeof visible = [];
        map.set(key, arr);
        groups.push({ key, label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }), entries: arr });
      }
      map.get(key)!.push(j);
    });
    return groups;
  }, [sortedFiltered, visibleCount]);

  // Mood summary
  const moodCounts = useMemo(() =>
    journals.reduce((acc, j) => { if (j.mood) acc[j.mood] = (acc[j.mood] || 0) + 1; return acc; }, {} as Record<string, number>),
    [journals]
  );
  const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const moodTotal = topMoods.reduce((s, [, c]) => s + c, 0);

  // Calendar — first entry per day (for photo + title preview)
  const calEntries = useMemo(() => {
    const map = new Map<number, Journal>();
    journals.forEach((j) => {
      const d = new Date(j.date);
      if (d.getFullYear() === calMonth.year && d.getMonth() === calMonth.month) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, j);
      }
    });
    return map;
  }, [journals, calMonth]);

  const firstDow = new Date(calMonth.year, calMonth.month, 1).getDay();
  const daysInMonth = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
  const monthLabel = new Date(calMonth.year, calMonth.month).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const prevMonth = () => setCalMonth(p => { const d = new Date(p.year, p.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  const nextMonth = () => setCalMonth(p => { const d = new Date(p.year, p.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; });

  // Trends data
  const writingByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    journals.forEach((j) => {
      const key = new Date(j.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).slice(-6);
  }, [journals]);
  const maxCount = Math.max(...writingByMonth.map(([, c]) => c), 1);

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-text-primary text-3xl font-bold tracking-tight">Personal Journal</h1>
            <p className="text-text-secondary text-sm mt-1">
              {loading ? "Loading entries…" : `${journals.length} entr${journals.length === 1 ? "y" : "ies"} · Reflect, record, and remember.`}
            </p>
          </div>
          <Link
            to="/dashboard/journal/add-entry"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-background px-6 py-3 rounded-xl text-sm font-bold shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] w-fit"
          >
            <Plus size={18} strokeWidth={3} />
            Write New Entry
          </Link>
        </div>

        {/* ── Layout Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* View switcher — vertical list on desktop, compact icon cards on mobile */}
            <div className="bg-surface border border-border rounded-2xl p-2">
              {/* Mobile: 3-column icon cards */}
              <div className="grid grid-cols-3 gap-1 lg:hidden">
                {([
                  { id: "feed",     label: "Feed",     icon: BookOpen },
                  { id: "calendar", label: "Calendar", icon: CalendarIcon },
                  { id: "trends",   label: "Insights", icon: TrendingUp },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl text-xs font-medium transition-colors ${
                      view === id ? "bg-accent/10 text-accent font-bold" : "text-text-secondary hover:text-text-primary hover:bg-bg/50"
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Desktop: vertical list */}
              <div className="hidden lg:flex flex-col gap-1">
                {([
                  { id: "feed",     label: "Journal Feed", icon: BookOpen },
                  { id: "calendar", label: "Calendar",     icon: CalendarIcon },
                  { id: "trends",   label: "Insights",     icon: TrendingUp },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      view === id ? "bg-accent/10 text-accent font-bold" : "text-text-secondary hover:text-text-primary hover:bg-bg/50"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter — dropdown on mobile, full list on desktop */}
            <div className="lg:hidden">
              <FilterDropdown
                label="Filter by Type"
                options={Object.keys(TYPE_MAP) as string[]}
                selected={selectedType ? [selectedType] : []}
                onSelect={(val) => setSelectedType(selectedType === val ? null : val)}
                renderOption={(val) => TYPE_MAP[val]?.label ?? val}
              />
            </div>

            <div className="hidden lg:flex bg-surface border border-border rounded-2xl p-4 flex-col gap-3">
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Filter by Type</p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedType(null)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${!selectedType ? "bg-accent/10 text-accent" : "text-text-secondary hover:text-text-primary hover:bg-bg"}`}
                >
                  All types
                </button>
                {Object.entries(TYPE_MAP).map(([val, { icon: Icon, label, badge }]) => (
                  <button
                    key={val}
                    onClick={() => setSelectedType(selectedType === val ? null : val)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      selectedType === val ? `${badge} border-current` : "border-transparent text-text-secondary hover:text-text-primary hover:bg-bg"
                    }`}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood summary */}
            {topMoods.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
                <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Monthly Vibe</p>
                <div className="flex flex-col gap-2">
                  {topMoods.map(([mood, count]) => {
                    const m = MOOD_MAP[mood];
                    return (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                        className={`flex items-center gap-2 text-xs transition-colors rounded-lg px-2 py-1.5 ${selectedMood === mood ? "bg-accent/10 text-accent" : "text-text-secondary hover:text-text-primary"}`}
                      >
                        <span>{m?.emoji ?? "💭"}</span>
                        <span className="flex-1 capitalize text-left">{mood}</span>
                        <div className="w-16 h-1.5 bg-bg rounded-full overflow-hidden">
                          <div className="h-full bg-accent/50 rounded-full" style={{ width: `${(count / moodTotal) * 100}%` }} />
                        </div>
                        <span className="text-[10px] w-4 text-right">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quote — desktop only (mobile version is rendered after main content) */}
            <div className="hidden lg:block bg-gradient-to-br from-surface to-bg border border-border rounded-2xl p-6 relative overflow-hidden group">
              <Quote className="absolute -top-2 -right-2 text-accent/5 opacity-20" size={100} />
              <div className="relative z-10">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Quote size={14} className="text-accent" />
                </div>
                <p className="text-text-primary text-sm italic leading-relaxed">
                  "Journaling is like whispering to oneself and listening at the same time."
                </p>
                <p className="text-text-secondary text-[10px] mt-3 font-bold uppercase tracking-widest">— Mina Murray</p>
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="lg:col-span-9 flex flex-col gap-6">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
                <input
                  type="text"
                  placeholder="Search entries, tags or thoughts…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setVisibleCount(FEED_PAGE_SIZE); }}
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <button
                onClick={load}
                className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <RefreshCw size={15} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-24 gap-3 text-text-secondary">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Loading entries…</span>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
                <p className="text-rose-400 text-sm font-medium">{error}</p>
                <button onClick={load} className="text-xs font-bold text-accent hover:underline">Try again</button>
              </div>
            )}

            {/* Feed view */}
            {!loading && !error && view === "feed" && (
              <>
                {filtered.length === 0 ? (
                  <div className="bg-surface border border-border rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <BookOpen size={36} />
                    </div>
                    <div>
                      <h3 className="text-text-primary text-lg font-bold">
                        {journals.length === 0 ? "No entries yet" : "No matching entries"}
                      </h3>
                      <p className="text-text-secondary text-sm mt-1.5">
                        {journals.length === 0 ? "Your journal is empty. Start writing your first entry." : "Try adjusting your search or filters."}
                      </p>
                    </div>
                    {journals.length === 0 && (
                      <Link to="/dashboard/journal/add-entry" className="bg-accent text-background px-6 py-2.5 rounded-xl font-bold text-sm">
                        Write First Entry
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {groupedEntries.map(({ key, label, entries }) => (
                      <div key={key} className="flex flex-col gap-3">

                        {/* Month heading */}
                        <div className="flex items-center gap-3">
                          <h2 className="text-text-primary text-sm font-black uppercase tracking-widest shrink-0">{label}</h2>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-text-secondary/50 text-[10px] shrink-0">{entries.length} entr{entries.length === 1 ? "y" : "ies"}</span>
                        </div>

                        {entries.map((entry) => {
                      const type = TYPE_MAP[entry.journal_type] ?? TYPE_MAP.other;
                      const mood = MOOD_MAP[entry.mood ?? ""];
                      const entryDate = new Date(entry.date);
                      const plain = stripHtml(entry.content);
                      const TypeIcon = type.icon;

                      return (
                        <Link key={entry._id} to={`/dashboard/journal/${entry._id}`} className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all shadow-sm block">
                          <div className="p-5 sm:p-7 flex gap-5">
                            {/* Date column */}
                            <div className="shrink-0 flex flex-col items-center gap-2 w-10 text-center">
                              <span className="text-text-secondary text-[9px] font-bold uppercase tracking-wider leading-none">
                                {entryDate.toLocaleDateString("en-IN", { month: "short" })}
                              </span>
                              <span className="text-text-primary text-2xl font-black leading-none">{entryDate.getDate()}</span>
                              {mood && (
                                <span className={`text-base w-9 h-9 flex items-center justify-center rounded-xl border ${mood.color}`}>
                                  {mood.emoji}
                                </span>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-text-primary text-base sm:text-lg font-bold leading-tight group-hover:text-accent transition-colors line-clamp-1">
                                  {entry.title}
                                </h3>
                                {entry.is_favorite && (
                                  <span className="text-yellow-500 shrink-0"><Star size={15} fill="currentColor" /></span>
                                )}
                              </div>

                              {entry.description && (
                                <p className="text-text-secondary/70 text-xs italic">{entry.description}</p>
                              )}

                              <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">{plain}</p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                {entry.location && (
                                  <span className="flex items-center gap-1 text-[11px] text-text-secondary/60">
                                    <MapPin size={10} />
                                    {entry.location}
                                  </span>
                                )}
                                {(entry as Journal & { time?: string }).time && (
                                  <span className="flex items-center gap-1 text-[11px] text-text-secondary/60">
                                    <Clock size={10} />
                                    {fmt12h((entry as Journal & { time?: string }).time)}
                                  </span>
                                )}
                              </div>

                              {entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {entry.tags.slice(0, 5).map((tag) => (
                                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-bg border border-border rounded-full text-[10px] text-text-secondary">
                                      <Tag size={8} />
                                      {tag}
                                    </span>
                                  ))}
                                  {entry.tags.length > 5 && (
                                    <span className="text-[10px] text-text-secondary/50">+{entry.tags.length - 5} more</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right column — type badge + photo grid */}
                            <div className="shrink-0 flex flex-col items-end gap-2 min-w-[80px]">
                              {/* Type badge */}
                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${type.badge}`}>
                                <TypeIcon size={9} />
                                {type.label}
                              </span>

                              {/* WhatsApp-style photo grid */}
                              {entry.photos.length > 0 && (() => {
                                const photos = entry.photos;
                                const count = Math.min(photos.length, 4);
                                const extra = photos.length - 4;

                                // 1 photo — full square
                                if (count === 1) return (
                                  <div className="w-[76px] h-[76px] rounded-lg overflow-hidden">
                                    <img src={get_full_image_url(photos[0], "user")} alt="" className="w-full h-full object-cover" />
                                  </div>
                                );

                                // 2 photos — side by side
                                if (count === 2) return (
                                  <div className="flex gap-0.5 w-[76px] h-[76px]">
                                    {photos.slice(0, 2).map((p, i) => (
                                      <div key={i} className="flex-1 overflow-hidden rounded-sm">
                                        <img src={get_full_image_url(p, "user")} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                );

                                // 3 photos — one left, two stacked right
                                if (count === 3) return (
                                  <div className="flex gap-0.5 w-[76px] h-[76px]">
                                    <div className="flex-1 overflow-hidden rounded-sm">
                                      <img src={get_full_image_url(photos[0], "user")} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-0.5">
                                      {photos.slice(1, 3).map((p, i) => (
                                        <div key={i} className="flex-1 overflow-hidden rounded-sm">
                                          <img src={get_full_image_url(p, "user")} alt="" className="w-full h-full object-cover" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );

                                // 4+ photos — 2×2 grid, +N on last
                                return (
                                  <div className="grid grid-cols-2 gap-0.5 w-[76px] h-[76px]">
                                    {photos.slice(0, 4).map((p, i) => (
                                      <div key={i} className="relative overflow-hidden rounded-sm">
                                        <img src={get_full_image_url(p, "user")} alt="" className="w-full h-full object-cover" />
                                        {i === 3 && extra > 0 && (
                                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white text-[10px] font-bold">+{extra}</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                      </div>
                    ))}

                    {visibleCount < sortedFiltered.length && (
                      <button
                        onClick={() => setVisibleCount((v) => v + FEED_PAGE_SIZE)}
                        className="w-full py-3 rounded-xl border border-border bg-surface text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                      >
                        Load more ({sortedFiltered.length - visibleCount} remaining)
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Calendar view */}
            {!loading && !error && view === "calendar" && (
              <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-text-primary text-lg font-bold flex items-center gap-2">
                    <CalendarIcon size={20} className="text-accent" />
                    {monthLabel}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 rounded-xl bg-bg border border-border text-text-secondary hover:text-text-primary transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextMonth} className="p-2 rounded-xl bg-bg border border-border text-text-secondary hover:text-text-primary transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-border rounded-2xl overflow-hidden border border-border">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="bg-surface py-3 text-center text-[10px] font-bold text-text-secondary uppercase tracking-wider">{d}</div>
                  ))}
                  {Array.from({ length: firstDow }).map((_, i) => (
                    <div key={`e${i}`} className="bg-surface aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const entry = calEntries.get(day);
                    const has = !!entry;
                    const photo = entry?.photos?.[0];
                    const isToday = new Date().getDate() === day &&
                      new Date().getMonth() === calMonth.month &&
                      new Date().getFullYear() === calMonth.year;
                    return (
                      <div key={day} onClick={() => has && entry && navigate(`/dashboard/journal/${entry._id}`)} className={`bg-surface aspect-square relative overflow-hidden transition-colors ${has ? "hover:brightness-110 cursor-pointer" : ""}`}>
                        {photo && (
                          <img src={get_full_image_url(photo, "user")} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                        )}
                        <div className="relative z-10 p-1.5 flex flex-col h-full">
                          <span className={`text-[11px] font-bold leading-none ${isToday ? "text-accent" : has ? "text-text-primary" : "text-text-secondary/30"}`}>
                            {day}
                          </span>
                          {has && (
                            <p className="text-[8px] sm:text-[9px] text-text-primary/70 mt-1 line-clamp-2 leading-tight break-words">
                              {entry.title}
                            </p>
                          )}
                          {has && !photo && (
                            <div className="mt-auto self-end w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center gap-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> Entry written</span>
                  <span className="flex items-center gap-1.5"><span className="text-accent font-black">·</span> Today</span>
                  <span className="ml-auto">{calEntries.size} entr{calEntries.size === 1 ? "y" : "ies"} this month</span>
                </div>
              </div>
            )}

            {/* Insights / Trends view */}
            {!loading && !error && view === "trends" && (
              <div className="flex flex-col gap-5">
                {journals.length < 5 ? (
                  <div className="bg-surface border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse">
                      <TrendingUp size={40} />
                    </div>
                    <div className="max-w-sm">
                      <h3 className="text-text-primary text-lg font-bold">Keep writing to unlock insights</h3>
                      <p className="text-text-secondary text-sm mt-2">You need at least 5 entries to see meaningful patterns. You have {journals.length} so far.</p>
                    </div>
                    <Link to="/dashboard/journal/add-entry" className="bg-accent text-background px-6 py-2.5 rounded-xl font-bold text-sm">Write an Entry</Link>
                  </div>
                ) : (
                  <>
                    {/* Entry frequency */}
                    {writingByMonth.length > 0 && (
                      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5">
                        <h3 className="text-text-primary text-sm font-bold">Writing Frequency</h3>
                        <div className="flex items-end gap-2 h-28">
                          {writingByMonth.map(([label, count]) => (
                            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                              <span className="text-text-secondary text-[10px]">{count}</span>
                              <div
                                className="w-full bg-accent/70 rounded-t-md transition-all"
                                style={{ height: `${(count / maxCount) * 80}px` }}
                              />
                              <span className="text-text-secondary/50 text-[9px]">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mood breakdown */}
                    {topMoods.length > 0 && (
                      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
                        <h3 className="text-text-primary text-sm font-bold">Mood Breakdown</h3>
                        <div className="flex flex-col gap-2.5">
                          {topMoods.map(([mood, count]) => {
                            const m = MOOD_MAP[mood];
                            return (
                              <div key={mood} className="flex items-center gap-3">
                                <span className="text-base w-6 text-center">{m?.emoji ?? "💭"}</span>
                                <span className="text-text-secondary text-xs w-24 capitalize">{mood}</span>
                                <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                                  <div className="h-full bg-accent/60 rounded-full" style={{ width: `${(count / moodTotal) * 100}%` }} />
                                </div>
                                <span className="text-text-secondary/60 text-xs w-8 text-right">{Math.round((count / moodTotal) * 100)}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Total Entries", value: journals.length },
                        { label: "Favourites", value: journals.filter(j => j.is_favorite).length },
                        { label: "With Photos", value: journals.filter(j => j.photos.length > 0).length },
                        { label: "Unique Tags", value: [...new Set(journals.flatMap(j => j.tags))].length },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-surface border border-border rounded-2xl p-4 text-center">
                          <p className="text-text-primary text-2xl font-black">{value}</p>
                          <p className="text-text-secondary text-xs mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

          {/* Quote — mobile only, shown after main content */}
          <div className="lg:hidden bg-gradient-to-br from-surface to-bg border border-border rounded-2xl p-6 relative overflow-hidden">
            <Quote className="absolute -top-2 -right-2 text-accent/5 opacity-20" size={100} />
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Quote size={14} className="text-accent" />
              </div>
              <p className="text-text-primary text-sm italic leading-relaxed">
                "Journaling is like whispering to oneself and listening at the same time."
              </p>
              <p className="text-text-secondary text-[10px] mt-3 font-bold uppercase tracking-widest">— Mina Murray</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
