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
} from "lucide-react";
import { useForm } from "../../../../@hooks/Form/useForm";

const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
];

interface AddMovieForm {
  title: string;
  genres: string[];
  description: string;
  review: string;
  releaseYear: string;
  rating: number;
}

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
      },
      validationSchema: {
        title: (val) => (val ? null : "Title is required"),
        releaseYear: (val) => (val ? null : "Release year is required"),
        genres: (val) => (val.length > 0 ? null : "Genres is required"),
        review: (val) => (val ? null : "Review is required"),
        rating: (val) => (val ? null : "Rating is required"),
      },
      onSubmit: (formValues) => {
        console.log("Submitting movie:", formValues);
        alert(`Movie "${formValues.title}" added successfully!`);
      },
    });

  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenreToggle = (genre: string) => {
    const currentGenres = values.genres;
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter((g) => g !== genre)
      : [...currentGenres, genre];
    setFieldValue("genres", newGenres);
  };

  const handleGenreRemove = (genre: string) => {
    setFieldValue(
      "genres",
      values.genres.filter((g) => g !== genre),
    );
  };

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

  const activeRating = hoverRating || values.rating;

  return (
    <div className="bg-bg flex-1 flex flex-col overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[820px] mx-auto px-6 py-8"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">
            Add New Movie
          </h1>
          <p className="text-text-secondary text-sm mt-1.5">
            Enter the cinematic details to update your personal collection.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex gap-6">
            {/* ─── Left Column: Poster + Year + Rating ─── */}
            <div className="flex flex-col gap-5 w-[220px] shrink-0">
              {/* Poster Upload */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wide uppercase">
                  Movie Poster
                </label>
                <div
                  onClick={handlePosterClick}
                  className="w-full aspect-[2/3] rounded-lg border-2 border-dashed border-border hover:border-accent cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors bg-bg/50 overflow-hidden group"
                >
                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <ImagePlus
                        size={36}
                        className="text-text-secondary group-hover:text-accent transition-colors"
                      />
                      <span className="text-text-primary text-xs font-medium">
                        Click to upload poster
                      </span>
                      <span className="text-text-secondary text-[10px]">
                        PNG, JPG or WebP (Max 5MB)
                      </span>
                    </>
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

              {/* Release Year */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wide uppercase">
                  Release Year
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
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
                    className={`w-full bg-bg border rounded-lg py-2.5 pl-10 pr-3 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none transition-colors ${
                      errors.releaseYear
                        ? "border-error focus:border-error"
                        : "border-border focus:border-accent"
                    }`}
                  />
                </div>
                {errors.releaseYear && (
                  <p className="text-error text-[10px] mt-1">
                    {errors.releaseYear}
                  </p>
                )}
              </div>

              {/* Star Rating */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wide uppercase">
                  User Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFieldValue("rating", star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          size={22}
                          className={
                            star <= activeRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-transparent text-text-secondary/40"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-text-primary text-sm font-semibold ml-1">
                    {activeRating}.0 / 5.0
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Right Column: Title, Genre, Description, Review ─── */}
            <div className="flex flex-col gap-5 flex-1 min-w-0">
              {/* Movie Title */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wide uppercase">
                  Movie Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inception"
                  value={values.title}
                  onChange={handleChange("title")}
                  className={`w-full bg-bg border rounded-lg py-2.5 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none transition-colors ${
                    errors.title
                      ? "border-error focus:border-error"
                      : "border-border focus:border-accent"
                  }`}
                />
                {errors.title && (
                  <p className="text-error text-[10px] mt-1">{errors.title}</p>
                )}
              </div>

              {/* Genre */}
              <div className="relative">
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wide uppercase">
                  Genre
                </label>
                <button
                  type="button"
                  onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                  className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-sm text-left flex items-center justify-between focus:outline-none focus:border-accent transition-colors"
                >
                  <span className="text-text-secondary/50">
                    Select genres...
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-text-secondary transition-transform ${genreDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {errors.genres && (
                  <p className="text-error text-[10px] mt-1">{errors.genres}</p>
                )}

                {/* Dropdown */}
                {genreDropdownOpen && (
                  <div className="absolute z-20 top-full mt-1 left-0 w-full bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {GENRE_OPTIONS.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          values.genres.includes(genre)
                            ? "bg-accent/20 text-accent"
                            : "text-text-primary hover:bg-bg"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Genre Tags */}
                {values.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {values.genres.map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center gap-1 bg-accent/20 text-accent text-xs font-medium px-2.5 py-1 rounded-md"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => handleGenreRemove(genre)}
                          className="hover:text-text-primary transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description / Synopsis */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wide uppercase">
                  Description/Synopsis
                </label>
                <textarea
                  placeholder="A brief summary of the movie plot..."
                  value={values.description}
                  onChange={handleChange("description")}
                  rows={4}
                  className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              {/* Personal Review */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wide uppercase">
                  Personal Review
                </label>
                <textarea
                  placeholder="What did you think of this film?"
                  value={values.review}
                  onChange={handleChange("review")}
                  rows={4}
                  className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors resize-none"
                />
                {errors.review && (
                  <p className="text-error text-[10px] mt-1">{errors.review}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-1">
                <button
                  type="button"
                  className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-text-primary text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  <PlusCircle size={16} />
                  Add Movie
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Feature Cards ─── */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="bg-surface border border-border rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-semibold leading-tight">
                Auto-fetch Data
              </p>
              <p className="text-text-secondary text-[11px] leading-tight mt-0.5">
                Pull details from TMDb automatically
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <Eye size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-semibold leading-tight">
                Public/Private
              </p>
              <p className="text-text-secondary text-[11px] leading-tight mt-0.5">
                Set visibility for your review
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <LayoutList size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-semibold leading-tight">
                Smart Lists
              </p>
              <p className="text-text-secondary text-[11px] leading-tight mt-0.5">
                Categorize during addition
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddMovie;
