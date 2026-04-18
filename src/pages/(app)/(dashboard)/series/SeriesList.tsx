import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Tv,
  Filter,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { DUMMY_SERIES, SeriesStatus } from "./seriesData";

const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Thriller",
];
const RATING_OPTIONS = [5, 4, 3, 2, 1];
const YEAR_OPTIONS = [2024, 2023, 2022, 2020, 2018, 2016, 2008];
const STATUS_OPTIONS: { label: string; value: SeriesStatus }[] = [
  { label: "Watchlist", value: "Watchlist" },
  { label: "Watching", value: "Watching" },
  { label: "Rewatching", value: "Rewatching" },
  { label: "Watched", value: "Watched" },
  { label: "Not Finished", value: "NotFinished" },
];

const ITEMS_PER_PAGE = 10;

// ── Stars component ─────────────────────────────────────────
const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={14}
        className={
          s <= rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-transparent text-text-secondary/30"
        }
      />
    ))}
  </div>
);

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

// ── Main Component ──────────────────────────────────────────
const SeriesList = () => {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<SeriesStatus[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const hasFilters =
    genreFilter.length > 0 || ratingFilter.length > 0 || yearFilter.length > 0 || statusFilter.length > 0;

  const clearFilters = () => {
    setGenreFilter([]);
    setRatingFilter([]);
    setYearFilter([]);
    setStatusFilter([]);
    setPage(1);
  };

  const toggleFilter = <T extends string | number>(
    _arr: T[],
    val: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
  ) => {
    setter((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
    setPage(1);
  };

  // Filter + search
  const filtered = useMemo(() => {
    return DUMMY_SERIES.filter((s) => {
      const matchesSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.genres.some((g) => g.toLowerCase().includes(search.toLowerCase()));
      const matchesGenre =
        genreFilter.length === 0 ||
        s.genres.some((g) => genreFilter.includes(g));
      const matchesRating =
        ratingFilter.length === 0 || ratingFilter.includes(s.rating);
      const matchesYear =
        yearFilter.length === 0 || yearFilter.includes(s.year);
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(s.status);
      return matchesSearch && matchesGenre && matchesRating && matchesYear && matchesStatus;
    });
  }, [search, genreFilter, ratingFilter, yearFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // Derived Stats
  const totalCollection = DUMMY_SERIES.length;
  const watched = DUMMY_SERIES.filter((s) => s.status === "Watched").length;
  const watchlistCount = DUMMY_SERIES.filter((s) => s.status === "Watchlist").length;

  // ── Empty state ──
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center">
        <Tv size={36} className="text-text-secondary/40" />
      </div>
      <div className="text-center">
        <p className="text-text-primary font-semibold text-lg">
          No web series found
        </p>
        <p className="text-text-secondary text-sm mt-1">
          {hasFilters || search
            ? "Try adjusting your search or filters."
            : "Start building your collection by adding your first web series."}
        </p>
      </div>
      {!hasFilters && !search && (
        <Link
          to="/dashboard/series/add-series"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-text-primary text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors mt-2"
        >
          <Plus size={16} />
          Add Your First Series
        </Link>
      )}
    </div>
  );

  return (
    <div className="bg-bg flex-1 overflow-y-auto">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 flex flex-col min-h-full">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">
              My Collection
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Manage and explore your personal library of{" "}
              <span className="text-accent font-semibold">
                {DUMMY_SERIES.length}
              </span>{" "}
              web series
            </p>
          </div>
          <Link
            to="/dashboard/series/add-series"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-text-primary text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <Plus size={16} />
            Add Series
          </Link>
        </div>

        {/* ── Header Stats Row ── */}
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
                {watched}
              </span>
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-center shadow-sm">
            <h3 className="text-text-secondary text-sm font-medium mb-1">
              On Watchlist
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-text-primary text-3xl font-bold tracking-tight">
                {watchlistCount}
              </span>
              <span className="bg-accent/10 text-accent text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center">
                +1 recently
              </span>
            </div>
          </div>
        </div>

        {/* ── Toolbar: Search + Filters ── */}
        <div className="flex flex-col xl:flex-row gap-4 mb-6 shrink-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by title, creator..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2 flex-wrap items-center">
              <FilterDropdown
                label="Genre"
                options={GENRE_OPTIONS}
                selected={genreFilter}
                onSelect={(val) =>
                  toggleFilter(genreFilter, val as string, setGenreFilter)
                }
                icon={Filter}
              />
              <FilterDropdown
                label="Rating"
                options={RATING_OPTIONS}
                selected={ratingFilter}
                onSelect={(val) =>
                  toggleFilter(ratingFilter, val as number, setRatingFilter)
                }
                renderOption={(val) => `${"★".repeat(val as number)} ${val}.0+`}
                icon={Star}
              />
              <FilterDropdown
                label="Release Year"
                options={YEAR_OPTIONS}
                selected={yearFilter}
                onSelect={(val) =>
                  toggleFilter(yearFilter, val as number, setYearFilter)
                }
                icon={Filter}
              />
              <FilterDropdown
                label="Status"
                options={STATUS_OPTIONS.map(s => s.value)}
                selected={statusFilter}
                onSelect={(val) =>
                  toggleFilter(statusFilter, val as SeriesStatus, setStatusFilter)
                }
                renderOption={(val) => STATUS_OPTIONS.find(s => s.value === val)?.label || String(val)}
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

        {/* ── View Toggles ── */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6 shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 text-sm font-medium transition-colors relative pb-4 -mb-4 ${
                viewMode === "grid"
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <LayoutGrid size={16} />
              Grid View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 text-sm font-medium transition-colors relative pb-4 -mb-4 ${
                viewMode === "list"
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <ListIcon size={16} />
              List View
            </button>
          </div>
        </div>

        {/* ── Series Cards ── */}
        {paginated.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8 pb-8">
                {paginated.map((series) => (
                  <Link
                    key={series.id}
                    to={`/dashboard/series/${series.id}`}
                    className="group flex flex-col gap-3 cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-md md:rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 border border-border/30 group-hover:border-accent/40 bg-surface">
                      <img
                        src={series.poster}
                        alt={series.title}
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
                        {series.title}
                      </h3>
                      <p className="text-text-secondary text-xs mt-1 truncate flex gap-2">
                        <span>{series.year}</span>
                        <span className="text-text-secondary/40">•</span>
                        <span className="truncate">{series.genres.join(", ")}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <Stars rating={series.rating} />
                        <span className="text-text-secondary text-[10px] font-medium mt-[1px]">
                          ({series.rating.toFixed(1)})
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-8">
                {paginated.map((series) => (
                  <Link
                    key={series.id}
                    to={`/dashboard/series/${series.id}`}
                    className="group flex items-center gap-4 bg-surface border border-border p-3 rounded-xl shadow-sm hover:shadow-md hover:border-accent/40 transition-all cursor-pointer"
                  >
                    {/* Poster */}
                    <div className="w-[60px] sm:w-[80px] aspect-[2/3] rounded-lg overflow-hidden shrink-0 border border-border/50">
                      <img
                        src={series.poster}
                        alt={series.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="pr-4">
                          <h3 className="text-text-primary font-bold text-[15px] leading-tight group-hover:text-accent transition-colors">
                            {series.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-text-secondary text-xs">
                              {series.year}
                            </span>
                            <span className="text-text-secondary/30 text-xs">
                              ·
                            </span>
                            <span className="text-text-secondary text-xs">
                              {series.genres.join(" / ")}
                            </span>
                            <span className="text-text-secondary/30 text-xs hidden sm:inline">
                              ·
                            </span>
                            <div className="hidden sm:block">
                              <Stars rating={series.rating} />
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="hidden sm:flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            title="Edit"
                            onClick={(e) => e.preventDefault()}
                            className="p-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={(e) => e.preventDefault()}
                            className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-colors z-10"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Review */}
                      <p className="text-text-secondary text-xs leading-relaxed mt-2.5 italic line-clamp-2 pr-4 sm:pr-8">
                        {series.review}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Pagination ── */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-text-secondary text-xs">
              Showing{" "}
              <span className="text-text-primary font-semibold">
                {paginated.length}
              </span>{" "}
              of{" "}
              <span className="text-accent font-semibold">
                {filtered.length}
              </span>{" "}
              series
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`
                    w-8 h-8 rounded-lg text-xs font-semibold transition-colors
                    ${
                      p === page
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
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
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

export default SeriesList;
