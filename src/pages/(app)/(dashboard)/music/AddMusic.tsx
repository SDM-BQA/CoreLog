import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    ImagePlus,
    PlusCircle,
    Music,
    Calendar,
    Globe,
    Clock,
    Sparkles,
    Search,
    Mic,
    Users,
    Disc,
    CheckCircle2,
} from "lucide-react";
import { useForm } from "../../../../@hooks/Form/useForm";
import { upload_image_api } from "../../../../@apis/users";
import { get_genre_key, GENRE_MAP } from "../../../../@utils/genres";
import RatingInput from "../../../../@components/RatingInput";
import Select from "../../../../@components/@ui/Select";
import CalendarInput from "../../../../@components/@ui/CalendarInput";
import { FeatureCard, MultiSearchSelect } from "../../../../@components/@smart";
import {
    search_itunes_songs,
    search_itunes_albums,
    get_itunes_artwork,
    ItunesTrack,
    ItunesAlbum,
} from "../../../../@apis/music";
import { useCreateSongMutation, useCreateAlbumMutation } from "../../../../@store/api/music.api";
import { toISO } from "../../../../@utils/date.utils";
import { toast } from "react-toast";

const GENRE_OPTIONS = Object.values(GENRE_MAP);

const STATUS_MAP = {
    wishlist: "Wishlist",
    listened: "Listened",
};

const ARTIST_TYPE_OPTIONS = [
    { value: "solo", label: "Solo Artist / Singer" },
    { value: "band", label: "Band / Group" },
];

interface AddMusicForm {
    title: string;
    artist: string;
    artist_type: "solo" | "band";
    album_name: string;
    genres: string[];
    description: string;
    language: string;
    review: string;
    releaseYear: string;
    platform: string;
    rating: number;
    status: "wishlist" | "listened";
    listened_on: string;
    total_tracks: string;
}

const AddMusic = () => {
    const navigate = useNavigate();
    const [type, setType] = useState<"song" | "album">("song");
    const [createSong, { isLoading: isCreatingSong }] = useCreateSongMutation();
    const [createAlbum, { isLoading: isCreatingAlbum }] = useCreateAlbumMutation();
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [remoteCoverUrl, setRemoteCoverUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<(ItunesTrack | ItunesAlbum)[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { values, errors, handleChange, setFieldValue, handleSubmit, resetForm } = useForm<AddMusicForm>({
        initialValues: {
            title: "",
            artist: "",
            artist_type: "solo",
            album_name: "",
            genres: [],
            description: "",
            language: "",
            review: "",
            releaseYear: "",
            platform: "",
            rating: 0,
            status: "wishlist",
            listened_on: new Date().toISOString().split("T")[0],
            total_tracks: "",
        },
        validationSchema: {
            title: (val) => (val ? null : "Title is required"),
            artist: (val) => (val ? null : "Artist is required"),
            releaseYear: (val) => {
                if (!val) return "Year is required";
                if (isNaN(Number(val)) || Number(val) < 1800) return "Invalid year";
                if (Number(val) > new Date().getFullYear()) return "Year cannot be in the future";
                return null;
            },
            genres: (val) => (val.length > 0 ? null : "At least one genre is required"),
            status: (val) => (val ? null : "Status is required"),
            rating: (val, formValues) =>
                formValues.status === "listened" ? (val > 0 ? null : "Rating is required") : null,
        },
        onSubmit: async (formValues) => {
            try {
                let cover_image = "";
                if (coverFile) {
                    cover_image = await upload_image_api(coverFile);
                } else if (remoteCoverUrl) {
                    cover_image = remoteCoverUrl;
                }

                if (type === "song") {
                    await createSong({
                        title: formValues.title,
                        artist: formValues.artist,
                        artist_type: formValues.artist_type,
                        album_name: formValues.album_name || undefined,
                        cover_image,
                        description: formValues.description,
                        genres: formValues.genres.map(get_genre_key),
                        release_year: formValues.releaseYear,
                        language: formValues.language,
                        platform: formValues.platform,
                        status: formValues.status,
                        rating: formValues.rating,
                        review: formValues.review,
                        preview_url: previewUrl || undefined,
                        finished_on: formValues.status === "listened" ? toISO(formValues.listened_on) : undefined,
                    }).unwrap();
                    toast.success(`Song "${formValues.title}" added!`);
                } else {
                    await createAlbum({
                        title: formValues.title,
                        artist: formValues.artist,
                        artist_type: formValues.artist_type,
                        cover_image,
                        description: formValues.description,
                        genres: formValues.genres.map(get_genre_key),
                        release_year: formValues.releaseYear,
                        total_tracks: parseInt(formValues.total_tracks) || undefined,
                        language: formValues.language,
                        platform: formValues.platform,
                        status: formValues.status,
                        rating: formValues.rating,
                        review: formValues.review,
                    }).unwrap();
                    toast.success(`Album "${formValues.title}" added!`);
                }
                navigate("/dashboard/music");
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to add music.");
            }
        },
    });

    const isSubmitting = isCreatingSong || isCreatingAlbum;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setRemoteCoverUrl(null);
            setCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setCoverPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSearch = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        setShowResults(true);
        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const results =
                    type === "song"
                        ? await search_itunes_songs(query)
                        : await search_itunes_albums(query);
                setSearchResults(results);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const selectSong = (item: ItunesTrack) => {
        setFieldValue("title", item.trackName);
        setFieldValue("artist", item.artistName);
        setFieldValue("album_name", item.collectionName || "");
        setFieldValue("releaseYear", item.releaseDate?.split("-")[0] || "");
        setFieldValue("genres", item.primaryGenreName ? [item.primaryGenreName] : []);
        if (item.previewUrl) setPreviewUrl(item.previewUrl);
        if (item.artworkUrl100) {
            const url = get_itunes_artwork(item.artworkUrl100);
            setCoverPreview(url);
            setRemoteCoverUrl(url);
            setCoverFile(null);
        }
        setShowResults(false);
    };

    const selectAlbum = (item: ItunesAlbum) => {
        setFieldValue("title", item.collectionName);
        setFieldValue("artist", item.artistName);
        setFieldValue("releaseYear", item.releaseDate?.split("-")[0] || "");
        setFieldValue("genres", item.primaryGenreName ? [item.primaryGenreName] : []);
        setFieldValue("total_tracks", String(item.trackCount || ""));
        if (item.artworkUrl100) {
            const url = get_itunes_artwork(item.artworkUrl100);
            setCoverPreview(url);
            setRemoteCoverUrl(url);
            setCoverFile(null);
        }
        setShowResults(false);
    };

    const switchType = (newType: "song" | "album") => {
        setType(newType);
        resetForm();
        setCoverFile(null);
        setCoverPreview(null);
        setRemoteCoverUrl(null);
        setPreviewUrl(null);
        setSearchResults([]);
        setShowResults(false);
    };

    const showListenedOn = values.status === "listened";
    const showReview = values.status === "listened";

    return (
        <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="w-full max-w-[820px] mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-text-primary text-3xl font-bold tracking-tight font-inter">
                        Add Music
                    </h1>
                    <p className="text-text-secondary text-sm mt-2">
                        Log songs and albums you've listened to or want to explore.
                    </p>
                </div>

                {/* Type Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => switchType("song")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            type === "song"
                                ? "bg-accent text-white shadow-sm shadow-accent/20"
                                : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                        }`}
                    >
                        <Music size={16} />
                        Song / Track
                    </button>
                    <button
                        type="button"
                        onClick={() => switchType("album")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            type === "album"
                                ? "bg-accent text-white shadow-sm shadow-accent/20"
                                : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                        }`}
                    >
                        <Disc size={16} />
                        Album
                    </button>
                </div>

                {/* Main Form Card */}
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-8">
                        {/* ─── Left: Cover ─── */}
                        <div className="flex flex-col gap-6 w-full sm:w-[200px] shrink-0">
                            <div>
                                <label className="text-text-primary text-xs font-semibold mb-2.5 block tracking-wider uppercase">
                                    {type === "song" ? "Song Cover" : "Album Cover"}
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-200 bg-bg/50 overflow-hidden group shadow-sm"
                                >
                                    {coverPreview ? (
                                        <img
                                            src={coverPreview}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center px-4 text-center">
                                            <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                                <ImagePlus
                                                    size={24}
                                                    className="text-text-secondary group-hover:text-accent transition-colors"
                                                />
                                            </div>
                                            <span className="text-text-primary text-sm font-medium">
                                                Upload Cover
                                            </span>
                                            <span className="text-text-secondary text-[11px] mt-1">
                                                PNG, JPG or WebP
                                            </span>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {showReview && (
                                <RatingInput
                                    label="Your Rating"
                                    value={values.rating}
                                    onChange={(val) => setFieldValue("rating", val)}
                                    error={errors.rating}
                                />
                            )}

                            {/* Preview player (songs only) */}
                            {type === "song" && previewUrl && (
                                <div>
                                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                        Preview
                                    </label>
                                    <audio
                                        controls
                                        src={previewUrl}
                                        className="w-full rounded-lg"
                                    />
                                    <p className="text-text-secondary text-[10px] mt-1 opacity-60">
                                        30-second iTunes preview
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ─── Right: Fields ─── */}
                        <div className="flex flex-col gap-5 flex-1 min-w-0">
                            {/* Title Search */}
                            <div className="relative">
                                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                    {type === "song" ? "Song Title" : "Album Title"}
                                </label>
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder={
                                            type === "song"
                                                ? "Type song name to autofill from iTunes..."
                                                : "Type album name to autofill from iTunes..."
                                        }
                                        value={values.title}
                                        onChange={(e) => {
                                            handleChange("title")(e);
                                            handleSearch(e.target.value);
                                        }}
                                        onFocus={() => values.title.length >= 2 && setShowResults(true)}
                                        className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                                            errors.title
                                                ? "border-error focus:border-error focus:ring-error/20"
                                                : "border-border focus:border-accent"
                                        }`}
                                    />
                                </div>
                                {errors.title && (
                                    <p className="text-error text-xs mt-1.5 pl-1">{errors.title}</p>
                                )}

                                {/* Search Dropdown */}
                                {showResults && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto custom-scrollbar">
                                        {isSearching ? (
                                            <div className="flex items-center justify-center gap-2 py-6 text-text-secondary text-sm">
                                                <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                                                Searching iTunes...
                                            </div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="py-6 text-center text-text-secondary text-sm">
                                                No results found
                                            </div>
                                        ) : (
                                            searchResults.map((item: any, i) => {
                                                const isSong = "trackName" in item;
                                                const title = isSong ? item.trackName : item.collectionName;
                                                const artwork = item.artworkUrl100
                                                    ? get_itunes_artwork(item.artworkUrl100, 100)
                                                    : null;
                                                const sub = isSong
                                                    ? `${item.artistName} • ${item.collectionName || ""}`
                                                    : `${item.artistName} • ${item.trackCount || ""} tracks`;
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() =>
                                                            isSong
                                                                ? selectSong(item as ItunesTrack)
                                                                : selectAlbum(item as ItunesAlbum)
                                                        }
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg/60 transition-colors text-left"
                                                    >
                                                        {artwork ? (
                                                            <img
                                                                src={artwork}
                                                                alt={title}
                                                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0">
                                                                <Music size={16} className="text-text-secondary" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-text-primary text-sm font-medium truncate">
                                                                {title}
                                                            </p>
                                                            <p className="text-text-secondary text-xs truncate">
                                                                {sub}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowResults(false)}
                                            className="w-full py-2 text-xs text-text-secondary hover:text-text-primary border-t border-border transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Artist + Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                        Artist / Band
                                    </label>
                                    <div className="relative">
                                        <Mic
                                            size={18}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="e.g. Taylor Swift, BTS"
                                            value={values.artist}
                                            onChange={handleChange("artist")}
                                            className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                                                errors.artist
                                                    ? "border-error focus:border-error focus:ring-error/20"
                                                    : "border-border focus:border-accent"
                                            }`}
                                        />
                                    </div>
                                    {errors.artist && (
                                        <p className="text-error text-xs mt-1.5 pl-1">{errors.artist}</p>
                                    )}
                                </div>

                                <Select
                                    label="Artist Type"
                                    value={values.artist_type}
                                    options={ARTIST_TYPE_OPTIONS}
                                    onChange={(val) => setFieldValue("artist_type", val as "solo" | "band")}
                                    icon={Users}
                                />
                            </div>

                            {/* Album name (song only) + tracks (album only) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {type === "song" && (
                                    <div>
                                        <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                            Album Name
                                        </label>
                                        <div className="relative">
                                            <Disc
                                                size={18}
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="e.g. Midnights"
                                                value={values.album_name}
                                                onChange={handleChange("album_name")}
                                                className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                {type === "album" && (
                                    <div>
                                        <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                            Total Tracks
                                        </label>
                                        <div className="relative">
                                            <Music
                                                size={18}
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                                            />
                                            <input
                                                type="number"
                                                placeholder="e.g. 13"
                                                value={values.total_tracks}
                                                onChange={handleChange("total_tracks")}
                                                className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Release Year */}
                                <div>
                                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                        Release Year
                                    </label>
                                    <div className="relative">
                                        <Calendar
                                            size={18}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="YYYY"
                                            maxLength={4}
                                            value={values.releaseYear}
                                            onChange={(e) =>
                                                setFieldValue("releaseYear", e.target.value.replace(/\D/g, ""))
                                            }
                                            className={`w-full bg-bg border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
                                                errors.releaseYear
                                                    ? "border-error focus:border-error focus:ring-error/20"
                                                    : "border-border focus:border-accent"
                                            }`}
                                        />
                                    </div>
                                    {errors.releaseYear && (
                                        <p className="text-error text-xs mt-1.5 pl-1">{errors.releaseYear}</p>
                                    )}
                                </div>
                            </div>

                            {/* Language + Platform */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                        Language
                                    </label>
                                    <div className="relative">
                                        <Globe
                                            size={18}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="e.g. English, Hindi"
                                            value={values.language}
                                            onChange={handleChange("language")}
                                            className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                        Platform
                                    </label>
                                    <div className="relative">
                                        <Clock
                                            size={18}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="e.g. Spotify, Apple Music"
                                            value={values.platform}
                                            onChange={handleChange("platform")}
                                            className="w-full bg-bg border border-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status + Listened On */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Status"
                                    value={values.status}
                                    options={Object.entries(STATUS_MAP).map(([value, label]) => ({
                                        value,
                                        label,
                                    }))}
                                    onChange={(val) => setFieldValue("status", val as "wishlist" | "listened")}
                                />

                                {showListenedOn && type === "song" && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <CalendarInput
                                            label="Listened On"
                                            icon={CheckCircle2}
                                            max={new Date().toISOString().split("T")[0]}
                                            value={values.listened_on}
                                            onChange={(val) => setFieldValue("listened_on", val)}
                                            error={errors.listened_on}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Genres */}
                            <MultiSearchSelect
                                label="Genres"
                                options={GENRE_OPTIONS}
                                selected={values.genres}
                                onToggle={(genre) => {
                                    const next = values.genres.includes(genre)
                                        ? values.genres.filter((g) => g !== genre)
                                        : [...values.genres, genre];
                                    setFieldValue("genres", next);
                                }}
                                onRemove={(genre) =>
                                    setFieldValue(
                                        "genres",
                                        values.genres.filter((g) => g !== genre)
                                    )
                                }
                                error={errors.genres}
                                placeholder="Search & select genres..."
                            />

                            {/* Description */}
                            <div>
                                <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                    Description
                                </label>
                                <textarea
                                    placeholder={
                                        type === "song"
                                            ? "Brief note about this song..."
                                            : "Brief note about this album..."
                                    }
                                    value={values.description}
                                    onChange={handleChange("description")}
                                    rows={3}
                                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                                />
                            </div>

                            {/* Review */}
                            {showReview && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                                        Your Review
                                    </label>
                                    <textarea
                                        placeholder="Share your thoughts about this music..."
                                        value={values.review}
                                        onChange={handleChange("review")}
                                        rows={4}
                                        className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                                    />
                                    <p className="text-text-secondary text-[10px] mt-2 italic flex items-center gap-1.5 opacity-60">
                                        <Sparkles size={12} className="text-accent" />
                                        Your review helps you remember your listening journey.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/music")}
                            className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg rounded-xl transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-accent/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <PlusCircle size={18} />
                            )}
                            {isSubmitting ? "Saving..." : `Save ${type === "song" ? "Song" : "Album"}`}
                        </button>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <FeatureCard icon={Music} title="iTunes Auto-fill" description="Instantly fill details from iTunes" />
                    <FeatureCard icon={Disc} title="Songs & Albums" description="Log tracks or entire albums" />
                    <FeatureCard icon={Sparkles} title="Smart Playlists" description="Auto-organized by artist & genre" />
                </div>
            </form>
        </div>
    );
};

export default AddMusic;
