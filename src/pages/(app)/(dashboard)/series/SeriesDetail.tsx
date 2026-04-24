import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  Pencil,
  Trash2,
  Tv,
  ChevronDown,
  CalendarPlus,
  PlayCircle,
  CheckCircle2,
  BookmarkCheck,
  Clapperboard,
  Tag,
  Globe,
} from "lucide-react";
import { 
  get_series_query, 
  update_series_mutation, 
  delete_series_mutation 
} from "../../../../@apis/series";
import { upload_image_api } from "../../../../@apis/users";
import { get_full_image_url, get_rating_level, get_language_name, get_country_name } from "../../../../@utils/api.utils";
import { get_genre_display, get_genre_key, GENRE_MAP } from "../../../../@utils/genres";
import { Modal, MultiSearchSelect } from "../../../../@components/@smart";
import DeleteModal from "../../../../@components/DeleteModal";
import RatingInput from "../../../../@components/RatingInput";
import { toast } from "react-toast";

interface Series {
  _id: string;
  title: string;
  creator: string;
  description: string;
  genres: string[];
  release_year: string;
  seasons: number;
  episodes: number;
  language: string;
  origin_country: string;
  status: "watchlist" | "watching" | "rewatching" | "watched" | "not_finished";
  rating: number;
  review?: string;
  poster_image?: string;
  platform?: string;
  started_from?: string;
  finished_on?: string;
  created_at?: string;
}

const STATUS_MAP: Record<string, string> = {
  watchlist: "Watchlist",
  watching: "Watching",
  rewatching: "Rewatching",
  watched: "Watched",
  not_finished: "Not Finished",
};

const STATUS_COLORS: Record<string, string> = {
  watchlist: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  watching: "text-amber-400 border-amber-400/30 bg-amber-400/5",
  rewatching: "text-purple-400 border-purple-400/30 bg-purple-400/5",
  watched: "text-green-400 border-green-400/30 bg-green-400/5",
  not_finished: "text-red-400 border-red-400/30 bg-red-400/5",
};

const GENRE_OPTIONS = Object.values(GENRE_MAP);

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editView, setEditView] = useState<"all" | "status_update" | "synopsis" | "review">("all");
  const [modalData, setModalData] = useState({
    title: "",
    creator: "",
    release_year: "",
    seasons: 1,
    episodes: 0,
    language: "",
    origin_country: "",
    status: "",
    genres: [] as string[],
    platform: "",
    description: "",
    rating: 0,
    review: "",
    started_from: "",
    finished_on: "",
  });

  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateModal = () => {
    const errors: Record<string, string> = {};
    if (editView === "all") {
      if (!modalData.title) errors.title = "Title is required";
      if (!modalData.platform) errors.platform = "Platform is required";
      if (!modalData.release_year) {
        errors.release_year = "Year is required";
      } else if (isNaN(Number(modalData.release_year)) || Number(modalData.release_year) < 1800 || Number(modalData.release_year) > new Date().getFullYear()) {
        errors.release_year = "Year cannot be in the future";
      }
      if (modalData.seasons <= 0) errors.seasons = "Must be at least 1 season";
      if (modalData.genres.length === 0) errors.genres = "At least one genre is required";
    }

    if (editView === "all" || editView === "status_update") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (modalData.status !== "watchlist" && modalData.started_from) {
        if (new Date(modalData.started_from) > today) {
          errors.started_from = "Future dates not allowed";
        }
      }
      if ((modalData.status === "watched" || modalData.status === "rewatching") && modalData.finished_on) {
        const finish = new Date(modalData.finished_on);
        const start = new Date(modalData.started_from);
        if (finish > today) errors.finished_on = "Future dates not allowed";
        if (finish < start) errors.finished_on = "Cannot be before start date";
      }
    }
    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchSeries = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await get_series_query(id);
      if (data) {
        setSeries(data as unknown as Series);
        setModalData({
          title: data.title,
          creator: data.creator,
          release_year: data.release_year,
          seasons: data.seasons,
          episodes: data.episodes || 0,
          language: data.language || "",
          origin_country: data.origin_country || "",
          status: data.status,
          genres: data.genres.map(get_genre_display),
          platform: data.platform || "",
          description: data.description || "",
          rating: data.rating,
          review: data.review || "",
          started_from: data.started_from || new Date().toISOString().split('T')[0],
          finished_on: data.finished_on || new Date().toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("Failed to load series details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [id]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === "watched" || newStatus === "rewatching") {
      setEditView("status_update");
      if (series) {
        setModalData({
          title: series.title,
          creator: series.creator,
          release_year: series.release_year,
          seasons: series.seasons,
          episodes: series.episodes || 0,
          language: series.language || "",
          origin_country: series.origin_country || "",
          status: newStatus,
          genres: series.genres.map(get_genre_display),
          platform: series.platform || "",
          description: series.description || "",
          rating: series.rating,
          review: series.review || "",
          started_from: series.started_from || new Date().toISOString().split('T')[0],
          finished_on: series.finished_on || new Date().toISOString().split('T')[0],
        });
      }
      setModalErrors({});
      setIsModalOpen(true);
    } else {
      updateSeries({ status: newStatus });
    }
  };

  const updateSeries = async (fields: any) => {
    if (!id) return;
    try {
      setIsUpdating(true);
      const result = await update_series_mutation(id, fields);
      if (result) {
        setSeries(result as unknown as Series);
        toast.success("Updated successfully");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating series:", error);
      toast.error("Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModalSave = () => {
    if (!validateModal()) return;
    const payload: any = { ...modalData };
    // Map genres to keys
    payload.genres = modalData.genres.map(get_genre_key);
    // Keep creator in sync for legacy display if needed
    payload.creator = `${modalData.language} (${modalData.origin_country})`;
    updateSeries(payload);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    try {
      const success = await delete_series_mutation(id);
      if (success) {
        toast.success("Series deleted");
        setIsDeleteModalOpen(false);
        navigate("/dashboard/series");
      }
    } catch (error) {
      console.error("Error deleting series:", error);
      toast.error("Failed to delete series");
    }
  };

  const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      setIsUploading(true);
      const imageUrl = await upload_image_api(file);
      await update_series_mutation(id, { poster_image: imageUrl });
      setSeries(prev => prev ? { ...prev, poster_image: imageUrl } : null);
      toast.success("Poster updated");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const openEdit = (view: typeof editView) => {
    if (series) {
      setModalData({
        title: series.title,
        creator: series.creator,
        release_year: series.release_year,
        seasons: series.seasons,
        episodes: series.episodes || 0,
        language: series.language || "",
        origin_country: series.origin_country || "",
        status: series.status,
        genres: series.genres.map(get_genre_display),
        platform: series.platform || "",
        description: series.description || "",
        rating: series.rating,
        review: series.review || "",
        started_from:
          series.started_from || new Date().toISOString().split("T")[0],
        finished_on:
          series.finished_on || new Date().toISOString().split("T")[0],
      });
    }
    setEditView(view);
    setModalErrors({});
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-bg flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm font-medium animate-pulse">Loading series...</p>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="bg-bg flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Tv size={48} className="text-text-secondary/20 mb-4" />
        <h2 className="text-text-primary text-xl font-bold">Series not found</h2>
        <Link to="/dashboard/series" className="mt-4 text-accent hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard/series")}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-semibold mb-8 transition-all group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to collection
        </button>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-8 lg:gap-12 mb-12">
          
          {/* Poster Section */}
          <div className="w-full sm:w-[240px] lg:w-[280px] shrink-0">
            <div className="relative group aspect-[2/3] rounded-2xl overflow-hidden bg-surface border border-border shadow-2xl">
              <img
                src={get_full_image_url(series.poster_image, "series")}
                alt={series.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/30 transition-all"
                >
                  Change Poster
                </button>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" onChange={handlePosterChange} />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 flex flex-col pt-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-text-primary text-3xl sm:text-4xl font-bold tracking-tight font-inter leading-tight">
                {series.title}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-current opacity-80 ${STATUS_COLORS[series.status]}`}>
                {STATUS_MAP[series.status]}
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-text-primary text-lg font-medium mb-6">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-text-secondary" />
                <span className="capitalize">{get_language_name(series.language)}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">Origin:</span>
                <span className="capitalize">{get_country_name(series.origin_country)}</span>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-8">
              <div className="relative inline-flex items-center">
                <BookmarkCheck size={14} className={`absolute left-3 pointer-events-none ${STATUS_COLORS[series.status].split(' ')[0]}`} />
                <select
                  value={series.status}
                  onChange={handleStatusChange}
                  className="appearance-none cursor-pointer pl-9 pr-8 py-2 text-sm font-semibold rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors outline-none focus:ring-2 focus:ring-accent/50 text-text-primary"
                >
                  {Object.entries(STATUS_MAP).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 pointer-events-none text-text-secondary" />
              </div>

              <div className="h-6 w-px bg-border hidden sm:block" />

              <button
                onClick={() => openEdit("all")}
                className="inline-flex items-center gap-2 bg-surface border border-border hover:bg-surface-hover text-text-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Pencil size={15} className="text-text-secondary" />
                Edit Details
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 bg-surface border border-border hover:border-red-500/50 hover:bg-red-500/5 text-text-secondary hover:text-red-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 sm:gap-6 text-sm text-text-secondary bg-surface/50 p-4 rounded-xl border border-border/50">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Rating</span>
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-text-primary font-semibold">
                    {series.rating.toFixed(1)}{" "}
                    <span className="text-accent font-black ml-1 text-[10px] uppercase tracking-tighter bg-accent/10 px-1.5 py-0.5 rounded">
                      {get_rating_level(series.rating)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Released</span>
                <div className="flex items-center gap-1.5 text-text-primary">
                  <Calendar size={14} className="text-text-secondary" />
                  {series.release_year}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Seasons</span>
                <div className="flex items-center gap-1.5 text-text-primary">
                  <Clapperboard size={14} className="text-text-secondary" />
                  {series.seasons}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Episodes</span>
                <div className="flex items-center gap-1.5 text-text-primary">
                  <PlayCircle size={14} className="text-text-secondary" />
                  {series.episodes || 0}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Platform</span>
                <div className="flex items-center gap-1.5 text-text-primary capitalize">
                  <Globe size={14} className="text-text-secondary" />
                  {series.platform || "N/A"}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Added On</span>
                <div className="flex items-center gap-1.5 text-text-primary">
                  <CalendarPlus size={14} className="text-text-secondary" />
                  {(() => {
                    const date = new Date(series.created_at || Date.now());
                    return isNaN(date.getTime()) 
                      ? new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                      : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                  })()}
                </div>
              </div>

              {(series.status === "watching" || series.status === "watched" || series.status === "rewatching" || series.status === "not_finished") && series.started_from && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Started</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <PlayCircle size={14} className="text-blue-400" />
                    {new Date(series.started_from).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>
              )}

              {series.finished_on && (series.status === "watched" || series.status === "rewatching") && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Finished</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <CheckCircle2 size={14} className="text-green-400" />
                    {new Date(series.finished_on).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>
              )}
            </div>

            {/* Genre Tags — Styled exactly like Books */}
            {series.genres && series.genres.length > 0 && (
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-6 flex-wrap">
                <Tag size={14} className="text-text-secondary" />
                {series.genres.map(g => (
                  <span
                    key={g}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary/30 transition-colors cursor-default"
                  >
                    {get_genre_display(g)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Separator Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-4 opacity-50" />

        {/* Synopsis & Review Sections */}
        <div className="grid grid-cols-1 gap-12">
          {/* Synopsis */}
          <section>
            <div className="flex items-center justify-between mb-4 group/header">
              <h2 className="text-text-primary text-lg font-bold flex items-center gap-2">
                <Tv size={20} className="text-text-secondary" />
                Synopsis
              </h2>
              <button
                onClick={() => openEdit("synopsis")}
                className="p-2 text-text-secondary hover:text-accent hover:bg-accent/5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium border border-border/50"
              >
                <Pencil size={14} />
                Edit Synopsis
              </button>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
              <p className={series.description ? "text-text-secondary text-base leading-relaxed whitespace-pre-line" : "text-text-secondary/40 text-sm italic"}>
                {series.description || "No synopsis available for this series."}
              </p>
            </div>
          </section>

          {/* Review / Notes */}
          {(series.status === "watched" || series.status === "rewatching") && (
            <section>
              <div className="flex items-center justify-between mb-4 group/header">
                <h2 className="text-text-primary text-lg font-bold flex items-center gap-2">
                  <Star size={20} className="text-text-secondary" />
                  Your Review
                </h2>
                <button
                  onClick={() => openEdit("review")}
                  className="p-2 text-text-secondary hover:text-accent hover:bg-accent/5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium border border-border/50"
                >
                  <Pencil size={14} />
                  Edit Review
                </button>
              </div>
              <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
                <p className={series.review ? "text-text-secondary text-base leading-relaxed whitespace-pre-line" : "text-text-secondary/40 text-sm italic"}>
                  {series.review || "No review added yet. Share your thoughts about this series!"}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Unified Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editView === "all" ? "Edit Series Details" :
          editView === "status_update" ? "Completion Details" :
          editView === "synopsis" ? "Edit Synopsis" : (modalData.status === "not_finished" ? "Edit Notes" : "Edit Review")
        }
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleModalSave}
              disabled={isUpdating}
              className="bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95 disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          {editView === "all" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Title</label>
                  <input type="text" placeholder="e.g. Breaking Bad" value={modalData.title} onChange={e => setModalData({...modalData, title: e.target.value})} className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.title ? "border-error focus:border-error focus:ring-error/20" : "border-border focus:border-accent"}`} />
                  {modalErrors.title && <p className="text-error text-xs mt-1.5 pl-1">{modalErrors.title}</p>}
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Language</label>
                  <input type="text" placeholder="e.g. EN, KO" value={modalData.language} onChange={e => setModalData({...modalData, language: e.target.value.toUpperCase()})} className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Origin Country</label>
                  <input type="text" placeholder="e.g. US, KR" value={modalData.origin_country} onChange={e => setModalData({...modalData, origin_country: e.target.value.toUpperCase()})} className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Status</label>
                  <select 
                    value={modalData.status} 
                    onChange={e => setModalData({...modalData, status: e.target.value})} 
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none appearance-none cursor-pointer"
                  >
                    {Object.entries(STATUS_MAP).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Year</label>
                  <input type="text" placeholder="YYYY" value={modalData.release_year} onChange={e => setModalData({...modalData, release_year: e.target.value})} className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.release_year ? "border-error focus:border-error focus:ring-error/20" : "border-border focus:border-accent"}`} />
                  {modalErrors.release_year && <p className="text-error text-xs mt-1.5 pl-1">{modalErrors.release_year}</p>}
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Seasons</label>
                  <input type="number" value={modalData.seasons} onChange={e => setModalData({...modalData, seasons: parseInt(e.target.value) || 1})} className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.seasons ? "border-error focus:border-error focus:ring-error/20" : "border-border focus:border-accent"}`} />
                  {modalErrors.seasons && <p className="text-error text-xs mt-1.5 pl-1">{modalErrors.seasons}</p>}
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Episodes</label>
                  <input type="number" value={modalData.episodes} onChange={e => setModalData({...modalData, episodes: parseInt(e.target.value) || 0})} className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Platform</label>
                  <input type="text" placeholder="e.g. Netflix, HBO" value={modalData.platform} onChange={e => setModalData({...modalData, platform: e.target.value})} className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.platform ? "border-error focus:border-error focus:ring-error/20" : "border-border focus:border-accent"}`} />
                  {modalErrors.platform && <p className="text-error text-xs mt-1.5 pl-1">{modalErrors.platform}</p>}
                </div>
              </div>
              <MultiSearchSelect
                label="Genres"
                options={GENRE_OPTIONS}
                selected={modalData.genres}
                onToggle={(genre) => {
                  setModalData(prev => ({
                    ...prev,
                    genres: prev.genres.includes(genre) ? prev.genres.filter(x => x !== genre) : [...prev.genres, genre]
                  }));
                }}
                onRemove={(genre) => {
                   setModalData(prev => ({
                    ...prev,
                    genres: prev.genres.filter(x => x !== genre)
                  }));
                }}
                error={modalErrors.genres}
                placeholder="Search genres..."
              />
            </>
          )}

          {(editView === "all" || editView === "status_update") && (
            <div className="space-y-4">
              {/* Started From Date - Shown for Watching, Watched, Rewatching, Not Finished */}
              {(modalData.status === "watching" || modalData.status === "watched" || modalData.status === "rewatching" || modalData.status === "not_finished") && (
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Start Date</label>
                  <input 
                    type="date" 
                    max={new Date().toISOString().split("T")[0]}
                    value={modalData.started_from} 
                    onChange={e => setModalData({...modalData, started_from: e.target.value})} 
                    className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.started_from ? "border-error" : "border-border"}`} 
                  />
                  {modalErrors.started_from && <p className="text-error text-[10px] font-medium mt-1 ml-1">{modalErrors.started_from}</p>}
                </div>
              )}

              {/* Finished Date - ONLY for Watched, Rewatching */}
              {(modalData.status === "watched" || modalData.status === "rewatching") && (
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Finish Date</label>
                  <input 
                    type="date" 
                    max={new Date().toISOString().split("T")[0]}
                    value={modalData.finished_on} 
                    onChange={e => setModalData({...modalData, finished_on: e.target.value})} 
                    className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.finished_on ? "border-error" : "border-border"}`} 
                  />
                  {modalErrors.finished_on && <p className="text-error text-[10px] font-medium mt-1 ml-1">{modalErrors.finished_on}</p>}
                </div>
              )}
            </div>
          )}

          {(editView === "status_update" || editView === "review") && (modalData.status === "watched" || modalData.status === "rewatching") && (
            <div className="space-y-4">
               <RatingInput
                  label="Your Rating"
                  value={modalData.rating}
                  onChange={(val) => setModalData({ ...modalData, rating: val })}
                />
               <label className="text-text-primary text-xs font-semibold block uppercase tracking-wider">
                  Your Review
               </label>
               <textarea
                value={modalData.review}
                onChange={e => setModalData({...modalData, review: e.target.value})}
                placeholder="Share your thoughts..."
                rows={8}
                className="w-full bg-bg border border-border rounded-xl p-4 text-sm text-text-primary focus:border-accent outline-none resize-none shadow-inner"
              />
            </div>
          )}

          {editView === "synopsis" && (
            <textarea
              value={modalData.description}
              onChange={e => setModalData({...modalData, description: e.target.value})}
              placeholder="Plot summary..."
              rows={12}
              className="w-full bg-bg border border-border rounded-xl p-4 text-sm text-text-primary focus:border-accent outline-none resize-none shadow-inner"
            />
          )}
        </div>
      </Modal>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Series"
        itemName={series?.title ?? ""}
      />
    </div>
  );
};

export default SeriesDetail;
