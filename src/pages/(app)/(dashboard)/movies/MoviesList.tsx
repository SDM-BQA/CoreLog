import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Plus,
  LayoutGrid,
  List as ListIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  get_my_movies_query,
} from "../../../../@apis/movies";
import TargetBanner from "../../../../@components/TargetBanner";
import { get_genre_display, get_genre_key } from "../../../../@utils/genres";
import { get_language_name } from "../../../../@utils/api.utils";
import { FilterDropdown, MediaDisplay, CalendarView } from "../../../../@components/@smart";
import { useGetMoviesListQuery, useGetMovieFiltersQuery } from "../../../../@store/api/movies.api";

export interface Movie {
  _id: string;
  title: string;
  language?: string;
  poster_image: string;
  rating: number;
  genres: string[];
  status: "watchlist" | "watching" | "rewatching" | "watched" | "not_finished";
  review?: string;
  description?: string;
  release_year?: string;
  runtime?: number;
  platform?: string;
  started_from?: string;
  finished_on?: string;
  created_at?: string;
}

const RATING_OPTIONS = [5, 4, 3, 2, 1];
const STATUS_MAP: Record<string, string> = {
  watchlist: "Watchlist",
  watching: "Watching",
  rewatching: "Rewatching",
  watched: "Watched",
  not_finished: "Not Finished",
};
const ITEMS_PER_PAGE = 10;

const MoviesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar">(
    (searchParams.get("view") as any) || "grid"
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [committedSearch, setCommittedSearch] = useState(searchParams.get("search") || "");

  const [genreFilter, setGenreFilter] = useState<string[]>(
    searchParams.get("genres")?.split(",").filter(Boolean) || []
  );
  const [ratingFilter, setRatingFilter] = useState<number[]>(
    searchParams.get("rating")?.split(",").map(Number).filter(Boolean) || []
  );
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || []
  );
  const [languageFilter, setLanguageFilter] = useState<string[]>(
    searchParams.get("languages")?.split(",").filter(Boolean) || []
  );
  const [platformFilter, setPlatformFilter] = useState<string[]>(
    searchParams.get("platforms")?.split(",").filter(Boolean) || []
  );

  // Data fetching with RTK Query
  const { data: moviesData, isLoading: isMoviesLoading } = useGetMoviesListQuery({
    search: committedSearch || undefined,
    genres: genreFilter.length ? genreFilter : undefined,
    status: statusFilter.length ? statusFilter : undefined,
    languages: languageFilter.length ? languageFilter : undefined,
    platforms: platformFilter.length ? platformFilter : undefined,
    rating: ratingFilter.length ? Math.min(...ratingFilter) : undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const { data: filtersData } = useGetMovieFiltersQuery(undefined);

  const movies = moviesData?.movies || [];
  const total = moviesData?.total_count || 0;
  const totalPages = moviesData?.page_count || 1;
  const hasNextPage = moviesData?.has_next_page || false;
  const isLoading = isMoviesLoading;

  const [stats, setStats] = useState({ total: 0, watched: 0, watchlist: 0 });

  const genreOptions = filtersData?.genres || [];
  const statusOptions = filtersData?.statuses || [];
  const languageOptions = filtersData?.languages || [];
  const platformOptions = filtersData?.platforms || [];

  // All movies for calendar view (unpaginated)
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (currentPage > 1) params.page = String(currentPage);
    if (committedSearch) params.search = committedSearch;
    if (viewMode !== "grid") params.view = viewMode;
    if (genreFilter.length) params.genres = genreFilter.join(",");
    if (statusFilter.length) params.status = statusFilter.join(",");
    if (ratingFilter.length) params.rating = ratingFilter.join(",");
    if (languageFilter.length) params.languages = languageFilter.join(",");
    if (platformFilter.length) params.platforms = platformFilter.join(",");
    // if (directorFilter.length) params.directors = directorFilter.join(",");
    setSearchParams(params, { replace: true });
  }, [currentPage, committedSearch, viewMode, genreFilter, statusFilter, ratingFilter, languageFilter, setSearchParams]);

  const hasFilters =
    genreFilter.length > 0 ||
    ratingFilter.length > 0 ||
    statusFilter.length > 0 ||
    languageFilter.length > 0 ||
    platformFilter.length > 0 ||
    // directorFilter.length > 0 ||
    !!committedSearch;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [all, watched, watchlist] = await Promise.all([
          get_my_movies_query({ limit: 1 }),
          get_my_movies_query({ status: ["watched"], limit: 1 }),
          get_my_movies_query({ status: ["watchlist"], limit: 1 }),
        ]);
        setStats({
          total: all.total_count,
          watched: watched.total_count,
          watchlist: watchlist.total_count,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  // Fetch ALL movies (no pagination) when calendar view is active
  useEffect(() => {
    if (viewMode !== "calendar") return;
    const fetchAll = async () => {
      setIsCalendarLoading(true);
      try {
        const result = await get_my_movies_query({ limit: 1000 });
        setAllMovies(result.movies as unknown as Movie[]);
      } catch (error) {
        console.error("Error fetching all movies for calendar:", error);
      } finally {
        setIsCalendarLoading(false);
      }
    };
    fetchAll();
  }, [viewMode]);

  // Sync state from URL on back/forward navigation
  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const view = (searchParams.get("view") as any) || "grid";
    const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
    const status = searchParams.get("status")?.split(",").filter(Boolean) || [];
    const rating = searchParams.get("rating")?.split(",").map(Number).filter(Boolean) || [];
    const languages = searchParams.get("languages")?.split(",").filter(Boolean) || [];
    const platforms = searchParams.get("platforms")?.split(",").filter(Boolean) || [];
    // const directors = searchParams.get("directors")?.split(",").filter(Boolean) || [];

    if (page !== currentPage) setCurrentPage(page);
    if (search !== committedSearch) { setCommittedSearch(search); setSearchQuery(search); }
    if (view !== viewMode) setViewMode(view);
    if (JSON.stringify(genres) !== JSON.stringify(genreFilter)) setGenreFilter(genres);
    if (JSON.stringify(status) !== JSON.stringify(statusFilter)) setStatusFilter(status);
    if (JSON.stringify(rating) !== JSON.stringify(ratingFilter)) setRatingFilter(rating);
    if (JSON.stringify(languages) !== JSON.stringify(languageFilter)) setLanguageFilter(languages);
    if (JSON.stringify(platforms) !== JSON.stringify(platformFilter)) setPlatformFilter(platforms);
    // if (JSON.stringify(directors) !== JSON.stringify(directorFilter)) setDirectorFilter(directors);
  }, [searchParams]);

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
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setGenreFilter([]);
    setRatingFilter([]);
    setStatusFilter([]);
    setLanguageFilter([]);
    setPlatformFilter([]);
    // setDirectorFilter([]);
    setSearchQuery("");
    setCommittedSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-8 flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-6">
          <div>
            <h1 className="text-text-primary text-xl sm:text-3xl font-bold tracking-tight font-inter">
              My Collection
            </h1>
            <p className="text-text-secondary text-sm mt-1 hidden sm:block">
              Manage and explore your personal library of{" "}
              <span className="text-accent font-semibold">{stats.total}</span> movies
            </p>
          </div>
          <Link
            to="/dashboard/movies/add-movie"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-accent hover:bg-accent/80 text-text-primary text-xs sm:text-sm font-semibold px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg transition-colors shrink-0"
          >
            <Plus size={16} />
            Add Movie
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-8 shrink-0">
          {[
            { label: "Total Collection", value: stats.total },
            { label: "Watched", value: stats.watched },
            { label: "On Watchlist", value: stats.watchlist },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col justify-center shadow-sm">
              <h3 className="text-text-secondary text-[10px] sm:text-sm font-medium mb-0.5 sm:mb-1 truncate">{label}</h3>
              <span className="text-text-primary text-xl sm:text-3xl font-bold tracking-tight">{value}</span>
            </div>
          ))}
        </div>

        <TargetBanner category="movies" label="watched" />

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search by title or director..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-10 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors shadow-sm"
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

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <FilterDropdown
              label="Genre"
              options={genreOptions.map(get_genre_display)}
              emptyMessage="Add movies to filter by genre"
              selected={genreFilter.map(get_genre_display)}
              onSelect={(val) => toggleFilter(get_genre_key(val as string), setGenreFilter)}
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
              emptyMessage="Add movies to filter by status"
              selected={statusFilter}
              onSelect={(val) => toggleFilter(val as string, setStatusFilter)}
              renderOption={(val) => STATUS_MAP[val] ?? val}
              icon={Filter}
            />
            <FilterDropdown
              label="Language"
              options={languageOptions}
              emptyMessage="Add movies to filter by language"
              selected={languageFilter}
              onSelect={(val) => toggleFilter(val as string, setLanguageFilter)}
              icon={Filter}
            />
            <FilterDropdown
              label="Platform"
              options={platformOptions}
              emptyMessage="Add movies to filter by platform"
              selected={platformFilter}
              onSelect={(val) => toggleFilter(val as string, setPlatformFilter)}
              icon={Filter}
            />
            {/* <FilterDropdown
              label="Director"
              options={directorOptions}
              emptyMessage="Add movies to filter by director"
              selected={directorFilter}
              onSelect={(val) => toggleFilter(val as string, setDirectorFilter)}
              icon={Filter}
            /> */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-error hover:bg-error/10 rounded-lg transition-colors border border-transparent hover:border-error/20"
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6 shrink-0">
          <div className="flex items-center gap-6 relative">
            {(["grid", "list", "calendar"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors relative pb-4 ${
                  viewMode === mode ? "text-accent" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {mode === "grid" ? <LayoutGrid size={16} /> : mode === "list" ? <ListIcon size={16} /> : <CalendarDays size={16} />}
                {mode === "grid" ? "Grid" : mode === "list" ? "List" : "Calendar"}
              </button>
            ))}
            <div
              className="absolute bottom-0 h-0.5 bg-accent transition-all duration-300 ease-in-out rounded-full"
              style={{
                left: viewMode === "grid" ? "0px" : viewMode === "list" ? "70px" : "146px",
                width: viewMode === "grid" ? "54px" : viewMode === "list" ? "50px" : "88px",
              }}
            />
          </div>
          {!isLoading && (
            <p className="text-text-secondary text-xs">
              {total === 0 ? "No results" : (
                <>
                  <span className="text-text-primary font-semibold">{movies.length}</span> of{" "}
                  <span className="text-accent font-semibold">{total}</span> movies
                </>
              )}
            </p>
          )}
        </div>

        {/* Content + Pagination */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 flex flex-col pr-2">
            {viewMode === "calendar" ? (
              isCalendarLoading ? (
                <div className="animate-pulse flex flex-col gap-4">
                  <div className="h-10 bg-surface rounded-xl w-1/4" />
                  <div className="h-[400px] bg-surface rounded-xl w-full" />
                </div>
              ) : (
                <CalendarView
                  books={allMovies.map((m) => ({
                    _id: m._id,
                    title: m.title,
                    cover_image: m.poster_image,
                    started_from: m.started_from,
                    finished_on: m.finished_on,
                    status: m.status,
                  }))}
                  type="movie"
                  detailBasePath="/dashboard/movies"
                />
              )
            ) : (
              <MediaDisplay
                items={movies.map((movie: any) => ({
                  _id: movie._id,
                  title: movie.title,
                  subtitle: movie.language ? get_language_name(movie.language) : "",
                  image: movie.poster_image,
                  rating: movie.rating,
                  status: movie.status,
                  genres: movie.genres,
                  year: movie.release_year,
                }))}
                type="movie"
                viewMode={viewMode}
                isLoading={isLoading}
                hasFilters={hasFilters}
                onClearFilters={clearFilters}
                statusMap={STATUS_MAP}
                getGenreDisplay={get_genre_display}
                itemsPerPage={ITEMS_PER_PAGE}
                pageKey={`${currentPage}-${committedSearch}`}
              />
            )}
          </div>

          {/* Pagination */}
          {!isLoading && total > 0 && viewMode !== "calendar" && (
            <div className="flex lg:flex-col items-center justify-between lg:justify-start gap-4 lg:w-16 shrink-0 mt-auto lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border lg:pl-6 pb-4 lg:pb-0 lg:sticky lg:top-8 lg:self-start">
              <p className="text-text-secondary text-xs lg:text-[10px] font-bold tracking-widest uppercase lg:[writing-mode:vertical-rl] lg:rotate-180 shrink-0">
                Page <span className="text-text-primary">{currentPage}</span> / <span className="text-accent">{totalPages}</span>
              </p>
              <div className="flex lg:flex-col items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} className="lg:-rotate-90" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center shrink-0 ${
                      p === currentPage
                        ? "bg-accent text-white"
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
                  <ChevronRight size={16} className="lg:-rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviesList;
