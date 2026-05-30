import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Clock, Calendar, Tag,
  Pencil, Trash2, Loader2, Hash, Save, Camera, X,
  FileText, User, DollarSign, Plane, Heart,
  Briefcase, Sparkles, Moon, Lightbulb, MoreHorizontal,
  Image as ImageIcon, BookOpen, ChevronLeft, ChevronRight,
  Crosshair,
} from "lucide-react";
import {
  type Journal,
} from "../../../../@apis/journal";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { upload_image_api } from "../../../../@apis/users";
import { Modal } from "../../../../@components/@smart";
import Select from "../../../../@components/@ui/Select";
import CalendarInput from "../../../../@components/@ui/CalendarInput";
import DeleteModal from "../../../../@components/DeleteModal";
import { toast } from "react-toast";
import { useDeleteJournalMutation, useGetJournalByIdQuery, useGetJournalFiltersQuery, useUpdateJournalMutation } from "../../../../@store/api/journal.api";
import { useAppSelector } from "../../../../@store/hooks/store.hooks";
import { JOURNAL_PREDEFINED_TAGS } from "../../../../constants/journalTags";
import {
  getExpenseBlocks,
  getExpenseTotal,
  resolveJournalTemplateBlocks,
  stripJournalTemplateBlocks,
} from "../../../../@utils/journalTemplateBlocks.utils";

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

import { formatDate, toISO } from "../../../../@utils/date.utils";

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
  const { user } = useAppSelector((state) => state.user);
  const isPremiumUser = user?.plan === "inner_circle";
  const photoLimit = isPremiumUser ? 20 : 6;

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data fetching with RTK Query
  const { data: fetchedJournal, isLoading: isJournalLoading } = useGetJournalByIdQuery(id);
  const { data: journalFilters } = useGetJournalFiltersQuery(undefined);
  const [updateJournalMutation, { isLoading: isUpdatingMutation }] = useUpdateJournalMutation();
  const [deleteJournalMutation] = useDeleteJournalMutation();

  const [journal, setJournal]           = useState<Journal | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [isGeocoding, setIsGeocoding]   = useState(false);
  const [lightbox, setLightbox]         = useState<number | null>(null);
  const [editPhotos, setEditPhotos]     = useState<string[]>([]);
  const [editTags, setEditTags]         = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const showUpgradeNotice = !isPremiumUser && editPhotos.length > 6;
  const photoInputRef                   = useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState({
    title: "", description: "", content: "",
    journal_type: "personal", mood: "", location: "",
    location_address: "", location_city: "", location_lat: "", location_lng: "",
    date: "", time: "", is_favorite: false,
  });

  // Sync local journal state with RTK Query data
  useEffect(() => {
    if (fetchedJournal) {
      setJournal(fetchedJournal as unknown as Journal);
      syncEdit(fetchedJournal as unknown as Journal);
    }
  }, [fetchedJournal]);

  const isLoading = isJournalLoading;
  const isUpdating = isUpdatingMutation;

  const syncEdit = (j: Journal) => {
    setEditPhotos(j.photos ?? []);
    setEditTags(j.tags?.map((t) => t.replace(/^#/, "").trim().toLowerCase()).filter(Boolean) ?? []);
    setEditData({
    title:        j.title,
    description:  j.description ?? "",
    content:      stripJournalTemplateBlocks(j.content),
    journal_type: j.journal_type,
    mood:         j.mood ?? "",
    location:     j.location ?? "",
    location_address: j.location_address ?? "",
    location_city: j.location_city ?? "",
    location_lat: j.location_lat ? String(j.location_lat) : "",
    location_lng: j.location_lng ? String(j.location_lng) : "",
    date:         j.date ? j.date.split("T")[0] : "",
    time:         j.time ?? "",
    is_favorite:  j.is_favorite ?? false,
  });
  };

  const setE = <K extends keyof typeof editData>(k: K, v: typeof editData[K]) =>
    setEditData((p) => ({ ...p, [k]: v }));

  const normalizeTag = (raw: string) => raw.replace(/^#/, "").trim().toLowerCase().replace(/\s+/g, "_");
  const allTagSuggestions = Array.from(new Set([
    ...JOURNAL_PREDEFINED_TAGS,
    ...((journalFilters?.tags ?? []).map((t: string) => normalizeTag(t)).filter(Boolean)),
  ]));

  const filteredTagSuggestions = allTagSuggestions
    .filter((t) => !editTags.includes(t))
    .filter((t) => !editTagInput.trim() || t.includes(normalizeTag(editTagInput)));
  const customTag = normalizeTag(editTagInput);
  const canAddCustomTag = !!customTag && !editTags.includes(customTag) && !allTagSuggestions.includes(customTag);

  const addEditTag = (raw: string) => {
    const next = normalizeTag(raw);
    if (!next || editTags.includes(next)) return;
    setEditTags((prev) => [...prev, next]);
    setEditTagInput("");
    setShowTagSuggestions(false);
  };

  const removeEditTag = (tag: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!id) return;
    if (!editData.title.trim()) { toast.error("Title is required"); return; }
    try {
      await updateJournalMutation({
        id,
        input: {
          title:        editData.title.trim(),
          description:  editData.description || undefined,
          content:      stripJournalTemplateBlocks(editData.content),
          journal_type: editData.journal_type,
          mood:         editData.mood || undefined,
          location:     editData.location,
          location_address: editData.location_address || undefined,
          location_city: editData.location_city || undefined,
          location_lat: editData.location_lat ? Number(editData.location_lat) : undefined,
          location_lng: editData.location_lng ? Number(editData.location_lng) : undefined,
          tags:         editTags.length ? editTags : undefined,
          date:         editData.date ? toISO(editData.date) : undefined,
          time:         editData.time || undefined,
          is_favorite:  editData.is_favorite,
          photos:       editPhotos.length ? editPhotos : undefined,
          template_blocks: templateBlocks,
        }
      }).unwrap();
      toast.success("Entry updated");
      setIsEditOpen(false);
    } catch {
      toast.error("Failed to update entry");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const slots = photoLimit - editPhotos.length;
    if (slots <= 0) { toast.error(`Maximum ${photoLimit} photos`); return; }
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
      await deleteJournalMutation(id).unwrap();
      toast.success("Entry deleted");
      navigate("/dashboard/journal");
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGeocodeAddress = async () => {
    if (!editData.location_address.trim()) {
      toast.error("Enter full address first");
      return;
    }
    try {
      setIsGeocoding(true);
      const query = encodeURIComponent(editData.location_address.trim());
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) {
        toast.error("Could not find coordinates for this address");
        return;
      }
      const best = data[0];
      setEditData((p) => ({
        ...p,
        location_lat: String(best.lat ?? ""),
        location_lng: String(best.lon ?? ""),
      }));
      toast.success("Address pinned on map coordinates");
    } catch {
      toast.error("Failed to geocode address");
    } finally {
      setIsGeocoding(false);
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
  const templateBlocks = resolveJournalTemplateBlocks(journal);
  const expenseBlocks = getExpenseBlocks(templateBlocks);
  const visibleContent = stripJournalTemplateBlocks(journal.content);
  const words   = wordCount(visibleContent);
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
              onClick={() => navigate(`/dashboard/journal/edit-entry/${journal._id}`)}
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
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-4 py-8 flex flex-col gap-8">

        {/* Description */}
        {journal.description && (
          <p className="text-text-secondary text-base italic border-l-2 border-accent/40 pl-4">{journal.description}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Sidebar ── */}
          <aside className="order-3 lg:order-1 lg:col-span-3 xl:col-span-3 flex flex-col gap-5">

            {/* Meta card */}
            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Entry Details</p>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Calendar size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Date</p>
                  <p className="text-text-primary text-sm font-semibold mt-0.5">{formatDate(journal.date)}</p>
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
                    {journal.location_lat && journal.location_lng && (
                      <>
                        <div className="mt-2 rounded-xl overflow-hidden border border-border bg-bg">
                          <iframe
                            title="Journal location map"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${journal.location_lng - 0.01}%2C${journal.location_lat - 0.01}%2C${journal.location_lng + 0.01}%2C${journal.location_lat + 0.01}&layer=mapnik&marker=${journal.location_lat}%2C${journal.location_lng}`}
                            className="w-full h-32"
                            loading="lazy"
                          />
                        </div>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${journal.location_lat}&mlon=${journal.location_lng}#map=13/${journal.location_lat}/${journal.location_lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent text-xs font-semibold mt-1 inline-block hover:underline"
                        >
                          Open on map
                        </a>
                      </>
                    )}
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

            {/* Expenses */}
            {expenseBlocks.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Expenses</p>
                  <span className="text-text-primary text-sm font-black">
                    ₹{expenseBlocks.reduce((sum, block) => sum + getExpenseTotal(block), 0)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {expenseBlocks.flatMap((block) => block.items).map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-bg px-3 py-2">
                      <span className="text-text-secondary text-xs leading-relaxed">{item.note}</span>
                      <span className="text-text-primary text-xs font-bold shrink-0">₹{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  <span className="text-text-primary font-medium">{formatDate(journal.created_at)}</span>
                </div>
              )}
              {journal.updated_at && journal.updated_at !== journal.created_at && (
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Updated</span>
                  <span className="text-text-primary font-medium">{formatDate(journal.updated_at)}</span>
                </div>
              )}
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="order-1 lg:order-2 lg:col-span-7 xl:col-span-7 flex flex-col gap-6">

            {/* HTML Content */}
            <div className="bg-surface border border-border rounded-3xl p-7 sm:p-10 min-h-[300px] shadow-sm">
              <div
                className="journal-detail-content text-text-primary text-sm sm:text-base leading-[1.9]"
                dangerouslySetInnerHTML={{ __html: visibleContent }}
              />
            </div>

          </main>

          {/* Right photo column */}
          <aside className="order-2 lg:order-3 lg:col-span-2 xl:col-span-2 flex flex-col gap-5">
            {hasPhotos && (
              <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
                <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <ImageIcon size={11} /> Photos · {journal.photos.length}
                </p>
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
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
          </aside>
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
            <div className="space-y-1.5">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Full Address</label>
              <input
                value={editData.location_address}
                onChange={(e) => setE("location_address", e.target.value)}
                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">City</label>
                <input
                  value={editData.location_city}
                  onChange={(e) => setE("location_city", e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Coordinates</label>
                <div className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-xs text-text-secondary truncate">
                  {editData.location_lat && editData.location_lng ? `${editData.location_lat}, ${editData.location_lng}` : "Not pinned"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGeocodeAddress}
              disabled={isGeocoding}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors disabled:opacity-60"
            >
              {isGeocoding ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
              {isGeocoding ? "Finding coordinates..." : "Pin Address On Map"}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <CalendarInput
                  label="Date"
                  value={editData.date}
                  onChange={(val) => setE("date", val)}
                  max={new Date().toISOString().split("T")[0]}
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
            <div className="space-y-1.5 relative z-[220]">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Tags</label>
              <div className="w-full min-h-[42px] bg-bg border border-border rounded-xl px-2 py-1.5 flex flex-wrap items-center gap-1.5">
                {editTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-xs">
                    #{tag}
                    <button type="button" onClick={() => removeEditTag(tag)} className="text-accent/80 hover:text-accent">
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <input
                  value={editTagInput}
                  onFocus={() => setShowTagSuggestions(true)}
                  onChange={(e) => {
                    setEditTagInput(e.target.value);
                    setShowTagSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Tab" || e.key === " ") {
                      e.preventDefault();
                      addEditTag(editTagInput);
                    }
                    if (e.key === "Backspace" && !editTagInput && editTags.length) {
                      removeEditTag(editTags[editTags.length - 1]);
                    }
                  }}
                  placeholder={editTags.length ? "Add more tags..." : "Type tag and press Space/Enter"}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-text-primary placeholder:text-text-secondary/35 focus:outline-none"
                />
              </div>
              {showTagSuggestions && (filteredTagSuggestions.length > 0 || canAddCustomTag) && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[999] rounded-xl border border-border bg-surface shadow-2xl overflow-hidden max-h-44 overflow-y-auto">
                  {canAddCustomTag && (
                    <button
                      type="button"
                      onClick={() => addEditTag(customTag)}
                      className="w-full text-left px-3 py-2 text-xs text-accent hover:bg-bg transition-colors border-b border-border"
                    >
                      Add #{customTag}
                    </button>
                  )}
                  {filteredTagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addEditTag(tag)}
                      className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg transition-colors border-b border-border last:border-b-0"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
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
              <ImageIcon size={11} /> Photos · {editPhotos.length}/{photoLimit}
            </label>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploading || editPhotos.length >= photoLimit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40"
            >
              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              Add Photo
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
          </div>
          {showUpgradeNotice && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
              You already have more than 6 photos. Upgrade to Inner Circle to add more photos.
            </div>
          )}

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


