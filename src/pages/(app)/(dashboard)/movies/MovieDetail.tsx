import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  Pencil,
  Trash2,
  Film,
  CalendarPlus,
  PlayCircle,
  CheckCircle2,
  BookmarkCheck,
  Clock,
  Tag,
  Globe,
} from "lucide-react";
import {
  get_movie_query,
  update_movie_mutation,
  delete_movie_mutation,
  type MovieInput,
} from "../../../../@apis/movies";
import { upload_image_api } from "../../../../@apis/users";
import { get_full_image_url, get_rating_level, get_language_name, get_country_name } from "../../../../@utils/api.utils";
import { formatDate, toDateInput, toISO } from "../../../../@utils/date.utils";
import { get_genre_display, get_genre_key, GENRE_MAP } from "../../../../@utils/genres";
import { Modal, MultiSearchSelect } from "../../../../@components/@smart";
import Select from "../../../../@components/@ui/Select";
import DeleteModal from "../../../../@components/DeleteModal";
import RatingInput from "../../../../@components/RatingInput";
import { toast } from "react-toast";

interface Movie {
  _id: string;
  title: string;
  // director: string;
  description: string;
  genres: string[];
  release_year: string;
  runtime: number;
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
const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, label]) => ({ value, label }));

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editView, setEditView] = useState<"all" | "status_update" | "synopsis" | "review">("all");
  const [modalData, setModalData] = useState({
    title: "",
    // director: "",
    release_year: "",
    runtime: 0,
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

  const fetchMovie = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await get_movie_query(id);
      if (data) {
        setMovie(data as Movie);
        setModalData({
          title: data.title,
          // director: data.director || "",
          release_year: data.release_year,
          runtime: data.runtime || 0,
          language: data.language || "",
          origin_country: data.origin_country || "",
          status: data.status,
          genres: data.genres.map(get_genre_display),
          platform: data.platform || "",
          description: data.description || "",
          rating: data.rating,
          review: data.review || "",
          started_from: toDateInput(data.started_from) || toDateInput(Date.now()),
          finished_on: toDateInput(data.finished_on) || toDateInput(Date.now()),
        });
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
      toast.error("Failed to load movie details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovie();
  }, [id]);

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
      if (modalData.genres.length === 0) errors.genres = "At least one genre is required";
    }
    if (editView === "all" || editView === "status_update") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (modalData.status !== "watchlist" && modalData.started_from) {
        if (new Date(modalData.started_from) > today) errors.started_from = "Future dates not allowed";
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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === "watched" || newStatus === "rewatching" || newStatus === "watching") {
      setEditView("status_update");
      if (movie) {
        setModalData({
          title: movie.title,
          // director: movie.director || "",
          release_year: movie.release_year,
          runtime: movie.runtime || 0,
          language: movie.language || "",
          origin_country: movie.origin_country || "",
          status: newStatus,
          genres: movie.genres.map(get_genre_display),
          platform: movie.platform || "",
          description: movie.description || "",
          rating: movie.rating,
          review: movie.review || "",
          started_from: toDateInput(movie.started_from) || toDateInput(Date.now()),
          finished_on: toDateInput(movie.finished_on) || toDateInput(Date.now()),
        });
      }
      setModalErrors({});
      setIsModalOpen(true);
    } else {
      updateMovie({ status: newStatus });
    }
  };

  const updateMovie = async (fields: Partial<MovieInput>) => {
    if (!id) return;
    try {
      setIsUpdating(true);
      const result = await update_movie_mutation(id, fields);
      if (result) {
        setMovie(result as Movie);
        toast.success("Updated successfully");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating movie:", error);
      toast.error("Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModalSave = () => {
    if (!validateModal()) return;
    const payload = {
      ...modalData,
      genres: modalData.genres.map(get_genre_key),
      started_from: toISO(modalData.started_from),
      finished_on: toISO(modalData.finished_on),
    };
    updateMovie(payload);
  };

  const openEdit = (view: typeof editView) => {
    if (movie) {
      setModalData({
        title: movie.title,
        // director: movie.director || "",
        release_year: movie.release_year,
        runtime: movie.runtime || 0,
        language: movie.language || "",
        origin_country: movie.origin_country || "",
        status: movie.status,
        genres: movie.genres.map(get_genre_display),
        platform: movie.platform || "",
        description: movie.description || "",
        rating: movie.rating,
        review: movie.review || "",
        started_from: toDateInput(movie.started_from) || toDateInput(Date.now()),
        finished_on: toDateInput(movie.finished_on) || toDateInput(Date.now()),
      });
    }
    setEditView(view);
    setModalErrors({});
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    try {
      const success = await delete_movie_mutation(id);
      if (success) {
        toast.success("Movie deleted");
        setIsDeleteModalOpen(false);
        navigate("/dashboard/movies");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("Failed to delete movie");
    }
  };

  const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      setIsUploading(true);
      const imageUrl = await upload_image_api(file);
      await update_movie_mutation(id, { poster_image: imageUrl });
      setMovie((prev) => (prev ? { ...prev, poster_image: imageUrl } : null));
      toast.success("Poster updated");
    } catch (error) {
      console.error("Error uploading poster:", error);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm font-medium animate-pulse">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="bg-bg flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Film size={48} className="text-text-secondary/20 mb-4" />
        <h2 className="text-text-primary text-xl font-bold">Movie not found</h2>
        <Link to="/dashboard/movies" className="mt-4 text-accent hover:underline flex items-center gap-2">
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
          onClick={() => navigate("/dashboard/movies")}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-semibold mb-8 transition-all group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to collection
        </button>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-8 lg:gap-12 mb-12">

          {/* Poster */}
          <div className="w-full sm:w-[240px] lg:w-[280px] shrink-0">
            <div className="relative group aspect-[2/3] rounded-2xl overflow-hidden bg-surface border border-border shadow-2xl">
              <img
                src={get_full_image_url(movie.poster_image, "movie")}
                alt={movie.title}
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
                  <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" onChange={handlePosterChange} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col pt-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-text-primary text-3xl sm:text-4xl font-bold tracking-tight font-inter leading-tight">
                {movie.title}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-current opacity-80 ${STATUS_COLORS[movie.status]}`}>
                {STATUS_MAP[movie.status]}
              </span>
            </div>

            {/* {movie.director && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-text-primary text-lg font-medium mb-6">
                <User size={18} className="text-text-secondary" />
                <span>{movie.director}</span>
              </div>
            )} */}

            {(movie.language || movie.origin_country) && (
              <div className="flex items-center justify-center sm:justify-start gap-4 text-text-primary text-base font-medium mb-6">
                {movie.language && (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-text-secondary" />
                    <span className="capitalize">{get_language_name(movie.language)}</span>
                  </div>
                )}
                {movie.language && movie.origin_country && <div className="h-4 w-px bg-border" />}
                {movie.origin_country && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary text-sm">Origin:</span>
                    <span className="capitalize">{get_country_name(movie.origin_country)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-8">
              <Select
                value={movie.status}
                options={STATUS_OPTIONS}
                onChange={(val) => handleStatusChange({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>)}
                icon={BookmarkCheck}
                className="w-[180px]"
              />

              <div className="h-6 w-px bg-border hidden sm:block" />

              <button
                onClick={() => openEdit("all")}
                className="inline-flex items-center gap-2 bg-surface border border-border hover:bg-surface-hover text-text-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Pencil size={15} className="text-text-secondary" />
                Edit Details
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
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
                    {movie.rating.toFixed(1)}{" "}
                    <span className="text-accent font-black ml-1 text-[10px] uppercase tracking-tighter bg-accent/10 px-1.5 py-0.5 rounded">
                      {get_rating_level(movie.rating)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Released</span>
                <div className="flex items-center gap-1.5 text-text-primary">
                  <Calendar size={14} className="text-text-secondary" />
                  {movie.release_year}
                </div>
              </div>

              {movie.runtime > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Runtime</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <Clock size={14} className="text-text-secondary" />
                    {movie.runtime} min
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Platform</span>
                <div className="flex items-center gap-1.5 text-text-primary capitalize">
                  <Globe size={14} className="text-text-secondary" />
                  {movie.platform || "N/A"}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Added On</span>
                <div className="flex items-center gap-1.5 text-text-primary">
                  <CalendarPlus size={14} className="text-text-secondary" />
                  {formatDate(movie.created_at || Date.now())}
                </div>
              </div>

              {(movie.status === "watching" || movie.status === "watched" || movie.status === "rewatching" || movie.status === "not_finished") && movie.started_from && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Started</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <PlayCircle size={14} className="text-blue-400" />
                    {formatDate(movie.started_from)}
                  </div>
                </div>
              )}

              {movie.finished_on && (movie.status === "watched" || movie.status === "rewatching") && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Finished</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <CheckCircle2 size={14} className="text-green-400" />
                    {formatDate(movie.finished_on)}
                  </div>
                </div>
              )}
            </div>

            {/* Genre Tags */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-6 flex-wrap">
                <Tag size={14} className="text-text-secondary" />
                {movie.genres.map((g) => (
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

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-4 opacity-50" />

        {/* Synopsis & Review */}
        <div className="grid grid-cols-1 gap-12">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-text-primary text-lg font-bold flex items-center gap-2">
                <Film size={20} className="text-text-secondary" />
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
              <p className={movie.description ? "text-text-secondary text-base leading-relaxed whitespace-pre-line" : "text-text-secondary/40 text-sm italic"}>
                {movie.description || "No synopsis available for this movie."}
              </p>
            </div>
          </section>

          {(movie.status === "watched" || movie.status === "rewatching") && (
            <section>
              <div className="flex items-center justify-between mb-4">
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
                <p className={movie.review ? "text-text-secondary text-base leading-relaxed whitespace-pre-line" : "text-text-secondary/40 text-sm italic"}>
                  {movie.review || "No review added yet. Share your thoughts about this movie!"}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editView === "all" ? "Edit Movie Details" :
          editView === "status_update" ? "Completion Details" :
          editView === "synopsis" ? "Edit Synopsis" : "Edit Review"
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
                  <input type="text" placeholder="e.g. Inception" value={modalData.title} onChange={(e) => setModalData({ ...modalData, title: e.target.value })} className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.title ? "border-error" : "border-border"}`} />
                  {modalErrors.title && <p className="text-error text-xs mt-1.5 pl-1">{modalErrors.title}</p>}
                </div>
                {/* <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Director</label>
                  <input type="text" placeholder="e.g. Christopher Nolan" value={modalData.director} onChange={(e) => setModalData({ ...modalData, director: e.target.value })} className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none" />
                </div> */}
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Language</label>
                  <input type="text" placeholder="e.g. English, Korean" value={modalData.language} onChange={(e) => setModalData({ ...modalData, language: e.target.value })} className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Origin Country</label>
                  <input type="text" placeholder="e.g. US, South Korea" value={modalData.origin_country} onChange={(e) => setModalData({ ...modalData, origin_country: e.target.value })} className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Select
                  label="Status"
                  value={modalData.status}
                  options={STATUS_OPTIONS}
                  onChange={(val) => setModalData({ ...modalData, status: val })}
                />
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Year</label>
                  <input type="text" placeholder="YYYY" value={modalData.release_year} onChange={(e) => setModalData({ ...modalData, release_year: e.target.value })} className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.release_year ? "border-error" : "border-border"}`} />
                  {modalErrors.release_year && <p className="text-error text-xs mt-1.5 pl-1">{modalErrors.release_year}</p>}
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Runtime (mins)</label>
                  <input type="number" placeholder="e.g. 148" value={modalData.runtime} onChange={(e) => setModalData({ ...modalData, runtime: parseInt(e.target.value) || 0 })} className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none" />
                </div>
              </div>

              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Platform</label>
                <input type="text" placeholder="e.g. Netflix, Prime Video" value={modalData.platform} onChange={(e) => setModalData({ ...modalData, platform: e.target.value })} className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.platform ? "border-error" : "border-border"}`} />
                {modalErrors.platform && <p className="text-error text-xs mt-1.5 pl-1">{modalErrors.platform}</p>}
              </div>

              <MultiSearchSelect
                label="Genres"
                options={GENRE_OPTIONS}
                selected={modalData.genres}
                onToggle={(genre) => setModalData((prev) => ({ ...prev, genres: prev.genres.includes(genre) ? prev.genres.filter((x) => x !== genre) : [...prev.genres, genre] }))}
                onRemove={(genre) => setModalData((prev) => ({ ...prev, genres: prev.genres.filter((x) => x !== genre) }))}
                error={modalErrors.genres}
                placeholder="Search genres..."
              />
            </>
          )}

          {(editView === "all" || editView === "status_update") && (
            <div className="space-y-4">
              {(modalData.status === "watching" || modalData.status === "watched" || modalData.status === "rewatching" || modalData.status === "not_finished") && (
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Start Date</label>
                  <input type="date" max={new Date().toISOString().split("T")[0]} value={modalData.started_from} onChange={(e) => setModalData({ ...modalData, started_from: e.target.value })} className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.started_from ? "border-error" : "border-border"}`} />
                  {modalErrors.started_from && <p className="text-error text-xs mt-1 ml-1">{modalErrors.started_from}</p>}
                </div>
              )}
              {(modalData.status === "watched" || modalData.status === "rewatching") && (
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Finish Date</label>
                  <input type="date" max={new Date().toISOString().split("T")[0]} value={modalData.finished_on} onChange={(e) => setModalData({ ...modalData, finished_on: e.target.value })} className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:border-accent outline-none ${modalErrors.finished_on ? "border-error" : "border-border"}`} />
                  {modalErrors.finished_on && <p className="text-error text-xs mt-1 ml-1">{modalErrors.finished_on}</p>}
                </div>
              )}
            </div>
          )}

          {(editView === "status_update" || editView === "review") && (modalData.status === "watched" || modalData.status === "rewatching") && (
            <div className="space-y-4">
              <RatingInput label="Your Rating" value={modalData.rating} onChange={(val) => setModalData({ ...modalData, rating: val })} />
              <label className="text-text-primary text-xs font-semibold block uppercase tracking-wider">Your Review</label>
              <textarea value={modalData.review} onChange={(e) => setModalData({ ...modalData, review: e.target.value })} placeholder="Share your thoughts..." rows={8} className="w-full bg-bg border border-border rounded-xl p-4 text-sm text-text-primary focus:border-accent outline-none resize-none shadow-inner" />
            </div>
          )}

          {editView === "synopsis" && (
            <textarea value={modalData.description} onChange={(e) => setModalData({ ...modalData, description: e.target.value })} placeholder="Plot summary..." rows={12} className="w-full bg-bg border border-border rounded-xl p-4 text-sm text-text-primary focus:border-accent outline-none resize-none shadow-inner" />
          )}
        </div>
      </Modal>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Movie"
        itemName={movie?.title ?? ""}
      />
    </div>
  );
};

export default MovieDetail;
