import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ImagePlus,
  PlusCircle,
  Tv,
  User,
  Calendar,
  Globe,
  PlayCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  Clapperboard,
  Check,
  ChevronDown,
  X,
  Search,
} from "lucide-react";
import { useForm } from "../../../../@hooks/Form/useForm";
import { create_series_mutation } from "../../../../@apis/series";
import { upload_image_api } from "../../../../@apis/users";
import { get_genre_key, GENRE_MAP } from "../../../../@utils/genres";
import RatingInput from "../../../../@components/RatingInput";
import { SearchDropdown, TMDBSeries, FeatureCard } from "../../../../@components/@smart";
import { 
  search_external_series_api, 
  fetch_external_series_details_api,
  fetch_external_series_providers_api 
} from "../../../../@apis/series";
import { toast } from "react-toast";

const GENRE_OPTIONS = Object.values(GENRE_MAP);

interface AddSeriesForm {
  title: string;
  creator: string;
  genres: string[];
  description: string;
  language: string;
  origin_country: string;
  review: string;
  releaseYear: string;
  seasons: string;
  episodes: string;
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

type StatusKey = keyof typeof STATUS_MAP;
const STATUS_OPTIONS = Object.keys(STATUS_MAP) as StatusKey[];

const TMDB_GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  9648: "Mystery",
  10765: "Sci-Fi",
  10768: "War",
  37: "Western",
};

const AddSeries = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState("");
  const [remotePosterUrl, setRemotePosterUrl] = useState<string | null>(null);

  // Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TMDBSeries[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { values, errors, handleChange, setFieldValue, handleSubmit } =
    useForm<AddSeriesForm>({
      initialValues: {
        title: "",
        creator: "",
        genres: [],
        description: "",
        language: "",
        origin_country: "",
        review: "",
        releaseYear: "",
        seasons: "1",
        episodes: "0",
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
          if (isNaN(Number(val)) || Number(val) < 1800)
            return "Invalid year";
          if (Number(val) > new Date().getFullYear())
            return "Year cannot be in the future";
          return null;
        },
        genres: (val) =>
          val.length > 0 ? null : "At least one genre is required",
        status: (val) => (val ? null : "Status is required"),
        seasons: (val) =>
          parseInt(val) > 0 ? null : "Must be at least 1 season",
        rating: (val, formValues) =>
          formValues.status === "watched" || formValues.status === "rewatching"
            ? val > 0
              ? null
              : "Rating is required"
            : null,
        started_from: (val, formValues) => {
          if (formValues.status === "watchlist") return null;
          const date = new Date(val);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (date > today) return "Future dates not allowed";
          return null;
        },
        finished_on: (val, formValues) => {
          if (
            formValues.status !== "watched" &&
            formValues.status !== "rewatching"
          )
            return null;
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
          setIsSubmitting(true);
          let poster_image = "";
          if (posterFile) {
            poster_image = await upload_image_api(posterFile);
          } else if (remotePosterUrl) {
            poster_image = remotePosterUrl;
          }

          const started_from =
            formValues.status !== "watchlist"
              ? new Date(formValues.started_from).toISOString().split("T")[0]
              : undefined;

          const finished_on =
            formValues.status === "watched" || formValues.status === "rewatching"
              ? new Date(formValues.finished_on).toISOString().split("T")[0]
              : undefined;

          await create_series_mutation({
            title: formValues.title,
            creator: formValues.language + " (" + formValues.origin_country + ")",
            description: formValues.description,
            genres: formValues.genres.map(get_genre_key),
            release_year: formValues.releaseYear,
            seasons: parseInt(formValues.seasons) || 1,
            episodes: parseInt(formValues.episodes) || 0,
            language: formValues.language,
            origin_country: formValues.origin_country,
            status: formValues.status,
            rating: formValues.rating,
            review: formValues.review,
            poster_image,
            platform: formValues.platform,
            started_from,
            finished_on,
          });

          toast.success(`Series "${formValues.title}" added successfully!`);
          navigate("/dashboard/series");
        } catch (error: any) {
          console.error("Error adding series:", error);
          toast.error(error.message || "Failed to add series.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });

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
        const items = await search_external_series_api(query);
        setSearchResults(items);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const selectSeries = async (series: TMDBSeries) => {
    setFieldValue("title", series.name);
    setFieldValue("description", series.overview || "");
    setFieldValue("releaseYear", series.first_air_date?.split("-")[0] || "");
    setFieldValue("language", series.original_language?.toUpperCase() || "");
    setFieldValue("origin_country", series.origin_country?.join(", ") || "");

    if (series.genre_ids) {
      const validGenres = series.genre_ids
        .map((id) => TMDB_GENRE_MAP[id])
        .filter((g): g is string => !!g);
      setFieldValue("genres", validGenres.length > 0 ? validGenres : []);
    }

    if (series.poster_path) {
      const url = `https://image.tmdb.org/t/p/w500${series.poster_path}`;
      setPosterPreview(url);
      setRemotePosterUrl(url);
      setPosterFile(null);
    }

    // Fetch extra details for No. of Seasons & Platforms
    try {
      const [details, providers] = await Promise.all([
        fetch_external_series_details_api(series.id),
        fetch_external_series_providers_api(series.id)
      ]);

      if (details && details.number_of_seasons) {
        setFieldValue("seasons", details.number_of_seasons.toString());
      }

      if (details && details.number_of_episodes) {
        setFieldValue("episodes", details.number_of_episodes.toString());
      }

      if (providers && providers.flatrate && providers.flatrate.length > 0) {
        // Use the first flatrate provider as the platform
        setFieldValue("platform", providers.flatrate[0].provider_name);
      }
    } catch (error) {
      console.error("Failed to fetch extra series info:", error);
    }

    setShowResults(false);
  };

  const handleGenreToggle = (genre: string) => {
    const current = values.genres;
    const next = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    setFieldValue("genres", next);
  };

  const handleGenreRemove = (genre: string) => {
    setFieldValue(
      "genres",
      values.genres.filter((g) => g !== genre),
    );
  };

  const showStartDate =
    values.status === "watching" ||
    values.status === "watched" ||
    values.status === "rewatching" ||
    values.status === "not_finished";

  const showFinishDate =
    values.status === "watched" || values.status === "rewatching";

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
            Add New Series
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Track your favorite shows, seasons, and personal reviews.
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
                  Series Poster
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
                      <span className="text-text-primary text-sm font-medium">
                        Upload Poster
                      </span>
                      <span className="text-text-secondary text-[11px] mt-1">
                        PNG, JPG or WebP
                      </span>
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
              {/* Series Title with Search */}
              <div className="relative">
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Series Title
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Type series name to autofill..."
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
                  <p className="text-error text-xs mt-1.5 pl-1">
                    {errors.title}
                  </p>
                )}

                {/* Search Results Dropdown */}
                {showResults && (
                  <SearchDropdown
                    isSearching={isSearching}
                    searchResults={searchResults}
                    onSelect={selectSeries}
                    onClose={() => setShowResults(false)}
                    type="series"
                  />
                )}
              </div>

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
                      placeholder="e.g. EN, KO"
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
                      placeholder="e.g. US, KR"
                      value={values.origin_country}
                      onChange={handleChange("origin_country")}
                      className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Year / Seasons / Platform */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        setFieldValue(
                          "releaseYear",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                        errors.releaseYear
                          ? "border-error focus:border-error focus:ring-error/20"
                          : "border-border focus:border-accent"
                      }`}
                    />
                  </div>
                  {errors.releaseYear && (
                    <p className="text-error text-xs mt-1.5 pl-1">
                      {errors.releaseYear}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Total Seasons
                  </label>
                  <div className="relative">
                    <Clapperboard
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={values.seasons}
                      onChange={handleChange("seasons")}
                      className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                        errors.seasons
                          ? "border-error focus:border-error focus:ring-error/20"
                          : "border-border focus:border-accent"
                      }`}
                    />
                  </div>
                  {errors.seasons && (
                    <p className="text-error text-xs mt-1.5 pl-1">
                      {errors.seasons}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Total Episodes
                  </label>
                  <div className="relative">
                    <PlayCircle
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="number"
                      placeholder="e.g. 62"
                      value={values.episodes}
                      onChange={handleChange("episodes")}
                      className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                        errors.episodes
                          ? "border-error focus:border-error focus:ring-error/20"
                          : "border-border focus:border-accent"
                      }`}
                    />
                  </div>
                  {errors.episodes && (
                    <p className="text-error text-xs mt-1.5 pl-1">
                      {errors.episodes}
                    </p>
                  )}
                </div>

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
                      placeholder="e.g. Netflix, Disney+"
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
                    <p className="text-error text-xs mt-1.5 pl-1">
                      {errors.platform}
                    </p>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Watching Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-left flex items-center justify-between focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  >
                    <span className="text-text-primary font-medium">
                      {STATUS_MAP[values.status as StatusKey]}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-text-secondary transition-transform duration-200 ${
                        statusDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {statusDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setStatusDropdownOpen(false)}
                      />
                      <div className="absolute z-30 top-[calc(100%+6px)] left-0 w-full bg-surface border border-border rounded-xl shadow-xl shadow-black/5 overflow-hidden py-1">
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              setFieldValue("status", status);
                              setStatusDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                              values.status === status
                                ? "bg-accent/10 text-accent font-semibold"
                                : "text-text-primary hover:bg-bg"
                            }`}
                          >
                            {STATUS_MAP[status]}
                            {values.status === status && <Check size={16} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Start Date */}
                {showStartDate && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                      Started From
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
                        onChange={(e) =>
                          setFieldValue("started_from", e.target.value)
                        }
                        className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all ${
                          errors.started_from
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-border"
                        }`}
                      />
                    </div>
                    {errors.started_from && (
                      <p className="text-error text-xs mt-1.5 pl-1">
                        {errors.started_from}
                      </p>
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
                        onChange={(e) =>
                          setFieldValue("finished_on", e.target.value)
                        }
                        className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all ${
                          errors.finished_on
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-border"
                        }`}
                      />
                    </div>
                    {errors.finished_on && (
                      <p className="text-error text-xs mt-1.5 pl-1">
                        {errors.finished_on}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="relative">
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Genres
                </label>
                <div
                  className={`w-full bg-bg border rounded-xl flex items-center gap-2 px-4 transition-all ${
                    errors.genres
                      ? "border-error"
                      : genreDropdownOpen
                        ? "border-accent ring-2 ring-accent/20"
                        : "border-border"
                  }`}
                >
                  <Search
                    size={14}
                    className="text-text-secondary/50 shrink-0"
                  />
                  <input
                    type="text"
                    placeholder="Search & select genres..."
                    value={genreSearch}
                    onFocus={() => setGenreDropdownOpen(true)}
                    onChange={(e) => {
                      setGenreSearch(e.target.value);
                      setGenreDropdownOpen(true);
                    }}
                    className="flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
                  />
                  <ChevronDown
                    size={16}
                    className={`text-text-secondary/60 shrink-0 transition-transform duration-200 ${
                      genreDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {errors.genres && (
                  <p className="text-error text-xs mt-1.5 pl-1">
                    {errors.genres}
                  </p>
                )}
                {genreDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => {
                        setGenreDropdownOpen(false);
                        setGenreSearch("");
                      }}
                    />
                    <div className="absolute z-30 top-[calc(100%+6px)] left-0 w-full bg-surface border border-border rounded-xl shadow-xl shadow-black/5 overflow-hidden">
                      <div className="max-h-52 overflow-y-auto py-1">
                        {GENRE_OPTIONS.filter((g) =>
                          g.toLowerCase().includes(genreSearch.toLowerCase()),
                        ).length === 0 ? (
                          <p className="text-text-secondary/60 text-xs text-center py-4 italic">
                            No genres match "{genreSearch}"
                          </p>
                        ) : (
                          GENRE_OPTIONS.filter((g) =>
                            g.toLowerCase().includes(genreSearch.toLowerCase()),
                          ).map((genre) => {
                            const isSelected = values.genres.includes(genre);
                            return (
                              <button
                                key={genre}
                                type="button"
                                onClick={() => handleGenreToggle(genre)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                                  isSelected
                                    ? "bg-accent/10 text-accent font-semibold"
                                    : "text-text-primary hover:bg-bg"
                                }`}
                              >
                                {genre}
                                {isSelected && <Check size={16} />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
                {values.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {values.genres.map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-3 py-1.5 rounded-lg animate-in fade-in slide-in-from-bottom-1 duration-200"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => handleGenreRemove(genre)}
                          className="hover:bg-error hover:text-white text-accent/70 rounded-full p-0.5 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Synopsis
                </label>
                <textarea
                  placeholder="A brief summary of the plot..."
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
                    placeholder="Share your thoughts about this series..."
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
                    <p className="text-error text-xs mt-1.5 pl-1">
                      {errors.review}
                    </p>
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
              onClick={() => navigate("/dashboard/series")}
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
              {isSubmitting ? "Saving..." : "Save Series"}
            </button>
          </div>
        </div>

        {/* ─── Bottom Feature Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <FeatureCard
            icon={Sparkles}
            title="Smart Tracking"
            description="Track seasons and progress"
          />
          <FeatureCard
            icon={Eye}
            title="Public / Private"
            description="Set visibility for reviews"
          />
          <FeatureCard
            icon={Tv}
            title="Auto Shelf"
            description="Categorize by watch status"
          />
        </div>
      </form>
    </div>
  );
};

export default AddSeries;
