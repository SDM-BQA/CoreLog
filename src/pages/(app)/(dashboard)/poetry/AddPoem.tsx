import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  PenTool,
  Sparkles,
  Save,
  Hash,
  Smile,
  Wind,
  Globe,
  BookOpen,
  Loader2,
  Image as ImageIcon,
  Camera,
  X,
  Calendar,
} from "lucide-react";
import { create_poem_mutation } from "../../../../@apis/poetry";
import { upload_image_api } from "../../../../@apis/users";
import { get_full_image_url } from "../../../../@utils/api.utils";
import Select from "../../../../@components/@ui/Select";
import { toast } from "react-toast";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "gu", label: "Gujarati" },
  { code: "pa", label: "Punjabi" },
  { code: "mr", label: "Marathi" },
  { code: "or", label: "Odia" },
  { code: "as", label: "Assamese" },
  { code: "ar", label: "Arabic" },
  { code: "fa", label: "Persian / Farsi" },
  { code: "tr", label: "Turkish" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
];

const POEM_TYPES = [
  "Free Verse",
  "Sonnet",
  "Haiku",
  "Tanka",
  "Ghazal",
  "Nazm",
  "Rubai",
  "Qasida",
  "Masnavi",
  "Ballad",
  "Ode",
  "Elegy",
  "Villanelle",
  "Limerick",
  "Couplet",
  "Prose Poetry",
  "Other",
];

const MOODS = [
  "Melancholy", "Joy", "Longing", "Nostalgia", "Rage", "Serenity",
  "Wonder", "Grief", "Hope", "Despair", "Love", "Solitude",
];

const ATMOSPHERES = [
  "Serene", "Stormy", "Mystical", "Dark", "Ethereal", "Urban",
  "Rural", "Cosmic", "Intimate", "Surreal", "Raw", "Dreamlike",
];

const AddPoem = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    language: "en",
    poem_type: "Free Verse",
    mood: "",
    atmosphere: "",
    status: "draft",
    tags: "",
    cover_image: "",
    created_at: new Date().toISOString().split('T')[0],
  });

  const set = (key: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await upload_image_api(file);
      set("cover_image", url);
      toast.success("Cover image uploaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error("Title is required"); return; }
    if (!formData.content.trim()) { toast.error("Poem content is required"); return; }

    setIsSubmitting(true);
    try {
      await create_poem_mutation({
        title: formData.title.trim(),
        content: formData.content,
        language: formData.language,
        poem_type: formData.poem_type,
        mood: formData.mood || undefined,
        atmosphere: formData.atmosphere || undefined,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        cover_image: formData.cover_image || undefined,
        status: formData.status,
        created_at: formData.created_at ? new Date(formData.created_at).toISOString() : undefined,
      });
      toast.success("Poem saved to your anthology");
      navigate("/dashboard/poetry");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save poem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            to="/dashboard/poetry"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Anthology
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-text-primary text-3xl font-bold tracking-tight">Compose New Poem</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-bold uppercase tracking-widest">
              <PenTool size={12} />
              Drafting
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">

          {/* Main Content */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col gap-6 shadow-sm">

              <div className="space-y-2">
                <label className="text-text-secondary text-xs font-bold uppercase tracking-widest pl-1">
                  Title of the Work
                </label>
                <input
                  required
                  type="text"
                  placeholder="Enter a title..."
                  value={formData.title}
                  onChange={(e) => set("title", e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-amber-500/50 transition-colors text-lg font-bold"
                />
              </div>

              {/* Language + Type row */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Language"
                  value={formData.language}
                  options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))}
                  onChange={(val) => set("language", val)}
                  icon={Globe}
                />
                <Select
                  label="Poem Type"
                  value={formData.poem_type}
                  options={POEM_TYPES.map(t => ({ value: t, label: t }))}
                  onChange={(val) => set("poem_type", val)}
                  icon={BookOpen}
                />
              </div>

              <div className="space-y-2">
                <label className="text-text-secondary text-xs font-bold uppercase tracking-widest pl-1">
                  The Verse
                </label>
                <textarea
                  required
                  rows={18}
                  placeholder="Spill your words here..."
                  value={formData.content}
                  onChange={(e) => set("content", e.target.value)}
                  className="w-full bg-bg border border-border rounded-2xl py-4 px-5 text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-amber-500/50 transition-colors italic font-serif leading-relaxed resize-none"
                  style={{ direction: ["ur", "ar", "fa"].includes(formData.language) ? "rtl" : "ltr" }}
                />
                {["ur", "ar", "fa"].includes(formData.language) && (
                  <p className="text-amber-500/60 text-[10px] pl-1">
                    Right-to-left text direction applied for {LANGUAGES.find(l => l.code === formData.language)?.label}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
              <h3 className="text-text-primary text-sm font-bold flex items-center gap-2 border-b border-border pb-4">
                <Sparkles size={16} className="text-amber-500" />
                Poem Metadata
              </h3>

              <div className="space-y-4">
                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <label className="text-text-secondary text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                    <ImageIcon size={12} />
                    Cover Illustration
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 ${
                      formData.cover_image 
                        ? "border-accent/50" 
                        : "border-border hover:border-accent/30 bg-bg/50"
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 size={24} className="animate-spin text-accent" />
                    ) : formData.cover_image ? (
                      <>
                        <img src={get_full_image_url(formData.cover_image, "poem")} alt="Cover" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); set("cover_image", ""); }}
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
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Click to upload</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-secondary text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                    <Calendar size={12} />
                    Creation Date
                  </label>
                  <input
                    type="date"
                    value={formData.created_at}
                    onChange={(e) => set("created_at", e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
                  />
                </div>

                <Select
                  label="Current Mood"
                  value={formData.mood}
                  options={[{ value: "", label: "Select mood..." }, ...MOODS.map(m => ({ value: m, label: m }))]}
                  onChange={(val) => set("mood", val)}
                  icon={Smile}
                />

                <Select
                  label="Atmosphere"
                  value={formData.atmosphere}
                  options={[{ value: "", label: "Select atmosphere..." }, ...ATMOSPHERES.map(a => ({ value: a, label: a }))]}
                  onChange={(val) => set("atmosphere", val)}
                  icon={Wind}
                />

                <div className="space-y-1.5">
                  <label className="text-text-secondary text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                    <Hash size={12} />
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="love, night, solitude..."
                    value={formData.tags}
                    onChange={(e) => set("tags", e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <p className="text-text-secondary/40 text-[10px] pl-1">Comma separated</p>
                </div>

                <Select
                  label="Manuscript Status"
                  value={formData.status}
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "finished", label: "Finished" },
                    { value: "published", label: "Published" }
                  ]}
                  onChange={(val) => set("status", val)}
                  icon={Save}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60 text-background py-3 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <PenTool size={16} />}
                {isSubmitting ? "Saving..." : "Save to Anthology"}
              </button>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 flex flex-col gap-3">
              <p className="text-amber-500/60 text-[10px] font-bold uppercase tracking-widest">Writing Tip</p>
              <p className="text-text-secondary text-xs italic leading-relaxed">
                "Poetry is when an emotion has found its thought and the thought has found words." — Robert Frost
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPoem;

