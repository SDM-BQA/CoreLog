import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  Tv,
  Pencil,
  Trash2,
  Tag,
  BookmarkCheck,
  CalendarPlus,
  ChevronDown,
} from "lucide-react";
import { getSeriesById, SeriesStatus } from "./seriesData";

const STATUS_COLORS: Record<string, string> = {
  Watched: "text-green-500",
  Watchlist: "text-yellow-500",
  Watching: "text-blue-500",
  Rewatching: "text-blue-500",
  NotFinished: "text-red-500",
};

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const series = getSeriesById(id || "");

  const [currentStatus, setCurrentStatus] = useState<SeriesStatus>(
    series?.status || "Watchlist",
  );

  if (!series) {
    return (
      <div className="bg-bg flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-sm">
          <Tv size={36} className="text-text-secondary/40" />
        </div>
        <div className="text-center">
          <p className="text-text-primary text-lg font-semibold mb-1">
            Series not found
          </p>
          <p className="text-text-secondary text-sm mb-4">
            The series you're looking for doesn't exist in your collection.
          </p>
          <Link
            to="/dashboard/series"
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface/80 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to collection
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentStatus(e.target.value as SeriesStatus);
  };

  return (
    <div className="bg-bg flex-1 overflow-y-auto">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={series.poster}
            alt=""
            className="w-full h-full object-cover scale-125 blur-3xl opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/80 to-bg" />
        </div>

        <div className="relative z-10 max-w-[920px] mx-auto px-6 pt-8 pb-12">
          <button
            onClick={() => navigate("/dashboard/series")}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-medium mb-8 transition-colors group w-fit"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to collection
          </button>

          <div className="flex flex-col sm:flex-row gap-8 md:gap-10 items-center sm:items-start text-center sm:text-left">
            <div className="w-[200px] sm:w-[240px] shrink-0">
              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-border shadow-2xl bg-surface">
                <img
                  src={series.poster}
                  alt={series.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col pt-2">
              <h1 className="text-text-primary text-3xl sm:text-4xl font-bold tracking-tight font-inter leading-tight mb-2">
                {series.title}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-text-primary text-lg font-medium mb-6">
                <Tv size={18} className="text-text-secondary" />
                {series.creator}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-8">
                <div className="relative inline-flex items-center">
                  <BookmarkCheck
                    size={14}
                    className={`absolute left-3 pointer-events-none ${STATUS_COLORS[currentStatus] || "text-text-primary"}`}
                  />
                  <select
                    value={currentStatus}
                    onChange={handleStatusChange}
                    className={`appearance-none cursor-pointer pl-9 pr-8 py-2 text-sm font-semibold rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors outline-none focus:ring-2 focus:ring-accent/50 ${
                      STATUS_COLORS[currentStatus] || "text-text-primary"
                    }`}
                  >
                    <option value="Watchlist" className="text-text-primary">Watchlist</option>
                    <option value="Watching" className="text-text-primary">Watching</option>
                    <option value="Rewatching" className="text-text-primary">Rewatching</option>
                    <option value="Watched" className="text-text-primary">Watched</option>
                    <option value="NotFinished" className="text-text-primary">Not Finished</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 pointer-events-none text-text-secondary"
                  />
                </div>

                <div className="h-6 w-px bg-border hidden sm:block"></div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-surface border border-border hover:bg-surface-hover text-text-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Pencil size={15} className="text-text-secondary" />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-surface border border-border hover:border-red-500/50 hover:bg-red-500/5 text-text-secondary hover:text-red-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 sm:gap-6 text-sm text-text-secondary bg-surface/50 p-4 rounded-xl border border-border/50">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Rating</span>
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-text-primary font-semibold">
                      {series.rating.toFixed(1)} <span className="text-text-secondary font-normal">/ 5.0</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Release Year</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <Calendar size={14} className="text-text-secondary" />
                    {series.year}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Seasons</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <Tv size={14} className="text-text-secondary" />
                    {series.seasons} Seasons
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">Added On</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <CalendarPlus size={14} className="text-text-secondary" />
                    {new Date(series.addedOn).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-6 flex-wrap">
                <Tag size={14} className="text-text-secondary" />
                {series.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors cursor-default"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[920px] mx-auto px-6 py-10 flex flex-col gap-8">
        {(currentStatus === "Watched" || currentStatus === "Rewatching" || series.review) && (
          <section>
            <h2 className="text-text-primary text-lg font-bold mb-4 flex items-center gap-2">
              <Pencil size={20} className="text-text-secondary" />
              Personal Review
            </h2>
            <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
              <p className="text-text-secondary text-base leading-relaxed whitespace-pre-line">
                {series.review || "No review added yet."}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;
