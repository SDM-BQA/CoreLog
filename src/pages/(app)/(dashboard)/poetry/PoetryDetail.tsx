import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  BookOpen,
  Smile,
  Wind,
  Hash,
  Calendar,
  Pencil,
  Trash2,
  Sparkles,
  Save,
  Loader2,
  Camera,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { delete_poem_mutation, type Poem, type PoemInput } from "../../../../@apis/poetry";
import { upload_image_api } from "../../../../@apis/users";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { formatDate, toDateInput, toISO } from "../../../../@utils/date.utils";
import { Modal } from "../../../../@components/@smart";
import Select from "../../../../@components/@ui/Select";
import CalendarInput from "../../../../@components/@ui/CalendarInput";
import DeleteModal from "../../../../@components/DeleteModal";
import { toast } from "react-toast";
import { useGetPoemByIdQuery, useUpdatePoemMutation } from "../../../../@store/api/poetry.api";
import { POETRY_PREDEFINED_TAGS } from "../../../../constants/poetryTags";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "bn", label: "Bengali" },
  { code: "kn", label: "Kannada" },
];

const POEM_TYPES = [
  "Free Verse", "Sonnet", "Haiku", "Tanka", "Ghazal", "Nazm", "Rubai",
  "Qasida", "Masnavi", "Ballad", "Ode", "Elegy", "Villanelle", "Limerick",
  "Couplet", "Prose Poetry", "Other",
];

const MOODS = [
  "Melancholy", "Joy", "Longing", "Nostalgia", "Rage", "Serenity",
  "Wonder", "Grief", "Hope", "Despair", "Love", "Solitude", "Other",
];

const ATMOSPHERES = [
  "Serene", "Stormy", "Mystical", "Dark", "Ethereal", "Urban",
  "Rural", "Cosmic", "Intimate", "Surreal", "Raw", "Dreamlike",
];

const STATUS_MAP: Record<string, string> = {
  draft: "Draft",
  finished: "Finished",
  published: "Published",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-amber-400 border-amber-400/30 bg-amber-400/5",
  finished: "text-green-400 border-green-400/30 bg-green-400/5",
  published: "text-blue-400 border-blue-400/30 bg-blue-400/5",
};

const getLangLabel = (code: string) =>
  LANGUAGES.find((l) => l.code === code)?.label ?? code;

const isRTL = (code: string) => ["ur", "ar", "fa"].includes(code);

const PoetryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data fetching with RTK Query
  const { data: fetchedPoem, isLoading: isPoemLoading } = useGetPoemByIdQuery(id);
  const [updatePoemMutation, { isLoading: isUpdatingMutation }] = useUpdatePoemMutation();

  const [poem, setPoem] = useState<Poem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTags, setModalTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    content: "",
    language: "en",
    poem_type: "Free Verse",
    mood: "",
    atmosphere: "",
    cover_image: "",
    status: "draft",
    created_at: "",
  });

  const normalizeTag = (raw: string) => raw.replace(/^#/, "").trim().toLowerCase().replace(/\s+/g, "_");
  const filteredTagSuggestions = POETRY_PREDEFINED_TAGS
    .filter((t) => !modalTags.includes(t))
    .filter((t) => !tagInput.trim() || t.includes(normalizeTag(tagInput)));
  const customTag = normalizeTag(tagInput);
  const canAddCustomTag = !!customTag && !modalTags.includes(customTag) && !POETRY_PREDEFINED_TAGS.includes(customTag);

  const addTag = (raw: string) => {
    const next = normalizeTag(raw);
    if (!next || modalTags.includes(next)) return;
    setModalTags((prev) => [...prev, next]);
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setModalTags((prev) => prev.filter((t) => t !== tag));
  };

  // Sync local poem state with RTK Query data
  useEffect(() => {
    if (fetchedPoem) {
      setPoem(fetchedPoem);
      syncModal(fetchedPoem);
    }
  }, [fetchedPoem]);

  const isLoading = isPoemLoading;
  const isUpdating = isUpdatingMutation;

  const syncModal = (p: Poem) => {
    const formattedDate = toDateInput(p.created_at);

    setModalData({
      title: p.title,
      content: p.content,
      language: p.language,
      poem_type: p.poem_type,
      mood: p.mood ?? "",
      atmosphere: p.atmosphere ?? "",
      
      cover_image: p.cover_image ?? "",
      status: p.status,
      created_at: formattedDate,
    });
    setModalTags((p.tags ?? []).map((t) => normalizeTag(t)).filter(Boolean));
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const openEdit = () => {
    if (poem) syncModal(poem);
    setIsModalOpen(true);
  };

  const setM = (key: keyof typeof modalData, value: string) =>
    setModalData((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await upload_image_api(file);
      setM("cover_image", url);
      toast.success("Cover image uploaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    if (!modalData.title.trim()) { toast.error("Title is required"); return; }
    if (!modalData.content.trim()) { toast.error("Content is required"); return; }
    try {
      const payload: Partial<PoemInput> = {
        title: modalData.title.trim(),
        content: modalData.content,
        language: modalData.language,
        poem_type: modalData.poem_type,
        mood: modalData.mood || undefined,
        atmosphere: modalData.atmosphere || undefined,
        tags: modalTags.length ? modalTags : undefined,
        cover_image: modalData.cover_image || undefined,
        status: modalData.status,
        created_at: toISO(modalData.created_at),
      };
      await updatePoemMutation({ id, input: payload }).unwrap();
      toast.success("Poem updated");
      setIsModalOpen(false);
    } catch {
      toast.error("Failed to update poem");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await delete_poem_mutation(id);
      toast.success("Poem deleted");
      navigate("/dashboard/poetry");
    } catch {
      toast.error("Failed to delete poem");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="bg-bg flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">Poem not found.</p>
        <Link to="/dashboard/poetry" className="text-accent text-sm font-semibold hover:underline">
          Back to Anthology
        </Link>
      </div>
    );
  }

  const rtl = isRTL(poem.language);
  const lineCount = poem.content.split("\n").filter((l) => l.trim()).length;
  const wordCount = poem.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard/poetry"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Anthology
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={openEdit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-amber-500/40 transition-colors text-sm font-semibold"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-transparent text-error hover:bg-error/10 hover:border-error/20 transition-colors text-sm font-semibold"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Sidebar: Image & Info */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-border shadow-2xl bg-surface relative group">
              <img 
                src={get_full_image_url(poem.cover_image, "poem")} 
                alt={poem.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLORS[poem.status] ?? "text-text-secondary border-border"}`}>
                    {STATUS_MAP[poem.status] ?? poem.status}
                 </span>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Language</p>
                    <p className="text-text-primary text-sm font-bold">{getLangLabel(poem.language)}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Form</p>
                    <p className="text-text-primary text-sm font-bold">{poem.poem_type}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Created</p>
                    <p className="text-text-primary text-sm font-bold">{formatDate(poem.created_at)}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Main Verse */}
          <div className="md:col-span-8 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h1
                className="text-text-primary text-5xl font-bold tracking-tight leading-tight"
                style={{ direction: rtl ? "rtl" : "ltr" }}
              >
                {poem.title}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                 {poem.mood && (
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-xs text-text-secondary">
                     <Smile size={11} /> {poem.mood}
                   </span>
                 )}
                 {poem.atmosphere && (
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-xs text-text-secondary">
                     <Wind size={11} /> {poem.atmosphere}
                   </span>
                 )}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-[40px] p-10 md:p-16 shadow-sm min-h-[500px]">
              <pre
                className="text-text-primary font-serif text-xl leading-loose italic whitespace-pre-wrap"
                style={{
                  direction: rtl ? "rtl" : "ltr",
                  textAlign: rtl ? "right" : "left",
                  fontFamily: "'Georgia', serif",
                }}
              >
                {poem.content}
              </pre>
            </div>

            {/* Stats & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-500" />
                  Verse Analytics
                </p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-text-primary text-2xl font-bold">{lineCount}</p>
                    <p className="text-text-secondary text-xs mt-0.5">Lines</p>
                  </div>
                  <div>
                    <p className="text-text-primary text-2xl font-bold">{wordCount}</p>
                    <p className="text-text-secondary text-xs mt-0.5">Words</p>
                  </div>
                  <div>
                    <p className="text-text-primary text-2xl font-bold">{poem.content.length}</p>
                    <p className="text-text-secondary text-xs mt-0.5">Chars</p>
                  </div>
                </div>
              </div>

              {poem.tags && poem.tags.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
                  <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Hash size={12} className="text-amber-500" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {poem.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-amber-500/5 border border-amber-500/20 text-amber-500/80 text-xs font-medium rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Refine the Verse"
        maxWidth="800px"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating || isUploading}
              className="inline-flex items-center gap-2 px-8 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-background text-sm font-bold rounded-xl transition-all shadow-lg shadow-accent/20"
            >
              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
          {/* Left: Content */}
          <div className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest ml-1">Title</label>
              <input
                type="text"
                value={modalData.title}
                onChange={(e) => setM("title", e.target.value)}
                className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest ml-1">The Verse</label>
              <textarea
                rows={12}
                value={modalData.content}
                onChange={(e) => setM("content", e.target.value)}
                className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors resize-none italic font-serif leading-relaxed"
                style={{ direction: isRTL(modalData.language) ? "rtl" : "ltr" }}
              />
            </div>
          </div>

          {/* Right: Metadata & Image */}
          <div className="flex flex-col gap-5">
            {/* Cover Image Upload */}
            <div className="space-y-2">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <ImageIcon size={12} /> Cover Illustration
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 ${
                  modalData.cover_image 
                    ? "border-accent/50" 
                    : "border-border hover:border-accent/30 bg-bg/50"
                }`}
              >
                {isUploading ? (
                  <Loader2 size={24} className="animate-spin text-accent" />
                ) : modalData.cover_image ? (
                  <>
                    <img src={get_full_image_url(modalData.cover_image, "poem")} alt="Cover" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setM("cover_image", ""); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center text-accent">
                      <Camera size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Change Cover</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Language"
                value={modalData.language}
                options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))}
                onChange={(val) => setM("language", val)}
              />
              <Select
                label="Form"
                value={modalData.poem_type}
                options={POEM_TYPES.map(t => ({ value: t, label: t }))}
                onChange={(val) => setM("poem_type", val)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Mood"
                value={modalData.mood}
                options={[{ value: "", label: "None" }, ...MOODS.map(m => ({ value: m, label: m }))]}
                onChange={(val) => setM("mood", val)}
              />
              <Select
                label="Atmosphere"
                value={modalData.atmosphere}
                options={[{ value: "", label: "None" }, ...ATMOSPHERES.map(a => ({ value: a, label: a }))]}
                onChange={(val) => setM("atmosphere", val)}
              />
            </div>

            <Select
              label="Status"
              value={modalData.status}
              options={Object.entries(STATUS_MAP).map(([value, label]) => ({ value, label }))}
              onChange={(val) => setM("status", val)}
            />

            <div className="space-y-1.5 relative">
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest ml-1">Tags</label>
              <div
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 min-h-[42px] flex flex-wrap items-center gap-2 focus-within:border-accent transition-colors"
                onClick={() => setShowTagSuggestions(true)}
              >
                {modalTags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-[10px] text-accent">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-accent/80 hover:text-accent">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "," || e.key === " ") {
                      e.preventDefault();
                      if (tagInput.trim()) addTag(tagInput);
                    } else if (e.key === "Backspace" && !tagInput && modalTags.length) {
                      removeTag(modalTags[modalTags.length - 1]);
                    }
                  }}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 120)}
                  placeholder={modalTags.length ? "Add more tags..." : "Type tag and press Space/Enter"}
                  className="flex-1 min-w-[120px] bg-transparent text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none"
                />
              </div>
              {showTagSuggestions && (filteredTagSuggestions.length > 0 || canAddCustomTag) && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[60] rounded-xl border border-border bg-surface shadow-2xl overflow-hidden max-h-44 overflow-y-auto">
                  {canAddCustomTag && (
                    <button
                      type="button"
                      onClick={() => addTag(customTag)}
                      className="w-full text-left px-3 py-2 text-xs text-accent hover:bg-bg"
                    >
                      Add #{customTag}
                    </button>
                  )}
                  {filteredTagSuggestions.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <CalendarInput
                label="Creation Date"
                value={modalData.created_at}
                onChange={(val) => setM("created_at", val)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>
      </Modal>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Poem"
        isLoading={isDeleting}
        itemName={poem.title}
      />
    </div>
  );
};

export default PoetryDetail;

