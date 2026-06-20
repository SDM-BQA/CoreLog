import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListMusic, PlusCircle, Sparkles, Mic, Tag, Calendar } from "lucide-react";
import { useCreatePlaylistMutation } from "../../../../@store/api/music.api";
import Select from "../../../../@components/@ui/Select";
import { toast } from "react-toast";
import { useGetMusicFiltersQuery } from "../../../../@store/api/music.api";
import { get_genre_display } from "../../../../@utils/genres";

const CreatePlaylist = () => {
    const navigate = useNavigate();
    const [createPlaylist, { isLoading }] = useCreatePlaylistMutation();
    const { data: filtersData } = useGetMusicFiltersQuery(undefined);

    const [type, setType] = useState<"manual" | "smart">("manual");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [smartArtist, setSmartArtist] = useState("");
    const [smartGenre, setSmartGenre] = useState("");
    const [smartYear, setSmartYear] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const genreOptions = (filtersData?.genres || []).map((g: string) => ({
        value: g,
        label: get_genre_display(g),
    }));
    const artistOptions = (filtersData?.artists || []).map((a: string) => ({ value: a, label: a }));
    const yearOptions = (filtersData?.years || []).map((y: string) => ({ value: y, label: y }));

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Playlist name is required";
        if (type === "smart" && !smartArtist && !smartGenre && !smartYear) {
            errs.smart = "Select at least one smart filter";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const result = await createPlaylist({
                name: name.trim(),
                description: description.trim() || undefined,
                type,
                smart_filter:
                    type === "smart"
                        ? {
                              artist: smartArtist || undefined,
                              genre: smartGenre || undefined,
                              year: smartYear || undefined,
                          }
                        : undefined,
            }).unwrap();
            toast.success(`Playlist "${name}" created!`);
            navigate(`/dashboard/music/playlist/${result._id}`);
        } catch {
            toast.error("Failed to create playlist.");
        }
    };

    return (
        <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="w-full max-w-[600px] mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">
                        Create Playlist
                    </h1>
                    <p className="text-text-secondary text-sm mt-2">
                        Build a manual collection or let the app generate a smart playlist automatically.
                    </p>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                    {/* Type Toggle */}
                    <div>
                        <label className="text-text-primary text-xs font-semibold mb-3 block tracking-wider uppercase">
                            Playlist Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setType("manual")}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                    type === "manual"
                                        ? "border-accent bg-accent/5 text-accent"
                                        : "border-border text-text-secondary hover:border-accent/40"
                                }`}
                            >
                                <ListMusic size={22} />
                                <span className="text-sm font-semibold">Manual</span>
                                <span className="text-[11px] text-center opacity-70">Add songs & albums yourself</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("smart")}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                    type === "smart"
                                        ? "border-accent bg-accent/5 text-accent"
                                        : "border-border text-text-secondary hover:border-accent/40"
                                }`}
                            >
                                <Sparkles size={22} />
                                <span className="text-sm font-semibold">Smart</span>
                                <span className="text-[11px] text-center opacity-70">Auto-filtered by artist, genre, or year</span>
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                            Playlist Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Chill Vibes, Gym Hits, 90s Classics"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                                errors.name ? "border-error focus:border-error focus:ring-error/20" : "border-border focus:border-accent"
                            }`}
                        />
                        {errors.name && <p className="text-error text-xs mt-1.5 pl-1">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                            Description (optional)
                        </label>
                        <textarea
                            placeholder="What's this playlist about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                        />
                    </div>

                    {/* Smart Filters */}
                    {type === "smart" && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="border-t border-border pt-4">
                                <p className="text-text-primary text-xs font-semibold mb-3 tracking-wider uppercase flex items-center gap-1.5">
                                    <Sparkles size={12} className="text-accent" />
                                    Smart Filters
                                </p>
                                <p className="text-text-secondary text-xs mb-4">
                                    The playlist will auto-populate with your logged music that matches these filters.
                                </p>
                                {errors.smart && <p className="text-error text-xs mb-3">{errors.smart}</p>}

                                <div className="flex flex-col gap-3">
                                    <Select
                                        label="By Artist"
                                        value={smartArtist}
                                        icon={Mic}
                                        options={[{ value: "", label: "Any artist" }, ...artistOptions]}
                                        onChange={setSmartArtist}
                                        placeholder="Any artist"
                                    />
                                    <Select
                                        label="By Genre"
                                        value={smartGenre}
                                        icon={Tag}
                                        options={[{ value: "", label: "Any genre" }, ...genreOptions]}
                                        onChange={setSmartGenre}
                                        placeholder="Any genre"
                                    />
                                    <Select
                                        label="By Year"
                                        value={smartYear}
                                        icon={Calendar}
                                        options={[{ value: "", label: "Any year" }, ...yearOptions]}
                                        onChange={setSmartYear}
                                        placeholder="Any year"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/music?tab=playlists")}
                            className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-accent/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <PlusCircle size={16} />
                            )}
                            {isLoading ? "Creating..." : "Create Playlist"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePlaylist;
