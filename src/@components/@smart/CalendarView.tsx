import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, Tv } from "lucide-react";
import { get_full_image_url } from "../../@utils/api.utils";

/**
 * Minimal Book interface required by CalendarView.
 * Can be extended — the component only reads these fields.
 */
export interface CalendarBook {
  _id: string;
  title: string;
  cover_image: string;
  started_from?: string;
  finished_on?: string;
  status?: string;
}

// Palette for book spans — cycles through these colours
const BOOK_COLORS = [
  {
    bg: "bg-violet-500/80",
    border: "border-violet-400",
    text: "text-white",
    dot: "bg-violet-400",
  },
  {
    bg: "bg-sky-500/80",
    border: "border-sky-400",
    text: "text-white",
    dot: "bg-sky-400",
  },
  {
    bg: "bg-emerald-500/80",
    border: "border-emerald-400",
    text: "text-white",
    dot: "bg-emerald-400",
  },
  {
    bg: "bg-amber-500/80",
    border: "border-amber-400",
    text: "text-white",
    dot: "bg-amber-400",
  },
  {
    bg: "bg-rose-500/80",
    border: "border-rose-400",
    text: "text-white",
    dot: "bg-rose-400",
  },
  {
    bg: "bg-pink-500/80",
    border: "border-pink-400",
    text: "text-white",
    dot: "bg-pink-400",
  },
  {
    bg: "bg-teal-500/80",
    border: "border-teal-400",
    text: "text-white",
    dot: "bg-teal-400",
  },
  {
    bg: "bg-orange-500/80",
    border: "border-orange-400",
    text: "text-white",
    dot: "bg-orange-400",
  },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface BookWithDates extends CalendarBook {
  start: Date | null;
  end: Date | null;
}

interface CalendarViewProps {
  books: CalendarBook[];
  /** Base path for book detail links. Defaults to "/dashboard/books" */
  detailBasePath?: string;
  /** Media type for image lookup. Defaults to "book" */
  type?: "book" | "series";
}

function getBooksForDay(
  booksWithDates: BookWithDates[],
  day: Date,
): BookWithDates[] {
  const d = new Date(day);
  d.setHours(12, 0, 0, 0);
  return booksWithDates.filter((b) => {
    if (!b.start) return false;
    const start = new Date(b.start);
    start.setHours(0, 0, 0, 0);

    // For 'not_finished' items without an end date, only show on the start date
    if (!b.end && b.status === "not_finished") {
      return isSameDay(d, start);
    }

    const end = b.end ? new Date(b.end) : null;
    if (end) {
      end.setHours(23, 59, 59, 0);
      return d >= start && d <= end;
    }

    // Ongoing items (reading/watching) without an end date prolong to the current day
    const today = new Date();
    today.setHours(23, 59, 59, 0);
    return d >= start && d <= today;
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarView({
  books,
  detailBasePath = "/dashboard/books",
  type = "book",
}: CalendarViewProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const booksWithDates: BookWithDates[] = useMemo(() => {
    return books.map((b) => ({
      ...b,
      start: b.started_from ? new Date(b.started_from) : null,
      end: b.finished_on ? new Date(b.finished_on) : null,
    }));
  }, [books]);

  const booksThisMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return booksWithDates.filter((b) => {
      if (!b.start) return false;

      // If it's not finished and has no end date, it's a single day event
      if (!b.end && b.status === "not_finished") {
        return b.start <= lastDay && b.start >= firstDay;
      }

      const end = b.end ?? new Date();
      return b.start <= lastDay && end >= firstDay;
    });
  }, [booksWithDates, year, month]);

  const colorMap = useMemo(() => {
    const map: Record<string, (typeof BOOK_COLORS)[0]> = {};
    booksWithDates.forEach((b, i) => {
      map[b._id] = BOOK_COLORS[i % BOOK_COLORS.length];
    });
    return map;
  }, [booksWithDates]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1),
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () =>
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-text-primary text-xl font-bold tracking-tight">
            {MONTHS[month]} <span className="text-accent">{year}</span>
          </h2>
          <button
            type="button"
            onClick={goToday}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      {booksThisMonth.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {booksThisMonth.map((b) => {
            const c = colorMap[b._id];
            return (
              <Link
                key={b._id}
                to={`${detailBasePath}/${b._id}`}
                onMouseEnter={() => setHoveredBook(b._id)}
                onMouseLeave={() => setHoveredBook(null)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${c.border} ${
                  hoveredBook === b._id
                    ? `${c.bg} ${c.text}`
                    : "bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                <span className="max-w-[120px] truncate">{b.title}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Day Names ── */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-bold text-text-secondary/60 uppercase tracking-widest py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day)
            return <div key={`empty-${idx}`} className="aspect-square" />;
          const isToday = isSameDay(day, today);
          const dayBooks = getBooksForDay(booksWithDates, day);
          const MAX_VISIBLE = 3;

          return (
            <div
              key={day.toISOString()}
              className={`relative min-h-[80px] sm:min-h-[96px] p-1.5 rounded-xl border flex flex-col gap-1 transition-colors ${
                isToday
                  ? "border-accent/50 bg-accent/5"
                  : "border-border/50 bg-surface hover:border-border"
              }`}
            >
              <span
                className={`text-xs font-bold self-start w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday
                    ? "bg-accent text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {day.getDate()}
              </span>

              {dayBooks.slice(0, MAX_VISIBLE).map((b) => {
                const c = colorMap[b._id];
                const isStart = b.start ? isSameDay(b.start, day) : false;
                const isEnd = b.end
                  ? isSameDay(b.end, day)
                  : b.status === "not_finished"
                    ? isStart
                    : false;
                const isHovered = hoveredBook === b._id;
                return (
                  <Link
                    key={b._id}
                    to={`${detailBasePath}/${b._id}`}
                    title={b.title}
                    onMouseEnter={() => setHoveredBook(b._id)}
                    onMouseLeave={() => setHoveredBook(null)}
                    className={`relative flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold truncate transition-all border ${c.border} ${c.bg} ${c.text} ${
                      isHovered
                        ? "opacity-100 scale-[1.02] shadow-md"
                        : "opacity-80"
                    } ${isStart ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""}`}
                  >
                    {isStart && (
                      <img
                        src={get_full_image_url(b.cover_image, type)}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                        className="w-3 h-4 sm:w-3.5 sm:h-5 object-cover rounded shrink-0"
                      />
                    )}
                    {isStart ? (
                      <span className="truncate hidden sm:block">
                        {b.title}
                      </span>
                    ) : (
                      <span className="w-full" />
                    )}
                  </Link>
                );
              })}

              {dayBooks.length > MAX_VISIBLE && (
                <span className="text-[9px] text-text-secondary font-semibold px-1">
                  +{dayBooks.length - MAX_VISIBLE} more
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {booksThisMonth.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center">
            {type === "series" ? (
              <Tv size={28} className="text-text-secondary/30" />
            ) : (
              <BookOpen size={28} className="text-text-secondary/30" />
            )}
          </div>
          <p className="text-text-primary font-semibold">
            No {type === "series" ? "watching" : "reading"} activity this month
          </p>
          <p className="text-text-secondary text-sm max-w-xs">
            {type === "series" ? "Series" : "Books"} with{" "}
            <span className="text-accent font-medium">Started From</span> or{" "}
            <span className="text-accent font-medium">Finished On</span> dates
            will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
