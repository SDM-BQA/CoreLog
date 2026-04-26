import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  PenTool,
  Clock,
  ChevronRight,
  ScrollText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { get_my_poems_query, type Poem } from "../../../../@apis/poetry";
import TargetBanner from "../../../../@components/TargetBanner";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { toast } from "react-toast";

const PoemSkeleton = () => (
  <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm animate-pulse h-full">
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-full md:w-32 lg:w-40 aspect-video md:aspect-auto bg-bg/50 border-b md:border-b-0 md:border-r border-border" />
      <div className="flex-1 p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-20 h-2 bg-bg rounded-full" />
            <div className="w-1.5 h-1.5 rounded-full bg-bg" />
          </div>
          <div className="w-3/4 h-8 bg-bg rounded-xl mb-4" />
          <div className="space-y-2">
            <div className="w-full h-3 bg-bg rounded-full" />
            <div className="w-full h-3 bg-bg rounded-full" />
            <div className="w-2/3 h-3 bg-bg rounded-full" />
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-border/50 flex justify-between items-center">
          <div className="flex gap-2">
            <div className="w-10 h-5 bg-bg rounded-lg" />
            <div className="w-10 h-5 bg-bg rounded-lg" />
          </div>
          <div className="w-12 h-3 bg-bg rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const PoetryList = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [, setTotalCount] = useState(0);

  const fetchPoems = useCallback(async () => {
    try {
      setIsLoading(true);
      const filter: any = {
        limit: 100, // For now, simple list
      };
      if (searchQuery.trim()) filter.search = searchQuery.trim();
      if (statusFilter !== "All") filter.status = statusFilter.toLowerCase();

      const result = await get_my_poems_query(filter);
      setPoems(result.poems);
      setTotalCount(result.total_count);
    } catch (error) {
      console.error("Failed to fetch poems:", error);
      toast.error("Failed to load your anthology");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPoems();
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchPoems]);

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-10 flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-[10px] font-bold uppercase tracking-widest">
              <PenTool size={12} />
              Personal Anthology
            </div>
            <h1 className="text-text-primary text-4xl font-bold tracking-tight font-inter">
              Poetry Studio
            </h1>
            <p className="text-text-secondary text-base max-w-lg">
              Capture your thoughts, emotions, and rhythms in words. A sanctuary for your creative soul.
            </p>
          </div>
          
          <Link 
            to="/dashboard/poetry/add-poem"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-background px-6 py-3 rounded-xl text-sm font-bold shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} strokeWidth={3} />
            New Poem
          </Link>
        </div>

        <TargetBanner category="poems" label="written" />

        {/* Stats & Filters Row */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
             {["All", "Finished", "Draft", "Published"].map((status) => (
               <button
                 key={status}
                 onClick={() => setStatusFilter(status)}
                 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                   statusFilter === status 
                     ? "bg-accent/10 text-accent border-accent/50 shadow-lg shadow-accent/10" 
                     : "bg-surface text-text-secondary border-border hover:border-accent/40"
                 }`}
               >
                 {status}
               </button>
             ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search by title, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-2.5 pl-11 pr-4 text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Poetry Grid */}
        <div className="relative min-h-[400px] pb-20">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(6)].map((_, i) => (
                <PoemSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {poems.map((poem) => (
                <Link
                  key={poem._id}
                  to={`/dashboard/poetry/${poem._id}`}
                  className="group bg-surface border border-border rounded-3xl hover:border-accent/30 transition-all relative overflow-hidden shadow-sm hover:shadow-xl block"
                >
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Cover Image */}
                    <div className="w-full md:w-32 lg:w-40 aspect-video md:aspect-auto shrink-0 relative overflow-hidden border-b md:border-b-0 md:border-r border-border bg-surface">
                      <img 
                        src={get_full_image_url(poem.cover_image, "poem")} 
                        alt={poem.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>

                    <div className="flex-1 p-6 sm:p-8 flex flex-col gap-6 relative">
                      {/* Atmosphere Badge */}
                      {poem.atmosphere && (
                        <div className="absolute top-0 right-0 px-4 py-1 bg-accent/5 text-accent text-[9px] font-bold uppercase tracking-widest rounded-bl-xl border-l border-b border-accent/10">
                          {poem.atmosphere}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-3 mb-4">
                           <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                             <Clock size={12} />
                             {(() => {
                               const date = new Date(poem.created_at);
                               return isNaN(date.getTime()) 
                                 ? "Unknown Date" 
                                 : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                             })()}
                           </span>
                           <span className={`w-1.5 h-1.5 rounded-full ${poem.status === 'finished' ? 'bg-emerald-500' : poem.status === 'published' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                        </div>
                        <h3 className="text-text-primary text-2xl font-bold mb-4 group-hover:text-accent transition-colors leading-tight line-clamp-1">
                          {poem.title}
                        </h3>
                        <div className="relative">
                          <p className="text-text-secondary/80 text-sm leading-relaxed whitespace-pre-line line-clamp-3 italic font-serif">
                            {poem.content}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                         <div className="flex flex-wrap gap-2">
                           {poem.tags?.slice(0, 3).map(tag => (
                             <span key={tag} className="text-[10px] font-medium text-text-secondary bg-bg px-2.5 py-1 rounded-lg border border-border">
                               #{tag}
                             </span>
                           ))}
                         </div>
                         <div className="flex items-center gap-1 text-accent text-[11px] font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                            Read <ChevronRight size={14} />
                         </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {poems.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-surface border border-border rounded-full flex items-center justify-center mb-6">
                    <ScrollText className="text-text-secondary/20" size={36} />
                  </div>
                  <h3 className="text-text-primary text-xl font-bold">No poems found</h3>
                  <p className="text-text-secondary text-sm mt-2 max-w-sm">
                    {searchQuery || statusFilter !== "All" 
                      ? "Try adjusting your search or filter to find your creative works."
                      : "Your anthology is empty. Start your creative journey by writing your first poem."}
                  </p>
                  {(searchQuery || statusFilter !== "All") && (
                    <button 
                      onClick={() => {setSearchQuery(""); setStatusFilter("All");}}
                      className="mt-6 text-accent font-bold text-sm hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                  {(!searchQuery && statusFilter === "All") && (
                    <Link 
                      to="/dashboard/poetry/add-poem"
                      className="mt-6 bg-accent/10 text-accent px-6 py-2 rounded-xl text-sm font-bold hover:bg-accent/20 transition-all"
                    >
                      Write a Poem
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PoetryList;

