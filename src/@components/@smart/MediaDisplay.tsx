import { Link } from "react-router-dom";
import { Star, BookOpen, Tv, Film } from "lucide-react";
import { get_full_image_url } from "../../@utils/api.utils";

export type MediaType = "book" | "series" | "movie";

export interface MediaItem {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  rating: number;
  status: string;
  genres: string[];
  year?: string | number;
}

interface MediaDisplayProps {
  items: MediaItem[];
  type: MediaType;
  viewMode: "grid" | "list";
  isLoading: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
  statusMap: Record<string, string>;
  getGenreDisplay: (key: string) => string;
  itemsPerPage?: number;
  pageKey?: string;
}

const DETAIL_PATH: Record<MediaType, string> = {
  book: "books",
  series: "series",
  movie: "movies",
};

const getStatusStyle = (status: string) => {
  const s = status.toLowerCase();
  if (s === "read" || s === "watched") return "bg-green-500/20 text-green-400 border-green-500/30";
  if (s.includes("ing")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (s.includes("list") || s.includes("want")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
};

const GridSkeleton = ({ count }: { count: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 pb-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col gap-3 animate-pulse">
        <div className="aspect-[2/3] w-full rounded-2xl bg-surface border border-border/30" />
        <div className="h-3 bg-surface rounded w-3/4" />
        <div className="h-2.5 bg-surface rounded w-1/2" />
      </div>
    ))}
  </div>
);

const ListSkeleton = ({ count }: { count: number }) => (
  <div className="flex flex-col gap-3 pb-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 bg-surface border border-border p-3 rounded-xl animate-pulse">
        <div className="w-[52px] aspect-[2/3] rounded-xl bg-border/30 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-border/30 rounded w-2/3" />
          <div className="h-2.5 bg-border/30 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({
  type,
  hasFilters,
  onClearFilters,
}: {
  type: MediaType;
  hasFilters: boolean;
  onClearFilters: () => void;
}) => {
  const icons = {
    book: <BookOpen className="text-text-secondary/40" size={32} />,
    series: <Tv className="text-text-secondary/40" size={32} />,
    movie: <Film className="text-text-secondary/40" size={32} />,
  };
  const labels = { book: "books", series: "web series", movie: "movies" };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
        {icons[type]}
      </div>
      <p className="text-text-primary font-semibold text-lg">No {labels[type]} found</p>
      <p className="text-text-secondary text-sm mt-1 max-w-sm mb-4">
        {hasFilters
          ? "Try adjusting your search or clear filters."
          : `Start building your ${labels[type]} collection.`}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="text-accent text-sm font-semibold hover:underline"
        >
          Clear all filters & search
        </button>
      )}
    </div>
  );
};

export const MediaDisplay = ({
  items,
  type,
  viewMode,
  isLoading,
  hasFilters,
  onClearFilters,
  statusMap,
  getGenreDisplay,
  itemsPerPage = 10,
  pageKey,
}: MediaDisplayProps) => {
  if (isLoading) {
    return viewMode === "grid"
      ? <GridSkeleton count={itemsPerPage} />
      : <ListSkeleton count={itemsPerPage} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState type={type} hasFilters={hasFilters} onClearFilters={onClearFilters} />
    );
  }

  const basePath = `/dashboard/${DETAIL_PATH[type]}`;

  // Group items by status
  const groupedItems = items.reduce((acc, item) => {
    const status = item.status || "unknown";
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>);

  // Define status order (Watching first, then Watched/Read, then others)
  const statusOrder = ["watching", "reading", "rewatching", "watchlist", "want_to_read", "watched", "read", "not_finished"];
  const sortedStatuses = Object.keys(groupedItems).sort((a, b) => {
    const indexA = statusOrder.indexOf(a.toLowerCase());
    const indexB = statusOrder.indexOf(b.toLowerCase());
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div key={pageKey} className="flex flex-col gap-10 pb-8 animate-reveal">
      {sortedStatuses.map((status) => {
        const statusItems = groupedItems[status];
        const statusLabel = statusMap[status] || status;

        return (
          <div key={status} className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary/60 flex items-center gap-3 shrink-0">
                <span className="w-2 h-2 rounded-full bg-accent/40" />
                {statusLabel}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border/50 text-text-secondary/40 ml-1">
                  {statusItems.length}
                </span>
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {statusItems.map((item) => (
                  <Link
                    key={item._id}
                    to={`${basePath}/${item._id}`}
                    className="group flex flex-col gap-3 cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 border border-border/40 group-hover:border-accent/40 bg-surface">
                      <img
                        src={get_full_image_url(item.image, type)}
                        alt={item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = get_full_image_url(undefined, type);
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className={`text-[9px] font-black px-2 py-1 rounded-md border backdrop-blur-md shadow-lg uppercase tracking-widest ${getStatusStyle(item.status)}`}
                        >
                          {(statusMap[item.status] || item.status).split(" ")[0]}
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
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-text-secondary text-[11px] font-medium truncate flex-1 uppercase tracking-tight">
                          {item.subtitle}
                        </p>
                        <div className="flex items-center gap-1 bg-accent/5 px-1.5 py-0.5 rounded-md border border-accent/10 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-white text-xs font-black">{item.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {statusItems.map((item) => (
                  <Link
                    key={item._id}
                    to={`${basePath}/${item._id}`}
                    className="group flex items-center gap-4 bg-surface border border-border p-3 rounded-xl shadow-sm hover:shadow-md hover:border-accent/40 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] w-[52px] shrink-0 rounded-xl overflow-hidden border border-border shadow-md">
                      <img
                        src={get_full_image_url(item.image, type)}
                        alt={item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = get_full_image_url(undefined, type);
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-text-primary font-bold text-base md:text-lg leading-tight mb-1 truncate group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-text-secondary text-sm font-medium flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-text-secondary/30" />
                        {item.subtitle}
                        {item.year && (
                          <>
                            <span className="text-text-secondary/30 text-xs">·</span>
                            <span className="text-text-secondary text-xs">{item.year}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-start w-48 shrink-0">
                      <div className="flex flex-wrap gap-1.5">
                        {item.genres?.slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="text-[10px] uppercase font-bold text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-full tracking-wider group-hover:bg-white/15 transition-colors"
                          >
                            {getGenreDisplay(g)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 w-24 sm:w-32 md:w-36 shrink-0">
                      <div className="flex items-center gap-1.5 bg-accent/5 px-2 py-1 rounded-lg border border-accent/10">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-white text-sm sm:text-lg font-black">{item.rating.toFixed(1)}</span>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${getStatusStyle(item.status)}`}
                      >
                        {statusMap[item.status] || item.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
