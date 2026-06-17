import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Target, Pencil, X, Save, Loader2 } from "lucide-react";
import {
    get_my_target_query,
    get_target_progress_query,
    set_target_mutation,
    type Target as TargetType,
} from "../@apis/targets";

type Category = "movies" | "series" | "books" | "poems";

interface TargetBannerProps {
    category: Category;
    label: string;
    year?: number;
}

const STYLES: Record<Category, { text: string; bg: string; border: string; bar: string; inputBorder: string; btnHover: string }> = {
    movies:  { text: "text-blue-500",    bg: "bg-blue-500/5",    border: "border-blue-500/20",    bar: "bg-blue-500",    inputBorder: "border-blue-500/40",    btnHover: "hover:bg-blue-500/15" },
    series:  { text: "text-purple-500",  bg: "bg-purple-500/5",  border: "border-purple-500/20",  bar: "bg-purple-500",  inputBorder: "border-purple-500/40",  btnHover: "hover:bg-purple-500/15" },
    books:   { text: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/20", bar: "bg-emerald-500", inputBorder: "border-emerald-500/40", btnHover: "hover:bg-emerald-500/15" },
    poems:   { text: "text-amber-500",   bg: "bg-amber-500/5",   border: "border-amber-500/20",   bar: "bg-amber-500",   inputBorder: "border-amber-500/40",   btnHover: "hover:bg-amber-500/15" },
};

const TargetBanner = ({ category, label, year: propYear }: TargetBannerProps) => {
    const year = propYear ?? new Date().getFullYear();
    const s = STYLES[category];

    const [target, setTarget] = useState<TargetType | null>(null);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [t, p] = await Promise.all([
                    get_my_target_query(year),
                    get_target_progress_query(year),
                ]);
                setTarget(t);
                setProgress(p[category]);
                if (t) setEditValue(String(t[category] ?? ""));
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [year, category]);

    const handleSave = async () => {
        const val = parseInt(editValue);
        if (isNaN(val) || val < 0) return;
        setIsSaving(true);
        try {
            const updated = await set_target_mutation({
                year,
                movies: target?.movies,
                series: target?.series,
                books: target?.books,
                poems: target?.poems,
                [category]: val,
            });
            setTarget(updated);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return null;

    const goal = target?.[category];
    const pct = goal ? Math.min(100, Math.round((progress / goal) * 100)) : 0;

    if (!goal) {
        return (
            <div className={`flex items-center gap-3 px-5 py-3 ${s.bg} ${s.border} border rounded-2xl mb-6`}>
                <Target size={15} className={`${s.text} shrink-0`} />
                <span className="text-text-secondary text-sm flex-1">No {year} goal set for this category.</span>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="number" min="1" value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="e.g. 24"
                            className={`w-24 bg-bg ${s.inputBorder} border rounded-lg px-2 py-1 text-sm text-text-primary focus:outline-none`}
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        />
                        <button onClick={handleSave} disabled={isSaving}
                            className={`p-1.5 rounded-lg ${s.bg} ${s.text} ${s.btnHover} transition-colors`}>
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg hover:bg-bg text-text-secondary transition-colors">
                            <X size={13} />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => { setEditValue(""); setIsEditing(true); }}
                        className={`text-xs font-bold ${s.text} ${s.btnHover} px-3 py-1.5 rounded-lg transition-colors shrink-0`}>
                        Set Goal
                    </button>
                )}
                <Link to="/dashboard/target" className={`${s.text} text-xs font-bold hover:underline shrink-0`}>All Goals →</Link>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-4 px-5 py-3 ${s.bg} ${s.border} border rounded-2xl mb-6`}>
            <Target size={15} className={`${s.text} shrink-0`} />
            <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1 min-w-0">
                <span className="text-text-secondary text-sm font-medium shrink-0">{year} Goal</span>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="number" min="1" value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className={`w-20 bg-bg ${s.inputBorder} border rounded-lg px-2 py-1 text-sm text-text-primary focus:outline-none`}
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        />
                        <button onClick={handleSave} disabled={isSaving}
                            className={`p-1.5 rounded-lg ${s.bg} ${s.text} ${s.btnHover} transition-colors`}>
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg hover:bg-bg text-text-secondary transition-colors">
                            <X size={13} />
                        </button>
                    </div>
                ) : (
                    <>
                        <span className={`${s.text} font-bold text-sm shrink-0`}>
                            {progress} / {goal} {label}
                        </span>
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden min-w-[80px]">
                            <div className={`h-full ${s.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-text-secondary text-xs font-bold shrink-0">{pct}%</span>
                        <button onClick={() => { setEditValue(String(goal)); setIsEditing(true); }}
                            className="text-text-secondary hover:text-text-primary transition-colors p-1 shrink-0">
                            <Pencil size={13} />
                        </button>
                    </>
                )}
            </div>
            <Link to="/dashboard/target" className={`${s.text} text-xs font-bold hover:underline shrink-0 hidden sm:block`}>
                All Goals →
            </Link>
        </div>
    );
};

export default TargetBanner;
