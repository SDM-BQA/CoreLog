import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    Music,
    Disc,
    ListMusic,
    Mic,
    BarChart2,
    Plus,
    Search,
    Star,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    Users,
    LayoutGrid,
    List as ListIcon,
    Play,
    Calendar,
} from "lucide-react";
import { useGetSongsListQuery, useGetAlbumsListQuery, useGetMyPlaylistsQuery, useGetMusicFiltersQuery } from "../../../../@store/api/music.api";
import { get_genre_display, get_genre_key } from "../../../../@utils/genres";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { formatDate } from "../../../../@utils/date.utils";
import { FilterDropdown } from "../../../../@components/@smart";

type Tab = "songs" | "albums" | "playlists" | "artists" | "years";

const ITEMS_PER_PAGE = 20;

const STATUS_MAP: Record<string, string> = {
    wishlist: "Wishlist",
    listened: "Listened",
};

const STATUS_COLORS: Record<string, string> = {
    wishlist: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    listened: "text-green-400 border-green-400/30 bg-green-400/5",
};

const MusicHub = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState<Tab>((searchParams.get("tab") as Tab) || "songs");
    const [viewMode, setViewMode] = useState<"grid" | "list">((searchParams.get("view") as any) || "grid");
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [committedSearch, setCommittedSearch] = useState(searchParams.get("search") || "");

    const [genreFilter, setGenreFilter] = useState<string[]>(
        searchParams.get("genres")?.split(",").filter(Boolean) || []
    );
    const [statusFilter, setStatusFilter] = useState<string[]>(
        searchParams.get("status")?.split(",").filter(Boolean) || []
    );
    const [artistFilter, setArtistFilter] = useState<string[]>(
        searchParams.get("artists")?.split(",").filter(Boolean) || []
    );
    const [artistTypeFilter, setArtistTypeFilter] = useState<"all" | "solo" | "band">("all");

    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync URL params
    useEffect(() => {
        const params: Record<string, string> = { tab: activeTab };
        if (currentPage > 1) params.page = String(currentPage);
        if (committedSearch) params.search = committedSearch;
        if (viewMode !== "grid") params.view = viewMode;
        if (genreFilter.length) params.genres = genreFilter.join(",");
        if (statusFilter.length) params.status = statusFilter.join(",");
        if (artistFilter.length) params.artists = artistFilter.join(",");
        setSearchParams(params, { replace: true });
    }, [activeTab, currentPage, committedSearch, viewMode, genreFilter, statusFilter, artistFilter, setSearchParams]);

    const { data: songsData, isLoading: songsLoading } = useGetSongsListQuery(
        activeTab === "songs"
            ? {
                  search: committedSearch || undefined,
                  genres: genreFilter.length ? genreFilter : undefined,
                  status: statusFilter.length ? statusFilter : undefined,
                  artists: artistFilter.length ? artistFilter : undefined,
                  page: currentPage,
                  limit: ITEMS_PER_PAGE,
              }
            : undefined,
        { skip: activeTab !== "songs" }
    );

    const { data: albumsData, isLoading: albumsLoading } = useGetAlbumsListQuery(
        activeTab === "albums"
            ? {
                  search: committedSearch || undefined,
                  genres: genreFilter.length ? genreFilter : undefined,
                  status: statusFilter.length ? statusFilter : undefined,
                  artists: artistFilter.length ? artistFilter : undefined,
                  page: currentPage,
                  limit: ITEMS_PER_PAGE,
              }
            : undefined,
        { skip: activeTab !== "albums" }
    );

    // For artists and years tabs, fetch all without pagination
    const { data: allSongsData } = useGetSongsListQuery(
        { limit: 1000 },
        { skip: activeTab !== "artists" && activeTab !== "years" && activeTab !== "playlists" }
    );
    const { data: allAlbumsData } = useGetAlbumsListQuery(
        { limit: 1000 },
        { skip: activeTab !== "artists" && activeTab !== "years" }
    );

    const { data: playlistsData, isLoading: playlistsLoading } = useGetMyPlaylistsQuery(undefined, {
        skip: activeTab !== "playlists",
    });

    const { data: filtersData } = useGetMusicFiltersQuery(undefined);

    const songs = songsData?.songs || [];
    const totalSongs = songsData?.total_count || 0;
    const songPages = songsData?.page_count || 1;

    const albums = albumsData?.albums || [];
    const totalAlbums = albumsData?.total_count || 0;
    const albumPages = albumsData?.page_count || 1;

    const playlists = playlistsData || [];

    const genreOptions = filtersData?.genres || [];
    const statusOptions = filtersData?.statuses || ["wishlist", "listened"];
    const artistOptions = filtersData?.artists || [];

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setCommittedSearch(val);
            setCurrentPage(1);
        }, 400);
    };

    const switchTab = (tab: Tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        setSearchQuery("");
        setCommittedSearch("");
        setGenreFilter([]);
        setStatusFilter([]);
        setArtistFilter([]);
    };

    const toggleFilter = (
        filter: string[],
        setFilter: React.Dispatch<React.SetStateAction<string[]>>,
        val: string
    ) => {
        setFilter((prev) =>
            prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
        );
        setCurrentPage(1);
    };

    // ─── Artists tab data ───────────────────────────────────────────────────
    const artistMap = (() => {
        const map: Record<string, { songs: number; albums: number; type: string; cover?: string; avgRating: number; totalRatings: number }> = {};
        const allS = allSongsData?.songs || [];
        const allA = allAlbumsData?.albums || [];
        allS.forEach((s: any) => {
            if (!map[s.artist]) map[s.artist] = { songs: 0, albums: 0, type: s.artist_type || "solo", cover: s.cover_image, avgRating: 0, totalRatings: 0 };
            map[s.artist].songs++;
            if (s.rating > 0) {
                map[s.artist].totalRatings++;
                map[s.artist].avgRating += s.rating;
            }
        });
        allA.forEach((a: any) => {
            if (!map[a.artist]) map[a.artist] = { songs: 0, albums: 0, type: a.artist_type || "solo", cover: a.cover_image, avgRating: 0, totalRatings: 0 };
            map[a.artist].albums++;
            if (a.rating > 0) {
                map[a.artist].totalRatings++;
                map[a.artist].avgRating += a.rating;
            }
        });
        return Object.entries(map).map(([name, data]) => ({
            name,
            ...data,
            avgRating: data.totalRatings > 0 ? Math.round((data.avgRating / data.totalRatings) * 10) / 10 : 0,
        })).sort((a, b) => (b.songs + b.albums) - (a.songs + a.albums));
    })();

    const filteredArtists = artistTypeFilter === "all"
        ? artistMap
        : artistMap.filter((a) => a.type === artistTypeFilter);

    // ─── Years tab data ─────────────────────────────────────────────────────
    const yearMap = (() => {
        const map: Record<string, { songs: number; albums: number; genres: Record<string, number>; artists: Record<string, number> }> = {};
        const allS = allSongsData?.songs || [];
        const allA = allAlbumsData?.albums || [];
        [...allS, ...allA].forEach((item: any) => {
            const yr = item.release_year || "Unknown";
            if (!map[yr]) map[yr] = { songs: 0, albums: 0, genres: {}, artists: {} };
            if ("duration_ms" in item) map[yr].songs++;
            else map[yr].albums++;
            (item.genres || []).forEach((g: string) => {
                map[yr].genres[g] = (map[yr].genres[g] || 0) + 1;
            });
            if (item.artist) {
                map[yr].artists[item.artist] = (map[yr].artists[item.artist] || 0) + 1;
            }
        });
        return Object.entries(map)
            .map(([year, data]) => ({
                year,
                ...data,
                topGenre: Object.entries(data.genres).sort((a, b) => b[1] - a[1])[0]?.[0] || "—",
                topArtist: Object.entries(data.artists).sort((a, b) => b[1] - a[1])[0]?.[0] || "—",
                total: data.songs + data.albums,
            }))
            .filter((y) => y.year !== "Unknown")
            .sort((a, b) => Number(b.year) - Number(a.year));
    })();

    const maxYearTotal = Math.max(...yearMap.map((y) => y.total), 1);

    const TABS = [
        { id: "songs" as Tab, label: "Songs", icon: Music },
        { id: "albums" as Tab, label: "Albums", icon: Disc },
        { id: "playlists" as Tab, label: "Playlists", icon: ListMusic },
        { id: "artists" as Tab, label: "Artists", icon: Mic },
        { id: "years" as Tab, label: "Year View", icon: BarChart2 },
    ];

    const isLoading = (activeTab === "songs" && songsLoading) || (activeTab === "albums" && albumsLoading);
    const totalPages = activeTab === "songs" ? songPages : albumPages;
    const totalCount = activeTab === "songs" ? totalSongs : totalAlbums;
    const items = activeTab === "songs" ? songs : albums;

    return (
        <div className="flex-1 bg-bg overflow-y-auto custom-scrollbar">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-5">
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold tracking-tight font-inter flex items-center gap-2.5">
                            <Music size={24} className="text-accent" />
                            Music
                        </h1>
                        <p className="text-text-secondary text-sm mt-0.5">
                            Track songs and albums you love.
                        </p>
                    </div>
                    <Link
                        to="/dashboard/music/add"
                        className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-accent/20 active:scale-95"
                    >
                        <Plus size={16} />
                        Add Music
                    </Link>
                </div>

                {/* ─── Stats Bar ─── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Total Songs", value: (allSongsData?.total_count || 0), icon: Music },
                        { label: "Total Albums", value: (allAlbumsData?.total_count || 0), icon: Disc },
                        { label: "Artists", value: artistMap.length, icon: Mic },
                        { label: "Playlists", value: playlists.length, icon: ListMusic },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-surface border border-border rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon size={14} className="text-accent" />
                                <p className="text-text-secondary text-xs">{label}</p>
                            </div>
                            <p className="text-text-primary text-xl font-bold">{value}</p>
                        </div>
                    ))}
                </div>

                {/* ─── Tab Bar ─── */}
                <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-6 overflow-x-auto">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => switchTab(id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === id
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-text-secondary hover:text-text-primary hover:bg-bg/60"
                            }`}
                        >
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ─── Songs / Albums Tab ─── */}
                {(activeTab === "songs" || activeTab === "albums") && (
                    <>
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-5">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <FilterDropdown
                                    label="Genre"
                                    icon={Filter}
                                    options={genreOptions.map((g: string) => ({ value: g, label: get_genre_display(g) }))}
                                    selected={genreFilter}
                                    onToggle={(val) => toggleFilter(genreFilter, setGenreFilter, val)}
                                    onClear={() => { setGenreFilter([]); setCurrentPage(1); }}
                                />
                                <FilterDropdown
                                    label="Status"
                                    icon={Filter}
                                    options={statusOptions.map((s: string) => ({ value: s, label: STATUS_MAP[s] || s }))}
                                    selected={statusFilter}
                                    onToggle={(val) => toggleFilter(statusFilter, setStatusFilter, val)}
                                    onClear={() => { setStatusFilter([]); setCurrentPage(1); }}
                                />
                                <FilterDropdown
                                    label="Artist"
                                    icon={Mic}
                                    options={artistOptions.map((a: string) => ({ value: a, label: a }))}
                                    selected={artistFilter}
                                    onToggle={(val) => toggleFilter(artistFilter, setArtistFilter, val)}
                                    onClear={() => { setArtistFilter([]); setCurrentPage(1); }}
                                />

                                {/* View toggle */}
                                <div className="flex items-center bg-surface border border-border rounded-xl p-1 gap-0.5 shrink-0">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"}`}
                                    >
                                        <LayoutGrid size={15} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"}`}
                                    >
                                        <ListIcon size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active filters */}
                        {(genreFilter.length > 0 || statusFilter.length > 0 || artistFilter.length > 0 || committedSearch) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {committedSearch && (
                                    <span className="flex items-center gap-1.5 text-xs bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20">
                                        "{committedSearch}"
                                        <button onClick={() => { setSearchQuery(""); setCommittedSearch(""); }}><X size={12} /></button>
                                    </span>
                                )}
                                {genreFilter.map((g) => (
                                    <span key={g} className="flex items-center gap-1.5 text-xs bg-surface border border-border text-text-secondary px-3 py-1 rounded-full">
                                        {get_genre_display(g)}
                                        <button onClick={() => setGenreFilter((p) => p.filter((x) => x !== g))}><X size={12} /></button>
                                    </span>
                                ))}
                                {statusFilter.map((s) => (
                                    <span key={s} className="flex items-center gap-1.5 text-xs bg-surface border border-border text-text-secondary px-3 py-1 rounded-full">
                                        {STATUS_MAP[s] || s}
                                        <button onClick={() => setStatusFilter((p) => p.filter((x) => x !== s))}><X size={12} /></button>
                                    </span>
                                ))}
                                {artistFilter.map((a) => (
                                    <span key={a} className="flex items-center gap-1.5 text-xs bg-surface border border-border text-text-secondary px-3 py-1 rounded-full">
                                        {a}
                                        <button onClick={() => setArtistFilter((p) => p.filter((x) => x !== a))}><X size={12} /></button>
                                    </span>
                                ))}
                                <button
                                    onClick={() => { setGenreFilter([]); setStatusFilter([]); setArtistFilter([]); setSearchQuery(""); setCommittedSearch(""); setCurrentPage(1); }}
                                    className="text-xs text-error hover:text-error/80 px-2 py-1"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Count */}
                        <p className="text-text-secondary text-xs mb-4">
                            {totalCount} {activeTab === "songs" ? "song" : "album"}{totalCount !== 1 ? "s" : ""}
                        </p>

                        {/* Loading */}
                        {isLoading ? (
                            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-1"}`}>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="bg-surface border border-border rounded-xl animate-pulse">
                                        <div className={`${viewMode === "grid" ? "aspect-square" : "h-16"} bg-border/30 rounded-t-xl`} />
                                        <div className="p-3 space-y-2">
                                            <div className="h-3 bg-border/30 rounded w-3/4" />
                                            <div className="h-2 bg-border/20 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Music size={48} className="text-text-secondary/30" />
                                <p className="text-text-secondary text-sm">No {activeTab} found.</p>
                                <Link to="/dashboard/music/add" className="inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-accent/90 transition-all">
                                    <Plus size={14} />
                                    Add {activeTab === "songs" ? "Song" : "Album"}
                                </Link>
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {items.map((item: any) => {
                                    const isSong = activeTab === "songs";
                                    const coverUrl = get_full_image_url(item.cover_image);
                                    const statusColor = STATUS_COLORS[item.status] || "text-text-secondary border-border bg-bg";
                                    return (
                                        <Link
                                            key={item._id}
                                            to={`/dashboard/music/${isSong ? "song" : "album"}/${item._id}`}
                                            className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-all hover:shadow-md"
                                        >
                                            <div className="aspect-square overflow-hidden relative bg-bg">
                                                {coverUrl ? (
                                                    <img src={coverUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        {isSong ? <Music size={32} className="text-text-secondary/30" /> : <Disc size={32} className="text-text-secondary/30" />}
                                                    </div>
                                                )}
                                                <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                                    {STATUS_MAP[item.status] || item.status}
                                                </span>
                                                {isSong && (item as any).preview_url && (
                                                    <div className="absolute bottom-2 left-2 bg-black/60 rounded-full p-1.5">
                                                        <Play size={10} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <p className="text-text-primary text-sm font-semibold truncate">{item.title}</p>
                                                <p className="text-text-secondary text-xs truncate mt-0.5">{item.artist}</p>
                                                {item.rating > 0 && (
                                                    <div className="flex items-center gap-1 mt-1.5">
                                                        <Star size={11} className="text-amber-400 fill-amber-400" />
                                                        <span className="text-text-secondary text-[11px]">{item.rating}/10</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {items.map((item: any) => {
                                    const isSong = activeTab === "songs";
                                    const coverUrl = get_full_image_url(item.cover_image);
                                    const statusColor = STATUS_COLORS[item.status] || "text-text-secondary border-border bg-bg";
                                    return (
                                        <Link
                                            key={item._id}
                                            to={`/dashboard/music/${isSong ? "song" : "album"}/${item._id}`}
                                            className="flex items-center gap-4 bg-surface border border-border rounded-xl p-3 hover:border-accent/50 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-bg border border-border">
                                                {coverUrl ? (
                                                    <img src={coverUrl} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        {isSong ? <Music size={18} className="text-text-secondary/30" /> : <Disc size={18} className="text-text-secondary/30" />}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-text-primary text-sm font-semibold truncate">{item.title}</p>
                                                <p className="text-text-secondary text-xs truncate">{item.artist} · {item.release_year}</p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                {item.rating > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Star size={12} className="text-amber-400 fill-amber-400" />
                                                        <span className="text-text-secondary text-xs">{item.rating}</span>
                                                    </div>
                                                )}
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                                    {STATUS_MAP[item.status] || item.status}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                                <p className="text-text-secondary text-xs">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                                        if (page < 1 || page > totalPages) return null;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === currentPage ? "bg-accent text-white" : "border border-border text-text-secondary hover:text-text-primary hover:border-accent"}`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                    <button
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ─── Playlists Tab ─── */}
                {activeTab === "playlists" && (
                    <>
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-text-secondary text-sm">{playlists.length} playlist{playlists.length !== 1 ? "s" : ""}</p>
                            <Link
                                to="/dashboard/music/playlist/create"
                                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
                            >
                                <Plus size={14} />
                                New Playlist
                            </Link>
                        </div>

                        {playlistsLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-32 bg-surface border border-border rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : playlists.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <ListMusic size={48} className="text-text-secondary/30" />
                                <p className="text-text-secondary text-sm">No playlists yet.</p>
                                <Link to="/dashboard/music/playlist/create" className="inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-accent/90 transition-all">
                                    <Plus size={14} />
                                    Create Playlist
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {playlists.map((pl: any) => (
                                    <Link
                                        key={pl._id}
                                        to={`/dashboard/music/playlist/${pl._id}`}
                                        className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/50 transition-all hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                                                <ListMusic size={18} className="text-accent" />
                                            </div>
                                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${pl.type === "smart" ? "text-purple-400 border-purple-400/30 bg-purple-400/5" : "text-accent border-accent/30 bg-accent/5"}`}>
                                                {pl.type === "smart" ? "Smart" : "Manual"}
                                            </span>
                                        </div>
                                        <p className="text-text-primary text-sm font-semibold">{pl.name}</p>
                                        {pl.description && (
                                            <p className="text-text-secondary text-xs mt-1 line-clamp-2">{pl.description}</p>
                                        )}
                                        <p className="text-text-secondary text-xs mt-3">
                                            {pl.items?.length || 0} item{pl.items?.length !== 1 ? "s" : ""}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ─── Artists Tab ─── */}
                {activeTab === "artists" && (
                    <>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex items-center bg-surface border border-border rounded-xl p-1 gap-0.5">
                                {(["all", "solo", "band"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setArtistTypeFilter(t)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${artistTypeFilter === t ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"}`}
                                    >
                                        {t === "solo" ? <Mic size={12} /> : t === "band" ? <Users size={12} /> : null}
                                        {t === "all" ? "All" : t === "solo" ? "Singers" : "Bands"}
                                    </button>
                                ))}
                            </div>
                            <p className="text-text-secondary text-sm">{filteredArtists.length} artist{filteredArtists.length !== 1 ? "s" : ""}</p>
                        </div>

                        {filteredArtists.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Mic size={48} className="text-text-secondary/30" />
                                <p className="text-text-secondary text-sm">No artists found. Add some music first.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {filteredArtists.map((artist) => {
                                    const coverUrl = get_full_image_url(artist.cover);
                                    return (
                                        <button
                                            key={artist.name}
                                            onClick={() => {
                                                setArtistFilter([artist.name]);
                                                switchTab("songs");
                                            }}
                                            className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-accent/50 transition-all text-left group"
                                        >
                                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-bg border border-border">
                                                {coverUrl ? (
                                                    <img src={coverUrl} alt={artist.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-accent/10">
                                                        <Mic size={18} className="text-accent/60" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-text-primary text-sm font-semibold">{artist.name}</p>
                                                <p className="text-text-secondary text-xs mt-0.5">
                                                    {artist.type === "band" ? "Band" : "Solo"} ·{" "}
                                                    {artist.songs > 0 && `${artist.songs} song${artist.songs !== 1 ? "s" : ""}`}
                                                    {artist.songs > 0 && artist.albums > 0 && " · "}
                                                    {artist.albums > 0 && `${artist.albums} album${artist.albums !== 1 ? "s" : ""}`}
                                                </p>
                                            </div>
                                            {artist.avgRating > 0 && (
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <Star size={13} className="text-amber-400 fill-amber-400" />
                                                    <span className="text-text-primary text-sm font-semibold">{artist.avgRating}</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ─── Year View Tab ─── */}
                {activeTab === "years" && (
                    <>
                        <p className="text-text-secondary text-sm mb-5">
                            {yearMap.length} year{yearMap.length !== 1 ? "s" : ""} of music
                        </p>

                        {yearMap.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <BarChart2 size={48} className="text-text-secondary/30" />
                                <p className="text-text-secondary text-sm">No music logged yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {yearMap.map((y) => (
                                    <div key={y.year} className="bg-surface border border-border rounded-xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                                    <Calendar size={16} className="text-accent" />
                                                </div>
                                                <div>
                                                    <p className="text-text-primary text-base font-bold">{y.year}</p>
                                                    <p className="text-text-secondary text-xs">
                                                        {y.songs} song{y.songs !== 1 ? "s" : ""} · {y.albums} album{y.albums !== 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-text-secondary text-[10px] uppercase tracking-wider">Top Genre</p>
                                                <p className="text-text-primary text-xs font-medium">{get_genre_display(y.topGenre)}</p>
                                            </div>
                                        </div>

                                        {/* Bar */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden border border-border">
                                                <div
                                                    className="h-full bg-accent rounded-full transition-all duration-500"
                                                    style={{ width: `${(y.total / maxYearTotal) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-text-secondary text-xs w-16 text-right">
                                                {y.total} logged
                                            </span>
                                        </div>

                                        {y.topArtist && (
                                            <p className="text-text-secondary text-xs mt-2">
                                                Top artist: <span className="text-text-primary font-medium">{y.topArtist}</span>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MusicHub;
