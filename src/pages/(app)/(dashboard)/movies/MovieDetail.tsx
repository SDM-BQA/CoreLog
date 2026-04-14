import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Globe,
  Clapperboard,
  Pencil,
  Trash2,
  Tag,
  BookmarkCheck,
  CalendarPlus,
} from "lucide-react";
import { getMovieById } from "./moviesData";

const STATUS_STYLES: Record<string, string> = {
  Watched: "bg-green-500/15 text-green-400 border-green-500/30",
  Watchlist: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Rewatching: "bg-accent/15 text-accent border-accent/30",
};

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movie = getMovieById(id || "");

  if (!movie) {
    return (
      <div className="bg-bg flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center">
          <Clapperboard size={36} className="text-text-secondary/40" />
        </div>
        <p className="text-text-primary text-lg font-semibold">
          Movie not found
        </p>
        <p className="text-text-secondary text-sm">
          The movie you're looking for doesn't exist in your collection.
        </p>
        <Link
          to="/dashboard/movies"
          className="inline-flex items-center gap-2 text-accent hover:text-accent/80 text-sm font-medium mt-2 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg flex-1 overflow-y-auto">
      {/* ── Hero Section with blurred poster background ── */}
      <div className="relative overflow-hidden">
        {/* Blurred backdrop */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.poster}
            alt=""
            className="w-full h-full object-cover scale-110 blur-3xl opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/80 to-bg" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[920px] mx-auto px-6 pt-6 pb-10">
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard/movies")}
            className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm font-medium mb-6 transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to collection
          </button>

          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-center sm:items-start text-center sm:text-left">
            {/* ── Poster ── */}
            <div className="w-[180px] sm:w-[220px] shrink-0">
              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* ── Info ── */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Title + status */}
              <div className="flex items-center sm:items-start justify-center sm:justify-start gap-3 flex-wrap">
                <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter leading-tight">
                  {movie.title}
                </h1>
                <span
                  className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_STYLES[movie.status]}`}
                >
                  <BookmarkCheck size={12} />
                  {movie.status}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 flex-wrap text-text-secondary text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-text-secondary/60" />
                  {movie.year}
                </span>
                <span className="text-text-secondary/30">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-text-secondary/60" />
                  {movie.runtime}
                </span>
                <span className="text-text-secondary/30">·</span>
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-text-secondary/60" />
                  {movie.language}
                </span>
                <span className="text-text-secondary/30">·</span>
                <span className="flex items-center gap-1.5">
                  <Clapperboard size={14} className="text-text-secondary/60" />
                  {movie.director}
                </span>
              </div>

              {/* Star rating */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={20}
                      className={
                        s <= movie.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-transparent text-text-secondary/30"
                      }
                    />
                  ))}
                </div>
                <span className="text-text-primary text-sm font-semibold">
                  {movie.rating}.0 / 5.0
                </span>
              </div>

              {/* Genre tags */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 flex-wrap">
                <Tag size={14} className="text-text-secondary/60" />
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-accent/10 text-accent border border-accent/20"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Added on */}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-4 text-text-secondary text-xs">
                <CalendarPlus size={13} className="text-text-secondary/60" />
                Added on{" "}
                {new Date(movie.addedOn).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-6">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-text-primary text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  <Pencil size={15} />
                  Edit Movie
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-border hover:border-error/50 text-text-secondary hover:text-error text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Review Section ── */}
      <div className="max-w-[920px] mx-auto px-6 pb-10">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-text-primary text-lg font-bold mb-4 flex items-center gap-2">
            <Pencil size={16} className="text-accent" />
            Personal Review
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
            {movie.review}
          </p>
        </div>

        {/* ── Quick Info Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-text-secondary text-[10px] font-semibold uppercase tracking-widest mb-1">
              Director
            </p>
            <p className="text-text-primary text-sm font-semibold">
              {movie.director}
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-text-secondary text-[10px] font-semibold uppercase tracking-widest mb-1">
              Runtime
            </p>
            <p className="text-text-primary text-sm font-semibold">
              {movie.runtime}
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-text-secondary text-[10px] font-semibold uppercase tracking-widest mb-1">
              Language
            </p>
            <p className="text-text-primary text-sm font-semibold">
              {movie.language}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
