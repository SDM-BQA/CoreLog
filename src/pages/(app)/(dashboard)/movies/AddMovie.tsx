import { useState, useRef } from "react";
import {
  ImagePlus,
  ChevronDown,
  X,
  Star,
  PlusCircle,
  Sparkles,
  Eye,
  LayoutList,
  Calendar,
  Globe,
  Search,
} from "lucide-react";
import { useForm } from "../../../../@hooks/Form/useForm";
import { SearchDropdown, MultiSearchSelect, TMDBMovie } from "../../../../@components/@smart";
import { 
  search_external_movies_api, 
  fetch_external_movie_providers_api 
} from "../../../../@apis/movies";


interface AddMovieForm {
  title: string;
  genres: string[];
  description: string;
  review: string;
  releaseYear: string;
  rating: number;
  status: string;
  platform: string;
}

const STATUS_OPTIONS = ["Watchlist", "Watching", "Watched", "Not Finished"];

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
  const { values, errors, handleChange, setFieldValue, handleSubmit } =
    useForm<AddMovieForm>({
      initialValues: {
        title: "",
        genres: ["Sci-Fi", "Action"],
        description: "",
        review: "",
        releaseYear: "",
        rating: 4,
        status: "Watchlist",
        platform: "",
      },
      validationSchema: {
        title: (val) => (val ? null : "Title is required"),
        releaseYear: (val) => (val ? null : "Release year is required"),
        genres: (val) => (val.length > 0 ? null : "Genres is required"),
        rating: (val) => (val ? null : "Rating is required"),
        status: (val) => (val ? null : "Status is required"),
      },
      onSubmit: (formValues) => {
        if (formValues.status === "Watched" && !formValues.review) {
          alert("Please add a review for watched movies.");
          return;
        }
        console.log("Submitting movie:", formValues);
        alert(`Movie "${formValues.title}" added successfully!`);
      },
    });

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  const handlePosterClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    if (movie.genre_ids) {
      const validGenres = movie.genre_ids
        .map((id) => TMDB_GENRE_MAP[id])
        .filter((g): g is string => !!g);
      setFieldValue("genres", validGenres.length > 0 ? validGenres : []);
    }

    if (movie.poster_path) {
      const url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      setPosterPreview(url);
    }

    // Fetch Providers
    try {
      const providers = await fetch_external_movie_providers_api(movie.id);
      if (providers && providers.flatrate && providers.flatrate.length > 0) {
        setFieldValue("platform", providers.flatrate[0].provider_name);
      }
    } catch (error) {
      console.error("Failed to fetch movie providers:", error);
    }

    setShowResults(false);
  };

  const activeRating = hoverRating || values.rating;

  return (
    <div className="bg-bg flex-1 flex flex-col overflow-y-auto">
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
            Enter the cinematic details to update your personal collection.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-8">
            {/* ─── Left Column: Poster & Rating (Visual Anchor) ─── */}
            <div className="flex flex-col gap-6 w-full sm:w-[220px] shrink-0">
              {/* Poster Upload */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Movie Poster
                </label>
                <div
                  onClick={handlePosterClick}
                  className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-border hover:border-accent cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors bg-bg/50 overflow-hidden group shadow-sm"
                >
                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
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

              {/* Star Rating */}
              <div className="bg-bg/50 border border-border rounded-xl p-4 flex flex-col items-center gap-2">
                <label className="text-text-secondary text-[11px] font-semibold tracking-wider uppercase">
                  Your Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFieldValue("rating", star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={
                          star <= activeRating
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                            : "fill-transparent text-text-secondary/30"
                        }
                      />
                    </button>
                  ))}
                </div>
                <span className="text-text-primary text-sm font-bold mt-1">
                  {activeRating}.0{" "}
                  <span className="text-text-secondary font-normal text-xs">
                    / 5.0
                  </span>
                </span>
              </div>
            </div>

            {/* ─── Right Column: Textual Data & Metadata ─── */}
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
                    className={`w-full bg-bg border rounded-xl py-3 pl-11 pr-4 text-text-primary text-base placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
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
                    onSelect={selectMovie}
                    onClose={() => setShowResults(false)}
                    type="movie"
                  />
                )}
              </div>

              {/* Grid Layout for Year & Status */}
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

                {/* Status Section */}
                <div className="relative">
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Watch Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-left flex items-center justify-between focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  >
                    <span className="text-text-primary font-medium">
                      {values.status}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-text-secondary transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {statusDropdownOpen && (
                    <div className="absolute z-30 top-[calc(100%+4px)] left-0 w-full bg-surface border border-border rounded-xl shadow-lg shadow-black/5 overflow-hidden">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setFieldValue("status", status);
                            setStatusDropdownOpen(false);
                            if (status !== "Watched") {
                              setFieldValue("review", "");
                            }
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            values.status === status
                              ? "bg-accent/10 text-accent font-medium"
                              : "text-text-primary hover:bg-bg"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
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
                    className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                </div>
              </div>

              <MultiSearchSelect
                label="Genres"
                options={Object.values(TMDB_GENRE_MAP)}
                selected={values.genres}
                onToggle={(genre) => {
                  const currentGenres = values.genres;
                  const newGenres = currentGenres.includes(genre)
                    ? currentGenres.filter((g) => g !== genre)
                    : [...currentGenres, genre];
                  setFieldValue("genres", newGenres);
                }}
                onRemove={(genre) => setFieldValue("genres", values.genres.filter(g => g !== genre))}
                error={errors.genres}
                placeholder="Search & select genres..."
              />

              {/* Description / Synopsis */}
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

              {/* Personal Review (Only shown if Watched) */}
              {values.status === "Watched" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Personal Review
                  </label>
                  <textarea
                    placeholder="What did you think of this film? Share your thoughts..."
                    value={values.review}
                    onChange={handleChange("review")}
                    rows={4}
                    className={`w-full bg-bg border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none ${
                      errors.review
                        ? "border-error focus:border-error"
                        : "border-border focus:border-accent"
                    }`}
                  />
                  {errors.review && (
                    <p className="text-error text-xs mt-1.5 pl-1">
                      {errors.review}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-accent/20"
            >
              <PlusCircle size={18} />
              Save Movie
            </button>
          </div>
        </div>

        {/* ─── Bottom Feature Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-surface border border-border rounded-xl px-4 py-4 flex items-center gap-4 hover:border-accent/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-semibold">
                Auto-fetch Data
              </p>
              <p className="text-text-secondary text-xs mt-0.5">
                Pull details automatically
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl px-4 py-4 flex items-center gap-4 hover:border-accent/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Eye size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-semibold">
                Public/Private
              </p>
              <p className="text-text-secondary text-xs mt-0.5">
                Set visibility for reviews
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl px-4 py-4 flex items-center gap-4 hover:border-accent/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <LayoutList size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-semibold">
                Smart Lists
              </p>
              <p className="text-text-secondary text-xs mt-0.5">
                Categorize automatically
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddMovie;
