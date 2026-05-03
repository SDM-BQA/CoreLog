import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Save,
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
import { useCreateJournalMutation } from "../../../../@store/api/journal.api";
import { get_full_image_url } from "../../../../@utils/api.utils";
import Select from "../../../../@components/@ui/Select";
import { toast } from "react-toast";

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

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

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
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-2xl shadow-2xl w-[320px] overflow-hidden">

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
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-2xl shadow-2xl w-[260px] overflow-hidden">

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
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [createJournalMutation, { isLoading: isCreatingMutation }] = useCreateJournalMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [showCal, setShowCal]     = useState(false);
  const [showClock, setShowClock] = useState(false);

  const nowForDefault = new Date();
  const defaultTime = `${String(nowForDefault.getHours()).padStart(2, "0")}:${String(nowForDefault.getMinutes()).padStart(2, "0")}`;

  const [meta, setMeta] = useState({
    title: "",
    description: "",
    journal_type: "personal",
    mood: "",
    location: "",
    tags: "",
    date: nowForDefault.toISOString().split("T")[0],
    time: defaultTime,
    is_favorite: false,
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const setM = (k: keyof typeof meta, v: string | boolean) =>
    setMeta((p) => ({ ...p, [k]: v }));

  const color = TYPE_COLOR[meta.journal_type] ?? "violet";
  const ac = AC[color];

  const onEditorInput = useCallback(() => {
    setIsEmpty(!editorRef.current?.textContent?.trim());
  }, []);

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

    const slots = 6 - photos.length;
    if (slots <= 0) { toast.error("Maximum 6 photos allowed"); return; }

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
    const content = editorRef.current?.innerHTML ?? "";
    if (!editorRef.current?.textContent?.trim()) { toast.error("Entry content is required"); return; }
    if (!meta.location.trim()) { toast.error("Location is required"); return; }
    if (!meta.time) { toast.error("Time is required"); return; }

    try {
      await createJournalMutation({
        title: meta.title.trim(),
        content,
        description: meta.description.trim() || undefined,
        journal_type: meta.journal_type,
        mood: meta.mood || undefined,
        location: meta.location.trim(),
        photos: photos.length ? photos : undefined,
        tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        date: new Date(meta.date).toISOString(),
        time: meta.time,
        is_favorite: meta.is_favorite,
      }).unwrap();
      toast.success("Journal entry saved");
      navigate("/dashboard/journal");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save entry");
    }
  };

  const isSubmitting = isCreatingMutation;


  useEffect(() => {
    document.addEventListener("selectionchange", checkActive);
    return () => document.removeEventListener("selectionchange", checkActive);
  }, [checkActive]);


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
          <span className="text-text-primary font-bold text-sm flex-1 truncate">New Entry</span>
          <span className="text-text-secondary/50 text-xs hidden md:block shrink-0">
            {new Date(meta.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </span>
          <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${ac.badge}`}>
            {currentType && <currentType.icon size={10} />}
            <span className="hidden sm:inline">{currentType?.label}</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className={`shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-white disabled:opacity-50 transition-all ${ac.btn}`}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span className="hidden sm:inline">{isSubmitting ? "Saving…" : "Save"}</span>
          </button>
        </div>

        {/* ── Split pane ────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden custom-scrollbar">

          {/* LEFT — writing area */}
          <div className="lg:flex-1 lg:min-h-0 flex flex-col overflow-hidden">

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
                className="w-full h-full min-h-[180px] p-5 sm:p-7 text-text-primary focus:outline-none leading-[1.9] text-sm sm:text-base journal-editor"
                style={{ wordBreak: "break-word" }}
              />
            </div>
          </div>

          {/* RIGHT — sidebar */}
          <div className="border-t lg:border-t-0 lg:border-l border-border lg:w-[300px] lg:shrink-0 overflow-y-auto custom-scrollbar bg-surface/40">
            <div className="p-4 flex flex-col gap-4">

              {/* Type */}
              <div className="space-y-2">
                <label className="text-text-secondary text-xs font-black uppercase tracking-tighter">
                  Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {JOURNAL_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setM("journal_type", value)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all ${
                        meta.journal_type === value
                          ? `${AC[TYPE_COLOR[value]].badge} border-current`
                          : "bg-bg border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  ))}
                </div>
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
                    onClick={() => setShowCal(true)}
                    className={`w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none transition-colors text-left flex items-center gap-1.5 ${ac.ring}`}
                  >
                    <Calendar size={12} className="text-text-secondary shrink-0" />
                    <span className="truncate">
                      {new Date(meta.date + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-secondary text-xs font-black uppercase tracking-tighter flex items-center gap-1.5">
                    <Clock size={12} /> Time <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowClock(true)}
                    className={`w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none transition-colors text-left flex items-center gap-1.5 ${ac.ring}`}
                  >
                    <Clock size={12} className="text-text-secondary shrink-0" />
                    <span className="truncate">{meta.time ? fmt12h(meta.time) : "Select"}</span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-border" />

              <Select
                label="Mood"
                value={meta.mood}
                options={[{ value: "", label: "Select mood…" }, ...MOODS.map(m => ({ value: m.value, label: `${m.emoji} ${m.label}` }))]}
                onChange={(val) => setM("mood", val)}
                icon={Smile}
              />

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-text-secondary text-xs font-black uppercase tracking-tighter flex items-center gap-1.5">
                  <MapPin size={12} /> Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Where are you writing from?"
                  value={meta.location}
                  onChange={(e) => setM("location", e.target.value)}
                  className={`w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary placeholder:text-text-secondary/25 focus:outline-none transition-colors ${ac.ring}`}
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-text-secondary text-xs font-black uppercase tracking-tighter flex items-center gap-1.5">
                  <Hash size={12} /> Tags
                </label>
                <input
                  type="text"
                  placeholder="growth, family, goals…"
                  value={meta.tags}
                  onChange={(e) => setM("tags", e.target.value)}
                  className={`w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary placeholder:text-text-secondary/25 focus:outline-none transition-colors ${ac.ring}`}
                />
              </div>

              <div className="h-px bg-border" />

              {/* Favourite */}
              <button
                type="button"
                onClick={() => setM("is_favorite", !meta.is_favorite)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                  meta.is_favorite
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-bg border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                <Star size={14} fill={meta.is_favorite ? "currentColor" : "none"} />
                {meta.is_favorite ? "Marked as favourite" : "Mark as favourite"}
              </button>

            </div>
          </div>
        </div>

        {/* ── Photos section ───────────────────────────────────────────── */}
        <div className="shrink-0 h-44 border-t border-border flex flex-col">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-2 border-b border-border bg-surface/60">
            <div className="flex items-center gap-2">
              <ImageIcon size={13} className="text-text-secondary" />
              <span className="text-xs font-black uppercase tracking-tighter text-text-secondary">Photos</span>
              <span className="text-text-secondary/40 text-xs">{photos.length}/6</span>
            </div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploading || photos.length >= 6}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40"
            >
              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              Add Photo
            </button>
            <input ref={photoInputRef} type="file" onChange={handlePhotoUpload} accept="image/*" multiple className="hidden" />
          </div>

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
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => p.filter((_, i) => i !== idx))}
                      className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
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
