import { useState, useRef } from "react";
import {
  ImagePlus,
  ChevronDown,
  X,
  Star,
  PlusCircle,
  Sparkles,
  Eye,
  BookOpen,
  Calendar,
  User,
  Check,
  Search,
  Hash,
  Globe,
  Building2,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { useForm } from "../../../../@hooks/Form/useForm";
import { upload_image_api } from "../../../../@apis/users";
import { create_book_mutation, search_external_books_api } from "../../../../@apis/books";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toast";
import SearchDropdown from "./components/SearchDropdown";
import FeatureCard from "./components/FeatureCard";

const GENRE_OPTIONS = [
  "Fiction", "Fantasy", "Sci-Fi", "Thriller", "Literary", 
  "Classic", "Self-Help", "Non-Fiction", "Mystery", "Mythology"
];

interface AddBookForm {
  title: string;
  author: string;
  genres: string[];
  description: string;
  review: string;
  publicationYear: string;
  rating: number;
  status: string;
  pageCount?: number;
  publisher?: string;
  language?: string;
  startedFrom?: string;
  finishedOn?: string;
}

const STATUS_MAP = {
  want_to_read: "Wants to Read",
  reading: "Reading",
  read: "Read",
  not_finished: "Not Finished",
};

const STATUS_OPTIONS = Object.keys(STATUS_MAP) as (keyof typeof STATUS_MAP)[];

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
    pageCount?: number;
    publisher?: string;
    language?: string;
  };
}

const validationSchema = {
  title: (val: string) => (val ? null : "Title is required"),
  author: (val: string) => (val ? null : "Author is required"),
  publicationYear: (val: string) => {
    if (!val) return "Publication year is required";
    if (parseInt(val) > new Date().getFullYear())
      return "Year cannot be in the future";
    return null;
  },
  genres: (val: string[]) => (val.length > 0 ? null : "Genres is required"),
  status: (val: string) => (val ? null : "Status is required"),
  rating: (val: number, formValues: AddBookForm) =>
    formValues.status === "read"
      ? val > 0
        ? null
        : "Rating is required"
      : null,
  review: (val: string, formValues: AddBookForm) =>
    formValues.status === "read"
      ? val.trim()
        ? null
        : "Personal review is required for read books"
      : null,
};

const AddBook = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remoteCoverUrl, setRemoteCoverUrl] = useState<string | null>(null);

  // Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { values, errors, handleChange, setFieldValue, handleSubmit } =
    useForm<AddBookForm>({
      initialValues: {
        title: "",
        author: "",
        genres: [],
        description: "",
        review: "",
        publicationYear: "",
        rating: 0,
        status: "want_to_read",
        pageCount: 0,
        publisher: "",
        language: "",
        startedFrom: new Date().toISOString().split("T")[0],
        finishedOn: new Date().toISOString().split("T")[0],
      },
      validationSchema,
      onSubmit: async (formValues) => {
        try {
          setIsSubmitting(true);
          let cover_image = "";

          if (selectedFile) {
            cover_image = await upload_image_api(selectedFile);
          } else if (remoteCoverUrl) {
            cover_image = remoteCoverUrl;
          }

          await create_book_mutation({
            title: formValues.title,
            author: formValues.author,
            description: formValues.description,
            genres: formValues.genres,
            publication_year: formValues.publicationYear,
            status: formValues.status,
            rating: formValues.rating,
            review: formValues.review,
            cover_image: cover_image,
            page_count: formValues.pageCount || 0,
            publisher: formValues.publisher || "",
            language: formValues.language || "",
            started_from: formValues.status === "reading" || formValues.status === "read" ? formValues.startedFrom : undefined,
            finished_on: formValues.status === "read" ? formValues.finishedOn : undefined,
          });

          toast.success(`Book "${formValues.title}" added successfully!`);
          navigate("/dashboard/books");
        } catch (error: any) {
          console.error("Error adding book:", error);
          toast.error(error.message || "Failed to add book. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
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

  const handleCoverClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRemoteCoverUrl(null); // Local file takes priority
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
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
        const items = await search_external_books_api(query);
        setSearchResults(items);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const selectBook = (book: GoogleBook) => {
    const info = book.volumeInfo;
    setFieldValue("title", info.title);
    setFieldValue("author", info.authors?.join(", ") || "");
    setFieldValue("description", info.description || "");
    setFieldValue("publicationYear", info.publishedDate?.split("-")[0] || "");
    
    if (info.categories) {
       // Only add genres that exist in our GENRE_OPTIONS to keep it valid
       const validGenres = info.categories
         .map((c: string) => c.split(" / ").pop())
         .filter((c): c is string => !!c && GENRE_OPTIONS.includes(c));
       setFieldValue("genres", validGenres.length > 0 ? validGenres : []);
    }

    if (info.imageLinks?.thumbnail) {
      const url = info.imageLinks.thumbnail.replace("http:", "https:");
      setCoverPreview(url);
      setRemoteCoverUrl(url);
    }

    setFieldValue("pageCount", info.pageCount || 0);
    setFieldValue("publisher", info.publisher || "");
    setFieldValue("language", info.language?.toUpperCase() || "");

    setShowResults(false);
  };

  const activeRating = hoverRating || values.rating;

  return (
    <div className="bg-bg flex-1 flex flex-col overflow-y-auto w-full">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[820px] mx-auto px-4 sm:px-6 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">
            Add New Book
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Enter the details of your latest reading adventure.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-8">
            
            {/* ─── Left Column: Cover & Rating (Visual Anchor) ─── */}
            <div className="flex flex-col gap-6 w-full sm:w-[220px] shrink-0">
              {/* Cover Upload */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2.5 block tracking-wider uppercase">
                  Book Cover
                </label>
                <div
                  onClick={handleCoverClick}
                  className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-200 bg-bg/50 overflow-hidden group shadow-sm"
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
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
                        Upload Cover
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

              {/* Star Rating - Only visible if Read */}
              {values.status === "read" && (
                <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-text-primary text-xs font-semibold tracking-wider uppercase">
                    Your Rating
                  </label>
                  <div className="flex flex-col items-center gap-3 py-4 bg-bg/50 rounded-2xl border border-border shadow-inner">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFieldValue("rating", star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-0.5 transition-all hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={
                              star <= activeRating
                                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]"
                                : "fill-transparent text-text-secondary/20"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    {activeRating > 0 && (
                      <span className="text-accent font-bold text-sm">
                        {activeRating}.0 / 5.0
                      </span>
                    )}
                  </div>
                  {errors.rating && (
                    <p className="text-error text-[10px] font-medium text-center">{errors.rating}</p>
                  )}
                </div>
              )}
            </div>

            {/* ─── Right Column: Textual Data & Metadata ─── */}
            <div className="flex flex-col gap-6 flex-1 min-w-0">
              
              {/* Book Title with Search Suggestion */}
              <div className="relative">
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Book Title
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Type any book name to search..."
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
                  <p className="text-error text-xs mt-1.5 pl-1">{errors.title}</p>
                )}

                {/* Search Results Dropdown */}
                {showResults && (
                  <SearchDropdown 
                    isSearching={isSearching}
                    searchResults={searchResults}
                    onSelect={selectBook}
                    onClose={() => setShowResults(false)}
                  />
                )}
              </div>

              {/* Author */}
              <div>
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Author
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="e.g. Matt Haig"
                    value={values.author}
                    onChange={handleChange("author")}
                    className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                      errors.author
                        ? "border-error focus:border-error focus:ring-error/20"
                        : "border-border focus:border-accent"
                    }`}
                  />
                </div>
                {errors.author && (
                  <p className="text-error text-xs mt-1.5 pl-1">{errors.author}</p>
                )}
              </div>

              {/* Grid Layout for Year & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Publication Year */}
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Publication Year
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
                      value={values.publicationYear}
                      onChange={(e) =>
                        setFieldValue(
                          "publicationYear",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                        errors.publicationYear
                          ? "border-error focus:border-error focus:ring-error/20"
                          : "border-border focus:border-accent"
                      }`}
                    />
                  </div>
                  {errors.publicationYear && (
                    <p className="text-error text-xs mt-1.5 pl-1">
                      {errors.publicationYear}
                    </p>
                  )}
                </div>

                {/* Page Count */}
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Page Count
                  </label>
                  <div className="relative">
                    <Hash
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 320"
                      value={values.pageCount || ""}
                      onChange={(e) =>
                        setFieldValue(
                          "pageCount",
                          parseInt(e.target.value.replace(/\D/g, "")) || 0
                        )
                      }
                      className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>

                {/* Publisher */}
                <div className="sm:col-span-1">
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Publisher
                  </label>
                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Penguin Books"
                      value={values.publisher}
                      onChange={handleChange("publisher")}
                      className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>

                {/* Language */}
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
                      placeholder="e.g. EN"
                      value={values.language}
                      onChange={handleChange("language")}
                      className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>

                {/* Status Section (CLEAR SELECT) */}
                <div className="relative">
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Reading Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-left flex items-center justify-between focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  >
                    <span className="text-text-primary font-medium">
                      {STATUS_MAP[values.status as keyof typeof STATUS_MAP]}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-text-secondary transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {statusDropdownOpen && (
                    <>
                      {/* Invisible overlay to catch outside clicks */}
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
                              if (status !== "read") {
                                // setFieldValue("review", "");
                              }
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

                {/* Started From — shown when Reading or Read */}
                {(values.status === "reading" || values.status === "read") && (
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
                        value={values.startedFrom}
                        onChange={(e) => setFieldValue("startedFrom", e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Finished On — shown only when Read */}
                {values.status === "read" && (
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
                        value={values.finishedOn}
                        onChange={(e) => setFieldValue("finishedOn", e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Genres (CLEAR MULTI-SELECT) */}
              <div className="relative">
                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                  Genres
                </label>
                <button
                  type="button"
                  onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                  className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-left flex items-center justify-between focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all ${
                    errors.genres ? "border-error focus:border-error" : "border-border"
                  }`}
                >
                  <span className="text-text-secondary/80">
                    Select genres to categorize...
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-text-secondary transition-transform duration-200 ${genreDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {errors.genres && (
                  <p className="text-error text-xs mt-1.5 pl-1">{errors.genres}</p>
                )}

                {/* Genre Dropdown Menu */}
                {genreDropdownOpen && (
                  <>
                    {/* Invisible overlay to catch outside clicks */}
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setGenreDropdownOpen(false)} 
                    />
                    <div className="absolute z-30 top-[calc(100%+6px)] left-0 w-full bg-surface border border-border rounded-xl shadow-xl shadow-black/5 max-h-60 overflow-y-auto py-1">
                      {GENRE_OPTIONS.map((genre) => {
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
                      })}
                    </div>
                  </>
                )}

                {/* Selected Genre Tags */}
                {values.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {values.genres.map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-3 py-1.5 rounded-lg group animate-in fade-in slide-in-from-bottom-1 duration-200"
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
                  placeholder="A brief summary of the book plot..."
                  value={values.description}
                  onChange={handleChange("description")}
                  rows={3}
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                />
              </div>

              {/* Personal Review - Only visible if Read */}
              {values.status === "read" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Personal Review
                  </label>
                  <textarea
                    placeholder="What did you think of this book? Share your thoughts..."
                    value={values.review}
                    onChange={handleChange("review")}
                    rows={4}
                    className={`w-full bg-bg border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none ${
                        errors.review ? "border-error focus:border-error focus:ring-error/20" : "border-border focus:border-accent"
                    }`}
                  />
                  {errors.review && (
                    <p className="text-error text-xs mt-1.5 pl-1">{errors.review}</p>
                  )}
                  <p className="text-text-secondary text-[10px] mt-2 italic flex items-center gap-1.5 opacity-60">
                    <Sparkles size={12} className="text-accent" />
                    Your review helps you remember your reading journey.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-border">
            <button
              type="button"
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
              {isSubmitting ? "Saving..." : "Save Book"}
            </button>
          </div>
        </div>

        {/* ─── Bottom Feature Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <FeatureCard
            icon={Sparkles}
            title="Auto-fetch Data"
            description="Pull details automatically"
          />
          <FeatureCard
            icon={Eye}
            title="Public / Private"
            description="Set visibility for reviews"
          />
          <FeatureCard
            icon={BookOpen}
            title="Smart Shelf"
            description="Categorize automatically"
          />
        </div>
      </form>
    </div>
  );
};

export default AddBook;