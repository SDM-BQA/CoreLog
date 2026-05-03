import { useState } from "react";
import { formatDate } from "../@utils/date.utils";
import {
  TrendingUp,
  Plus,
  X,
  NotebookPen,
  Flame,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export interface LogEntry {
  _id: string;
  date: string;
  position: number;
  note?: string;
}

interface MediaLogProps {
  status: string;
  activeStatuses: string[];
  unitLabel: "page" | "episode";
  unitIcon: React.ReactNode;
  completedLabel: string;
  total: number;
  logs: LogEntry[];
  onAdd: (entry: { date: string; position: number; note?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onFinish: () => void;
}

const MediaLog = ({
  status,
  activeStatuses,
  unitLabel,
  unitIcon,
  completedLabel,
  total,
  logs,
  onAdd,
  onDelete,
  onFinish,
}: MediaLogProps) => {
  const isActive = activeStatuses.includes(status);

  const latestPosition = logs.length > 0 ? logs[logs.length - 1].position : 0;
  const clampedPosition = total ? Math.min(latestPosition, total) : latestPosition;
  const progressPct = total ? Math.min(100, Math.round((clampedPosition / total) * 100)) : 0;
  const isCompleted = !!(total && latestPosition === total);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ date: "", position: "", note: "" });

  const openForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setForm({ date: today, position: clampedPosition > 0 ? String(clampedPosition) : "", note: "" });
    setError("");
    setFormOpen(true);
  };

  const handleSave = async () => {
    const posNum = parseInt(form.position);
    if (!form.date) { setError("Please select a date."); return; }
    if (!form.position || isNaN(posNum) || posNum <= 0) { setError(`Enter a valid ${unitLabel} number.`); return; }
    if (posNum <= clampedPosition) { setError(`Must be greater than your current position (${unitLabel} ${clampedPosition}).`); return; }
    if (total && posNum > total) { setError(`Cannot exceed the total (${total} ${unitLabel}s).`); return; }

    setError("");
    setSaving(true);
    try {
      await onAdd({ date: form.date, position: posNum, note: form.note || undefined });
      setFormOpen(false);
      if (total && posNum >= total) {
        setTimeout(() => onFinish(), 400);
      }
    } catch {
      setError(`Failed to save log entry.`);
    }
    setSaving(false);
  };

  const unitPlural = `${unitLabel}s`;
  const remainingCount = total ? Math.max(0, total - clampedPosition) : 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-text-primary text-lg font-bold flex items-center gap-2">
          <TrendingUp size={20} className="text-text-secondary" />
          {unitLabel === "page" ? "Reading Log" : "Watch Log"}
        </h2>
        {isActive && (
          <div className="flex items-center gap-2">
            <button
              onClick={openForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent/30 transition-colors"
            >
              <Plus size={13} /> Log Session
            </button>
            <button
              onClick={onFinish}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCircle2 size={13} /> Finished
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {logs.length > 0 && total > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm font-medium flex items-center gap-1.5">
              <NotebookPen size={14} /> Progress
            </span>
            <span className="text-text-primary text-sm font-bold">
              {unitLabel === "page" ? "Page" : "Episode"} {clampedPosition}{" "}
              <span className="text-text-secondary font-normal">of {total}</span>
            </span>
          </div>
          <div className="relative w-full h-2.5 bg-border/40 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <Flame size={12} className="text-orange-400" />
                {logs.length} update{logs.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                {unitIcon}
                {remainingCount} {unitPlural} remaining
              </span>
            </div>
            <span className="text-accent font-bold text-sm">{progressPct}%</span>
          </div>
        </div>
      )}

      {/* Log form */}
      {isActive && formOpen && (
        <div className="mb-5 bg-surface border border-accent/30 rounded-2xl overflow-hidden shadow-lg shadow-accent/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-accent/5">
            <span className="text-text-primary text-sm font-semibold flex items-center gap-2">
              <NotebookPen size={15} className="text-accent" /> New Session
            </span>
            <button onClick={() => setFormOpen(false)} className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70 mb-1.5 block">Date</label>
                <input type="date" value={form.date}
                  onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setError(""); }}
                  className="w-full bg-bg border border-border rounded-xl py-2.5 px-3 text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70 mb-1.5 block">
                  {unitLabel === "page" ? "Read up to page" : "Watched up to episode"}
                  {total ? <span className="font-normal opacity-50 ml-1">/ {total}</span> : null}
                </label>
                <input type="number" min={clampedPosition + 1} max={total || undefined}
                  placeholder={clampedPosition > 0 ? `> ${clampedPosition}` : `e.g. 1`}
                  value={form.position}
                  onChange={e => { setForm(f => ({ ...f, position: e.target.value })); setError(""); }}
                  className="w-full bg-bg border border-border rounded-xl py-2.5 px-3 text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70 mb-1.5 block">
                Note <span className="font-normal normal-case opacity-60">(optional)</span>
              </label>
              <textarea rows={2} placeholder="Quick thoughts, a favourite quote, bookmark…" value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl py-2.5 px-3 text-text-primary text-sm placeholder:text-text-secondary/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none" />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                <span className="shrink-0">⚠</span> {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => { setFormOpen(false); setError(""); }}
                className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-accent hover:bg-accent/90 text-background transition-colors disabled:opacity-50 shadow-sm shadow-accent/20">
                {saving ? "Saving…" : "Save Progress"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log entries */}
      {logs.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-border/30 flex items-center justify-center">
            <div className="text-text-secondary/30">{unitIcon}</div>
          </div>
          <p className="text-text-secondary/60 text-sm font-medium">No progress logged yet</p>
          {isActive && (
            <p className="text-text-secondary/40 text-xs">Use "Log Session" to update your progress day by day.</p>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border/60" />
          <div className="flex flex-col gap-3">
            {isCompleted && (
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full border-2 bg-emerald-500 border-emerald-400 flex items-center justify-center z-10 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-3 flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 text-sm font-semibold">{completedLabel}</span>
                </div>
              </div>
            )}
            {[...logs].reverse().map((log, i) => {
              const isLatest = i === 0;
              return (
                <div key={log._id} className="flex items-start gap-4 group">
                  <div className={`shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                    isLatest && isCompleted ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/30"
                    : isLatest ? "bg-accent border-accent/50 shadow-md shadow-accent/20"
                    : "bg-surface border-border group-hover:border-accent/40"
                  }`}>
                    <div className={isLatest ? "text-background" : "text-text-secondary"} style={{ display: "flex" }}>{unitIcon}</div>
                  </div>
                  <div className="flex-1 min-w-0 bg-surface border border-border rounded-2xl px-5 py-4 hover:border-accent/20 transition-colors group/card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="text-text-primary text-sm font-semibold">
                            {formatDate(log.date)}
                          </span>
                          {isLatest && !isCompleted && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">Latest</span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                          {unitLabel === "page" ? `Up to page ${log.position}` : `Up to episode ${log.position}`}
                        </span>
                        {log.note && (
                          <p className="mt-2.5 text-text-secondary text-xs leading-relaxed italic border-l-2 border-accent/30 pl-3">
                            {log.note}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <button onClick={() => onDelete(log._id)}
                          className="opacity-0 group-hover/card:opacity-100 text-text-secondary/30 hover:text-rose-400 transition-all p-1.5 rounded-lg hover:bg-rose-500/5 shrink-0 mt-0.5">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaLog;
