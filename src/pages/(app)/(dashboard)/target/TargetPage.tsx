import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Target,
    Film,
    Tv,
    BookOpen,
    ScrollText,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Save,
    Loader2,
    X,
} from "lucide-react";
import {
    get_my_target_query,
    get_target_progress_query,
    set_target_mutation,
    delete_target_mutation,
    type Target as TargetType,
    type TargetProgress,
} from "../../../../@apis/targets";
import { toast } from "react-toast";

// ── Progress Ring ───────────────────────────────────────────────────────────
const ProgressRing = ({ pct, colorClass, size = 110 }: { pct: number; colorClass: string; size?: number }) => {
    const r = (size / 2) - 10;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.min(pct, 100) / 100);
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={9} className="stroke-border" />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={9}
                className={colorClass}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
        </svg>
    );
};

// ── Category config ──────────────────────────────────────────────────────────
type CategoryKey = "movies" | "series" | "books" | "poems";

const CATEGORIES: {
    key: CategoryKey;
    label: string;
    actionLabel: string;
    icon: React.ElementType;
    text: string;
    bg: string;
    ring: string;
    border: string;
    to: string;
}[] = [
    { key: "movies",  label: "Movies",     actionLabel: "watched",  icon: Film,       text: "text-blue-500",    bg: "bg-blue-500/10",    ring: "stroke-blue-500",    border: "border-blue-500/20",    to: "/dashboard/movies"  },
    { key: "series",  label: "Web Series", actionLabel: "watched",  icon: Tv,         text: "text-purple-500",  bg: "bg-purple-500/10",  ring: "stroke-purple-500",  border: "border-purple-500/20",  to: "/dashboard/series"  },
    { key: "books",   label: "Books",      actionLabel: "read",     icon: BookOpen,   text: "text-emerald-500", bg: "bg-emerald-500/10", ring: "stroke-emerald-500", border: "border-emerald-500/20", to: "/dashboard/books"   },
    { key: "poems",   label: "Poetry",     actionLabel: "written",  icon: ScrollText, text: "text-amber-500",   bg: "bg-amber-500/10",   ring: "stroke-amber-500",   border: "border-amber-500/20",   to: "/dashboard/poetry"  },
];

// ── Component ────────────────────────────────────────────────────────────────
const TargetPage = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);

    const [target, setTarget] = useState<TargetType | null>(null);
    const [progress, setProgress] = useState<TargetProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [form, setForm] = useState({ movies: "", series: "", books: "", poems: "" });

    const fetchData = async (y: number) => {
        setIsLoading(true);
        try {
            const [t, p] = await Promise.all([
                get_my_target_query(y),
                get_target_progress_query(y),
            ]);
            setTarget(t);
            setProgress(p);
        } catch {
            toast.error("Failed to load targets");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(year); }, [year]);

    const openModal = () => {
        setForm({
            movies: String(target?.movies ?? ""),
            series: String(target?.series ?? ""),
            books:  String(target?.books  ?? ""),
            poems:  String(target?.poems  ?? ""),
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const parse = (v: string) => { const n = parseInt(v); return isNaN(n) || n < 0 ? undefined : n; };
        const movies = parse(form.movies);
        const series = parse(form.series);
        const books  = parse(form.books);
        const poems  = parse(form.poems);

        if (!movies && !series && !books && !poems) {
            toast.error("Set at least one goal");
            return;
        }
        setIsSaving(true);
        try {
            const updated = await set_target_mutation({ year, movies, series, books, poems });
            setTarget(updated);
            setIsModalOpen(false);
            toast.success("Goals saved");
        } catch {
            toast.error("Failed to save goals");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!target?._id) return;
        setIsDeleting(true);
        try {
            await delete_target_mutation(target._id);
            setTarget(null);
            toast.success("Goals cleared");
        } catch {
            toast.error("Failed to clear goals");
        } finally {
            setIsDeleting(false);
        }
    };

    const hasTarget = target && (target.movies || target.series || target.books || target.poems);

    return (
        <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Target size={20} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-text-primary text-2xl font-bold tracking-tight">Yearly Goals</h1>
                            <p className="text-text-secondary text-sm">Track what you want to watch, read & write each year.</p>
                        </div>
                    </div>

                    {/* Year selector */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => setYear(y => y - 1)}
                            className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/30 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-text-primary font-bold text-lg w-16 text-center">{year}</span>
                        <button onClick={() => setYear(y => y + 1)} disabled={year >= currentYear}
                            className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 size={32} className="animate-spin text-accent" />
                    </div>
                ) : !hasTarget ? (
                    // ── Empty State ──
                    <div className="flex flex-col items-center justify-center gap-6 py-20 bg-surface border border-border rounded-3xl">
                        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                            <Target size={36} className="text-accent" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-text-primary text-xl font-bold">No goals set for {year}</h2>
                            <p className="text-text-secondary text-sm mt-1 max-w-xs mx-auto">
                                Set how many movies, series, books and poems you want to log this year.
                            </p>
                        </div>
                        <button onClick={openModal}
                            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-background px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all">
                            <Target size={16} />
                            Set {year} Goals
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ── Action bar ── */}
                        <div className="flex items-center justify-between">
                            <p className="text-text-secondary text-sm">
                                Your targets for <span className="text-text-primary font-bold">{year}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={openModal}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 text-sm font-semibold transition-colors">
                                    <Pencil size={14} />
                                    Edit Goals
                                </button>
                                <button onClick={handleDelete} disabled={isDeleting}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-transparent text-error hover:bg-error/10 hover:border-error/20 text-sm font-semibold transition-colors">
                                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* ── Goal Cards ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {CATEGORIES.map(({ key, label, actionLabel, icon: Icon, text, bg, ring, border, to }) => {
                                const goal = target?.[key];
                                const done = progress?.[key] ?? 0;
                                const pct = goal ? Math.min(100, Math.round((done / goal) * 100)) : 0;

                                return (
                                    <div key={key} className={`bg-surface border ${border} rounded-3xl p-6 flex gap-6 items-center`}>
                                        {/* Ring */}
                                        <div className="relative shrink-0">
                                            <ProgressRing pct={pct} colorClass={ring} size={110} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-text-primary text-xl font-bold leading-none">{pct}%</span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                                                <Icon size={18} className={text} />
                                            </div>
                                            <h3 className="text-text-primary font-bold text-lg leading-tight">{label}</h3>
                                            {goal ? (
                                                <>
                                                    <p className={`${text} text-sm font-bold`}>
                                                        {done} <span className="text-text-secondary font-normal">/ {goal} {actionLabel}</span>
                                                    </p>
                                                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-500 ${ring.replace("stroke-", "bg-")}`}
                                                            style={{ width: `${pct}%` }} />
                                                    </div>
                                                    {pct >= 100 && (
                                                        <span className={`text-xs font-bold ${text}`}>🎉 Goal reached!</span>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-text-secondary text-sm">No goal set</p>
                                            )}
                                            <Link to={to} className={`text-xs font-bold ${text} hover:underline mt-1`}>
                                                View {label} →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Summary bar ── */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h3 className="text-text-secondary text-[10px] font-bold uppercase tracking-widest mb-4">Overall Progress</h3>
                            <div className="flex flex-col gap-3">
                                {CATEGORIES.map(({ key, label, ring, text }) => {
                                    const goal = target?.[key];
                                    if (!goal) return null;
                                    const done = progress?.[key] ?? 0;
                                    const pct = Math.min(100, Math.round((done / goal) * 100));
                                    return (
                                        <div key={key} className="flex items-center gap-3">
                                            <span className="text-text-secondary text-xs w-20 shrink-0">{label}</span>
                                            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-500 ${ring.replace("stroke-", "bg-")}`}
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className={`text-xs font-bold ${text} w-12 text-right shrink-0`}>{done}/{goal}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Edit Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6 z-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-text-primary text-xl font-bold">Set {year} Goals</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-bg text-text-secondary transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {CATEGORIES.map(({ key, label, icon: Icon, text, bg }) => (
                                <div key={key} className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                                        <Icon size={16} className={text} />
                                    </div>
                                    <label className="text-text-primary text-sm font-semibold flex-1">{label}</label>
                                    <input
                                        type="number" min="0" placeholder="—"
                                        value={form[key]}
                                        onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-24 bg-bg border border-border rounded-xl py-2 px-3 text-sm text-text-primary text-right focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                            ))}
                        </div>

                        <p className="text-text-secondary text-xs">Leave a field blank to skip that category.</p>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="inline-flex items-center gap-2 px-7 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-background text-sm font-bold rounded-xl transition-all shadow-lg shadow-accent/20">
                                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                {isSaving ? "Saving..." : "Save Goals"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TargetPage;
