import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Film,
  BookOpen,
  Tv,
  Plus,
  Clock,
  TrendingUp,
  ChevronRight,
  Star,
  PlusCircle,
  Play,
  PenLine,
  ScrollText,
} from "lucide-react";
import { DUMMY_JOURNAL_ENTRIES, MOOD_EMOJIS } from "../journal/journalData";
import { useAppSelector } from "../../../../@store/hooks/store.hooks";
import { get_dashboard_stats_query, type DashboardStats } from "../../../../@apis/users";
import { get_my_movies_query } from "../../../../@apis/movies";
import { get_my_series_query } from "../../../../@apis/series";
import { get_my_poems_query } from "../../../../@apis/poetry";
import { get_full_image_url } from "../../../../@utils/api.utils";

type MediaItem = 
  | { type: 'Movie'; title: string; _id: string; cover: string; status: string; rating?: number; created_at?: string; release_year?: string; genres?: string[] }
  | { type: 'Series'; title: string; _id: string; cover: string; status: string; rating?: number; created_at?: string; first_air_date?: string; genres?: string[]; total_seasons?: number }
  | { type: 'Book'; title: string; _id: string; cover: string; status: string; rating?: number; created_at?: string; author?: string; genres?: string[] }
  | { type: 'Poem'; title: string; _id: string; cover: string; status: string; mood?: string; atmosphere?: string; created_at?: string; content?: string; rating?: number; genres?: string[] };

const DashboardHome = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { user } = useAppSelector((state) => state.user);
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentItems, setRecentItems] = useState<MediaItem[]>([]);
  const [inProgressItems, setInProgressItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stats = await get_dashboard_stats_query();
        setDashboardStats(stats);

        // Fetch recent items (simplified for now)
        const [moviesRes, seriesRes, poemsRes] = await Promise.all([
          get_my_movies_query({ limit: 5 }),
          get_my_series_query({ limit: 5 }),
          get_my_poems_query({ limit: 5 }),
        ]);

        const allRecent: MediaItem[] = [
          ...moviesRes.movies.map(m => ({ ...m, type: 'Movie' as const, cover: get_full_image_url(m.poster_image, "movie") })),
          ...seriesRes.series.map(s => ({ ...s, type: 'Series' as const, cover: get_full_image_url(s.poster_image, "series") })),
          ...poemsRes.poems.map(p => ({ 
            ...p, 
            type: 'Poem' as const, 
            cover: get_full_image_url(p.cover_image, "poem") 
          })),
        ].sort((a, b) => {
          const dateA = new Date(a.created_at || '').getTime();
          const dateB = new Date(b.created_at || '').getTime();
          return dateB - dateA;
        });

        setRecentItems(allRecent.slice(0, 5));

        // In progress
        const inProgress = allRecent.filter(item => 
          item.status === 'watching' || item.status === 'reading' || item.status === 'draft' || item.status === 'rewatching'
        );
        setInProgressItems(inProgress.slice(0, 4));

      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats display
  const statsDisplay = [
    { label: "Movies", count: dashboardStats?.movies ?? 0, icon: Film, color: "text-blue-500", bg: "bg-blue-500/10", to: "/dashboard/movies" },
    { label: "Web Series", count: dashboardStats?.series ?? 0, icon: Tv, color: "text-purple-500", bg: "bg-purple-500/10", to: "/dashboard/series" },
    { label: "Books", count: dashboardStats?.books ?? 0, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10", to: "/dashboard/books" },
    { label: "Poetry", count: dashboardStats?.poems ?? 0, icon: ScrollText, color: "text-amber-500", bg: "bg-amber-500/10", to: "/dashboard/poetry" },
    { label: "Journal", count: dashboardStats?.journal_entries ?? 0, icon: PenLine, color: "text-pink-500", bg: "bg-pink-500/10", to: "/dashboard/journal" },
  ];

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-10">
        
        {/* ── Welcome Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">
              Welcome back, {user?.first_name || user?.user_name || "User"}! 
            </h1>
            <p className="text-text-secondary text-base mt-1">
              Here's a breakdown of your personal media universe.
            </p>
          </div>

          {/* Universal Add Button */}
          <div className="relative">
            <button
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-background px-6 py-3 rounded-xl text-sm font-bold shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={20} strokeWidth={3} />
              Add To Collection
            </button>

            {isAddOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAddOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+12px)] w-56 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                   <Link to="/dashboard/movies/add-movie" className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors" onClick={() => setIsAddOpen(false)}>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Film size={16} className="text-blue-500" />
                      </div>
                      <span className="text-sm font-semibold text-text-primary">Add Movie</span>
                   </Link>
                   <Link to="/dashboard/series/add-series" className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors" onClick={() => setIsAddOpen(false)}>
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Tv size={16} className="text-purple-500" />
                      </div>
                      <span className="text-sm font-semibold text-text-primary">Add Web Series</span>
                   </Link>
                   <Link to="/dashboard/books/add-book" className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors" onClick={() => setIsAddOpen(false)}>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <BookOpen size={16} className="text-emerald-500" />
                      </div>
                      <span className="text-sm font-semibold text-text-primary">Add Book</span>
                   </Link>
                   <Link to="/dashboard/journal" className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors" onClick={() => setIsAddOpen(false)}>
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                        <PenLine size={16} className="text-pink-500" />
                      </div>
                      <span className="text-sm font-semibold text-text-primary">Add Journal Entry</span>
                   </Link>
                   <Link to="/dashboard/poetry/add-poem" className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors" onClick={() => setIsAddOpen(false)}>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <ScrollText size={16} className="text-amber-500" />
                      </div>
                      <span className="text-sm font-semibold text-text-primary">Compose Poem</span>
                   </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {statsDisplay.map((stat) => (
            <Link 
              key={stat.label} 
              to={stat.to}
              className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5 hover:border-accent/40 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon size={26} className={stat.color} />
              </div>
              <div>
                <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-text-primary text-3xl font-bold">{stat.count}</span>
                  <span className="text-text-secondary text-xs">Items</span>
                </div>
              </div>
              <ChevronRight size={20} className="ml-auto text-text-secondary/40 group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* ── Left Column: In Progress & Recent ── */}
          <div className="xl:col-span-2 flex flex-col gap-10">
            
            {/* ── In Progress Section ── */}
            {inProgressItems.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-text-primary text-xl font-bold flex items-center gap-2">
                    <Clock size={22} className="text-accent" />
                    Continue Your Journey
                  </h2>
                  <span className="text-text-secondary text-xs uppercase font-bold tracking-widest">In Progress</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inProgressItems.map((item, idx) => (
                    <Link key={idx} to={item.type === 'Poem' ? `/dashboard/poetry/${item._id}` : item.type === 'Movie' ? `/dashboard/movies/${item._id}` : `/dashboard/series/${item._id}`} className="bg-surface border border-border rounded-2xl p-4 flex gap-4 hover:border-accent/30 transition-colors">
                      <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden shrink-0 border border-border/50">
                        <img src={item.cover || 'https://images.unsplash.com/photo-1455391394557-45741ebb19b1?q=80&w=300&auto=format&fit=crop'} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="py-1 flex flex-col justify-between">
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.type === 'Movie' ? 'bg-blue-500/10 text-blue-500' :
                            item.type === 'Series' ? 'bg-purple-500/10 text-purple-500' :
                            item.type === 'Book' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {item.type}
                          </span>
                          <h3 className="text-text-primary font-bold text-sm mt-2 line-clamp-1">{item.title}</h3>
                          <p className="text-text-secondary text-xs mt-1">
                            {item.type === 'Series' 
                              ? `${item.total_seasons || 0} Seasons` 
                              : item.type === 'Book' 
                                ? item.author 
                                : item.type === 'Poem'
                                  ? item.mood
                                  : 'Recently Started'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-accent text-xs font-bold hover:underline mt-2">
                          <Play size={12} fill="currentColor" />
                          Resume {item.type === 'Book' ? 'Reading' : item.type === 'Poem' ? 'Drafting' : 'Watching'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Quick Activity Section ── */}
            {recentItems.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-text-primary text-xl font-bold flex items-center gap-2">
                    <PlusCircle size={22} className="text-accent" />
                    New Additions
                  </h2>
                  <Link to="/dashboard/movies" className="text-accent text-xs font-bold hover:underline">View All</Link>
                </div>
                
                <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
                  {recentItems.map((item, idx) => (
                    <Link key={idx} to={item.type === 'Poem' ? `/dashboard/poetry/${item._id}` : item.type === 'Movie' ? `/dashboard/movies/${item._id}` : `/dashboard/series/${item._id}`} className="p-4 flex items-center gap-4 hover:bg-bg/40 transition-colors group">
                      <div className="w-12 h-16 rounded-md overflow-hidden shrink-0">
                        <img src={item.cover || 'https://images.unsplash.com/photo-1455391394557-45741ebb19b1?q=80&w=300&auto=format&fit=crop'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-text-primary font-bold text-sm truncate">{item.title}</h4>
                         <p className="text-text-secondary text-xs flex items-center gap-2 mt-1">
                            <span className={`${
                              item.type === 'Movie' ? 'text-blue-500' :
                              item.type === 'Series' ? 'text-purple-500' :
                              item.type === 'Book' ? 'text-emerald-500' :
                              'text-amber-500'
                            } font-semibold`}>{item.type}</span>
                            <span>•</span>
                            <span>Added {new Date(item.created_at || '').toLocaleDateString()}</span>
                         </p>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                         <Star size={14} className="fill-yellow-400 text-yellow-400" />
                         <span className="text-text-primary text-xs font-bold">{item.rating || 'N/A'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Recent Journal Entries ── */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-text-primary text-xl font-bold flex items-center gap-2">
                  <PenLine size={22} className="text-pink-500" />
                  Latest Reflections
                </h2>
                <Link to="/dashboard/journal" className="text-accent text-xs font-bold hover:underline">Open Journal</Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DUMMY_JOURNAL_ENTRIES.slice(0, 2).map((entry) => (
                  <div key={entry.id} className="bg-surface border border-border rounded-2xl p-5 hover:border-pink-500/30 transition-colors group">
                     <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{MOOD_EMOJIS[entry.mood]}</span>
                        <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                     </div>
                     <h4 className="text-text-primary font-bold text-sm mb-2 group-hover:text-pink-500 transition-colors line-clamp-1">{entry.title}</h4>
                     <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed mb-4">{entry.content}</p>
                     <div className="flex flex-wrap gap-1.5">
                        {entry.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] font-bold text-pink-500/70 bg-pink-500/5 px-2 py-0.5 rounded-full border border-pink-500/10">#{tag}</span>
                        ))}
                     </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right Column: Insights & Trends ── */}
          <div className="flex flex-col gap-6">
             <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <TrendingUp size={36} className="text-accent" />
                </div>
                <h3 className="text-text-primary text-lg font-bold">Personal Insights</h3>
                <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                  You've reached <span className="text-accent font-bold">85%</span> of your monthly reading goal. Keep it up!
                </p>
                <div className="w-full h-2 bg-bg border border-border rounded-full mt-6 overflow-hidden">
                   <div className="h-full bg-accent w-[85%] rounded-full shadow-[0_0_12px_rgba(var(--accent-rgb),0.5)]" />
                </div>
                <button className="w-full mt-8 py-3 bg-bg border border-border rounded-xl text-text-primary text-sm font-semibold hover:border-accent/40 transition-colors">
                  View Full Analytics
                </button>
             </div>

             <div className="bg-gradient-to-br from-accent to-accent/80 rounded-3xl p-8 text-background shadow-xl shadow-accent/20">
                <h3 className="text-xl font-bold mb-2 font-inter">CoreLog Premium</h3>
                <p className="text-background/80 text-sm mb-6 leading-relaxed">
                  Get absolute access to advanced stats, public profile and API integrations.
                </p>
                <Link to="/pricing" className="block w-full py-3 bg-background text-accent text-center rounded-xl text-sm font-bold shadow-lg">
                  Explore Plans
                </Link>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;

