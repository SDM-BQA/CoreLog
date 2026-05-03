import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ImagePlus,
  PlusCircle,
  Film,
  Calendar,
  Globe,
  PlayCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  Search,
  // User,
} from "lucide-react";
import { useForm } from "../../../../@hooks/Form/useForm";
import { upload_image_api } from "../../../../@apis/users";
import { get_genre_key, GENRE_MAP } from "../../../../@utils/genres";
import RatingInput from "../../../../@components/RatingInput";
import Select from "../../../../@components/@ui/Select";
import { TMDBMovie, FeatureCard, SearchDropdown, MultiSearchSelect } from "../../../../@components/@smart";
import {
  search_external_movies_api,
  fetch_external_movie_details_api,
  fetch_external_movie_providers_api,
} from "../../../../@apis/movies";
import { useCreateMovieMutation } from "../../../../@store/api/movies.api";
import { toast } from "react-toast";

const GENRE_OPTIONS = Object.values(GENRE_MAP);

interface AddMovieForm {
  title: string;
  // director: string;
  genres: string[];
  description: string;
  language: string;
  origin_country: string;
  review: string;
  releaseYear: string;
  runtime: string;
  platform: string;
  rating: number;
  status: string;
  started_from: string;
  finished_on: string;
}

const STATUS_MAP = {
  watchlist: "Watchlist",
  watching: "Watching",
  rewatching: "Rewatching",
  watched: "Watched",
  not_finished: "Not Finished",
};


const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  14: "Fantasy",
  27: "Horror",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const AddMovie = () => {
  const navigate = useNavigate();
  const [createMovieMutation, { isLoading: isCreating }] = useCreateMovieMutation();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [remotePosterUrl, setRemotePosterUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Search states
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { values, errors, handleChange, setFieldValue, handleSubmit } =
    useForm<AddMovieForm>({
      initialValues: {
        title: "",
        // director: "",
        genres: [],
        description: "",
        language: "",
        origin_country: "",
        review: "",
        releaseYear: "",
        runtime: "",
        platform: "",
        rating: 0,
        status: "watchlist",
        started_from: new Date().toISOString().split("T")[0],
        finished_on: new Date().toISOString().split("T")[0],
      },
      validationSchema: {
        title: (val) => (val ? null : "Title is required"),
        platform: (val) => (val ? null : "Platform is required"),
        releaseYear: (val) => {
          if (!val) return "Year is required";
          if (isNaN(Number(val)) || Number(val) < 1800) return "Invalid year";
          if (Number(val) > new Date().getFullYear()) return "Year cannot be in the future";
          return null;
        },
        genres: (val) => (val.length > 0 ? null : "At least one genre is required"),
        status: (val) => (val ? null : "Status is required"),
        rating: (val, formValues) =>
          formValues.status === "watched" || formValues.status === "rewatching"
            ? val > 0 ? null : "Rating is required"
            : null,
        started_from: (val, formValues) => {
          if (formValues.status === "watchlist") return null;
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (new Date(val) > today) return "Future dates not allowed";
          return null;
        },
        finished_on: (val, formValues) => {
          if (formValues.status !== "watched" && formValues.status !== "rewatching") return null;
          const finish = new Date(val);
          const start = new Date(formValues.started_from);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (finish > today) return "Future dates not allowed";
          if (finish < start) return "Cannot be before start date";
          return null;
        },
      },
      onSubmit: async (formValues) => {
        try {
          let poster_image = "";
          if (posterFile) {
            poster_image = await upload_image_api(posterFile);
          } else if (remotePosterUrl) {
            poster_image = remotePosterUrl;
          }

          const started_from =
            formValues.status !== "watchlist"
              ? new Date(formValues.started_from).toISOString()
              : undefined;

          const finished_on =
            formValues.status === "watched" || formValues.status === "rewatching"
              ? new Date(formValues.finished_on).toISOString()
              : undefined;

          await createMovieMutation({
            title: formValues.title,
            // director: formValues.director,
            description: formValues.description,
            genres: formValues.genres.map(get_genre_key),
            release_year: formValues.releaseYear,
            runtime: parseInt(formValues.runtime) || 0,
            language: formValues.language,
            origin_country: formValues.origin_country,
            status: formValues.status,
            rating: formValues.rating,
            review: formValues.review,
            poster_image,
            platform: formValues.platform,
            started_from,
            finished_on,
          }).unwrap();

          toast.success(`Movie "${formValues.title}" added successfully!`);
          navigate("/dashboard/movies");
        } catch (error) {
          console.error("Error adding movie:", error);
          toast.error(error instanceof Error ? error.message : "Failed to add movie.");
        }
      },
    });

  const isSubmitting = isCreating;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRemotePosterUrl(null);
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setShowResults(true);
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const items = await search_external_movies_api(query);
        setSearchResults(items);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const selectMovie = async (movie: TMDBMovie) => {
    setFieldValue("title", movie.title);
    setFieldValue("description", movie.overview || "");
    setFieldValue("releaseYear", movie.release_date?.split("-")[0] || "");

    if (movie.original_language) {
      try {
        const langName = new Intl.DisplayNames(["en"], { type: "language" }).of(movie.original_language);
        setFieldValue("language", langName || movie.original_language.toUpperCase());
      } catch {
        setFieldValue("language", movie.original_language.toUpperCase());
      }
    }

    if (movie.genre_ids) {
      const validGenres = movie.genre_ids
        .map((id) => TMDB_GENRE_MAP[id])
        .filter((g): g is string => !!g);
      setFieldValue("genres", validGenres.length > 0 ? validGenres : []);
    }

    if (movie.poster_path) {
      const url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      setPosterPreview(url);
      setRemotePosterUrl(url);
      setPosterFile(null);
    }

    try {
      const [details, providers] = await Promise.all([
        fetch_external_movie_details_api(movie.id),
        fetch_external_movie_providers_api(movie.id),
      ]);
      if (details?.runtime) setFieldValue("runtime", details.runtime.toString());
      if (providers?.flatrate?.length > 0) {
        setFieldValue("platform", providers.flatrate[0].provider_name);
      }
    } catch (error) {
      console.error("Failed to fetch movie details:", error);
    }

    setShowResults(false);
  };

  const showStartDate =
    values.status === "watching" ||
    values.status === "watched" ||
    values.status === "rewatching" ||
    values.status === "not_finished";

  const showFinishDate = values.status === "watched" || values.status === "rewatching";
  const showReview = showFinishDate;

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[820px] mx-auto px-4 sm:px-6 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">
            Add New Movie
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Track your favorite films, ratings, and personal reviews.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-8">
            {/* ─── Left Column: Poster & Rating ─── */}
            <div className="flex flex-col gap-6 w-full sm:w-[220px] shrink-0">
              {/* Poster Upload */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2.5 block tracking-wider uppercase">
                  Movie Poster
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-200 bg-bg/50 overflow-hidden group shadow-sm"
                >
                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <ImagePlus
                          size={24}
                          className="text-text-secondary group-hover:text-accent transition-colors"
                        />
                      </div>
                      <span className="text-text-primary text-sm font-medium">Upload Poster</span>
                      <span className="text-text-secondary text-[11px] mt-1">PNG, JPG or WebP</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Rating — only for watched/rewatching */}
              {showReview && (
                <RatingInput
                  label="Your Rating"
                  value={values.rating}
                  onChange={(val) => setFieldValue("rating", val)}
                  error={errors.rating}
                />
              )}
            </div>

            {/* ─── Right Column: Fields ─── */}
            <div className="flex flex-col gap-6 flex-1 min-w-0">
              {/* Movie Title with Search */}
              <div className="relative">
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Movie Title
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Type movie name to autofill..."
                    value={values.title}
                    onChange={(e) => {
                      handleChange("title")(e);
                      handleSearch(e.target.value);
                    }}
                    onFocus={() => values.title.length >= 3 && setShowResults(true)}
                    className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                      errors.title
                        ? "border-error focus:border-error focus:ring-error/20"
                        : "border-border focus:border-accent"
                    }`}
                  />
                </div>
                {errors.title && (
                  <p className="text-error text-xs mt-1.5 pl-1">{errors.title}</p>
                )}
                {showResults && (
                  <SearchDropdown
                    isSearching={isSearching}
                    searchResults={searchResults}
                    onSelect={selectMovie}
                    onClose={() => setShowResults(false)}
                    type="movie"
                  />
                )}
              </div>

              {/* Director */}
              {/* <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Director
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="e.g. Christopher Nolan"
                    value={values.director}
                    onChange={handleChange("director")}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                </div>
              </div> */}

              {/* Language & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Language
                  </label>
                  <div className="relative">
                    <Globe
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. English, Korean"
                      value={values.language}
                      onChange={handleChange("language")}
                      className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Origin Country
                  </label>
                  <div className="relative">
                    <Globe
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. US, South Korea"
                      value={values.origin_country}
                      onChange={handleChange("origin_country")}
                      className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Year / Platform / Status / Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Release Year */}
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Release Year
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="YYYY"
                      maxLength={4}
                      value={values.releaseYear}
                      onChange={(e) =>
                        setFieldValue("releaseYear", e.target.value.replace(/\D/g, ""))
                      }
                      className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                        errors.releaseYear
                          ? "border-error focus:border-error focus:ring-error/20"
                          : "border-border focus:border-accent"
                      }`}
                    />
                  </div>
                  {errors.releaseYear && (
                    <p className="text-error text-xs mt-1.5 pl-1">{errors.releaseYear}</p>
                  )}
                </div>

                {/* Runtime */}
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Runtime (mins)
                  </label>
                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="number"
                      placeholder="e.g. 148"
                      value={values.runtime}
                      onChange={handleChange("runtime")}
                      className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    />
                  </div>
                </div>

                {/* Streaming Platform */}
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Streaming Platform
                  </label>
                  <div className="relative">
                    <Globe
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Netflix, Prime Video"
                      value={values.platform}
                      onChange={handleChange("platform")}
                      className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                        errors.platform
                          ? "border-error focus:border-error focus:ring-error/20"
                          : "border-border focus:border-accent"
                      }`}
                    />
                  </div>
                  {errors.platform && (
                    <p className="text-error text-xs mt-1.5 pl-1">{errors.platform}</p>
                  )}
                </div>

                <Select
                  label="Watch Status"
                  value={values.status}
                  options={Object.entries(STATUS_MAP).map(([value, label]) => ({ value, label }))}
                  onChange={(val) => {
                    setFieldValue("status", val);
                    if ((val === "watching" || val === "rewatching") && !values.started_from) {
                      setFieldValue("started_from", new Date().toISOString().split("T")[0]);
                    }
                    if (val === "watched" && !values.finished_on) {
                      setFieldValue("finished_on", new Date().toISOString().split("T")[0]);
                    }
                  }}
                />

                {/* Start Date */}
                {showStartDate && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                      Watched From
                    </label>
                    <div className="relative">
                      <PlayCircle
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                      />
                      <input
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={values.started_from}
                        onChange={(e) => setFieldValue("started_from", e.target.value)}
                        className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all ${
                          errors.started_from
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-border"
                        }`}
                      />
                    </div>
                    {errors.started_from && (
                      <p className="text-error text-xs mt-1.5 pl-1">{errors.started_from}</p>
                    )}
                  </div>
                )}

                {/* Finish Date */}
                {showFinishDate && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                      Finished On
                    </label>
                    <div className="relative">
                      <CheckCircle2
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                      />
                      <input
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={values.finished_on}
                        onChange={(e) => setFieldValue("finished_on", e.target.value)}
                        className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all ${
                          errors.finished_on
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-border"
                        }`}
                      />
                    </div>
                    {errors.finished_on && (
                      <p className="text-error text-xs mt-1.5 pl-1">{errors.finished_on}</p>
                    )}
                  </div>
                )}
              </div>

              <MultiSearchSelect
                label="Genres"
                options={GENRE_OPTIONS}
                selected={values.genres}
                onToggle={(genre) => {
                  const current = values.genres;
                  const next = current.includes(genre)
                    ? current.filter((g) => g !== genre)
                    : [...current, genre];
                  setFieldValue("genres", next);
                }}
                onRemove={(genre) =>
                  setFieldValue("genres", values.genres.filter((g) => g !== genre))
                }
                error={errors.genres}
                placeholder="Search & select genres..."
              />

              {/* Synopsis */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Synopsis
                </label>
                <textarea
                  placeholder="A brief summary of the movie plot..."
                  value={values.description}
                  onChange={handleChange("description")}
                  rows={3}
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                />
              </div>

              {/* Review — only for watched/rewatching */}
              {showReview && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Your Review
                  </label>
                  <textarea
                    placeholder="Share your thoughts about this film..."
                    value={values.review}
                    onChange={handleChange("review")}
                    rows={4}
                    className={`w-full bg-bg border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none ${
                      errors.review
                        ? "border-error focus:border-error focus:ring-error/20"
                        : "border-border focus:border-accent"
                    }`}
                  />
                  {errors.review && (
                    <p className="text-error text-xs mt-1.5 pl-1">{errors.review}</p>
                  )}
                  <p className="text-text-secondary text-[10px] mt-2 italic flex items-center gap-1.5 opacity-60">
                    <Sparkles size={12} className="text-accent" />
                    Your review helps you remember your watching journey.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate("/dashboard/movies")}
              className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-accent/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <PlusCircle size={18} />
              )}
              {isSubmitting ? "Saving..." : "Save Movie"}
            </button>
          </div>
        </div>

        {/* ─── Bottom Feature Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <FeatureCard
            icon={Sparkles}
            title="Smart Tracking"
            description="Track films and watch history"
          />
          <FeatureCard
            icon={Eye}
            title="Public / Private"
            description="Set visibility for reviews"
          />
          <FeatureCard
            icon={Film}
            title="Auto Shelf"
            description="Categorize by watch status"
          />
        </div>
      </form>
    </div>
  );
};

export default AddMovie;
