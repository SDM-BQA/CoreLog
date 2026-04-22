import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Plus,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  BookOpen,
} from "lucide-react";
import { get_my_books_query } from "../../../../@apis/books";
import { get_full_image_url } from "../../../../@utils/api.utils";

export interface Book {
  _id: string;
  title: string;
  author: string;
  cover_image: string;
  coverImage?: string; // for compatibility with old code if needed
  rating: number;
  genres: string[];
  status: "read" | "reading" | "want_to_read" | "not_finished";
  review?: string;
  description?: string;
  publication_year?: string;
  addedOn?: string;
}

// ── Filter Dropdown ─────────────────────────────────────────
const FilterDropdown = ({
  label,
  options,
  selected,
  onSelect,
  renderOption,
  icon: Icon,
}: {
  label: string;
  options: (string | number)[];
  selected: (string | number)[];
  onSelect: (val: string | number) => void;
  renderOption?: (val: string | number) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 ${
          selected.length > 0
            ? "border-accent/50 bg-accent/10 text-accent"
            : "border-border bg-surface text-text-secondary hover:text-text-primary hover:border-accent"
        }`}
      >
        {Icon && (
          <Icon
            size={14}
            className={
              selected.length > 0 ? "text-accent" : "text-text-secondary/60"
            }
          />
        )}
        {label}
        {selected.length > 0 && (
          <span className="bg-accent/20 text-accent text-[10px] font-bold px-1.5 rounded-full">
            {selected.length}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1.5 left-0 min-w-[160px] max-h-64 overflow-y-auto bg-surface border border-border rounded-lg shadow-xl py-1">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onSelect(opt)}
                className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                  selected.includes(opt)
                    ? "bg-accent/15 text-accent"
                    : "text-text-primary hover:bg-bg"
                }`}
              >
                {renderOption ? renderOption(opt) : String(opt)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Extracted from original booksData for filter UI
const GENRE_OPTIONS = [
  "Fiction",
  "Fantasy",
  "Sci-Fi",
  "Thriller",
  "Literary",
  "Classic",
  "Self-Help",
  "Non-Fiction",
  "Mystery",
  "Mythology",
];
const RATING_OPTIONS = [5, 4, 3, 2, 1];
const STATUS_MAP = {
  want_to_read: "Wants to Read",
  reading: "Reading",
  read: "Read",
  not_finished: "Not Finished",
};

const STATUS_OPTIONS = Object.keys(STATUS_MAP);

const BooksList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const data = await get_my_books_query();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const AUTHOR_OPTIONS = useMemo(() => 
    Array.from(new Set(books.map((b) => b.author))).sort(),
  [books]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Real Filters
  const [genreFilter, setGenreFilter] = useState<string[]>([]);
  const [authorFilter, setAuthorFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const hasFilters =
    genreFilter.length > 0 ||
    authorFilter.length > 0 ||
    ratingFilter.length > 0 ||
    statusFilter.length > 0;

  const clearFilters = () => {
    setGenreFilter([]);
    setAuthorFilter([]);
    setRatingFilter([]);
    setStatusFilter([]);
    setCurrentPage(1);
  };

  const toggleFilter = <T extends string | number>(
    val: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
  ) => {
    setter((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
    setCurrentPage(1);
  };

  // Filter logic
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        !searchQuery ||
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        genreFilter.length === 0 ||
        book.genres?.some((g) => genreFilter.includes(g));
      const matchesAuthor =
        authorFilter.length === 0 || authorFilter.includes(book.author);
      // Floor rating for matching whole star values
      const matchesRating =
        ratingFilter.length === 0 ||
        ratingFilter.includes(Math.floor(book.rating));
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(book.status);

      return (
        matchesSearch &&
        matchesGenre &&
        matchesAuthor &&
        matchesRating &&
        matchesStatus
      );
    });
  }, [books, searchQuery, genreFilter, authorFilter, ratingFilter, statusFilter]);

  // Derived Stats
  const totalCollection = books.length;
  const completed = books.filter((b) => b.status === "read").length;
  const readingNow = books.filter((b) => b.status === "reading").length;

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooks.length / itemsPerPage),
  );
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    // FIX: Moving overflow-y-auto to the very outer wrap ensures the scrollbar is glued to the window edge
    <div className="bg-bg flex-1 overflow-y-auto">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 min-h-full flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">
              My Collection
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Manage and explore your personal library of{" "}
              <span className="text-accent font-semibold">
                {books.length}
              </span>{" "}
              books
            </p>
          </div>
          <Link
            to="/dashboard/books/add-book"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-text-primary text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <Plus size={16} />
            Add Book
          </Link>
        </div>

        {/* Header Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 shrink-0">
          <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-center shadow-sm">
            <h3 className="text-text-secondary text-sm font-medium mb-1 relative">
              Total Collection
            </h3>
            <div className="flex items-end gap-3">
              <span className="text-text-primary text-3xl font-bold tracking-tight">
                {totalCollection}
              </span>
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-center shadow-sm">
            <h3 className="text-text-secondary text-sm font-medium mb-1">
              Completed
            </h3>
            <div className="flex items-end gap-3">
              <span className="text-text-primary text-3xl font-bold tracking-tight">
                {completed}
              </span>
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-center shadow-sm">
            <h3 className="text-text-secondary text-sm font-medium mb-1">
              Reading Now
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-text-primary text-3xl font-bold tracking-tight">
                {readingNow}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar: Search + Filters + Action */}
        <div className="flex flex-col xl:flex-row gap-4 mb-6 shrink-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-10 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <FilterDropdown
                label="Genre"
                options={GENRE_OPTIONS}
                selected={genreFilter}
                onSelect={(val) => toggleFilter(val as string, setGenreFilter)}
                icon={Filter}
              />
              <FilterDropdown
                label="Author"
                options={AUTHOR_OPTIONS}
                selected={authorFilter}
                onSelect={(val) => toggleFilter(val as string, setAuthorFilter)}
                icon={Filter}
              />
              <FilterDropdown
                label="Rating"
                options={RATING_OPTIONS}
                selected={ratingFilter}
                onSelect={(val) => toggleFilter(val as number, setRatingFilter)}
                renderOption={(val) => `${"★".repeat(val as number)} ${val}.0+`}
                icon={Star}
              />
              <FilterDropdown
                label="Status"
                options={STATUS_OPTIONS}
                selected={statusFilter}
                onSelect={(val) => toggleFilter(val as string, setStatusFilter)}
                renderOption={(val) => STATUS_MAP[val as keyof typeof STATUS_MAP]}
                icon={Filter}
              />
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  <X size={13} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Toggles & Results Info */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6 shrink-0">
          <div className="flex items-center gap-8 relative">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 text-sm font-medium transition-colors relative pb-4 ${
                viewMode === "grid"
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <LayoutGrid size={16} />
              Grid View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 text-sm font-medium transition-colors relative pb-4 ${
                viewMode === "list"
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <ListIcon size={16} />
              List View
            </button>
            {/* Sliding Underline */}
            <div 
              className="absolute bottom-0 h-0.5 bg-accent transition-all duration-300 ease-in-out"
              style={{
                left: viewMode === "grid" ? "0px" : "110px", 
                width: viewMode === "grid" ? "90px" : "85px"
              }}
            />
          </div>
        </div>

        {/* Dynamic List / Grid view */}
        <div className="flex-1 flex flex-col min-h-0">
          {filteredBooks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
                <BookOpen className="text-text-secondary/40" size={32} />
              </div>
              <p className="text-text-primary font-semibold text-lg">
                {isLoading ? "Loading your collection..." : "No books found"}
              </p>
              <p className="text-text-secondary text-sm mt-1 max-w-sm mb-4">
                {isLoading 
                  ? "Please wait while we fetch your books."
                  : (hasFilters || searchQuery
                    ? "Try adjusting your search or clear filters to see more results."
                    : "Start building your reading collection.")}
              </p>
              {!isLoading && (hasFilters || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    clearFilters();
                  }}
                  className="text-accent text-sm font-semibold hover:underline"
                >
                  Clear all filters & search
                </button>
              )}
            </div>
          ) : (
            <>
              <div key={viewMode} className="animate-fade-in">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8 pb-8">
                    {paginatedBooks.map((book) => (
                      <Link
                        to={`/dashboard/books/${book._id}`}
                        key={book._id}
                        className="group flex flex-col gap-3 cursor-pointer"
                      >
                        <div className="relative aspect-[2/3] w-full rounded-md md:rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 border border-border/30 group-hover:border-accent/40 bg-surface">
                          <img
                            src={get_full_image_url(book.cover_image || book.coverImage, "book")}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Subtle overlay for actions */}
                          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <span className="bg-accent/90 text-background text-xs font-bold px-4 py-2 rounded-lg">
                              View Details
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-text-primary text-[15px] font-bold font-inter leading-tight truncate group-hover:text-accent transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-text-secondary text-xs mt-1 truncate">
                            {book.author}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="flex items-center gap-[1px]">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={10}
                                  className={
                                    star <= Math.round(book.rating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-transparent text-text-secondary/30"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-text-secondary text-[10px] font-medium mt-[1px]">
                              ({book.rating.toFixed(1)})
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pb-8">
                    {paginatedBooks.map((book) => (
                      <Link
                        to={`/dashboard/books/${book._id}`}
                        key={book._id}
                        className="group flex items-center gap-4 bg-surface border border-border p-3 rounded-xl shadow-sm hover:shadow-md hover:border-accent/40 transition-all cursor-pointer"
                      >
                        <div className="relative aspect-[2/3] w-[52px] shrink-0 rounded-lg overflow-hidden border border-border/50">
                          <img
                            src={get_full_image_url(book.cover_image || book.coverImage, "book")}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
  
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-text-primary font-bold text-[15px] leading-tight mb-1 truncate group-hover:text-accent transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-text-secondary text-xs truncate">
                            {book.author}
                          </p>
                        </div>
  
                        <div className="hidden sm:flex flex-col items-start w-48 shrink-0">
                          <div className="flex flex-wrap gap-1.5">
                            {book.genres?.map((g) => (
                              <span
                                key={g}
                                className="text-[10px] uppercase font-bold text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-full tracking-wider group-hover:bg-white/15 transition-colors"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
  
                        <div className="flex flex-col items-end gap-1.5 w-28 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Star
                              size={13}
                              className="fill-yellow-400 text-yellow-400"
                            />
                            <span className="text-text-primary text-sm font-bold">
                              {book.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-text-secondary text-[10px] font-semibold px-2 py-0.5 rounded bg-bg/80 border border-border/50">
                            {STATUS_MAP[book.status as keyof typeof STATUS_MAP]}
                          </span>
                        </div>
                        <button className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg transition-colors z-10" onClick={(e) => e.preventDefault()}>
                          <MoreVertical size={16} />
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pagination Block matching movies page exactly */}
        {filteredBooks.length > 0 && (
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border shrink-0">
            <p className="text-text-secondary text-xs">
              Showing{" "}
              <span className="text-text-primary font-semibold">
                {paginatedBooks.length}
              </span>{" "}
              of{" "}
              <span className="text-accent font-semibold">
                {filteredBooks.length}
              </span>{" "}
              books
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`
                    w-8 h-8 rounded-lg text-xs font-semibold transition-colors
                    ${
                      p === currentPage
                        ? "bg-accent text-text-primary"
                        : "border border-border text-text-secondary hover:text-text-primary hover:border-accent/30"
                    }
                  `}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksList;
