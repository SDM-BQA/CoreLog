import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Search,
  Plus,
  Star,
  Tag,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Quote,
  Filter,
  MoreVertical,
  X,
  BookOpen,
  Cloud,
  Sun,
  Moon,
} from "lucide-react";
import { DUMMY_JOURNAL_ENTRIES, MOOD_EMOJIS, MOOD_COLORS, JournalEntry } from "./journalData";

const Journal = () => {
  const [search, setSearch] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [view, setView] = useState<"feed" | "calendar" | "trends">("feed");

  // Filter entries
  const filteredEntries = useMemo(() => {
    return DUMMY_JOURNAL_ENTRIES.filter((entry) => {
      const matchesSearch =
        entry.title.toLowerCase().includes(search.toLowerCase()) ||
        entry.content.toLowerCase().includes(search.toLowerCase()) ||
        entry.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesMood = !selectedMood || entry.mood === selectedMood;
      return matchesSearch && matchesMood;
    });
  }, [search, selectedMood]);

  // Derived Stats
  const moodCounts = DUMMY_JOURNAL_ENTRIES.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Neutral";

  return (
    <div className="bg-bg flex-1 overflow-y-auto">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
        
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">Personal Journal</h1>
            <p className="text-text-secondary text-sm mt-1">Reflect, record, and remember your journey.</p>
          </div>
          <button className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-background px-6 py-3 rounded-xl text-sm font-bold shadow-xl shadow-accent/20 transition-all hover:scale-[1.02]">
            <Plus size={18} strokeWidth={3} />
            Write New Entry
          </button>
        </div>

        {/* ── Layout Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── Sidebar (Left Column) ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* View Switcher */}
            <div className="bg-surface border border-border rounded-2xl p-2 flex flex-col gap-1">
              {[
                { id: "feed", label: "Journal Feed", icon: BookOpen },
                { id: "calendar", label: "Calendar View", icon: CalendarIcon },
                { id: "trends", label: "Mood Trends", icon: TrendingUp },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    view === item.id 
                      ? "bg-accent/10 text-accent font-bold" 
                      : "text-text-secondary hover:text-text-primary hover:bg-bg/50"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Daily Quote Card */}
            <div className="bg-gradient-to-br from-surface to-bg border border-border rounded-2xl p-6 relative overflow-hidden group">
              <Quote className="absolute -top-2 -right-2 text-accent/5 opacity-20 group-hover:scale-110 transition-transform" size={120} />
              <div className="relative z-10">
                 <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                    <Quote size={16} className="text-accent" />
                 </div>
                 <p className="text-text-primary text-sm italic leading-relaxed">
                   "Journaling is like whispering to oneself and listening at the same time."
                 </p>
                 <p className="text-text-secondary text-[10px] mt-3 font-bold uppercase tracking-widest">— Mina Murray</p>
              </div>
            </div>

            {/* Mood Summary Header */}
            <div className="bg-surface border border-border rounded-2xl p-5">
               <h3 className="text-text-primary text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Sun size={14} className="text-yellow-500" />
                 Monthly Vibe
               </h3>
               <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                     <span className="text-text-secondary text-sm">Dominant Mood</span>
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${MOOD_COLORS[dominantMood]}`}>
                        {MOOD_EMOJIS[dominantMood]} {dominantMood}
                     </span>
                  </div>
                  <div className="h-2 w-full bg-bg rounded-full overflow-hidden flex">
                      <div className="bg-yellow-500 w-[40%]" />
                      <div className="bg-emerald-500 w-[30%]" />
                      <div className="bg-purple-500 w-[20%]" />
                      <div className="bg-blue-500 w-[10%]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                     {Object.entries(MOOD_EMOJIS).slice(0, 4).map(([mood, emoji]) => (
                        <div key={mood} className="flex items-center gap-2 text-[10px] text-text-secondary font-medium">
                           <span className="w-1.5 h-1.5 rounded-full bg-border" />
                           {emoji} {mood}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* ── Main Content (Right Column) ── */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Search entries, tags or thoughts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-all">
                    <Filter size={18} />
                    Filters
                 </button>
                 <div className="w-px h-full bg-border mx-1" />
                 <div className="flex bg-surface border border-border rounded-xl p-1">
                    <button className="p-2 rounded-lg bg-bg text-accent"><Sun size={16} /></button>
                    <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary"><Moon size={16} /></button>
                 </div>
              </div>
            </div>

            {/* Entries Feed */}
            {view === "feed" && (
              <div className="flex flex-col gap-6">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all shadow-sm">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                      {/* Date Block */}
                      <div className="flex flex-row md:flex-col items-center md:items-start gap-4 shrink-0 text-center md:text-left">
                        <div className="flex flex-col items-center">
                           <span className="text-text-secondary text-[10px] font-bold uppercase tracking-tighter">Apr</span>
                           <span className="text-text-primary text-3xl font-black">{new Date(entry.date).getDate()}</span>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${MOOD_COLORS[entry.mood]}`}>
                          {MOOD_EMOJIS[entry.mood]}
                        </div>
                      </div>

                      {/* Content Block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-text-primary text-xl font-bold font-inter leading-tight group-hover:text-accent transition-colors">
                            {entry.title}
                          </h3>
                          <div className="flex items-center gap-1">
                             <button className={`${entry.isFavorite ? 'text-yellow-500' : 'text-text-secondary/30'} hover:text-yellow-500 transition-colors p-1`}>
                               <Star size={18} fill={entry.isFavorite ? "currentColor" : "none"} />
                             </button>
                             <button className="text-text-secondary/30 hover:text-text-primary p-1">
                               <MoreVertical size={18} />
                             </button>
                          </div>
                        </div>

                        <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-6">
                          {entry.content}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                           {entry.tags.map(tag => (
                             <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-bg border border-border rounded-full text-[10px] font-bold text-text-secondary hover:text-accent hover:border-accent/30 cursor-pointer transition-colors">
                               <Tag size={10} />
                               {tag}
                             </span>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calendar Placeholder */}
            {view === "calendar" && (
              <div className="bg-surface border border-border rounded-3xl p-8 min-h-[500px] flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-text-primary text-xl font-bold flex items-center gap-3">
                       <CalendarIcon size={24} className="text-accent" />
                       April 2026
                    </h2>
                    <div className="flex gap-2">
                       <button className="p-2 rounded-xl bg-bg border border-border text-text-secondary hover:text-text-primary"><ChevronLeft size={18} /></button>
                       <button className="p-2 rounded-xl bg-bg border border-border text-text-secondary hover:text-text-primary"><ChevronRight size={18} /></button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-7 gap-px bg-border rounded-2xl overflow-hidden border border-border shadow-inner">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="bg-surface py-3 text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest">{day}</div>
                    ))}
                    {Array.from({ length: 30 }).map((_, i) => {
                      const day = i + 1;
                      const hasEntry = DUMMY_JOURNAL_ENTRIES.some(e => new Date(e.date).getDate() === day);
                      return (
                        <div key={i} className="bg-surface aspect-square p-2 group cursor-pointer hover:bg-bg transition-colors relative">
                           <span className={`text-xs font-medium ${hasEntry ? 'text-text-primary font-bold' : 'text-text-secondary/40'}`}>{day}</span>
                           {hasEntry && (
                             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                           )}
                        </div>
                      );
                    })}
                 </div>

                 <div className="mt-8 p-6 bg-bg/50 border border-border rounded-2xl items-center flex justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <Cloud size={24} />
                       </div>
                       <div>
                          <p className="text-text-primary text-sm font-bold">Cloudy with a chance of ideas</p>
                          <p className="text-text-secondary text-xs">A good day to reflect on the week's goals.</p>
                       </div>
                    </div>
                    <button className="text-accent text-xs font-bold hover:underline">View Advice</button>
                 </div>
              </div>
            )}

            {/* Empty State for Trends */}
            {view === "trends" && (
              <div className="bg-surface border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-6">
                 <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse">
                    <TrendingUp size={48} />
                 </div>
                 <div className="max-w-md">
                    <h3 className="text-text-primary text-xl font-bold">Unlocking Your Vibe History</h3>
                    <p className="text-text-secondary text-sm mt-2">
                       We need at least 10 entries to generate a meaningful mood map. Keep journaling to see your seasonal emotional trends!
                    </p>
                 </div>
                 <button className="bg-accent text-background px-6 py-2.5 rounded-xl font-bold text-sm">Keep Writing</button>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
