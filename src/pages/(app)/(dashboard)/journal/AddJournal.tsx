import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  Smile,
  Hash,
  Calendar,
  Clock,
  Camera,
  X,
  Star,
  Sparkles,
  FileText,
  Briefcase,
  DollarSign,
  Plane,
  Heart,
  Lightbulb,
  Moon,
  User,
  MoreHorizontal,
  Eye,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
} from "lucide-react";
import { upload_image_api } from "../../../../@apis/users";
import { useCreateJournalMutation, useGetJournalByIdQuery, useGetJournalFiltersQuery, useUpdateJournalMutation } from "../../../../@store/api/journal.api";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { toISO, formatDate } from "../../../../@utils/date.utils";
import Select from "../../../../@components/@ui/Select";
import LocationPickerMap from "../../../../@components/LocationPickerMap";
import Modal from "../../../../@components/Modal";
import { toast } from "react-toast";
import { useAppSelector } from "../../../../@store/hooks/store.hooks";
import { JOURNAL_PREDEFINED_TAGS } from "../../../../constants/journalTags";
import ScreenTimeImportModal, { type ScreenTimeAppDraft } from "../../../../@components/ScreenTimeImportModal";
import { useJournalTemplates } from "../../../../@hooks/useJournalTemplates";
import {
  getExpenseBlocks,
  resolveJournalTemplateBlocks,
  stripJournalTemplateBlocks,
  type JournalExpenseBlock,
  type JournalTemplateBlock,
} from "../../../../@utils/journalTemplateBlocks.utils";
import {
  getJournalTemplatePlaceholders,
  humanizeJournalTemplatePlaceholder,
  journalTemplateTextToHtml,
  renderJournalTemplateContent,
  type JournalSavedTemplate,
} from "../../../../@utils/journalTemplates.utils";

const JOURNAL_TYPES = [
  { value: "personal",  label: "Personal",  icon: User },
  { value: "plan",      label: "Plan",       icon: FileText },
  { value: "finance",   label: "Finance",    icon: DollarSign },
  { value: "travel",    label: "Travel",     icon: Plane },
  { value: "health",    label: "Health",     icon: Heart },
  { value: "work",      label: "Work",       icon: Briefcase },
  { value: "gratitude", label: "Gratitude",  icon: Sparkles },
  { value: "dream",     label: "Dream",      icon: Moon },
  { value: "ideas",     label: "Ideas",      icon: Lightbulb },
  { value: "other",     label: "Other",      icon: MoreHorizontal },
];

const MOODS = [
  { value: "happy",       label: "Happy",       emoji: "😊" },
  { value: "calm",        label: "Calm",        emoji: "😌" },
  { value: "sad",         label: "Sad",         emoji: "😔" },
  { value: "anxious",     label: "Anxious",     emoji: "😟" },
  { value: "excited",     label: "Excited",     emoji: "🤩" },
  { value: "grateful",    label: "Grateful",    emoji: "🙏" },
  { value: "angry",       label: "Angry",       emoji: "😤" },
  { value: "melancholic", label: "Melancholic", emoji: "🌧️" },
  { value: "hopeful",     label: "Hopeful",     emoji: "🌱" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "😵" },
  { value: "content",     label: "Content",     emoji: "☺️" },
  { value: "confused",    label: "Confused",    emoji: "🤔" },
  { value: "wonderful",   label: "Wonderful",   emoji: "🤗" },
  { value: "neutral",     label: "Neutral",     emoji: "😐" },
  { value: "bad",         label: "Bad",         emoji: "😞" },
];

type ExpenseDraftItem = {
  id: string;
  amount: string;
  note: string;
};

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toExpenseDraft = (block: JournalExpenseBlock): ExpenseDraftItem[] =>
  block.items.length
    ? block.items.map((item) => ({ id: item.id || newId(), amount: String(item.amount || ""), note: item.note || "" }))
    : [{ id: newId(), amount: "", note: "" }];

const toExpenseBlock = (items: ExpenseDraftItem[]): JournalExpenseBlock | null => {
  const cleanItems = items
    .map((item) => ({
      id: item.id,
      amount: Number(item.amount),
      note: item.note.trim(),
    }))
    .filter((item) => Number.isFinite(item.amount) && item.amount > 0 && item.note);

  if (!cleanItems.length) return null;

  return {
    id: "expenses",
    type: "expenses",
    title: "Today expenses",
    items: cleanItems,
  };
};

const minsToLabel = (mins: number) => {
  const safeMinutes = Math.max(0, Number(mins) || 0);
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ExpensesBlockEditor = ({
  items,
  onChange,
  onRemove,
}: {
  items: ExpenseDraftItem[];
  onChange: (items: ExpenseDraftItem[]) => void;
  onRemove: () => void;
}) => {
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const updateItem = (id: string, patch: Partial<ExpenseDraftItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <div className="rounded-xl border border-border bg-bg p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-text-primary text-xs font-bold">Today expenses</p>
          <p className="text-text-secondary/60 text-[10px]">Template block</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 rounded-lg border border-border text-text-secondary hover:text-error hover:border-error/30 transition-colors flex items-center justify-center"
          title="Remove expenses template"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[72px_minmax(0,1fr)_28px] gap-2">
            <input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="₹"
              value={item.amount}
              onChange={(e) => updateItem(item.id, { amount: e.target.value })}
              className="bg-surface border border-border rounded-lg px-2 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="lunch, gift, travel..."
              value={item.note}
              onChange={(e) => updateItem(item.id, { note: e.target.value })}
              className="bg-surface border border-border rounded-lg px-2 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((x) => x.id !== item.id))}
              className="rounded-lg border border-border text-text-secondary hover:text-error hover:border-error/30 transition-colors flex items-center justify-center"
              title="Remove expense"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChange([...items, { id: newId(), amount: "", note: "" }])}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80"
        >
          <Plus size={13} /> Add expense
        </button>
        <span className="text-xs font-bold text-text-primary">Total ₹{total}</span>
      </div>
    </div>
  );
};

const TYPE_COLOR: Record<string, string> = {
  personal: "violet", plan: "blue",    finance: "emerald", travel: "amber",
  health:   "rose",   work: "cyan",    gratitude: "yellow", dream: "purple",
  ideas:    "orange", other: "slate",
};

const AC: Record<string, { ring: string; badge: string; btn: string; activeBtn: string }> = {
  violet:  { ring: "focus:border-violet-500/50",  badge: "bg-violet-500/10 border-violet-500/20 text-violet-400",    btn: "bg-violet-600 hover:bg-violet-500 shadow-violet-500/20",   activeBtn: "bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30" },
  blue:    { ring: "focus:border-blue-500/50",    badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",          btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",           activeBtn: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30" },
  emerald: { ring: "focus:border-emerald-500/50", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20",  activeBtn: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30" },
  amber:   { ring: "focus:border-amber-500/50",   badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",       btn: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",        activeBtn: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30" },
  rose:    { ring: "focus:border-rose-500/50",    badge: "bg-rose-500/10 border-rose-500/20 text-rose-400",          btn: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20",           activeBtn: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30" },
  cyan:    { ring: "focus:border-cyan-500/50",    badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",          btn: "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20",           activeBtn: "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30" },
  yellow:  { ring: "focus:border-yellow-500/50",  badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",   btn: "bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20",    activeBtn: "bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30" },
  purple:  { ring: "focus:border-purple-500/50",  badge: "bg-purple-500/10 border-purple-500/20 text-purple-400",   btn: "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20",    activeBtn: "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30" },
  orange:  { ring: "focus:border-orange-500/50",  badge: "bg-orange-500/10 border-orange-500/20 text-orange-400",   btn: "bg-orange-600 hover:bg-orange-500 shadow-orange-500/20",    activeBtn: "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30" },
  slate:   { ring: "focus:border-slate-500/50",   badge: "bg-slate-500/10 border-slate-500/20 text-slate-400",      btn: "bg-slate-600 hover:bg-slate-500 shadow-slate-500/20",        activeBtn: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30" },
};

// ── Calendar picker ────────────────────────────────────────────────────────
const CalendarPicker = ({ value, onSelect, onClose }: {
  value: string; onSelect: (v: string) => void; onClose: () => void;
}) => {
  const today = new Date();
  const sel = value ? new Date(value + "T12:00:00") : today;

  const [viewYear, setViewYear]   = useState(sel.getFullYear());
  const [viewMonth, setViewMonth] = useState(sel.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  const goBack = () => {
    const d = new Date(viewYear, viewMonth - 1);
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
  };
  const goFwd = () => {
    const d = new Date(viewYear, viewMonth + 1);
    if (d > today) return;
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
  };

  const isFuture = (day: number) => new Date(viewYear, viewMonth, day) > today;
  const isToday  = (day: number) => today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  const isSel    = (day: number) => sel.getDate() === day && sel.getMonth() === viewMonth && sel.getFullYear() === viewYear;

  const pick = (day: number) => {
    if (isFuture(day)) return;
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onSelect(`${viewYear}-${m}-${d}`);
  };

  const pickToday = () => {
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    onSelect(`${today.getFullYear()}-${m}-${d}`);
  };

  const cantGoFwd = new Date(viewYear, viewMonth + 1) > today;

  return (
    <>
      <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-[1210] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-2xl shadow-2xl w-[320px] overflow-hidden">

        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button type="button" onClick={goBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-text-primary font-bold text-sm">{monthLabel}</span>
          <button type="button" onClick={goFwd} disabled={cantGoFwd}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-3 pt-3">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
            <div key={d} className="flex items-center justify-center h-8 text-[10px] font-black text-text-secondary/40 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 px-3 pb-2 gap-y-0.5">
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`p${i}`} className="h-9 flex items-center justify-center text-xs text-text-secondary/15">
              {prevMonthDays - firstDow + i + 1}
            </div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const future = isFuture(day);
            const selected = isSel(day);
            const todayDay = isToday(day);
            return (
              <button key={day} type="button" onClick={() => pick(day)} disabled={future}
                className={`h-9 w-full flex items-center justify-center rounded-xl text-sm font-medium transition-all
                  ${selected ? "bg-accent text-white font-bold shadow-md shadow-accent/25 scale-105" : ""}
                  ${todayDay && !selected ? "ring-1 ring-accent text-accent font-bold" : ""}
                  ${!selected && !future ? "hover:bg-bg text-text-primary" : ""}
                  ${future ? "text-text-secondary/20 cursor-not-allowed" : ""}
                `}>
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 flex gap-2 border-t border-border">
          <button type="button" onClick={pickToday}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
            Today
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-bold border border-border text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

// ── Clock picker ────────────────────────────────────────────────────────────
const CSIZE = 240;
const CCX   = 120;
const CCY   = 120;
const NUM_R = 86;
const HAND_R = 76;

// position on the clock face for a value out of `total`
const clockPos = (val: number, total: number) => {
  const a = (val / total) * 2 * Math.PI - Math.PI / 2;
  return { x: CCX + NUM_R * Math.cos(a), y: CCY + NUM_R * Math.sin(a),
           hx: CCX + HAND_R * Math.cos(a), hy: CCY + HAND_R * Math.sin(a) };
};

const ClockPicker = ({ value, onChange, onClose }: {
  value: string; onChange: (v: string) => void; onClose: () => void;
}) => {
  const [h24Init, mInit] = (value || "00:00").split(":").map(Number);
  const [step, setStep]   = useState<"h" | "m">("h");
  const [hour, setHour]   = useState(h24Init % 12 || 12);
  const [minute, setMinute] = useState(mInit || 0);
  const [ampm, setAmPm]   = useState<"AM" | "PM">(h24Init >= 12 ? "PM" : "AM");
  const [dragging, setDragging] = useState(false);
  const faceRef = useRef<HTMLDivElement>(null);

  const dH = String(hour).padStart(2, "0");
  const dM = String(minute).padStart(2, "0");

  // Hand angle: hours snap to 12 positions, minutes are free 0-59
  const handH = clockPos(hour, 12);
  const handM = (() => {
    const a = (minute / 60) * 2 * Math.PI - Math.PI / 2;
    return { hx: CCX + HAND_R * Math.cos(a), hy: CCY + HAND_R * Math.sin(a),
             x:  CCX + NUM_R  * Math.cos(a), y:  CCY + NUM_R  * Math.sin(a) };
  })();
  const hand = step === "h" ? handH : handM;

  const calcFromPointer = (clientX: number, clientY: number) => {
    if (!faceRef.current) return;
    const rect = faceRef.current.getBoundingClientRect();
    const dx = clientX - (rect.left + CSIZE / 2);
    const dy = clientY - (rect.top  + CSIZE / 2);
    if (Math.sqrt(dx * dx + dy * dy) < 18) return; // ignore dead zone at center
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    const norm  = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (step === "h") {
      const h = Math.round(norm / (2 * Math.PI) * 12);
      setHour(h === 0 ? 12 : h);
    } else {
      setMinute(Math.round(norm / (2 * Math.PI) * 60) % 60);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    calcFromPointer(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging) calcFromPointer(e.clientX, e.clientY); };
  const onMouseUp   = (e: React.MouseEvent) => {
    if (dragging) {
      calcFromPointer(e.clientX, e.clientY);
      setDragging(false);
      if (step === "h") setStep("m");
    }
  };
  const onTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    calcFromPointer(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    calcFromPointer(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = () => { setDragging(false); if (step === "h") setStep("m"); };

  const confirm = () => {
    const h = ampm === "AM" ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
    onChange(`${String(h).padStart(2, "0")}:${dM}`);
    onClose();
  };

  const hours5   = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes5 = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <>
      <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-[1210] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-2xl shadow-2xl w-[260px] overflow-hidden">

        {/* Time header */}
        <div className="bg-bg/70 px-4 py-3 flex items-center gap-1">
          <button type="button" onClick={() => setStep("h")}
            className={`text-3xl font-black px-2 py-0.5 rounded-xl transition-colors ${step === "h" ? "bg-accent/10 text-accent" : "text-text-secondary/50 hover:text-text-primary"}`}>
            {dH}
          </button>
          <span className="text-text-secondary/40 text-2xl font-black select-none">:</span>
          <button type="button" onClick={() => setStep("m")}
            className={`text-3xl font-black px-2 py-0.5 rounded-xl transition-colors ${step === "m" ? "bg-accent/10 text-accent" : "text-text-secondary/50 hover:text-text-primary"}`}>
            {dM}
          </button>
          <div className="ml-auto flex flex-col gap-0.5">
            {(["AM", "PM"] as const).map(p => (
              <button key={p} type="button" onClick={() => setAmPm(p)}
                className={`text-[11px] font-black px-2 py-0.5 rounded-lg transition-colors ${ampm === p ? "bg-accent/10 text-accent" : "text-text-secondary/40 hover:text-text-primary"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[9px] text-text-secondary/50 font-black uppercase tracking-widest py-1.5">
          {step === "h" ? "Drag or tap to set hour" : "Drag or tap to set minute"}
        </p>

        {/* Clock face — interactive */}
        <div
          ref={faceRef}
          className="relative mx-auto select-none touch-none cursor-pointer"
          style={{ width: CSIZE, height: CSIZE }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <svg className="absolute inset-0 text-accent" width={CSIZE} height={CSIZE}>
            {/* Track ring */}
            <circle cx={CCX} cy={CCY} r={CCX - 8} fill="none" stroke="var(--color-border,#333)" strokeWidth="1.5" />
            {/* Hand */}
            <line x1={CCX} y1={CCY} x2={hand.hx} y2={hand.hy} stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            {/* Center dot */}
            <circle cx={CCX} cy={CCY} r={4} fill="currentColor" />
            {/* Selection circle on hand tip */}
            <circle cx={hand.hx} cy={hand.hy} r={16} fill="currentColor" opacity="0.18" />
            <circle cx={hand.hx} cy={hand.hy} r={6} fill="currentColor" />
          </svg>

          {/* Number labels — reference only for minute step; clickable for hour */}
          {step === "h"
            ? hours5.map((val) => {
                const pos = clockPos(val, 12);
                const sel = val === hour;
                return (
                  <span
                    key={val}
                    style={{ position: "absolute", left: pos.x - 13, top: pos.y - 13, width: 26, height: 26 }}
                    className={`flex items-center justify-center rounded-full text-[11px] font-bold pointer-events-none ${sel ? "text-white" : "text-text-secondary"}`}
                  >
                    {val}
                  </span>
                );
              })
            : minutes5.map((val, i) => {
                const pos = clockPos(i, 12);
                const sel = minute >= val && minute < val + 5 && !(val === 55 && minute === 0);
                return (
                  <span
                    key={val}
                    style={{ position: "absolute", left: pos.x - 13, top: pos.y - 13, width: 26, height: 26 }}
                    className={`flex items-center justify-center rounded-full text-[11px] font-bold pointer-events-none ${sel ? "text-white" : "text-text-secondary/60"}`}
                  >
                    {String(val).padStart(2, "0")}
                  </span>
                );
              })
          }
        </div>

        <div className="p-3 pt-1">
          <button type="button" onClick={confirm}
            className="w-full py-2 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-all">
            Confirm {dH}:{dM} {ampm}
          </button>
        </div>
      </div>
    </>
  );
};

// ── Toolbar button ──────────────────────────────────────────────────────────
const ToolbarBtn = ({
  cmd, value, icon: Icon, title, isActive, activeClass, onExec, editorRef,
}: {
  cmd: string; value?: string; icon: React.ElementType; title: string;
  isActive: boolean; activeClass: string; onExec: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault();
      // Ensure the editor is focused before execCommand — critical on first click
      editorRef.current?.focus();
      document.execCommand(cmd, false, value);
      setTimeout(onExec, 0);
    }}
    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
      isActive
        ? activeClass
        : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
    }`}
  >
    <Icon size={14} strokeWidth={isActive ? 2.5 : 1.75} />
  </button>
);

// ── Main component ──────────────────────────────────────────────────────────
const AddJournal = () => {
  const { id: editJournalId } = useParams<{ id?: string }>();
  const isEditMode = Boolean(editJournalId);
  const { user } = useAppSelector((state) => state.user);
  const isPremiumUser = user?.plan === "inner_circle";
  const photoLimit = isPremiumUser ? 20 : 6;

  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressBoxRef = useRef<HTMLDivElement>(null);
  const tagBoxRef = useRef<HTMLDivElement>(null);
  const [createJournalMutation, { isLoading: isCreatingMutation }] = useCreateJournalMutation();
  const [updateJournalMutation, { isLoading: isUpdatingMutation }] = useUpdateJournalMutation();
  const { data: journalFilters } = useGetJournalFiltersQuery(undefined);
  const { data: existingJournal, isLoading: isJournalLoading } = useGetJournalByIdQuery(editJournalId ?? "", { skip: !isEditMode });
  const [isUploading, setIsUploading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [draftVersion, setDraftVersion] = useState(0);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showCal, setShowCal]     = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [isScreenTimeModalOpen, setIsScreenTimeModalOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const { templates: savedJournalTemplates } = useJournalTemplates(user?._id);

  const nowForDefault = new Date();
  const defaultTime = `${String(nowForDefault.getHours()).padStart(2, "0")}:${String(nowForDefault.getMinutes()).padStart(2, "0")}`;

  const [meta, setMeta] = useState({
    title: "",
    description: "",
    journal_type: "personal",
    mood: "",
    location: "",
    location_address: "",
    location_lat: "",
    location_lng: "",
    date: nowForDefault.toISOString().split("T")[0],
    time: defaultTime,
    is_favorite: false,
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [expenseItems, setExpenseItems] = useState<ExpenseDraftItem[] | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const showUpgradeNotice = !isPremiumUser && photos.length > 6;
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{
    display_name: string;
    lat: string;
    lon: string;
    city?: string;
  }>>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const setM = (k: keyof typeof meta, v: string | boolean) =>
    setMeta((p) => ({ ...p, [k]: v }));

  const normalizeTag = (raw: string) => raw.replace(/^#/, "").trim().toLowerCase().replace(/\s+/g, "_");
  const allTagSuggestions = Array.from(new Set([
    ...JOURNAL_PREDEFINED_TAGS,
    ...((journalFilters?.tags ?? []).map((t: string) => normalizeTag(t)).filter(Boolean)),
  ]));

  const filteredTagSuggestions = allTagSuggestions
    .filter((t) => !selectedTags.includes(t))
    .filter((t) => !tagInput.trim() || t.includes(normalizeTag(tagInput)));
  const customTag = normalizeTag(tagInput);
  const canAddCustomTag = !!customTag && !selectedTags.includes(customTag) && !allTagSuggestions.includes(customTag);

  const addTag = (raw: string) => {
    const next = normalizeTag(raw);
    if (!next) return;
    if (selectedTags.includes(next)) return;
    setSelectedTags((prev) => [...prev, next]);
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const templateBlocks: JournalTemplateBlock[] = (() => {
    const expenseBlock = expenseItems ? toExpenseBlock(expenseItems) : null;
    return expenseBlock ? [expenseBlock] : [];
  })();

  useEffect(() => {
    if (!isEditMode || !existingJournal) return;
    setMeta((prev) => ({
      ...prev,
      title: existingJournal.title ?? "",
      description: existingJournal.description ?? "",
      journal_type: existingJournal.journal_type ?? "personal",
      mood: existingJournal.mood ?? "",
      location: existingJournal.location ?? "",
      location_address: existingJournal.location_address ?? "",
      location_lat: existingJournal.location_lat ? String(existingJournal.location_lat) : "",
      location_lng: existingJournal.location_lng ? String(existingJournal.location_lng) : "",
      date: existingJournal.date ? String(existingJournal.date).split("T")[0] : prev.date,
      time: existingJournal.time ?? prev.time,
      is_favorite: Boolean(existingJournal.is_favorite),
    }));
    setPhotos(existingJournal.photos ?? []);
    setSelectedTags((existingJournal.tags ?? []).map((t: string) => normalizeTag(t)).filter(Boolean));
    const existingTemplateBlocks = resolveJournalTemplateBlocks(existingJournal);
    const existingExpense = getExpenseBlocks(existingTemplateBlocks)[0];
    setExpenseItems(existingExpense ? toExpenseDraft(existingExpense) : null);
    if (editorRef.current) {
      editorRef.current.innerHTML = stripJournalTemplateBlocks(existingJournal.content ?? "");
      setIsEmpty(!editorRef.current.textContent?.trim());
    }
  }, [isEditMode, existingJournal]);

  // Restore draft on mount (new entries only)
  useEffect(() => {
    if (isEditMode) return;
    try {
      const raw = localStorage.getItem("journal_draft_new");
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        meta: typeof meta;
        content: string;
        selectedTags: string[];
        photos: string[];
        expenseItems: ExpenseDraftItem[] | null;
        savedAt: number;
      };
      setMeta(draft.meta);
      setSelectedTags(draft.selectedTags ?? []);
      setPhotos(draft.photos ?? []);
      setExpenseItems(draft.expenseItems ?? null);
      if (editorRef.current && draft.content) {
        editorRef.current.innerHTML = draft.content;
        setIsEmpty(!editorRef.current.textContent?.trim());
      }
      const agoMins = Math.round((Date.now() - draft.savedAt) / 60000);
      toast.success(agoMins < 1 ? "Draft restored" : `Draft restored (saved ${agoMins}m ago)`);
    } catch { /* corrupt/missing draft */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave to localStorage (new entries only, 1.5s debounce)
  useEffect(() => {
    if (isEditMode) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    setAutosaveStatus("saving");
    autosaveTimerRef.current = setTimeout(() => {
      const content = editorRef.current?.innerHTML ?? "";
      try {
        localStorage.setItem("journal_draft_new", JSON.stringify({
          meta,
          content,
          selectedTags,
          photos,
          expenseItems,
          savedAt: Date.now(),
        }));
      } catch { /* storage full */ }
      setAutosaveStatus("saved");
    }, 1500);
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  // draftVersion tracks contentEditable changes that don't update React state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, meta, selectedTags, photos, expenseItems, draftVersion]);

  const color = TYPE_COLOR[meta.journal_type] ?? "violet";
  const ac = AC[color];

  const onEditorInput = useCallback(() => {
    setIsEmpty(!editorRef.current?.textContent?.trim());
    if (!isEditMode) setDraftVersion((v) => v + 1);
  }, [isEditMode]);

  const saveEditorSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    savedSelectionRef.current = range.cloneRange();
  }, []);

  const placeCaretAtEnd = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    savedSelectionRef.current = range.cloneRange();
  }, []);

  const insertScreenTimeSummary = useCallback((payload: { totalMinutes: number; apps: ScreenTimeAppDraft[] }) => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;

    editor.focus();

    if (savedSelectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    } else {
      placeCaretAtEnd();
    }

    if (!selection.rangeCount) {
      placeCaretAtEnd();
    }

    const apps = payload.apps.filter((app) => app.app_name.trim() && app.minutes > 0).slice(0, 3);
    const total = payload.totalMinutes > 0
      ? payload.totalMinutes
      : apps.reduce((sum, app) => sum + app.minutes, 0);

    const lines = [
      "<p><strong>Screen Time</strong></p>",
      `<p>Total | ${escapeHtml(minsToLabel(total))}</p>`,
      "<p>App | Time</p>",
      ...apps.map((app) => `<p>${escapeHtml(app.app_name.trim())} | ${escapeHtml(minsToLabel(app.minutes))}</p>`),
      "<p><br></p>",
    ];

    document.execCommand("insertHTML", false, lines.join(""));
    savedSelectionRef.current = selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    onEditorInput();
  }, [onEditorInput, placeCaretAtEnd]);

  const closeTemplateLibrary = useCallback(() => {
    setIsTemplateLibraryOpen(false);
    setTemplateSearch("");
    setSelectedTemplateId(null);
    setTemplateValues({});
  }, []);

  const insertJournalTemplate = useCallback((template: JournalSavedTemplate, values: Record<string, string>) => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;

    editor.focus();

    if (savedSelectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    } else {
      placeCaretAtEnd();
    }

    if (!selection.rangeCount) {
      placeCaretAtEnd();
    }

    const resolved = renderJournalTemplateContent(template.content, values);
    const html = `${journalTemplateTextToHtml(resolved)}<p><br></p>`;
    document.execCommand("insertHTML", false, html);
    savedSelectionRef.current = selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    onEditorInput();
  }, [onEditorInput, placeCaretAtEnd]);

  const filteredJournalTemplates = savedJournalTemplates.filter((template: JournalSavedTemplate) => {
    const query = templateSearch.trim().toLowerCase();
    if (!query) return true;

    return [template.name, template.category || "", template.content]
      .some((value) => value.toLowerCase().includes(query));
  });

  const selectedTemplate = selectedTemplateId
    ? savedJournalTemplates.find((template: JournalSavedTemplate) => template.id === selectedTemplateId) ?? null
    : null;
  const selectedTemplatePlaceholders = selectedTemplate
    ? getJournalTemplatePlaceholders(selectedTemplate.content)
    : [];

  const handleChooseTemplate = useCallback((template: JournalSavedTemplate) => {
    setSelectedTemplateId(template.id);
    setTemplateValues(
      Object.fromEntries(
        getJournalTemplatePlaceholders(template.content).map((placeholder) => [placeholder, ""]),
      ),
    );
  }, []);

  const handleApplySelectedTemplate = useCallback(() => {
    if (!selectedTemplate) return;

    const placeholders = getJournalTemplatePlaceholders(selectedTemplate.content);
    const missing = placeholders.find((placeholder) => !templateValues[placeholder]?.trim());
    if (missing) {
      toast.error(`${humanizeJournalTemplatePlaceholder(missing)} is required.`);
      return;
    }

    insertJournalTemplate(selectedTemplate, templateValues);
    closeTemplateLibrary();
    toast.success(`Inserted "${selectedTemplate.name}" template`);
  }, [closeTemplateLibrary, insertJournalTemplate, selectedTemplate, templateValues]);

  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const checkActive = useCallback(() => {
    const s = new Set<string>();
    const cmds = ["bold", "italic", "underline", "strikeThrough",
                  "justifyLeft", "justifyCenter", "justifyRight",
                  "insertUnorderedList", "insertOrderedList"];
    for (const c of cmds) {
      try { if (document.queryCommandState(c)) s.add(c); } catch { /* noop */ }
    }
    try {
      const block = document.queryCommandValue("formatBlock").toLowerCase().replace(/^<|>$/g, "");
      if (block) s.add(block);
    } catch { /* noop */ }
    setActiveFormats(s);
  }, []);

  // Returns true when the cursor sits at the very first position of `el`
  // (offset 0 with no preceding siblings between the text node and el).
  const isAtBlockStart = (range: Range, el: HTMLElement): boolean => {
    if (range.startOffset !== 0) return false;
    let node: Node | null = range.startContainer;
    while (node && node !== el) {
      if (node.previousSibling) return false;
      node = node.parentNode;
    }
    return true;
  };

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Backspace" && e.key !== "Enter") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
    const range = sel.getRangeAt(0);

    // Walk up from the cursor to find the nearest block element inside the editor
    let node: Node | null = range.startContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as Element).tagName.toLowerCase();
        if (["blockquote", "h1", "h2", "p", "div", "li"].includes(tag)) break;
      }
      node = node.parentNode;
    }

    if (!node || node === editorRef.current) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (!["blockquote", "h1", "h2", "li"].includes(tag)) return;

    const isEmpty = el.textContent?.trim() === "";

    if (tag === "li") {
      // For list items: intercept when empty OR when cursor is at the very start.
      // Both cases should exit the list rather than merging with the previous item.
      if (!isEmpty && !isAtBlockStart(range, el)) return;
      e.preventDefault();
      document.execCommand("outdent");
    } else {
      // For blockquote / h1 / h2: only intercept on empty lines
      if (!isEmpty) return;
      e.preventDefault();
      document.execCommand("formatBlock", false, "p");
    }
    setTimeout(checkActive, 0);
  }, [checkActive]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const slots = photoLimit - photos.length;
    if (slots <= 0) { toast.error(`Maximum ${photoLimit} photos allowed`); return; }

    const toUpload = files.slice(0, slots);
    if (files.length > slots) toast.error(`Only ${slots} slot${slots > 1 ? "s" : ""} left — uploading first ${slots}`);

    setIsUploading(true);
    const results = await Promise.allSettled(toUpload.map((f) => upload_image_api(f)));
    const urls = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    const failed = results.filter((r) => r.status === "rejected").length;

    if (urls.length) setPhotos((prev) => [...prev, ...urls]);
    if (urls.length) toast.success(`${urls.length} photo${urls.length > 1 ? "s" : ""} added`);
    if (failed) toast.error(`${failed} photo${failed > 1 ? "s" : ""} failed to upload`);

    setIsUploading(false);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta.title.trim()) { toast.error("Title is required"); return; }
    const content = stripJournalTemplateBlocks(editorRef.current?.innerHTML ?? "");
    if (!editorRef.current?.textContent?.trim()) { toast.error("Entry content is required"); return; }
    if (!meta.location_address.trim()) { toast.error("Full address is required"); return; }
    if (!meta.time) { toast.error("Time is required"); return; }

    try {
      const payload = {
        title: meta.title.trim(),
        content,
        description: meta.description.trim() || undefined,
        journal_type: meta.journal_type,
        mood: meta.mood || undefined,
        location: meta.location.trim() || "Selected Location",
        location_address: meta.location_address.trim(),
        location_city: meta.location.trim() || undefined,
        location_lat: meta.location_lat ? Number(meta.location_lat) : undefined,
        location_lng: meta.location_lng ? Number(meta.location_lng) : undefined,
        photos: photos.length ? photos : undefined,
        tags: selectedTags.length ? selectedTags : undefined,
        template_blocks: templateBlocks,
        date: toISO(meta.date),
        time: meta.time,
        is_favorite: meta.is_favorite,
      };

      if (isEditMode && editJournalId) {
        await updateJournalMutation({ id: editJournalId, input: payload }).unwrap();
        toast.success("Journal entry updated");
        navigate(`/dashboard/journal/${editJournalId}`);
      } else {
        await createJournalMutation(payload).unwrap();
        localStorage.removeItem("journal_draft_new");
        toast.success("Journal entry saved");
        navigate("/dashboard/journal");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save entry");
    }
  };

  const isSubmitting = isEditMode ? isUpdatingMutation : isCreatingMutation;

  if (isEditMode && isJournalLoading) {
    return (
      <div className="bg-bg flex-1 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  const handleGeocodeAddress = async (addressValue: string, silent = false) => {
    if (!addressValue.trim()) return;
    try {
      const query = encodeURIComponent(addressValue.trim());
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) {
        if (!silent) toast.error("Could not find coordinates for this address");
        return;
      }
      const best = data[0];
      const city =
        best?.address?.city ||
        best?.address?.town ||
        best?.address?.village ||
        "";
      setMeta((p) => ({
        ...p,
        location_lat: String(best.lat ?? ""),
        location_lng: String(best.lon ?? ""),
        location: city || p.location || "Selected Location",
      }));
      if (!silent) toast.success("Address pinned on map");
    } catch {
      if (!silent) toast.error("Failed to geocode address");
    }
  };

  const fetchAddressSuggestions = async (queryText: string) => {
    if (queryText.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const query = encodeURIComponent(queryText.trim());
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${query}`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!Array.isArray(data)) {
        setAddressSuggestions([]);
        return;
      }
      setAddressSuggestions(
        data.map((item: any) => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          city: item?.address?.city || item?.address?.town || item?.address?.village || item?.address?.hamlet || "",
        })),
      );
    } catch {
      setAddressSuggestions([]);
    }
  };

  const handleSelectAddressSuggestion = (s: { display_name: string; lat: string; lon: string; city?: string }) => {
    setMeta((p) => ({
      ...p,
      location_address: s.display_name,
      location_lat: s.lat,
      location_lng: s.lon,
      location: s.city || p.location || "Selected Location",
    }));
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  const handlePickOnMap = async (lat: number, lng: number) => {
    setMeta((p) => ({ ...p, location_lat: String(lat), location_lng: String(lng) }));
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      const address = data?.display_name || "";
      const city =
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.village ||
        data?.address?.hamlet ||
        "";
      setMeta((p) => ({
        ...p,
        location_address: address || p.location_address,
        location: city || p.location || "Selected Location",
      }));
    } catch {
      // Keep picked coordinates even if reverse geocode fails.
    }
  };


  useEffect(() => {
    document.addEventListener("selectionchange", checkActive);
    return () => document.removeEventListener("selectionchange", checkActive);
  }, [checkActive]);

  useEffect(() => {
    if (!meta.location_address.trim()) return;
    const timer = setTimeout(() => {
      void handleGeocodeAddress(meta.location_address, true);
    }, 700);
    return () => clearTimeout(timer);
  }, [meta.location_address]);

  useEffect(() => {
    if (!meta.location_address.trim()) {
      setAddressSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      void fetchAddressSuggestions(meta.location_address);
    }, 250);
    return () => clearTimeout(timer);
  }, [meta.location_address]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (addressBoxRef.current && !addressBoxRef.current.contains(e.target as Node)) {
        setShowAddressSuggestions(false);
      }
      if (tagBoxRef.current && !tagBoxRef.current.contains(e.target as Node)) {
        setShowTagSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);


  const currentType = JOURNAL_TYPES.find((t) => t.value === meta.journal_type);
  const ac2 = ac.activeBtn;

  const fmt12h = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    return `${String(hh % 12 || 12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="bg-bg flex-1 flex flex-col overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="shrink-0 flex items-center gap-3 px-4 sm:px-5 h-12 border-b border-border bg-surface">
          <Link
            to="/dashboard/journal"
            className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors text-xs font-medium group shrink-0"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Journal</span>
          </Link>
          <div className="w-px h-4 bg-border shrink-0" />
          <span className="text-text-primary font-bold text-sm flex-1 truncate">{isEditMode ? "Edit Entry" : "New Entry"}</span>
          {!isEditMode && autosaveStatus !== "idle" && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg bg-surface border border-border">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-text-secondary">
                {autosaveStatus === "saving" ? (
                  <><Loader2 size={10} className="animate-spin text-accent" /> Saving…</>
                ) : (
                  <><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Draft saved</>
                )}
              </span>
              <div className="w-px h-3 bg-border" />
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("journal_draft_new");
                  setMeta({
                    title: "", description: "", journal_type: "personal", mood: "",
                    location: "", location_address: "", location_lat: "", location_lng: "",
                    date: new Date().toISOString().split("T")[0],
                    time: defaultTime, is_favorite: false,
                  });
                  setSelectedTags([]);
                  setPhotos([]);
                  setExpenseItems(null);
                  if (editorRef.current) { editorRef.current.innerHTML = ""; }
                  setIsEmpty(true);
                  setAutosaveStatus("idle");
                  toast.success("Draft cleared");
                }}
                className="flex items-center gap-1 text-[10px] font-semibold text-text-secondary hover:text-error transition-colors"
                title="Clear draft"
              >
                <X size={10} /> Clear
              </button>
            </div>
          )}
          <span className="text-text-secondary/50 text-xs hidden md:block shrink-0">
            {formatDate(meta.date, { weekday: "short", day: "numeric", month: "short" })}
          </span>
          <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${ac.badge}`}>
            {currentType && <currentType.icon size={10} />}
            <span className="hidden sm:inline">{currentType?.label}</span>
          </div>
          <button
            type="button"
            onClick={() => setM("is_favorite", !meta.is_favorite)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition-all ${
              meta.is_favorite
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                : "bg-bg border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            <Star size={13} fill={meta.is_favorite ? "currentColor" : "none"} />
            <span className="hidden sm:inline">{meta.is_favorite ? "Favourite" : "Mark Favourite"}</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className={`shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-white disabled:opacity-50 transition-all ${ac.btn}`}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span className="hidden sm:inline">{isSubmitting ? (isEditMode ? "Updating…" : "Saving…") : (isEditMode ? "Update" : "Save")}</span>
          </button>
        </div>

        {/* ── Split pane ────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)_auto] overflow-y-auto lg:overflow-hidden custom-scrollbar">

          {/* LEFT — writing area */}
          <div className="lg:min-h-0 flex flex-col overflow-hidden min-h-[58vh] lg:col-start-1 lg:row-start-1">

            {/* Title */}
            <input
              required
              type="text"
              placeholder="What's on your mind today? *"
              value={meta.title}
              onChange={(e) => setM("title", e.target.value)}
              className="shrink-0 w-full bg-transparent border-0 border-b border-border px-5 sm:px-7 pt-4 pb-3 text-text-primary placeholder:text-text-secondary/25 focus:outline-none text-lg sm:text-xl font-bold"
            />

            {/* Description */}
            <input
              type="text"
              placeholder="One-line summary (optional)"
              value={meta.description}
              onChange={(e) => setM("description", e.target.value)}
              className="shrink-0 w-full bg-transparent border-0 border-b border-border px-5 sm:px-7 py-2.5 text-xs text-text-secondary placeholder:text-text-secondary/25 focus:outline-none"
            />

            {/* Toolbar */}
            <div className="shrink-0 flex flex-wrap items-center gap-y-1 px-3 py-1.5 border-b border-border bg-bg/50">
              <div className="flex items-center gap-0.5">
                <ToolbarBtn cmd="bold"          icon={Bold}          title="Bold (Ctrl+B)"      isActive={activeFormats.has("bold")}          activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
                <ToolbarBtn cmd="italic"        icon={Italic}        title="Italic (Ctrl+I)"    isActive={activeFormats.has("italic")}        activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
                <ToolbarBtn cmd="underline"     icon={Underline}     title="Underline (Ctrl+U)" isActive={activeFormats.has("underline")}     activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
                <ToolbarBtn cmd="strikeThrough" icon={Strikethrough} title="Strikethrough"      isActive={activeFormats.has("strikeThrough")} activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
              </div>
              <div className="w-px h-4 bg-border mx-1.5 shrink-0" />
              <div className="flex items-center gap-0.5">
                <ToolbarBtn cmd="formatBlock" value="h1"         icon={Heading1} title="Heading 1" isActive={activeFormats.has("h1")}         activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
                <ToolbarBtn cmd="formatBlock" value="h2"         icon={Heading2} title="Heading 2" isActive={activeFormats.has("h2")}         activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
                <ToolbarBtn cmd="formatBlock" value="blockquote" icon={Quote}    title="Quote"     isActive={activeFormats.has("blockquote")} activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
              </div>
              <div className="w-px h-4 bg-border mx-1.5 shrink-0" />
              <div className="flex items-center gap-0.5">
                <ToolbarBtn cmd="insertUnorderedList" icon={List}        title="Bullet List"   isActive={activeFormats.has("insertUnorderedList")} activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
                <ToolbarBtn cmd="insertOrderedList"   icon={ListOrdered} title="Numbered List" isActive={activeFormats.has("insertOrderedList")}   activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
              </div>
              <div className="w-px h-4 bg-border mx-1.5 shrink-0" />
              <div className="flex items-center gap-0.5">
                <ToolbarBtn cmd="justifyLeft"   icon={AlignLeft}   title="Align Left"   isActive={activeFormats.has("justifyLeft")}   activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
                <ToolbarBtn cmd="justifyCenter" icon={AlignCenter} title="Align Center" isActive={activeFormats.has("justifyCenter")} activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
                <ToolbarBtn cmd="justifyRight"  icon={AlignRight}  title="Align Right"  isActive={activeFormats.has("justifyRight")}  activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
              </div>
              <div className="w-px h-4 bg-border mx-1.5 shrink-0" />
              <ToolbarBtn cmd="insertHorizontalRule" icon={Minus} title="Divider" isActive={false} activeClass={ac2} onExec={checkActive} editorRef={editorRef} />
              <div className="w-px h-4 bg-border mx-1.5 shrink-0" />
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  saveEditorSelection();
                }}
                onClick={() => setIsScreenTimeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
                title="Add screen time"
              >
                <Clock size={13} />
                Screen Time
              </button>
            </div>

            {/* Editor — fills remaining height */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
              {isEmpty && (
                <span className="absolute top-5 left-5 sm:left-7 text-text-secondary/25 text-sm pointer-events-none select-none leading-relaxed">
                  Write freely… this is your safe space. <span className="text-rose-400/40">*</span>
                </span>
              )}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={onEditorInput}
                onKeyDown={handleEditorKeyDown}
                onMouseUp={saveEditorSelection}
                onKeyUp={saveEditorSelection}
                className="w-full h-full min-h-[44vh] sm:min-h-[320px] p-5 sm:p-7 text-text-primary focus:outline-none leading-[1.9] text-sm sm:text-base journal-editor"
                style={{ wordBreak: "break-word" }}
              />
            </div>
          </div>

          {/* RIGHT — sidebar */}
          <div className="border-t lg:border-t-0 lg:border-l border-border bg-surface/40 lg:col-start-2 lg:row-span-2 lg:h-full lg:min-h-0 lg:overflow-y-auto custom-scrollbar">
            <div className="p-4 flex flex-col gap-4">

              {/* Type */}
              <div className="space-y-2">
                <label className="text-text-secondary text-xs font-black uppercase tracking-tighter">
                  Type <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={meta.journal_type}
                  options={JOURNAL_TYPES.map(({ value, label, icon }) => ({ value, label, icon }))}
                  onChange={(val) => setM("journal_type", val)}
                />
              </div>

              <div className="h-px bg-border" />

              {/* Templates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-text-secondary text-xs font-black uppercase tracking-tighter flex items-center gap-1.5">
                    <Sparkles size={12} /> Templates
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        saveEditorSelection();
                      }}
                      onClick={() => setIsTemplateLibraryOpen(true)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 text-accent text-[10px] font-bold hover:bg-accent/15 transition-colors"
                    >
                      <Sparkles size={11} /> Library
                    </button>
                    {!expenseItems && (
                      <button
                        type="button"
                        onClick={() => setExpenseItems([{ id: newId(), amount: "", note: "" }])}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 text-accent text-[10px] font-bold hover:bg-accent/15 transition-colors"
                      >
                        <Plus size={11} /> Expenses
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-bg/40 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-text-primary text-xs font-semibold">
                      {savedJournalTemplates.length} saved template{savedJournalTemplates.length === 1 ? "" : "s"}
                    </p>
                    <Link
                      to="/dashboard/settings?tab=journal_templates"
                      className="text-accent text-[11px] font-bold hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                  <p className="text-text-secondary text-[11px] mt-1">
                    Use personalized templates with placeholders like {"{pages}"} and {"{book}"}.
                  </p>
                </div>
                {expenseItems ? (
                  <ExpensesBlockEditor
                    items={expenseItems}
                    onChange={(items) => setExpenseItems(items.length ? items : [{ id: newId(), amount: "", note: "" }])}
                    onRemove={() => setExpenseItems(null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setExpenseItems([{ id: newId(), amount: "", note: "" }])}
                    className="w-full rounded-xl border border-dashed border-border bg-bg/60 px-3 py-4 text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add expenses template
                  </button>
                )}
              </div>

              <div className="h-px bg-border" />

              {/* Date + Time — side by side */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-text-secondary text-xs font-black uppercase tracking-tighter flex items-center gap-1.5">
                    <Calendar size={12} /> Date <span className="text-rose-500">*</span>
                  </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressSuggestions(false);
                        setShowTagSuggestions(false);
                        setShowClock(false);
                        setShowCal(true);
                      }}
                    className={`w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none transition-colors text-left flex items-center gap-1.5 ${ac.ring}`}
                  >
                    <Calendar size={12} className="text-text-secondary shrink-0" />
                    <span className="truncate">
                      {formatDate(meta.date + "T12:00:00")}
                    </span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-secondary text-xs font-black uppercase tracking-tighter flex items-center gap-1.5">
                    <Clock size={12} /> Time <span className="text-rose-500">*</span>
                  </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressSuggestions(false);
                        setShowTagSuggestions(false);
                        setShowCal(false);
                        setShowClock(true);
                      }}
                    className={`w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none transition-colors text-left flex items-center gap-1.5 ${ac.ring}`}
                  >
                    <Clock size={12} className="text-text-secondary shrink-0" />
                    <span className="truncate">{meta.time ? fmt12h(meta.time) : "Select"}</span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div onMouseDown={() => setShowAddressSuggestions(false)}>
                <Select
                  label="Mood"
                  value={meta.mood}
                  options={[{ value: "", label: "Select mood…" }, ...MOODS.map(m => ({ value: m.value, label: `${m.emoji} ${m.label}` }))]}
                  onChange={(val) => setM("mood", val)}
                  icon={Smile}
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-text-secondary text-xs font-black uppercase tracking-tighter flex items-center gap-1.5">
                  <MapPin size={12} /> Address <span className="text-rose-500">*</span>
                </label>
                <div ref={addressBoxRef} className="relative z-[200]">
                  <input
                    type="text"
                    placeholder="Kundalahalli Colony, Brookefield, Bengaluru"
                    value={meta.location_address}
                    onFocus={() => setShowAddressSuggestions(true)}
                    onChange={(e) => {
                      setM("location_address", e.target.value);
                      setShowAddressSuggestions(true);
                    }}
                    className={`w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary placeholder:text-text-secondary/25 focus:outline-none transition-colors ${ac.ring}`}
                  />
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[999] rounded-xl border border-border bg-surface shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      {addressSuggestions.map((s, idx) => (
                        <button
                          key={`${s.lat}-${s.lon}-${idx}`}
                          type="button"
                          onClick={() => handleSelectAddressSuggestion(s)}
                          className="w-full text-left px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg transition-colors border-b border-border last:border-b-0"
                        >
                          {s.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-text-secondary/70">
                  Pin updates automatically from address.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary text-xs font-black uppercase tracking-tighter">Map Picker</label>
                <LocationPickerMap
                  lat={meta.location_lat ? Number(meta.location_lat) : undefined}
                  lng={meta.location_lng ? Number(meta.location_lng) : undefined}
                  onPick={handlePickOnMap}
                />
                <p className="text-[10px] text-text-secondary/70">Click anywhere on map to set marker location.</p>
              </div>

              {/* Tags */}
              <div ref={tagBoxRef} className="space-y-1.5 relative z-[240]">
                <label className="text-text-secondary text-xs font-black uppercase tracking-tighter flex items-center gap-1.5">
                  <Hash size={12} /> Tags
                </label>
                <div className={`w-full min-h-[40px] bg-bg border border-border rounded-lg px-2 py-1.5 flex flex-wrap items-center gap-1.5 ${ac.ring}`}>
                  {selectedTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-xs">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-accent/80 hover:text-accent">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onFocus={() => setShowTagSuggestions(true)}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Tab" || e.key === " ") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                      if (e.key === "Backspace" && !tagInput && selectedTags.length) {
                        removeTag(selectedTags[selectedTags.length - 1]);
                      }
                    }}
                    placeholder={selectedTags.length ? "Add more tags..." : "Type tag and press Space/Enter"}
                    className="flex-1 min-w-[120px] bg-transparent text-xs text-text-primary placeholder:text-text-secondary/35 focus:outline-none"
                  />
                </div>
                {showTagSuggestions && (filteredTagSuggestions.length > 0 || canAddCustomTag) && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[999] rounded-xl border border-border bg-surface shadow-2xl overflow-hidden max-h-44 overflow-y-auto">
                    {canAddCustomTag && (
                      <button
                        type="button"
                        onClick={() => addTag(customTag)}
                        className="w-full text-left px-3 py-2 text-xs text-accent hover:bg-bg transition-colors border-b border-border"
                      >
                        Add #{customTag}
                      </button>
                    )}
                    {filteredTagSuggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg transition-colors border-b border-border last:border-b-0"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-border" />

            </div>
          </div>

        {/* ── Photos section ───────────────────────────────────────────── */}
        <div className="h-44 border-t border-border flex flex-col w-full lg:col-start-1 lg:row-start-2">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-2 border-b border-border bg-surface/60">
            <div className="flex items-center gap-2">
              <ImageIcon size={13} className="text-text-secondary" />
              <span className="text-xs font-black uppercase tracking-tighter text-text-secondary">Photos</span>
              <span className="text-text-secondary/40 text-xs">{photos.length}/{photoLimit}</span>
            </div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploading || photos.length >= photoLimit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40"
            >
              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              Add Photo
            </button>
            <input ref={photoInputRef} type="file" onChange={handlePhotoUpload} accept="image/*" multiple className="hidden" />
          </div>
          {showUpgradeNotice && (
            <div className="px-5 py-1.5 border-b border-border bg-amber-500/10 text-amber-300 text-[11px]">
              You have more than 6 photos. Upgrade to Inner Circle to continue adding more.
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-h-0 px-5 py-3">
            {photos.length === 0 ? (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-text-secondary/40 hover:text-text-secondary hover:border-border/70 transition-all"
              >
                <Camera size={26} />
                <span className="text-xs font-medium">Add photos to this entry</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 h-full overflow-x-auto">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative shrink-0 h-full aspect-square rounded-xl overflow-hidden group">
                    <img src={get_full_image_url(url, "user")} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoUrl(url)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                      >
                        <Eye size={13} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotos((p) => p.filter((_, i) => i !== idx))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/20 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-rose-500/30 transition-colors"
                      >
                        <X size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {photos.length < photoLimit && (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploading}
                    className="shrink-0 h-full aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-text-secondary/30 hover:text-text-secondary transition-colors disabled:opacity-40"
                  >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    <span className="text-[10px] font-medium">Add</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        </div>

      {showCal && (
        <CalendarPicker
          value={meta.date}
          onSelect={(v) => { setM("date", v); setShowCal(false); setShowClock(true); }}
          onClose={() => setShowCal(false)}
        />
      )}
      {showClock && (
        <ClockPicker
          value={meta.time}
          onChange={(v) => { setM("time", v); setShowClock(false); }}
          onClose={() => setShowClock(false)}
        />
      )}
      <Modal
        isOpen={isTemplateLibraryOpen}
        onClose={closeTemplateLibrary}
        title={selectedTemplate ? selectedTemplate.name : "Journal Templates"}
        maxWidth="760px"
        footer={
          selectedTemplate ? (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplateId(null);
                  setTemplateValues({});
                }}
                className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleApplySelectedTemplate}
                className="bg-accent hover:bg-accent/90 text-background px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Insert Template
              </button>
            </div>
          ) : (
            <div className="flex justify-between gap-3">
              <Link
                to="/dashboard/settings?tab=journal_templates"
                onClick={closeTemplateLibrary}
                className="inline-flex items-center gap-2 text-accent text-sm font-bold hover:underline"
              >
                Manage templates in Settings
              </Link>
              <button
                type="button"
                onClick={closeTemplateLibrary}
                className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Close
              </button>
            </div>
          )
        }
      >
        {selectedTemplate ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-bg/40 p-4">
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Template Preview</p>
              <p className="text-text-primary text-sm whitespace-pre-line mt-2">{selectedTemplate.content}</p>
            </div>

            {selectedTemplatePlaceholders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTemplatePlaceholders.map((placeholder) => (
                  <div key={placeholder} className="space-y-1.5">
                    <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                      {humanizeJournalTemplatePlaceholder(placeholder)}
                    </label>
                    <input
                      type="text"
                      value={templateValues[placeholder] || ""}
                      onChange={(e) => setTemplateValues((current) => ({ ...current, [placeholder]: e.target.value }))}
                      placeholder={`Enter ${humanizeJournalTemplatePlaceholder(placeholder).toLowerCase()}`}
                      className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-bg/40 p-4">
                <p className="text-text-secondary text-sm">
                  This template has no placeholders. It will be inserted exactly as saved.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates by name, category or content..."
                className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 transition-colors"
              />
              <p className="text-text-secondary text-xs">
                Pick a saved template and fill its placeholders before inserting it into your journal.
              </p>
            </div>

            {filteredJournalTemplates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-bg/30 p-10 text-center">
                <p className="text-text-primary text-sm font-bold">No templates found</p>
                <p className="text-text-secondary text-xs mt-2">
                  Create templates in Settings and they’ll appear here. Your expenses template stays separate.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredJournalTemplates.map((template: JournalSavedTemplate) => {
                  const placeholders = getJournalTemplatePlaceholders(template.content);

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleChooseTemplate(template)}
                      className="text-left rounded-2xl border border-border bg-bg/35 p-4 hover:border-accent/40 hover:bg-bg/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-text-primary text-sm font-bold">{template.name}</p>
                            {template.category && (
                              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-semibold uppercase tracking-wide">
                                {template.category}
                              </span>
                            )}
                          </div>
                          <p className="text-text-secondary text-xs mt-2 whitespace-pre-line line-clamp-3">
                            {template.content}
                          </p>
                        </div>
                        <span className="text-accent text-xs font-bold shrink-0">Use</span>
                      </div>
                      {placeholders.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {placeholders.map((placeholder) => (
                            <span key={placeholder} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary text-[11px]">
                              {humanizeJournalTemplatePlaceholder(placeholder)}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
      <ScreenTimeImportModal
        isOpen={isScreenTimeModalOpen}
        onClose={() => setIsScreenTimeModalOpen(false)}
        onAdd={(payload) => {
          insertScreenTimeSummary(payload);
          setIsScreenTimeModalOpen(false);
          toast.success("Screen time added to journal");
        }}
      />
      <Modal
        isOpen={!!previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
        title="Photo Preview"
        maxWidth="900px"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Close
            </button>
          </div>
        }
      >
        {previewPhotoUrl && (
          <div className="rounded-2xl overflow-hidden border border-border bg-bg/40">
            <img
              src={get_full_image_url(previewPhotoUrl, "user")}
              alt="Journal preview"
              className="w-full max-h-[75vh] object-contain bg-black/20"
            />
          </div>
        )}
      </Modal>
      </form>

      {/* Editor typography styles */}
      <style>{`
        .journal-editor:focus { outline: none; }
        .journal-editor h1 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0 0.25rem; line-height: 1.3; }
        .journal-editor h2 { font-size: 1.2rem; font-weight: 700; margin: 0.6rem 0 0.2rem; line-height: 1.3; }
        .journal-editor blockquote { border-left: 3px solid currentColor; padding-left: 1rem; margin: 0.5rem 0; opacity: 0.7; font-style: italic; }
        .journal-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.4rem 0; }
        .journal-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.4rem 0; }
        .journal-editor li { margin: 0.15rem 0; }
        .journal-editor hr { border: none; border-top: 1px solid var(--color-border, #333); margin: 1rem 0; }
        .journal-editor b, .journal-editor strong { font-weight: 700; }
        .journal-editor i, .journal-editor em { font-style: italic; }
        .journal-editor u { text-decoration: underline; }
        .journal-editor s, .journal-editor strike { text-decoration: line-through; }
        .journal-editor p { margin: 0.2rem 0; }
      `}</style>
    </div>
  );
};

export default AddJournal;
