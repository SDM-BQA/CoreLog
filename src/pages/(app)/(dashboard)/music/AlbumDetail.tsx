import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Star,
    Calendar,
    Pencil,
    Trash2,
    Music,
    Tag,
    Globe,
    Mic,
    Disc,
    BookmarkPlus,
} from "lucide-react";
import { upload_image_api } from "../../../../@apis/users";
import { get_full_image_url, get_rating_level } from "../../../../@utils/api.utils";
import { formatDate } from "../../../../@utils/date.utils";
import { get_genre_display, get_genre_key, GENRE_MAP } from "../../../../@utils/genres";
import { Modal, MultiSearchSelect } from "../../../../@components/@smart";
import Select from "../../../../@components/@ui/Select";
import DeleteModal from "../../../../@components/DeleteModal";
import RatingInput from "../../../../@components/RatingInput";
import { toast } from "react-toast";
import { useGetAlbumByIdQuery, useUpdateAlbumMutation, useDeleteAlbumMutation } from "../../../../@store/api/music.api";

interface Album {
    _id: string;
    title: string;
    artist: string;
    artist_type: "solo" | "band";
    cover_image?: string;
    description?: string;
    genres: string[];
    release_year: string;
    total_tracks?: number;
    language?: string;
    platform?: string;
    status: "wishlist" | "listened";
    rating: number;
    review?: string;
    created_at?: string;
}

const STATUS_MAP: Record<string, string> = {
    wishlist: "Wishlist",
    listened: "Listened",
};

const STATUS_COLORS: Record<string, string> = {
    wishlist: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    listened: "text-green-400 border-green-400/30 bg-green-400/5",
};

const GENRE_OPTIONS = Object.values(GENRE_MAP);
const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, label]) => ({ value, label }));

const AlbumDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: fetchedAlbum, isLoading } = useGetAlbumByIdQuery(id);
    const [updateAlbumMutation, { isLoading: isUpdating }] = useUpdateAlbumMutation();
    const [deleteAlbumMutation] = useDeleteAlbumMutation();

    const [album, setAlbum] = useState<Album | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        title: "",
        artist: "",
        artist_type: "solo" as "solo" | "band",
        release_year: "",
        total_tracks: "",
        language: "",
        platform: "",
        status: "wishlist" as "wishlist" | "listened",
        genres: [] as string[],
        description: "",
        rating: 0,
        review: "",
    });
    const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (fetchedAlbum) {
            setAlbum(fetchedAlbum as unknown as Album);
            setModalData({
                title: fetchedAlbum.title,
                artist: fetchedAlbum.artist,
                artist_type: fetchedAlbum.artist_type || "solo",
                release_year: fetchedAlbum.release_year || "",
                total_tracks: String(fetchedAlbum.total_tracks || ""),
                language: fetchedAlbum.language || "",
                platform: fetchedAlbum.platform || "",
                status: fetchedAlbum.status,
                genres: (fetchedAlbum.genres || []).map(get_genre_display),
                description: fetchedAlbum.description || "",
                rating: fetchedAlbum.rating || 0,
                review: fetchedAlbum.review || "",
            });
        }
    }, [fetchedAlbum]);

    const validateModal = () => {
        const errs: Record<string, string> = {};
        if (!modalData.title) errs.title = "Title is required";
        if (!modalData.artist) errs.artist = "Artist is required";
        if (modalData.status === "listened" && modalData.rating < 1) errs.rating = "Rating is required";
        setModalErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validateModal()) return;
        try {
            const updated = await updateAlbumMutation({
                id: id!,
                input: {
                    title: modalData.title,
                    artist: modalData.artist,
                    artist_type: modalData.artist_type,
                    release_year: modalData.release_year,
                    total_tracks: parseInt(modalData.total_tracks) || undefined,
                    language: modalData.language,
                    platform: modalData.platform,
                    status: modalData.status,
                    genres: modalData.genres.map(get_genre_key),
                    description: modalData.description,
                    rating: modalData.rating,
                    review: modalData.review,
                },
            }).unwrap();
            setAlbum(updated as unknown as Album);
            toast.success("Album updated!");
            setIsModalOpen(false);
        } catch {
            toast.error("Failed to update album.");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAlbumMutation(id!).unwrap();
            toast.success("Album deleted.");
            navigate("/dashboard/music");
        } catch {
            toast.error("Failed to delete album.");
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !album) return;
        setIsUploading(true);
        try {
            const url = await upload_image_api(file);
            await updateAlbumMutation({ id: id!, input: { cover_image: url } }).unwrap();
            setAlbum((prev) => (prev ? { ...prev, cover_image: url } : prev));
            toast.success("Cover updated!");
        } catch {
            toast.error("Failed to upload cover.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 bg-bg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!album) {
        return (
            <div className="flex-1 bg-bg flex flex-col items-center justify-center gap-4">
                <Disc size={48} className="text-text-secondary/30" />
                <p className="text-text-secondary">Album not found.</p>
                <button onClick={() => navigate("/dashboard/music")} className="text-accent text-sm hover:underline">
                    Back to Music
                </button>
            </div>
        );
    }

    const coverUrl = get_full_image_url(album.cover_image);
    const ratingLabel = get_rating_level(album.rating);
    const statusColor = STATUS_COLORS[album.status] || "text-text-secondary border-border bg-bg";

    return (
        <div className="flex-1 bg-bg overflow-y-auto custom-scrollbar">
            <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-6">
                {/* Back */}
                <button
                    onClick={() => navigate("/dashboard/music")}
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Music
                </button>

                <div className="flex flex-col sm:flex-row gap-8">
                    {/* Cover */}
                    <div className="flex flex-col gap-4 shrink-0">
                        <div
                            className="relative w-52 h-52 rounded-2xl overflow-hidden border border-border bg-surface cursor-pointer group shadow-lg"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {coverUrl ? (
                                <img src={coverUrl} alt={album.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface">
                                    <Disc size={56} className="text-text-secondary/30" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {isUploading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Pencil size={20} className="text-white" />
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => { setModalErrors({}); setIsModalOpen(true); }}
                                className="inline-flex items-center gap-2 justify-center bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
                            >
                                <Pencil size={14} />
                                Edit Album
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="inline-flex items-center gap-2 justify-center text-error hover:bg-error/10 border border-error/20 text-sm px-4 py-2 rounded-xl transition-all"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 flex-wrap mb-1">
                            <h1 className="text-text-primary text-2xl sm:text-3xl font-bold tracking-tight font-inter">
                                {album.title}
                            </h1>
                            <span className={`mt-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusColor}`}>
                                {STATUS_MAP[album.status] || album.status}
                            </span>
                        </div>

                        <p className="text-text-secondary text-sm mb-4 flex items-center gap-1.5">
                            <Mic size={14} />
                            {album.artist}
                            <span className="text-text-secondary/40 text-xs">
                                ({album.artist_type === "band" ? "Band" : "Solo"})
                            </span>
                        </p>

                        {album.status === "listened" && album.rating > 0 && (
                            <div className="flex items-center gap-2 mb-5">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={18}
                                            className={album.rating >= star * 2 ? "text-amber-400 fill-amber-400" : "text-border"}
                                        />
                                    ))}
                                </div>
                                <span className="text-text-primary text-sm font-semibold">{album.rating}/10</span>
                                {ratingLabel && <span className="text-text-secondary text-xs">· {ratingLabel}</span>}
                            </div>
                        )}

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                            {album.release_year && (
                                <div className="bg-surface border border-border rounded-xl p-3">
                                    <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <Calendar size={10} /> Year
                                    </p>
                                    <p className="text-text-primary text-sm font-semibold">{album.release_year}</p>
                                </div>
                            )}
                            {album.total_tracks && (
                                <div className="bg-surface border border-border rounded-xl p-3">
                                    <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <Music size={10} /> Tracks
                                    </p>
                                    <p className="text-text-primary text-sm font-semibold">{album.total_tracks}</p>
                                </div>
                            )}
                            {album.language && (
                                <div className="bg-surface border border-border rounded-xl p-3">
                                    <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <Globe size={10} /> Language
                                    </p>
                                    <p className="text-text-primary text-sm font-semibold">{album.language}</p>
                                </div>
                            )}
                            {album.platform && (
                                <div className="bg-surface border border-border rounded-xl p-3">
                                    <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <Disc size={10} /> Platform
                                    </p>
                                    <p className="text-text-primary text-sm font-semibold">{album.platform}</p>
                                </div>
                            )}
                            {album.created_at && (
                                <div className="bg-surface border border-border rounded-xl p-3">
                                    <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <Calendar size={10} /> Added
                                    </p>
                                    <p className="text-text-primary text-sm font-semibold">{formatDate(album.created_at)}</p>
                                </div>
                            )}
                        </div>

                        {/* Genres */}
                        {album.genres?.length > 0 && (
                            <div className="mb-5">
                                <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Tag size={10} /> Genres
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {album.genres.map((g) => (
                                        <span key={g} className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full border border-accent/20">
                                            {get_genre_display(g)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {album.description && (
                            <div className="mb-5">
                                <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-2">Description</p>
                                <p className="text-text-primary text-sm leading-relaxed">{album.description}</p>
                            </div>
                        )}

                        {album.review && (
                            <div className="bg-surface border border-border rounded-xl p-5">
                                <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <BookmarkPlus size={10} /> My Review
                                </p>
                                <p className="text-text-primary text-sm leading-relaxed italic">"{album.review}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Album"
                onConfirm={handleSave}
                confirmLabel={isUpdating ? "Saving..." : "Save Changes"}
                isLoading={isUpdating}
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Title</label>
                        <input
                            type="text"
                            value={modalData.title}
                            onChange={(e) => setModalData((p) => ({ ...p, title: e.target.value }))}
                            className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${modalErrors.title ? "border-error" : "border-border focus:border-accent"}`}
                        />
                        {modalErrors.title && <p className="text-error text-xs mt-1">{modalErrors.title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Artist</label>
                            <input
                                type="text"
                                value={modalData.artist}
                                onChange={(e) => setModalData((p) => ({ ...p, artist: e.target.value }))}
                                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            />
                        </div>
                        <Select
                            label="Artist Type"
                            value={modalData.artist_type}
                            options={[{ value: "solo", label: "Solo" }, { value: "band", label: "Band" }]}
                            onChange={(val) => setModalData((p) => ({ ...p, artist_type: val as "solo" | "band" }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Release Year</label>
                            <input
                                type="text"
                                maxLength={4}
                                value={modalData.release_year}
                                onChange={(e) => setModalData((p) => ({ ...p, release_year: e.target.value.replace(/\D/g, "") }))}
                                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Total Tracks</label>
                            <input
                                type="number"
                                value={modalData.total_tracks}
                                onChange={(e) => setModalData((p) => ({ ...p, total_tracks: e.target.value }))}
                                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Language</label>
                            <input
                                type="text"
                                value={modalData.language}
                                onChange={(e) => setModalData((p) => ({ ...p, language: e.target.value }))}
                                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Platform</label>
                            <input
                                type="text"
                                value={modalData.platform}
                                onChange={(e) => setModalData((p) => ({ ...p, platform: e.target.value }))}
                                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            />
                        </div>
                    </div>

                    <Select
                        label="Status"
                        value={modalData.status}
                        options={STATUS_OPTIONS}
                        onChange={(val) => setModalData((p) => ({ ...p, status: val as "wishlist" | "listened" }))}
                    />

                    <MultiSearchSelect
                        label="Genres"
                        options={GENRE_OPTIONS}
                        selected={modalData.genres}
                        onToggle={(g) => {
                            const next = modalData.genres.includes(g)
                                ? modalData.genres.filter((x) => x !== g)
                                : [...modalData.genres, g];
                            setModalData((p) => ({ ...p, genres: next }));
                        }}
                        onRemove={(g) => setModalData((p) => ({ ...p, genres: p.genres.filter((x) => x !== g) }))}
                        placeholder="Search genres..."
                    />

                    <div>
                        <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Description</label>
                        <textarea
                            value={modalData.description}
                            onChange={(e) => setModalData((p) => ({ ...p, description: e.target.value }))}
                            rows={3}
                            className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                        />
                    </div>

                    {modalData.status === "listened" && (
                        <>
                            <RatingInput
                                label="Rating"
                                value={modalData.rating}
                                onChange={(val) => setModalData((p) => ({ ...p, rating: val }))}
                                error={modalErrors.rating}
                            />
                            <div>
                                <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">Review</label>
                                <textarea
                                    value={modalData.review}
                                    onChange={(e) => setModalData((p) => ({ ...p, review: e.target.value }))}
                                    rows={4}
                                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                                />
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Album"
                message={`Are you sure you want to delete "${album.title}"? This cannot be undone.`}
            />
        </div>
    );
};

export default AlbumDetail;
