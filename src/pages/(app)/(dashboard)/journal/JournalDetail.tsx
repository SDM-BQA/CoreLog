import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Clock, Calendar, Tag,
  Pencil, Trash2, Loader2, Hash, Save, Camera, X,
  FileText, User, DollarSign, Plane, Heart,
  Briefcase, Sparkles, Moon, Lightbulb, MoreHorizontal,
  Image as ImageIcon, BookOpen, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  get_journal_query,
  delete_journal_mutation,
  update_journal_mutation,
  type Journal,
} from "../../../../@apis/journal";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { upload_image_api } from "../../../../@apis/users";
import { Modal } from "../../../../@components/@smart";
import Select from "../../../../@components/@ui/Select";
import DeleteModal from "../../../../@components/DeleteModal";
import { toast } from "react-toast";

// ── Config ───────────────────────────────────────────────────────────────────
const MOOD_MAP: Record<string, { emoji: string; color: string; bg: string }> = {
  happy:       { emoji: "😊", color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/20" },
  calm:        { emoji: "😌", color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  sad:         { emoji: "😔", color: "text-slate-400",   bg: "bg-slate-500/10 border-slate-500/20" },
  anxious:     { emoji: "😟", color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
  excited:     { emoji: "🤩", color: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/20" },
  grateful:    { emoji: "🙏", color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
  angry:       { emoji: "😤", color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
  melancholic: { emoji: "🌧️", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  hopeful:     { emoji: "🌱", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  overwhelmed: { emoji: "😵", color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20" },
  content:     { emoji: "☺️", color: "text-teal-400",   bg: "bg-teal-500/10 border-teal-500/20" },
  confused:    { emoji: "🤔", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
};

const TYPE_MAP: Record<string, { icon: React.ElementType; label: string; badge: string; accent: string }> = {
  personal:  { icon: User,          label: "Personal",  badge: "bg-violet-500/10 border-violet-500/20 text-violet-400",   accent: "from-violet-500/20" },
  plan:      { icon: FileText,      label: "Plan",      badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",         accent: "from-blue-500/20" },
  finance:   { icon: DollarSign,    label: "Finance",   badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",accent: "from-emerald-500/20" },
  travel:    { icon: Plane,         label: "Travel",    badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",      accent: "from-amber-500/20" },
  health:    { icon: Heart,         label: "Health",    badge: "bg-rose-500/10 border-rose-500/20 text-rose-400",         accent: "from-rose-500/20" },
  work:      { icon: Briefcase,     label: "Work",      badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",         accent: "from-cyan-500/20" },
  gratitude: { icon: Sparkles,      label: "Gratitude", badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",  accent: "from-yellow-500/20" },
  dream:     { icon: Moon,          label: "Dream",     badge: "bg-purple-500/10 border-purple-500/20 text-purple-400",  accent: "from-purple-500/20" },
  ideas:     { icon: Lightbulb,     label: "Ideas",     badge: "bg-orange-500/10 border-orange-500/20 text-orange-400",  accent: "from-orange-500/20" },
  other:     { icon: MoreHorizontal,label: "Other",     badge: "bg-slate-500/10 border-slate-500/20 text-slate-400",     accent: "from-slate-500/20" },
};

const JOURNAL_TYPES = Object.entries(TYPE_MAP).map(([value, { label, icon }]) => ({ value, label, icon }));
const MOODS_LIST = Object.entries(MOOD_MAP).map(([value, { emoji }]) => ({ value, label: `${emoji} ${value.charAt(0).toUpperCase() + value.slice(1)}` }));

const fmt12h = (time?: string) => {
  if (!time) return "";
  const [hh, mm] = time.split(":").map(Number);
  return `${String(hh % 12 || 12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
};

const parseDate = (val: string | undefined): Date | null => {
  if (!val) return null;
  const n = Number(val);
  if (!isNaN(n) && n > 1_000_000_000) return new Date(n);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const fmtDate = (val: string | undefined) => {
  const d = parseDate(val);
  return d ? d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—";
};

const fmtShort = (val: string | undefined) => {
  const d = parseDate(val);
  return d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
};

const wordCount = (html: string) => {
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent || "").trim().split(/\s+/).filter(Boolean).length;
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({ photos, index, onClose }: { photos: string[]; index: number; onClose: () => void }) => {
  const [cur, setCur] = useState(index);
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={(e) => { e.stopPropagation(); setCur((c) => (c - 1 + photos.length) % photos.length); }}
      >
        <ChevronLeft size={20} />
      </button>
      <img
        src={get_full_image_url(photos[cur], "user")}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={(e) => { e.stopPropagation(); setCur((c) => (c + 1) % photos.length); }}
      >
        <ChevronRight size={20} />
      </button>
      <span className="absolute bottom-6 text-white/60 text-sm">{cur + 1} / {photos.length}</span>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const JournalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [journal, setJournal]           = useState<Journal | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [isUpdating, setIsUpdating]     = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [lightbox, setLightbox]         = useState<number | null>(null);
  const [editPhotos, setEditPhotos]     = useState<string[]>([]);
  const photoInputRef                   = useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState({
    title: "", description: "", content: "",
    journal_type: "personal", mood: "", location: "",
    tags: "", date: "", time: "", is_favorite: false,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await get_journal_query(id);
        if (data) { setJournal(data); syncEdit(data); }
        else { toast.error("Entry not found"); navigate("/dashboard/journal"); }
      } catch {
        toast.error("Failed to load entry");
        navigate("/dashboard/journal");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const syncEdit = (j: Journal) => {
    setEditPhotos(j.photos ?? []);
    setEditData({
    title:        j.title,
    description:  j.description ?? "",
    content:      j.content,
    journal_type: j.journal_type,
    mood:         j.mood ?? "",
    location:     j.location ?? "",
    tags:         j.tags?.join(", ") ?? "",
    date:         j.date ? j.date.split("T")[0] : "",
    time:         j.time ?? "",
    is_favorite:  j.is_favorite ?? false,
  });
  };

  const setE = <K extends keyof typeof editData>(k: K, v: typeof editData[K]) =>
    setEditData((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!id) return;
    if (!editData.title.trim()) { toast.error("Title is required"); return; }
    setIsUpdating(true);
    try {
      const result = await update_journal_mutation(id, {
        title:        editData.title.trim(),
        description:  editData.description || undefined,
        content:      editData.content,
        journal_type: editData.journal_type,
        mood:         editData.mood || undefined,
        location:     editData.location,
        tags:         editData.tags ? editData.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        date:         editData.date ? new Date(editData.date).toISOString() : undefined,
        time:         editData.time || undefined,
        is_favorite:  editData.is_favorite,
        photos:       editPhotos.length ? editPhotos : undefined,
      });
      setJournal(result);
      toast.success("Entry updated");
      setIsEditOpen(false);
    } catch {
      toast.error("Failed to update entry");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const slots = 6 - editPhotos.length;
    if (slots <= 0) { toast.error("Maximum 6 photos"); return; }
    const toUpload = files.slice(0, slots);
    setIsUploading(true);
    const results = await Promise.allSettled(toUpload.map((f) => upload_image_api(f)));
    const urls = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    if (urls.length) setEditPhotos((p) => [...p, ...urls]);
    if (results.some((r) => r.status === "rejected")) toast.error("Some photos failed to upload");
    setIsUploading(false);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await delete_journal_mutation(id);
      toast.success("Entry deleted");
      navigate("/dashboard/journal");
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="bg-bg flex-1 flex flex-col items-center justify-center gap-4">
        <BookOpen size={40} className="text-text-secondary/30" />
        <p className="text-text-secondary">Entry not found.</p>
        <Link to="/dashboard/journal" className="text-accent text-sm font-semibold hover:underline">Back to Journal</Link>
      </div>
    );
  }

  const type    = TYPE_MAP[journal.journal_type] ?? TYPE_MAP.other;
  const mood    = journal.mood ? MOOD_MAP[journal.mood] : null;
  const TypeIcon = type.icon;
  const words   = wordCount(journal.content);
  const hasPhotos = journal.photos?.length > 0;

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      {lightbox !== null && (
        <Lightbox photos={journal.photos} index={lightbox} onClose={() => setLightbox(null)} />
      )}

      {/* ── Hero ── */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden">
        {hasPhotos ? (
          <img
            src={get_full_image_url(journal.photos[0], "user")}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${type.accent} to-bg`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />

        {/* Back + actions */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-8 pt-5">
          <Link
            to="/dashboard/journal"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium group bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Journal</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { syncEdit(journal); setIsEditOpen(true); }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/50 transition-colors text-sm font-semibold"
            >
              <Pencil size={14} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 backdrop-blur-sm text-rose-400 hover:text-rose-300 hover:bg-black/50 transition-colors text-sm font-semibold"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${type.badge}`}>
              <TypeIcon size={9} />
              {type.label}
            </span>
            {mood && (
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${mood.bg} ${mood.color}`}>
                {mood.emoji} <span className="capitalize">{journal.mood}</span>
              </span>
            )}
            {journal.is_favorite && (
              <span className="text-yellow-400"><Star size={14} fill="currentColor" /></span>
            )}
          </div>
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight line-clamp-2 drop-shadow-lg">
            {journal.title}
          </h1>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* Description */}
        {journal.description && (
          <p className="text-text-secondary text-base italic border-l-2 border-accent/40 pl-4">{journal.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* ── Sidebar ── */}
          <aside className="order-2 md:order-none md:col-span-4 flex flex-col gap-5">

            {/* Meta card */}
            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Entry Details</p>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Calendar size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Date</p>
                  <p className="text-text-primary text-sm font-semibold mt-0.5">{fmtDate(journal.date)}</p>
                </div>
              </div>

              {journal.time && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Clock size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Time</p>
                    <p className="text-text-primary text-sm font-semibold mt-0.5">{fmt12h(journal.time)}</p>
                  </div>
                </div>
              )}

              {journal.location && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Location</p>
                    <p className="text-text-primary text-sm font-semibold mt-0.5">{journal.location}</p>
                  </div>
                </div>
              )}

              {mood && (
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-base shrink-0 ${mood.bg}`}>
                    {mood.emoji}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Mood</p>
                    <p className={`text-sm font-semibold mt-0.5 capitalize ${mood.color}`}>{journal.mood}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${type.badge}`}>
                  <TypeIcon size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Type</p>
                  <p className="text-text-primary text-sm font-semibold mt-0.5">{type.label}</p>
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Entry Stats</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Words",  value: words },
                  { label: "Photos", value: journal.photos?.length ?? 0 },
                  { label: "Tags",   value: journal.tags?.length ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-bg rounded-xl p-3 text-center">
                    <p className="text-text-primary text-xl font-black">{value}</p>
                    <p className="text-text-secondary text-[10px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {journal.tags?.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
                <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Hash size={11} /> Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {journal.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-bg border border-border rounded-full text-xs text-text-secondary">
                      <Tag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-2.5">
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Activity</p>
              {journal.created_at && (
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Created</span>
                  <span className="text-text-primary font-medium">{fmtShort(journal.created_at)}</span>
                </div>
              )}
              {journal.updated_at && journal.updated_at !== journal.created_at && (
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Updated</span>
                  <span className="text-text-primary font-medium">{fmtShort(journal.updated_at)}</span>
                </div>
              )}
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="order-1 md:order-none md:col-span-8 flex flex-col gap-6">

            {/* HTML Content */}
            <div className="bg-surface border border-border rounded-3xl p-7 sm:p-10 min-h-[300px] shadow-sm">
              <div
                className="journal-detail-content text-text-primary text-sm sm:text-base leading-[1.9]"
                dangerouslySetInnerHTML={{ __html: journal.content }}
              />
            </div>

            {/* Photo grid */}
            {hasPhotos && (
              <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
                <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <ImageIcon size={11} /> Photos · {journal.photos.length}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {journal.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightbox(idx)}
                      className="aspect-square rounded-xl overflow-hidden border border-border/50 hover:opacity-90 hover:scale-[1.02] transition-all"
                    >
                      <img
                        src={get_full_image_url(photo, "user")}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Entry"
        maxWidth="760px"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-7 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-background text-sm font-bold rounded-xl transition-all shadow-lg shadow-accent/20"
            >
              {isUpdating ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isUpdating ? "Saving…" : "Save Changes"}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Title</label>
              <input
                value={editData.title}
                onChange={(e) => setE("title", e.target.value)}
                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Description</label>
              <input
                value={editData.description}
                onChange={(e) => setE("description", e.target.value)}
                placeholder="One-line summary…"
                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Content</label>
              <textarea
                rows={8}
                value={editData.content.replace(/<[^>]*>/g, "")}
                onChange={(e) => setE("content", e.target.value)}
                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-4">
            <Select
              label="Type"
              value={editData.journal_type}
              options={JOURNAL_TYPES}
              onChange={(val) => setE("journal_type", val)}
            />
            <Select
              label="Mood"
              value={editData.mood}
              options={[{ value: "", label: "None" }, ...MOODS_LIST]}
              onChange={(val) => setE("mood", val)}
            />
            <div className="space-y-1.5">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Location</label>
              <input
                value={editData.location}
                onChange={(e) => setE("location", e.target.value)}
                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Date</label>
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setE("date", e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Time</label>
                <input
                  type="time"
                  value={editData.time}
                  onChange={(e) => setE("time", e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Tags</label>
              <input
                value={editData.tags}
                onChange={(e) => setE("tags", e.target.value)}
                placeholder="growth, family, goals…"
                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setE("is_favorite", !editData.is_favorite)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                editData.is_favorite
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-bg border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              <Star size={14} fill={editData.is_favorite ? "currentColor" : "none"} />
              {editData.is_favorite ? "Marked as Favourite" : "Mark as Favourite"}
            </button>
          </div>
        </div>

        {/* Photos section — full width below the two columns */}
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <ImageIcon size={11} /> Photos · {editPhotos.length}/6
            </label>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploading || editPhotos.length >= 6}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40"
            >
              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              Add Photo
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
          </div>

          {editPhotos.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {editPhotos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border/50 group">
                  <img src={get_full_image_url(photo, "user")} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditPhotos((p) => p.filter((_, i) => i !== idx))}
                    className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full py-6 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 text-text-secondary/40 hover:text-text-secondary hover:border-border/70 transition-all"
            >
              <Camera size={22} />
              <span className="text-xs">Add photos to this entry</span>
            </button>
          )}
        </div>
      </Modal>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Entry"
        isLoading={isDeleting}
        itemName={journal.title}
      />

      <style>{`
        .journal-detail-content h1 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0 0.25rem; line-height: 1.3; }
        .journal-detail-content h2 { font-size: 1.2rem; font-weight: 700; margin: 0.6rem 0 0.2rem; line-height: 1.3; }
        .journal-detail-content blockquote { border-left: 3px solid var(--color-accent, #7c3aed); padding-left: 1rem; margin: 0.5rem 0; opacity: 0.75; font-style: italic; }
        .journal-detail-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.4rem 0; }
        .journal-detail-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.4rem 0; }
        .journal-detail-content li { margin: 0.2rem 0; }
        .journal-detail-content hr { border: none; border-top: 1px solid var(--color-border, #333); margin: 1rem 0; }
        .journal-detail-content b, .journal-detail-content strong { font-weight: 700; }
        .journal-detail-content i, .journal-detail-content em { font-style: italic; }
        .journal-detail-content u { text-decoration: underline; }
        .journal-detail-content s { text-decoration: line-through; }
        .journal-detail-content p { margin: 0.25rem 0; }
      `}</style>
    </div>
  );
};

export default JournalDetail;
