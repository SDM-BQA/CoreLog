import { useMemo } from "react";
import { Flame, CalendarDays, Trophy, CheckCircle2 } from "lucide-react";
import type { Journal, JournalStreak } from "../@apis/journal";
import Modal from "./Modal";

interface JournalStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: Journal[];
  streak?: JournalStreak | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const toIstDayKey = (value: string) => {
  const date = new Date(value);
  const y = new Intl.DateTimeFormat("en-IN", { year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
  const m = new Intl.DateTimeFormat("en-IN", { month: "2-digit", timeZone: "Asia/Kolkata" }).format(date);
  const d = new Intl.DateTimeFormat("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" }).format(date);
  return `${y}-${m}-${d}`;
};

const dayKeyToUtcMs = (dayKey: string) => {
  const [y, m, d] = dayKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

const JournalStreakModal = ({ isOpen, onClose, journals, streak }: JournalStreakModalProps) => {
  const fallbackData = useMemo(() => {
    const uniqueDayKeys = Array.from(new Set(journals.map((j) => toIstDayKey(j.date))));
    const sortedDays = uniqueDayKeys
      .map((dayKey) => ({ dayKey, utcMs: dayKeyToUtcMs(dayKey) }))
      .sort((a, b) => a.utcMs - b.utcMs);

    let longest = 0;
    let run = 0;
    let previousMs: number | null = null;

    sortedDays.forEach(({ utcMs }) => {
      if (previousMs === null || utcMs - previousMs !== DAY_MS) {
        run = 1;
      } else {
        run += 1;
      }
      if (run > longest) longest = run;
      previousMs = utcMs;
    });

    const todayKey = toIstDayKey(new Date().toISOString());
    const yesterdayKey = toIstDayKey(new Date(Date.now() - DAY_MS).toISOString());
    const daySet = new Set(uniqueDayKeys);

    let current = 0;
    let anchorMs: number | null = null;
    if (daySet.has(todayKey)) {
      anchorMs = dayKeyToUtcMs(todayKey);
    } else if (daySet.has(yesterdayKey)) {
      anchorMs = dayKeyToUtcMs(yesterdayKey);
    }

    while (anchorMs !== null) {
      const keyDate = new Date(anchorMs);
      const key = `${keyDate.getUTCFullYear()}-${String(keyDate.getUTCMonth() + 1).padStart(2, "0")}-${String(keyDate.getUTCDate()).padStart(2, "0")}`;
      if (!daySet.has(key)) break;
      current += 1;
      anchorMs -= DAY_MS;
    }

    const now = new Date();
    const monthFmt = new Intl.DateTimeFormat("en-IN", { month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata" });
    const currentMonthKey = monthFmt.format(now);
    const activeThisMonth = uniqueDayKeys.filter((dayKey) => {
      const date = new Date(dayKeyToUtcMs(dayKey));
      return monthFmt.format(date) === currentMonthKey;
    }).length;

    const lastEntryDate = sortedDays.length
      ? new Date(sortedDays[sortedDays.length - 1].utcMs).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        })
      : "-";

    return {
      current,
      longest,
      activeThisMonth,
      totalActiveDays: uniqueDayKeys.length,
      lastEntryDate,
    };
  }, [journals]);

  const streakData = {
    current: streak?.current_streak ?? fallbackData.current,
    longest: streak?.longest_streak ?? fallbackData.longest,
    activeThisMonth: streak?.active_days_this_month ?? fallbackData.activeThisMonth,
    totalActiveDays: streak?.total_active_days ?? fallbackData.totalActiveDays,
    lastEntryDate: streak?.last_entry_date ?? fallbackData.lastEntryDate,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Journal Streak"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-accent text-background text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-5">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-bold uppercase tracking-widest">
            <Flame size={16} />
            Current Streak
          </div>
          <p className="text-text-primary text-4xl font-black mt-2 leading-none">
            {streakData.current}
            <span className="text-base text-text-secondary font-medium ml-1">days</span>
          </p>
          <p className="text-text-secondary text-xs mt-2">Last entry: {streakData.lastEntryDate}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-bg/50 p-4">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-semibold uppercase tracking-wider">
              <Trophy size={14} /> Longest
            </div>
            <p className="text-text-primary text-2xl font-black mt-2">{streakData.longest} days</p>
          </div>

          <div className="rounded-xl border border-border bg-bg/50 p-4">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-semibold uppercase tracking-wider">
              <CalendarDays size={14} /> This Month
            </div>
            <p className="text-text-primary text-2xl font-black mt-2">{streakData.activeThisMonth} days</p>
          </div>

          <div className="rounded-xl border border-border bg-bg/50 p-4">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 size={14} /> Total Active
            </div>
            <p className="text-text-primary text-2xl font-black mt-2">{streakData.totalActiveDays} days</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default JournalStreakModal;
