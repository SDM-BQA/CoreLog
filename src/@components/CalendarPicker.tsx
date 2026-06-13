import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const CalendarPicker = ({ value, onSelect, onClose }: CalendarPickerProps) => {
  const today = new Date();
  const selected = value ? new Date(`${value}T12:00:00`) : today;

  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const previousMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const goBack = () => {
    const date = new Date(viewYear, viewMonth - 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  };

  const goForward = () => {
    const date = new Date(viewYear, viewMonth + 1);
    if (date > today) return;
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  };

  const isFuture = (day: number) => new Date(viewYear, viewMonth, day) > today;
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  const isSelected = (day: number) =>
    selected.getDate() === day && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;

  const pick = (day: number) => {
    if (isFuture(day)) return;
    const month = String(viewMonth + 1).padStart(2, "0");
    const paddedDay = String(day).padStart(2, "0");
    onSelect(`${viewYear}-${month}-${paddedDay}`);
  };

  const pickToday = () => {
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    onSelect(`${today.getFullYear()}-${month}-${day}`);
  };

  const cantGoForward = new Date(viewYear, viewMonth + 1) > today;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-2xl shadow-2xl w-[320px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button
            type="button"
            onClick={goBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-text-primary font-bold text-sm">{monthLabel}</span>
          <button
            type="button"
            onClick={goForward}
            disabled={cantGoForward}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 px-3 pt-3">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="flex items-center justify-center h-8 text-[10px] font-black text-text-secondary/40 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 px-3 pb-2 gap-y-0.5">
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`prev-${index}`} className="h-9 flex items-center justify-center text-xs text-text-secondary/15">
              {previousMonthDays - firstDayOfWeek + index + 1}
            </div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const future = isFuture(day);
            const selectedDay = isSelected(day);
            const todayDay = isToday(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => pick(day)}
                disabled={future}
                className={`h-9 w-full flex items-center justify-center rounded-xl text-sm font-medium transition-all
                  ${selectedDay ? "bg-accent text-white font-bold shadow-md shadow-accent/25 scale-105" : ""}
                  ${todayDay && !selectedDay ? "ring-1 ring-accent text-accent font-bold" : ""}
                  ${!selectedDay && !future ? "hover:bg-bg text-text-primary" : ""}
                  ${future ? "text-text-secondary/20 cursor-not-allowed" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-4 pt-2 flex gap-2 border-t border-border">
          <button
            type="button"
            onClick={pickToday}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-bold border border-border text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default CalendarPicker;
