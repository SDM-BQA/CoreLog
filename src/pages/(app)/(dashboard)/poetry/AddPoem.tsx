import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  PenTool, 
  Sparkles, 
  Save, 
  Hash, 
  Smile, 
  Wind,
} from "lucide-react";

const AddPoem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: "",
    atmosphere: "",
    status: "Draft",
    tags: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save to the data file or an API
    console.log("Saving poem:", formData);
    navigate("/dashboard/poetry");
  };

  return (
    <div className="bg-bg flex-1 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link 
            to="/dashboard/poetry" 
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Anthology
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-text-primary text-3xl font-bold tracking-tight">Compose New Poem</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-bold uppercase tracking-widest">
              <PenTool size={12} />
              Drafting
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          
          {/* Main Content Area */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
              <div className="space-y-2">
                <label className="text-text-secondary text-xs font-bold uppercase tracking-widest pl-1">Title of the Work</label>
                <input
                  required
                  type="text"
                  placeholder="Enter a title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-amber-500/50 transition-colors text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-text-secondary text-xs font-bold uppercase tracking-widest pl-1">The Verse</label>
                <textarea
                  required
                  rows={15}
                  placeholder="Spill your words here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-bg border border-border rounded-2xl py-4 px-5 text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-amber-500/50 transition-colors italic font-serif leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sidebar / Metadata */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
              <h3 className="text-text-primary text-sm font-bold flex items-center gap-2 border-b border-border pb-4">
                <Sparkles size={16} className="text-amber-500" />
                Poem Metadata
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-text-secondary text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                    <Smile size={12} />
                    Current Mood
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Melancholy, Joy"
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-secondary text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                    <Wind size={12} />
                    Atmosphere
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Serene, Stormy"
                    value={formData.atmosphere}
                    onChange={(e) => setFormData({ ...formData, atmosphere: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-secondary text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                    <Hash size={12} />
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="comma separated"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-secondary text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                    <Save size={12} />
                    Manuscript Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Finished">Finished</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-background py-3 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <PenTool size={16} />
                Save to Anthology
              </button>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 flex flex-col gap-3">
               <p className="text-amber-500/60 text-[10px] font-bold uppercase tracking-widest">Writing Tip</p>
               <p className="text-text-secondary text-xs italic leading-relaxed">
                 "Poetry is when an emotion has found its thought and the thought has found words." — Robert Frost
               </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPoem;
