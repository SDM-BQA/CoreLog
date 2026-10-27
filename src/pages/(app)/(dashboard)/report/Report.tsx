import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  BookOpen,
  Film,
  Tv,
  Star,
  Printer,
  Loader2,
  BarChart3,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useGetBooksListQuery } from "../../../../@store/api/books.api";
import { useGetMoviesListQuery } from "../../../../@store/api/movies.api";
import { useGetSeriesListQuery } from "../../../../@store/api/series.api";

// ── Helpers ─────────────────────────────────────────────────────────────────

const BOOK_STATUSES: Record<string, { label: string; cls: string }> = {
  read:          { label: "Read",          cls: "bg-green-500/15 text-green-400 border-green-500/20" },
  reading:       { label: "Reading",       cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  want_to_read:  { label: "Want to Read",  cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  not_finished:  { label: "Not Finished",  cls: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
};

const MEDIA_STATUSES: Record<string, { label: string; cls: string }> = {
  watched:       { label: "Watched",       cls: "bg-green-500/15 text-green-400 border-green-500/20" },
  watching:      { label: "Watching",      cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  rewatching:    { label: "Rewatching",    cls: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" },
  watchlist:     { label: "Watchlist",     cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  not_finished:  { label: "Not Finished",  cls: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
};

const StatusBadge = ({ status, map }: { status: string; map: Record<string, { label: string; cls: string }> }) => {
  const s = map[status] ?? { label: status, cls: "bg-surface text-text-secondary border-border" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${s.cls}`}>
      {s.label}
    </span>
  );
};

const Stars = ({ rating }: { rating?: number }) => {
  if (!rating) return <span className="text-text-secondary/30 text-xs">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          className={i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-text-secondary/20 fill-text-secondary/10"}
        />
      ))}
      <span className="text-[10px] text-text-secondary ml-1">{rating}/5</span>
    </span>
  );
};

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
};

const fmtRuntime = (mins?: number) => {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

const StatCard = ({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string;
}) => (
  <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 print:border print:border-gray-200">
    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
      <Icon size={17} className="text-accent" />
    </div>
    <div>
      <p className="text-text-primary font-bold text-xl leading-none">{value}</p>
      <p className="text-text-secondary text-[11px] mt-0.5">{label}</p>
      {sub && <p className="text-text-secondary/50 text-[10px]">{sub}</p>}
    </div>
  </div>
);

// ── Section wrapper ──────────────────────────────────────────────────────────

const SectionHeader = ({
  icon: Icon,
  title,
  count,
  statuses,
  active,
  onFilter,
  statusMap,
  onDownload,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  statuses: string[];
  active: string;
  onFilter: (s: string) => void;
  statusMap: Record<string, { label: string; cls: string }>;
  onDownload: () => void;
}) => (
  <div className="flex flex-wrap items-center gap-3 mb-3">
    <div className="flex items-center gap-2 mr-2">
      <Icon size={16} className="text-accent" />
      <h2 className="text-text-primary font-bold text-base">{title}</h2>
      <span className="text-text-secondary text-xs">({count})</span>
    </div>
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={() => onFilter("all")}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
          active === "all"
            ? "bg-accent/15 text-accent"
            : "text-text-secondary hover:text-text-primary hover:bg-surface"
        }`}
      >
        All
      </button>
      {statuses.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onFilter(s)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
            active === s
              ? "bg-accent/15 text-accent"
              : "text-text-secondary hover:text-text-primary hover:bg-surface"
          }`}
        >
          {statusMap[s]?.label ?? s}
        </button>
      ))}
    </div>
    <button
      type="button"
      onClick={onDownload}
      className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-green-700 hover:bg-green-600 transition-colors"
    >
      <Download size={11} /> Download
    </button>
  </div>
);

const TableWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-xl border border-border print:border-gray-200">
    <table className="w-full text-xs text-left border-collapse">{children}</table>
  </div>
);

const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-text-secondary/60 bg-surface border-b border-border whitespace-nowrap ${className}`}>
    {children}
  </th>
);

const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-3 py-2.5 border-b border-border/50 text-text-secondary align-middle ${className}`}>
    {children}
  </td>
);

const EmptyRow = ({ cols }: { cols: number }) => (
  <tr>
    <td colSpan={cols} className="px-4 py-10 text-center text-text-secondary/40 text-sm">
      No items found.
    </td>
  </tr>
);

// ── Main component ───────────────────────────────────────────────────────────

const Report = () => {
  const { data: booksData,   isLoading: booksLoading }  = useGetBooksListQuery({ limit: 500 });
  const { data: moviesData,  isLoading: moviesLoading } = useGetMoviesListQuery({ limit: 500 });
  const { data: seriesData,  isLoading: seriesLoading } = useGetSeriesListQuery({ limit: 500 });

  const [bookFilter,   setBookFilter]   = useState("all");
  const [movieFilter,  setMovieFilter]  = useState("all");
  const [seriesFilter, setSeriesFilter] = useState("all");

  const books  = booksData?.books  ?? [];
  const movies = moviesData?.movies ?? [];
  const series = seriesData?.series ?? [];

  const filteredBooks  = bookFilter  === "all" ? books  : books.filter((b)  => b.status === bookFilter);
  const filteredMovies = movieFilter === "all" ? movies : movies.filter((m) => m.status === movieFilter);
  const filteredSeries = seriesFilter === "all" ? series : series.filter((s) => s.status === seriesFilter);

  const isLoading = booksLoading || moviesLoading || seriesLoading;

  // Summary stats
  const booksRead     = books.filter((b) => b.status === "read").length;
  const moviesWatched = movies.filter((m) => m.status === "watched").length;
  const seriesFinished = series.filter((s) => s.status === "watched").length;
  const totalItems    = books.length + movies.length + series.length;

  const avgRating = (items: { rating?: number }[]) => {
    const rated = items.filter((i) => i.rating);
    if (!rated.length) return null;
    return (rated.reduce((s, i) => s + (i.rating ?? 0), 0) / rated.length).toFixed(1);
  };

  type BookItem   = typeof books[0];
  type MovieItem  = typeof movies[0];
  type SeriesItem = typeof series[0];

  const toBookRow   = (b: BookItem,   i: number) => ({ "#": i + 1, Title: b.title ?? "", Author: b.author ?? "", Status: BOOK_STATUSES[b.status]?.label ?? b.status ?? "", Rating: b.rating ?? "", Pages: b.page_count ?? "", "Publication Year": b.publication_year ?? "", "Series Name": b.series_name ?? "", "Series #": b.series_number ?? "", Started: fmtDate(b.started_from), Finished: fmtDate(b.finished_on), Genres: (b.genres ?? []).join(", "), Review: b.review ?? "" });
  const toMovieRow  = (m: MovieItem,  i: number) => ({ "#": i + 1, Title: m.title ?? "", Director: m.director ?? "", Status: MEDIA_STATUSES[m.status]?.label ?? m.status ?? "", Rating: m.rating ?? "", Runtime: m.runtime ? fmtRuntime(m.runtime) : "", Platform: m.platform ?? "", Language: m.language ?? "", "Release Year": m.release_year ?? "", Watched: fmtDate(m.finished_on), Genres: (m.genres ?? []).join(", "), Review: m.review ?? "" });
  const toSeriesRow = (s: SeriesItem, i: number) => ({ "#": i + 1, Title: s.title ?? "", Creator: s.creator ?? "", Status: MEDIA_STATUSES[s.status]?.label ?? s.status ?? "", Rating: s.rating ?? "", Seasons: s.seasons ?? "", "Seasons Watched": s.seasons_watched ?? "", Episodes: s.episodes ?? "", Platform: s.platform ?? "", Language: s.language ?? "", "Release Year": s.release_year ?? "", Genres: (s.genres ?? []).join(", "), Review: s.review ?? "" });

  const toSheet = (rows: ReturnType<typeof toBookRow>[] | ReturnType<typeof toMovieRow>[] | ReturnType<typeof toSeriesRow>[]) =>
    rows.length ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.json_to_sheet([{}]);

  const writeFile = (wb: XLSX.WorkBook, name: string) => {
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `corelog-${name}-${date}.xlsx`);
  };

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, toSheet(books.map(toBookRow)),   "Books");
    XLSX.utils.book_append_sheet(wb, toSheet(movies.map(toMovieRow)), "Movies");
    XLSX.utils.book_append_sheet(wb, toSheet(series.map(toSeriesRow)), "Series");
    writeFile(wb, "report");
  };

  return (
    <div className="bg-bg flex-1 flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 sm:px-5 h-12 border-b border-border bg-surface print:hidden">
        <Link
          to="/dashboard"
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors text-xs font-medium group shrink-0"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <div className="w-px h-4 bg-border shrink-0" />
        <div className="flex items-center gap-2 flex-1">
          <BarChart3 size={14} className="text-accent shrink-0" />
          <span className="text-text-primary font-bold text-sm">Report</span>
        </div>
        {!isLoading && (
          <span className="text-text-secondary/40 text-xs hidden sm:block shrink-0">
            {totalItems} items total
          </span>
        )}
        <button
          type="button"
          onClick={downloadExcel}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-700 hover:bg-green-600 disabled:opacity-40 transition-colors"
        >
          <Download size={13} /> Excel
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary border border-border hover:text-text-primary hover:bg-bg transition-colors"
        >
          <Printer size={13} /> Print
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* ── Summary stats ── */}
              <div>
                <p className="text-text-secondary/50 text-[10px] font-black uppercase tracking-widest mb-3">Summary</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={BookOpen} label="Books read"      value={booksRead}      sub={`of ${books.length} total · avg ${avgRating(books) ?? "—"} ★`} />
                  <StatCard icon={Film}     label="Movies watched"  value={moviesWatched}  sub={`of ${movies.length} total · avg ${avgRating(movies) ?? "—"} ★`} />
                  <StatCard icon={Tv}       label="Series finished" value={seriesFinished} sub={`of ${series.length} total · avg ${avgRating(series) ?? "—"} ★`} />
                  <StatCard icon={BarChart3} label="All items"      value={totalItems}     sub={`${books.length}B · ${movies.length}M · ${series.length}S`} />
                </div>
              </div>

              {/* ── Books ── */}
              <section>
                <SectionHeader
                  icon={BookOpen}
                  title="Books"
                  count={filteredBooks.length}
                  statuses={Object.keys(BOOK_STATUSES)}
                  active={bookFilter}
                  onFilter={setBookFilter}
                  statusMap={BOOK_STATUSES}
                  onDownload={() => { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, toSheet(filteredBooks.map(toBookRow)), "Books"); writeFile(wb, "books"); }}
                />
                <TableWrap>
                  <thead>
                    <tr>
                      <Th className="w-8">#</Th>
                      <Th>Title</Th>
                      <Th>Author</Th>
                      <Th>Status</Th>
                      <Th>Rating</Th>
                      <Th>Pages</Th>
                      <Th>Year</Th>
                      <Th>Started</Th>
                      <Th>Finished</Th>
                      <Th>Genres</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.length === 0 ? (
                      <EmptyRow cols={10} />
                    ) : (
                      filteredBooks.map((b, i) => (
                        <tr key={(b as any)._id ?? i} className="hover:bg-surface/50 transition-colors">
                          <Td className="text-text-secondary/30 font-mono">{i + 1}</Td>
                          <Td className="text-text-primary font-semibold max-w-[180px]">
                            <span className="line-clamp-1 block" title={b.title}>{b.title}</span>
                            {b.series_name && (
                              <span className="text-[10px] text-text-secondary/50">{b.series_name}{b.series_number ? ` #${b.series_number}` : ""}</span>
                            )}
                          </Td>
                          <Td>{b.author || "—"}</Td>
                          <Td><StatusBadge status={b.status} map={BOOK_STATUSES} /></Td>
                          <Td><Stars rating={b.rating} /></Td>
                          <Td>{b.page_count ?? "—"}</Td>
                          <Td>{b.publication_year || "—"}</Td>
                          <Td>{fmtDate(b.started_from)}</Td>
                          <Td>{fmtDate(b.finished_on)}</Td>
                          <Td>
                            <span className="line-clamp-1" title={(b.genres ?? []).join(", ")}>
                              {(b.genres ?? []).slice(0, 2).join(", ") || "—"}
                            </span>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </TableWrap>
              </section>

              {/* ── Movies ── */}
              <section>
                <SectionHeader
                  icon={Film}
                  title="Movies"
                  count={filteredMovies.length}
                  statuses={Object.keys(MEDIA_STATUSES)}
                  active={movieFilter}
                  onFilter={setMovieFilter}
                  statusMap={MEDIA_STATUSES}
                  onDownload={() => { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, toSheet(filteredMovies.map(toMovieRow)), "Movies"); writeFile(wb, "movies"); }}
                />
                <TableWrap>
                  <thead>
                    <tr>
                      <Th className="w-8">#</Th>
                      <Th>Title</Th>
                      <Th>Director</Th>
                      <Th>Status</Th>
                      <Th>Rating</Th>
                      <Th>Runtime</Th>
                      <Th>Platform</Th>
                      <Th>Year</Th>
                      <Th>Watched</Th>
                      <Th>Genres</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovies.length === 0 ? (
                      <EmptyRow cols={10} />
                    ) : (
                      filteredMovies.map((m, i) => (
                        <tr key={(m as any)._id ?? i} className="hover:bg-surface/50 transition-colors">
                          <Td className="text-text-secondary/30 font-mono">{i + 1}</Td>
                          <Td className="text-text-primary font-semibold max-w-[180px]">
                            <span className="line-clamp-1 block" title={m.title}>{m.title}</span>
                          </Td>
                          <Td>{(m as any).director || "—"}</Td>
                          <Td><StatusBadge status={m.status} map={MEDIA_STATUSES} /></Td>
                          <Td><Stars rating={m.rating} /></Td>
                          <Td>{fmtRuntime((m as any).runtime)}</Td>
                          <Td>{(m as any).platform || "—"}</Td>
                          <Td>{(m as any).release_year || "—"}</Td>
                          <Td>{fmtDate((m as any).finished_on)}</Td>
                          <Td>
                            <span className="line-clamp-1" title={((m as any).genres ?? []).join(", ")}>
                              {((m as any).genres ?? []).slice(0, 2).join(", ") || "—"}
                            </span>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </TableWrap>
              </section>

              {/* ── Series ── */}
              <section>
                <SectionHeader
                  icon={Tv}
                  title="Web Series"
                  count={filteredSeries.length}
                  statuses={Object.keys(MEDIA_STATUSES)}
                  active={seriesFilter}
                  onFilter={setSeriesFilter}
                  statusMap={MEDIA_STATUSES}
                  onDownload={() => { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, toSheet(filteredSeries.map(toSeriesRow)), "Series"); writeFile(wb, "series"); }}
                />
                <TableWrap>
                  <thead>
                    <tr>
                      <Th className="w-8">#</Th>
                      <Th>Title</Th>
                      <Th>Creator</Th>
                      <Th>Status</Th>
                      <Th>Rating</Th>
                      <Th>Seasons</Th>
                      <Th>Episodes</Th>
                      <Th>Platform</Th>
                      <Th>Year</Th>
                      <Th>Genres</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSeries.length === 0 ? (
                      <EmptyRow cols={10} />
                    ) : (
                      filteredSeries.map((s, i) => (
                        <tr key={(s as any)._id ?? i} className="hover:bg-surface/50 transition-colors">
                          <Td className="text-text-secondary/30 font-mono">{i + 1}</Td>
                          <Td className="text-text-primary font-semibold max-w-[180px]">
                            <span className="line-clamp-1 block" title={s.title}>{s.title}</span>
                          </Td>
                          <Td>{(s as any).creator || "—"}</Td>
                          <Td><StatusBadge status={s.status} map={MEDIA_STATUSES} /></Td>
                          <Td><Stars rating={s.rating} /></Td>
                          <Td>{(s as any).seasons ?? "—"}{(s as any).seasons_watched != null ? ` (${(s as any).seasons_watched} watched)` : ""}</Td>
                          <Td>{(s as any).episodes ?? "—"}</Td>
                          <Td>{(s as any).platform || "—"}</Td>
                          <Td>{(s as any).release_year || "—"}</Td>
                          <Td>
                            <span className="line-clamp-1" title={((s as any).genres ?? []).join(", ")}>
                              {((s as any).genres ?? []).slice(0, 2).join(", ") || "—"}
                            </span>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </TableWrap>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          aside, .print\\:hidden { display: none !important; }
          body, .bg-bg { background: white !important; color: black !important; }
          .text-text-primary { color: #111 !important; }
          .text-text-secondary { color: #555 !important; }
          .border-border { border-color: #ddd !important; }
          .bg-surface { background: #f9f9f9 !important; }
          table { font-size: 11px; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
};

export default Report;
