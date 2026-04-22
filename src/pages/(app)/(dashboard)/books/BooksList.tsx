import { useState, useEffect, useRef, useCallback } from "react";
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
import { get_my_books_query, get_book_filters_query, BookFilter } from "../../../../@apis/books";
import { get_full_image_url } from "../../../../@utils/api.utils";

export interface Book {
  _id: string;
  title: string;
  author: string;
  cover_image: string;
  rating: number;
  genres: string[];
  status: "read" | "reading" | "want_to_read" | "not_finished";
  review?: string;
  description?: string;
  publication_year?: string;
  started_from?: string;
  finished_on?: string;
  created_at?: string;
}

const RATING_OPTIONS = [5, 4, 3, 2, 1];
const STATUS_MAP: Record<string, string> = {
  want_to_read: "Wants to Read",
  reading: "Reading",
  read: "Read",
  not_finished: "Not Finished",
};
const ITEMS_PER_PAGE = 10;

// ── Filter Dropdown ─────────────────────────────────────────
const FilterDropdown = ({
  label,
  options,
  selected,
  onSelect,
  renderOption,
  emptyMessage,
  icon: Icon,
}: {
  label: string;
  options: (string | number)[];
  selected: (string | number)[];
  onSelect: (val: string | number) => void;
  renderOption?: (val: string | number) => string;
  emptyMessage?: string;
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
          <Icon size={14} className={selected.length > 0 ? "text-accent" : "text-text-secondary/60"} />
        )}
        {label}
        {selected.length > 0 && (
          <span className="bg-accent/20 text-accent text-[10px] font-bold px-1.5 rounded-full">
            {selected.length}
          </span>
        )}
        <ChevronDown size={14} className={`opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1.5 left-0 min-w-[160px] max-h-64 overflow-y-auto bg-surface border border-border rounded-lg shadow-xl py-1">
            {options.length === 0 ? (
              <p className="px-4 py-3 text-xs text-text-secondary/60 italic">
                {emptyMessage ?? "No options available"}
              </p>
            ) : (
              options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onSelect(opt)}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                    selected.includes(opt) ? "bg-accent/15 text-accent" : "text-text-primary hover:bg-bg"
                  }`}
                >
                  {renderOption ? renderOption(opt) : String(opt)}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── Skeleton card ────────────────────────────────────────────
const GridSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8 pb-8">
    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
      <div key={i} className="flex flex-col gap-3 animate-pulse">
        <div className="aspect-[2/3] w-full rounded-xl bg-surface border border-border/30" />
        <div className="h-3 bg-surface rounded w-3/4" />
        <div className="h-2.5 bg-surface rounded w-1/2" />
      </div>
    ))}
  </div>
);

const ListSkeleton = () => (
  <div className="flex flex-col gap-3 pb-8">
    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 bg-surface border border-border p-3 rounded-xl animate-pulse">
        <div className="w-[52px] aspect-[2/3] rounded-lg bg-border/30 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-border/30 rounded w-2/3" />
          <div className="h-2.5 bg-border/30 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const BooksList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stats: fetched once on mount, independent of filters
  const [stats, setStats] = useState({ total: 0, completed: 0, readingNow: 0 });

  // Dynamic filter options from the user's actual collection
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [authorOptions, setAuthorOptions] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [authorFilter, setAuthorFilter] = useState<string[]>([]);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [committedSearch, setCommittedSearch] = useState("");

  const hasFilters =
    genreFilter.length > 0 || ratingFilter.length > 0 || statusFilter.length > 0 || authorFilter.length > 0 || committedSearch;


  // ── Fetch books from server ──────────────────────────────
  const fetchBooks = useCallback(async (filter: BookFilter) => {
    setIsLoading(true);
    try {
      const result = await get_my_books_query(filter);
      setBooks(result.books as unknown as Book[]);
      setTotal(result.total_count);
      setTotalPages(result.page_count);
      setHasNextPage(result.has_next_page);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-fetch whenever filters or page change
  useEffect(() => {
    fetchBooks({
      search: committedSearch || undefined,
      genres: genreFilter.length ? genreFilter : undefined,
      status: statusFilter.length ? statusFilter : undefined,
      author: authorFilter.length === 1 ? authorFilter[0] : undefined,
      rating: ratingFilter.length ? Math.min(...ratingFilter) : undefined,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    });
  }, [committedSearch, genreFilter, ratingFilter, statusFilter, authorFilter, currentPage, fetchBooks]);

  // Fetch stats + dynamic filter options once on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [all, read, reading, filters] = await Promise.all([
          get_my_books_query({ limit: 1 }),
          get_my_books_query({ status: ["read"], limit: 1 }),
          get_my_books_query({ status: ["reading"], limit: 1 }),
          get_book_filters_query(),
        ]);
        setStats({ total: all.total_count, completed: read.total_count, readingNow: reading.total_count });
        setGenreOptions(filters.genres);
        setStatusOptions(filters.statuses);
        setAuthorOptions(filters.authors);
      } catch (error) {
        console.error("Error fetching meta:", error);
      }
    };
    fetchMeta();
  }, []);

  // ── Handlers ─────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCommittedSearch(value);
      setCurrentPage(1);
    }, 400);
  };

  const toggleFilter = <T extends string | number>(
    val: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
  ) => {
    setter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setGenreFilter([]);
    setRatingFilter([]);
    setStatusFilter([]);
    setAuthorFilter([]);
    setSearchQuery("");
    setCommittedSearch("");
    setCurrentPage(1);
  };

  return (
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
              <span className="text-accent font-semibold">{stats.total}</span> books
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

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 shrink-0">
          {[
            { label: "Total Collection", value: stats.total },
            { label: "Completed", value: stats.completed },
            { label: "Reading Now", value: stats.readingNow },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-center shadow-sm">
              <h3 className="text-text-secondary text-sm font-medium mb-1">{label}</h3>
              <span className="text-text-primary text-3xl font-bold tracking-tight">{value}</span>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col xl:flex-row gap-4 mb-6 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-10 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <FilterDropdown
                label="Genre"
                options={genreOptions}
                emptyMessage="Add books to filter by genre"
                selected={genreFilter}
                onSelect={(val) => toggleFilter(val as string, setGenreFilter)}
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
                options={statusOptions}
                emptyMessage="Add books to filter by status"
                selected={statusFilter}
                onSelect={(val) => toggleFilter(val as string, setStatusFilter)}
                renderOption={(val) => STATUS_MAP[val] ?? val}
                icon={Filter}
              />
              <FilterDropdown
                label="Author"
                options={authorOptions}
                emptyMessage="Add books to filter by author"
                selected={authorFilter}
                onSelect={(val) => toggleFilter(val as string, setAuthorFilter)}
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

        {/* ── View Toggle ── */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6 shrink-0">
          <div className="flex items-center gap-8 relative">
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors relative pb-4 ${
                  viewMode === mode ? "text-accent" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {mode === "grid" ? <LayoutGrid size={16} /> : <ListIcon size={16} />}
                {mode === "grid" ? "Grid View" : "List View"}
              </button>
            ))}
            <div
              className="absolute bottom-0 h-0.5 bg-accent transition-all duration-300 ease-in-out"
              style={{ left: viewMode === "grid" ? "0px" : "110px", width: viewMode === "grid" ? "90px" : "85px" }}
            />
          </div>
          {!isLoading && (
            <p className="text-text-secondary text-xs">
              {total === 0 ? "No results" : (
                <>
                  <span className="text-text-primary font-semibold">{books.length}</span> of{" "}
                  <span className="text-accent font-semibold">{total}</span> books
                </>
              )}
            </p>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {isLoading ? (
            viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />
          ) : books.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
                <BookOpen className="text-text-secondary/40" size={32} />
              </div>
              <p className="text-text-primary font-semibold text-lg">No books found</p>
              <p className="text-text-secondary text-sm mt-1 max-w-sm mb-4">
                {hasFilters
                  ? "Try adjusting your search or clear filters."
                  : "Start building your reading collection."}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-accent text-sm font-semibold hover:underline">
                  Clear all filters & search
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8 pb-8">
              {books.map((book) => (
                <Link
                  to={`/dashboard/books/${book._id}`}
                  key={book._id}
                  className="group flex flex-col gap-3 cursor-pointer"
                >
                  <div className="relative aspect-[2/3] w-full rounded-md md:rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 border border-border/30 group-hover:border-accent/40 bg-surface">
                    <img
                      src={get_full_image_url(book.cover_image, "book")}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
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
                    <p className="text-text-secondary text-xs mt-1 truncate">{book.author}</p>
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
                    <span className={`mt-2 self-start text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      book.status === "read" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      book.status === "reading" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      book.status === "want_to_read" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {STATUS_MAP[book.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-8">
              {books.map((book) => (
                <Link
                  to={`/dashboard/books/${book._id}`}
                  key={book._id}
                  className="group flex items-center gap-4 bg-surface border border-border p-3 rounded-xl shadow-sm hover:shadow-md hover:border-accent/40 transition-all cursor-pointer"
                >
                  <div className="relative aspect-[2/3] w-[52px] shrink-0 rounded-lg overflow-hidden border border-border/50">
                    <img
                      src={get_full_image_url(book.cover_image, "book")}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-text-primary font-bold text-[15px] leading-tight mb-1 truncate group-hover:text-accent transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-text-secondary text-xs truncate">{book.author}</p>
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
                      <Star size={13} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-text-primary text-sm font-bold">{book.rating.toFixed(1)}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      book.status === "read" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      book.status === "reading" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      book.status === "want_to_read" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {STATUS_MAP[book.status]}
                    </span>
                  </div>
                  <button
                    className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg transition-colors z-10"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical size={16} />
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border shrink-0">
            <p className="text-text-secondary text-xs">
              Page <span className="text-text-primary font-semibold">{currentPage}</span> of{" "}
              <span className="text-accent font-semibold">{totalPages}</span>
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
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    p === currentPage
                      ? "bg-accent text-text-primary"
                      : "border border-border text-text-secondary hover:text-text-primary hover:border-accent/30"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={!hasNextPage}
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
