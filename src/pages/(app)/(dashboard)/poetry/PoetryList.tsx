import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  PenTool,
  Clock,
  ChevronRight,
  ScrollText
} from "lucide-react";
import { Link } from "react-router-dom";
import { myPoetryData } from "./poetryData";

const PoetryList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredPoetry = useMemo(() => {
    return myPoetryData.filter((poem) => {
      const matchesSearch = 
        poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poem.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "All" || poem.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="bg-bg flex-1 overflow-y-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
          {filteredPoetry.map((poem) => (
            <div 
              key={poem.id} 
              className="group bg-surface border border-border rounded-3xl p-8 hover:border-accent/30 transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl"
            >
              {/* Atmosphere Badge */}
              {poem.atmosphere && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-accent/5 text-accent text-[9px] font-bold uppercase tracking-widest rounded-bl-2xl border-l border-b border-accent/10">
                  {poem.atmosphere}
                </div>
              )}

              <div className="flex flex-col h-full gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                     <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                       <Clock size={12} />
                       {new Date(poem.dateCreated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </span>
                     <span className={`w-1.5 h-1.5 rounded-full ${poem.status === 'Finished' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                  </div>
                  <h3 className="text-text-primary text-2xl font-bold mb-4 group-hover:text-accent transition-colors leading-tight">
                    {poem.title}
                  </h3>
                  <div className="relative">
                    <p className="text-text-secondary/80 text-sm leading-relaxed whitespace-pre-line line-clamp-4 italic font-serif">
                      {poem.content}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                   <div className="flex flex-wrap gap-2">
                     {poem.tags.map(tag => (
                       <span key={tag} className="text-[10px] font-medium text-text-secondary bg-bg px-2.5 py-1 rounded-lg border border-border">
                         #{tag}
                       </span>
                     ))}
                   </div>
                   <div className="flex items-center gap-1 text-accent text-[11px] font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                      Read Full <ChevronRight size={14} />
                   </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPoetry.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-surface border border-border rounded-full flex items-center justify-center mb-6">
                <ScrollText className="text-text-secondary/20" size={36} />
              </div>
              <h3 className="text-text-primary text-xl font-bold">No poems found</h3>
              <p className="text-text-secondary text-sm mt-2 max-w-sm">
                Try adjusting your search or filter to find your creative works.
              </p>
              <button 
                onClick={() => {setSearchQuery(""); setStatusFilter("All");}}
                className="mt-6 text-accent font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PoetryList;
