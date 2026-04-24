import { useState, useEffect, useRef, useCallback } from "react";
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
  MoreVertical,
  Tv,
  X,
} from "lucide-react";
import { get_my_series_query, SeriesFilter } from "../../../../@apis/series";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { get_genre_display, get_genre_key } from "../../../../@utils/genres";
import { FilterDropdown, CalendarView } from "../../../../@components/@smart";

export interface Series {
  _id: string;
  title: string;
  creator: string;
  poster_image: string;
  rating: number;
  genres: string[];
  status: "watchlist" | "watching" | "rewatching" | "watched" | "not_finished";
  review?: string;
  description?: string;
  release_year?: string;
  seasons: number;
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

// ── Skeleton cards ───────────────────────────────────────────
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

const SeriesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({ total: 0, watched: 0, watching: 0 });

  // Filter options
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [platformOptions, setPlatformOptions] = useState<string[]>([]);

  // State from URL
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar" | "platform">(
    (searchParams.get("view") as any) || "grid"
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [committedSearch, setCommittedSearch] = useState(searchParams.get("search") || "");

  // All series for calendar view (unpaginated)
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  const [genreFilter, setGenreFilter] = useState<string[]>(
    searchParams.get("genres")?.split(",").filter(Boolean) || []
  );
  const [ratingFilter, setRatingFilter] = useState<number[]>(
    searchParams.get("rating")?.split(",").map(Number).filter(Boolean) || []
  );
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || []
  );
  const [platformFilter, setPlatformFilter] = useState<string[]>(
    searchParams.get("platforms")?.split(",").filter(Boolean) || []
  );

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
    if (platformFilter.length) params.platforms = platformFilter.join(",");

    setSearchParams(params, { replace: true });
  }, [currentPage, committedSearch, viewMode, genreFilter, statusFilter, ratingFilter, platformFilter, setSearchParams]);

  const hasFilters =
    genreFilter.length > 0 || ratingFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0 || committedSearch;

  const fetchSeries = useCallback(async (filter: SeriesFilter) => {
    setIsLoading(true);
    try {
      const result = await get_my_series_query(filter);
      setSeriesList(result.series as unknown as Series[]);
      setTotal(result.total_count);
      setTotalPages(result.page_count);
      setHasNextPage(result.has_next_page);
    } catch (error) {
      console.error("Error fetching series:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries({
      search: committedSearch || undefined,
      genres: genreFilter.length ? genreFilter : undefined,
      status: statusFilter.length ? statusFilter : undefined,
      platform: platformFilter.length === 1 ? platformFilter[0] : undefined,
      rating: ratingFilter.length ? Math.min(...ratingFilter) : undefined,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    });
  }, [committedSearch, genreFilter, ratingFilter, statusFilter, platformFilter, currentPage, fetchSeries]);

  useEffect(() => {
    const fetchMeta = async () => {
      // Stats and filter options fetched independently so one failure doesn't block the other
      try {
        const [all, watched, watching] = await Promise.all([
          get_my_series_query({ limit: 1 }),
          get_my_series_query({ status: ["watched"], limit: 1 }),
          get_my_series_query({ status: ["watching"], limit: 1 }),
        ]);
        setStats({ total: all.total_count, watched: watched.total_count, watching: watching.total_count });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }

      // Derive filter options from the user's actual series collection
      try {
        const allSeries = await get_my_series_query({ limit: 9999 });
        const list = allSeries.series as unknown as Series[];
        setGenreOptions([...new Set(list.flatMap((s) => s.genres || []))]);
        setStatusOptions([...new Set(list.map((s) => s.status))]);
        setPlatformOptions([...new Set(list.map((s) => s.platform).filter(Boolean) as string[])]);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchMeta();
  }, []);

  // Fetch ALL series (no pagination) when calendar or platform view is active
  useEffect(() => {
    if (viewMode !== "calendar" && viewMode !== "platform") return;
    const fetchAll = async () => {
      setIsCalendarLoading(true);
      try {
        const result = await get_my_series_query({ limit: 1000 });
        setAllSeries(result.series as unknown as Series[]);
      } catch (error) {
        console.error("Error fetching all series for calendar:", error);
      } finally {
        setIsCalendarLoading(false);
      }
    };
    fetchAll();
  }, [viewMode]);

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
    setPlatformFilter([]);
    setSearchQuery("");
    setCommittedSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="bg-bg flex-1 flex flex-col min-h-0">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">
              Web Series
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Manage and explore your personal library of{" "}
              <span className="text-accent font-semibold">{stats.total}</span> series
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

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 shrink-0">
          {[
            { label: "Total Collection", value: stats.total },
            { label: "Watched", value: stats.watched },
            { label: "Watching Now", value: stats.watching },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-center shadow-sm">
              <h3 className="text-text-secondary text-sm font-medium mb-1">{label}</h3>
              <span className="text-text-primary text-3xl font-bold tracking-tight">{value}</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search by title or creator..."
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
              emptyMessage="Add series to filter by genre"
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
              emptyMessage="Add series to filter by status"
              selected={statusFilter}
              onSelect={(val) => toggleFilter(val as string, setStatusFilter)}
              renderOption={(val) => STATUS_MAP[val] ?? val}
              icon={Filter}
            />
            <FilterDropdown
              label="Platform"
              options={platformOptions}
              emptyMessage="Add series to filter by platform"
              selected={platformFilter}
              onSelect={(val) => toggleFilter(val as string, setPlatformFilter)}
              icon={Filter}
            />
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
            {(["grid", "list", "calendar", "platform"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors relative pb-4 ${
                  viewMode === mode ? "text-accent" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {mode === "grid" ? <LayoutGrid size={16} /> : mode === "list" ? <ListIcon size={16} /> : mode === "calendar" ? <CalendarDays size={16} /> : <Tv size={16} />}
                {mode === "grid" ? "Grid" : mode === "list" ? "List" : mode === "calendar" ? "Calendar" : "Platform"}
              </button>
            ))}
            <div
              className="absolute bottom-0 h-0.5 bg-accent transition-all duration-300 ease-in-out rounded-full"
              style={{
                left: viewMode === "grid" ? "0px" : viewMode === "list" ? "70px" : viewMode === "calendar" ? "146px" : "252px",
                width: viewMode === "grid" ? "54px" : viewMode === "list" ? "50px" : viewMode === "calendar" ? "88px" : "80px",
              }}
            />
          </div>
          {!isLoading && (
            <p className="text-text-secondary text-xs">
              {total === 0 ? "No results" : (
                <>
                  <span className="text-text-primary font-semibold">{seriesList.length}</span> of{" "}
                  <span className="text-accent font-semibold">{total}</span> series
                </>
              )}
            </p>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
                <div className="animate-reveal">
                  {viewMode === "grid" ? <GridSkeleton /> : viewMode === "list" ? <ListSkeleton /> : <GridSkeleton />}
                </div>
              ) : viewMode === "calendar" ? (
                isCalendarLoading
                  ? <GridSkeleton />
                  : <CalendarView 
                      books={allSeries.map(s => ({
                        _id: s._id,
                        title: s.title,
                        cover_image: s.poster_image,
                        started_from: (s as any).started_from,
                        finished_on: (s as any).finished_on,
                        status: s.status
                      }))} 
                      detailBasePath="/dashboard/series"
                      type="series"
                    />
              ) : viewMode === "platform" ? (
                isCalendarLoading
                  ? <GridSkeleton />
                  : (() => {
                      const groups: Record<string, Series[]> = {};
                      for (const series of allSeries) {
                        const platform = series.platform || "Other";
                        if (!groups[platform]) groups[platform] = [];
                        groups[platform].push(series);
                      }
                      Object.values(groups).forEach(g => g.sort((a, b) => b.rating - a.rating));
                      const sortedGroups = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
                      
                      if (sortedGroups.length === 0) {
                         return (
                           <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                             <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
                               <Tv className="text-text-secondary/40" size={32} />
                             </div>
                             <p className="text-text-primary font-semibold text-lg">No platforms found</p>
                             <p className="text-text-secondary text-sm mt-1 max-w-sm mb-4">
                               Add series with a platform to see them grouped here.
                             </p>
                           </div>
                         );
                      }

                      return (
                        <div className="flex flex-col gap-10 pb-8 animate-reveal">
                          {sortedGroups.map(([platformName, seriesList]) => (
                            <div key={platformName} className="flex flex-col gap-4">
                              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border/50 pb-2">
                                <Tv size={18} className="text-accent" />
                                {platformName}
                                <span className="text-xs font-semibold bg-surface border border-border px-2 py-0.5 rounded-full text-text-secondary ml-2">
                                  {seriesList.length} Series
                                </span>
                              </h3>
                              <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                                {seriesList.map((series) => (
                                  <Link
                                    to={`/dashboard/series/${series._id}`}
                                    key={series._id}
                                    className="group shrink-0 w-32 sm:w-40 flex flex-col gap-3 cursor-pointer snap-start"
                                  >
                                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-lg border border-border/40 group-hover:border-accent/40 bg-surface">
                                      <img
                                        src={get_full_image_url(series.poster_image, "series")}
                                        alt={series.title}
                                        onError={(e) => { (e.target as HTMLImageElement).src = get_full_image_url(undefined, "series"); }}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                      <div className="absolute top-2 right-2 z-10">
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border backdrop-blur-md shadow-lg uppercase tracking-widest ${
                                          series.status === "watched" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                          series.status === "watching" || series.status === "rewatching" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                          series.status === "watchlist" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                                          "bg-red-500/20 text-red-400 border-red-500/30"
                                        }`}>
                                          {STATUS_MAP[series.status]?.split(' ')[0] || series.status}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-1 px-1">
                                      <h4 className="text-text-primary text-[13px] font-bold leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                                        {series.title}
                                      </h4>
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-text-secondary text-[10px] truncate font-semibold uppercase">
                                          {series.creator}
                                        </span>
                                        <div className="flex items-center gap-0.5 bg-accent/5 px-1 py-0.5 rounded border border-accent/10 shrink-0">
                                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                          <span className="text-white text-[9px] font-black">
                                            {series.rating.toFixed(1)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
              ) : seriesList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
                  <Tv className="text-text-secondary/40" size={32} />
                </div>
                <p className="text-text-primary font-semibold text-lg">No web series found</p>
                <p className="text-text-secondary text-sm mt-1 max-w-sm mb-4">
                  {hasFilters
                    ? "Try adjusting your search or clear filters."
                    : "Start building your web series collection."}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-accent text-sm font-semibold hover:underline">
                    Clear all filters & search
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div key={`${currentPage}-${committedSearch}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 pb-8 animate-reveal">
                {seriesList.map((series) => (
                  <Link
                    to={`/dashboard/series/${series._id}`}
                    key={series._id}
                    className="group flex flex-col gap-3 cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 border border-border/40 group-hover:border-accent/40 bg-surface">
                      <img
                        src={get_full_image_url(series.poster_image, "series")}
                        alt={series.title}
                        onError={(e) => { (e.target as HTMLImageElement).src = get_full_image_url(undefined, "series"); }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Status Badge Overlay */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-md border backdrop-blur-md shadow-lg uppercase tracking-widest ${
                          series.status === "watched" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                          series.status === "watching" || series.status === "rewatching" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                          series.status === "watchlist" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                          "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}>
                          {STATUS_MAP[series.status]?.split(' ')[0] || series.status}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-bg/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[3px]">
                        <div className="bg-accent text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-xl shadow-accent/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          View Details
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-1 px-1">
                      <h3 className="text-text-primary text-[15px] font-bold font-inter leading-tight line-clamp-1 group-hover:text-accent transition-colors">
                        {series.title}
                      </h3>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-text-secondary text-[11px] font-medium truncate flex-1 uppercase tracking-tight">
                          {series.creator}
                        </p>
                        <div className="flex items-center gap-1 bg-accent/5 px-1.5 py-0.5 rounded-md border border-accent/10 shrink-0">
                          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-white text-xs font-black">
                            {series.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div key={`${currentPage}-${committedSearch}`} className="flex flex-col gap-3 pb-8 animate-reveal">
                {seriesList.map((series) => (
                  <Link
                    to={`/dashboard/series/${series._id}`}
                    key={series._id}
                    className="group flex items-center gap-4 bg-surface border border-border p-3 rounded-xl shadow-sm hover:shadow-md hover:border-accent/40 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] w-[52px] shrink-0 rounded-xl overflow-hidden border border-border shadow-md">
                      <img
                        src={get_full_image_url(series.poster_image, "series")}
                        alt={series.title}
                        onError={(e) => { (e.target as HTMLImageElement).src = get_full_image_url(undefined, "series"); }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-text-primary font-bold text-base md:text-lg leading-tight mb-1 truncate group-hover:text-accent transition-colors">
                        {series.title}
                      </h3>
                      <p className="text-text-secondary text-sm font-medium flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-text-secondary/30" />
                        {series.creator}
                      </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-start w-48 shrink-0">
                      <div className="flex flex-wrap gap-1.5">
                        {series.genres?.map((g) => (
                          <span
                            key={g}
                            className="text-[10px] uppercase font-bold text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-full tracking-wider group-hover:bg-white/15 transition-colors"
                          >
                            {get_genre_display(g)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 w-24 sm:w-32 md:w-36 shrink-0">
                      <div className="flex items-center gap-1.5 bg-accent/5 px-2 py-1 rounded-lg border border-accent/10">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-white text-sm sm:text-lg md:text-xl font-black">{series.rating.toFixed(1)}</span>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                        series.status === "watched" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        series.status === "watching" || series.status === "rewatching" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        series.status === "watchlist" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {STATUS_MAP[series.status]}
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

          {/* Pagination — hidden in calendar and platform view */}
          {!isLoading && total > 0 && viewMode !== "calendar" && viewMode !== "platform" && (
            <div className="flex lg:flex-col items-center justify-between lg:justify-start gap-4 lg:w-16 shrink-0 mt-auto lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border lg:pl-6 pb-4 lg:pb-0">
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

export default SeriesList;
