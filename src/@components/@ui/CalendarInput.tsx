import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  icon?: React.ElementType;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatDisplay = (ymd?: string) => {
  if (!ymd) return "";
  const [year, month, day] = ymd.split("-").map(Number);
  if (!year || !month || !day) return "";
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const parseYmd = (ymd: string): Date | null => {
  const [year, month, day] = ymd.split("-").map(Number);
  if (!year || !month || !day) return null;
  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return null;
  return d;
};

const CalendarInput: React.FC<CalendarInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  error,
  disabled = false,
  min,
  max,
  icon: Icon = CalendarDays,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [jumpDate, setJumpDate] = useState("");

  const selectedDate = useMemo(() => {
    if (!value) return null;
    return parseYmd(value);
  }, [value]);

  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstWeekday = monthStart.getDay(); // 0 Sun

  const cells: Array<{ ymd: string; day: number; inMonth: boolean }> = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ ymd: "", day: 0, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    cells.push({ ymd: toYmd(d), day, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ ymd: "", day: 0, inMonth: false });
  }

  const inBounds = (ymd: string) => {
    if (!ymd) return false;
    if (min && ymd < min) return false;
    if (max && ymd > max) return false;
    return true;
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 151 }, (_, i) => currentYear - 100 + i); // currentYear-100 .. currentYear+50
  const monthOptions = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const applyJumpDate = () => {
    const parsed = parseYmd(jumpDate);
    if (!parsed) return;
    const ymd = toYmd(parsed);
    if (!inBounds(ymd)) return;
    onChange(ymd);
    setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      {label && (
        <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-bg border rounded-xl text-sm transition-all duration-200 outline-none
          ${isOpen ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/50"}
          ${error ? "border-error focus:ring-error/20" : ""}
          ${!value ? "text-text-secondary/60" : "text-text-primary"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon size={16} className={value ? "text-accent" : "text-text-secondary/40"} />
          <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
        </div>
        <CalendarDays size={16} className="text-text-secondary/50" />
      </button>

      {error && <p className="text-error text-xs mt-1.5 pl-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full min-w-[280px] sm:min-w-[320px] max-w-[360px] bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                className="p-1.5 rounded-md hover:bg-bg text-text-secondary"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-sm font-semibold text-text-primary">
                {viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </div>
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                className="p-1.5 rounded-md hover:bg-bg text-text-secondary"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <select
                value={viewDate.getMonth()}
                onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), Number(e.target.value), 1))}
                className="bg-bg border border-border rounded-md px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
              >
                {monthOptions.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <select
                value={viewDate.getFullYear()}
                onChange={(e) => setViewDate(new Date(Number(e.target.value), viewDate.getMonth(), 1))}
                className="bg-bg border border-border rounded-md px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wider text-text-secondary/70 mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="text-center py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, idx) => {
                if (!cell.inMonth) return <div key={`empty-${idx}`} className="h-8" />;
                const isSelected = value === cell.ymd;
                const enabled = inBounds(cell.ymd);
                return (
                  <button
                    key={cell.ymd}
                    type="button"
                    disabled={!enabled}
                    onClick={() => {
                      onChange(cell.ymd);
                      setIsOpen(false);
                    }}
                    className={`h-8 rounded-md text-xs transition-colors
                      ${isSelected ? "bg-accent text-white font-semibold" : "text-text-primary"}
                      ${enabled && !isSelected ? "hover:bg-bg" : ""}
                      ${!enabled ? "opacity-35 cursor-not-allowed" : ""}
                    `}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={jumpDate}
                onChange={(e) => setJumpDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="flex-1 bg-bg border border-border rounded-md px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={applyJumpDate}
                className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-accent/10 text-accent hover:bg-accent/20"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarInput;
