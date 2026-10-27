import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    ListMusic,
    Sparkles,
    Music,
    Disc,
    Trash2,
    Pencil,
    Plus,
    X,
    Mic,
    Star,
} from "lucide-react";
import {
    useGetPlaylistByIdQuery,
    useGetSongsListQuery,
    useGetAlbumsListQuery,
    useUpdatePlaylistMutation,
    useDeletePlaylistMutation,
    useAddToPlaylistMutation,
    useRemoveFromPlaylistMutation,
} from "../../../../@store/api/music.api";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { get_genre_display } from "../../../../@utils/genres";
import DeleteModal from "../../../../@components/DeleteModal";
import { toast } from "react-toast";

const PlaylistDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: playlist, isLoading } = useGetPlaylistByIdQuery(id);
    const [updatePlaylist] = useUpdatePlaylistMutation();
    const [deletePlaylist] = useDeletePlaylistMutation();
    const [addToPlaylist] = useAddToPlaylistMutation();
    const [removeFromPlaylist] = useRemoveFromPlaylistMutation();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addTab, setAddTab] = useState<"songs" | "albums">("songs");
    const [searchQ, setSearchQ] = useState("");

    const { data: songsData } = useGetSongsListQuery({ search: searchQ || undefined, limit: 20 }, { skip: !isAddModalOpen || addTab !== "songs" });
    const { data: albumsData } = useGetAlbumsListQuery({ search: searchQ || undefined, limit: 20 }, { skip: !isAddModalOpen || addTab !== "albums" });

    const handleDelete = async () => {
        try {
            await deletePlaylist(id!).unwrap();
            toast.success("Playlist deleted.");
            navigate("/dashboard/music?tab=playlists");
        } catch {
            toast.error("Failed to delete playlist.");
        }
    };

    const handleAdd = async (itemId: string, itemType: "song" | "album") => {
        try {
            await addToPlaylist({ playlist_id: id!, item_id: itemId, item_type: itemType }).unwrap();
            toast.success("Added to playlist!");
        } catch {
            toast.error("Failed to add to playlist.");
        }
    };

    const handleRemove = async (itemId: string) => {
        try {
            await removeFromPlaylist({ playlist_id: id!, item_id: itemId }).unwrap();
            toast.success("Removed from playlist.");
        } catch {
            toast.error("Failed to remove.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 bg-bg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="flex-1 bg-bg flex flex-col items-center justify-center gap-4">
                <ListMusic size={48} className="text-text-secondary/30" />
                <p className="text-text-secondary">Playlist not found.</p>
                <button onClick={() => navigate("/dashboard/music?tab=playlists")} className="text-accent text-sm hover:underline">
                    Back to Playlists
                </button>
            </div>
        );
    }

    const items = playlist.items || [];
    const isSmartPlaylist = playlist.type === "smart";

    const smartFilterText = isSmartPlaylist && playlist.smart_filter
        ? [
              playlist.smart_filter.artist && `Artist: ${playlist.smart_filter.artist}`,
              playlist.smart_filter.genre && `Genre: ${get_genre_display(playlist.smart_filter.genre)}`,
              playlist.smart_filter.year && `Year: ${playlist.smart_filter.year}`,
          ]
              .filter(Boolean)
              .join(" · ")
        : "";

    const addableSongs = (songsData?.songs || []).filter(
        (s: any) => !items.some((it) => it.item_id === s._id && it.item_type === "song")
    );
    const addableAlbums = (albumsData?.albums || []).filter(
        (a: any) => !items.some((it) => it.item_id === a._id && it.item_type === "album")
    );

    return (
        <div className="flex-1 bg-bg overflow-y-auto custom-scrollbar">
            <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-6">
                {/* Back */}
                <button
                    onClick={() => navigate("/dashboard/music?tab=playlists")}
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Playlists
                </button>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                            {isSmartPlaylist ? (
                                <Sparkles size={28} className="text-accent" />
                            ) : (
                                <ListMusic size={28} className="text-accent" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-text-primary text-2xl font-bold tracking-tight font-inter">
                                {playlist.name}
                            </h1>
                            {playlist.description && (
                                <p className="text-text-secondary text-sm mt-1">{playlist.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${isSmartPlaylist ? "text-purple-400 border-purple-400/30 bg-purple-400/5" : "text-accent border-accent/30 bg-accent/5"}`}>
                                    {isSmartPlaylist ? "Smart Playlist" : "Manual Playlist"}
                                </span>
                                <span className="text-text-secondary text-xs">{items.length} item{items.length !== 1 ? "s" : ""}</span>
                            </div>
                            {isSmartPlaylist && smartFilterText && (
                                <p className="text-text-secondary text-xs mt-1.5">{smartFilterText}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {!isSmartPlaylist && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
                            >
                                <Plus size={14} />
                                Add
                            </button>
                        )}
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="inline-flex items-center gap-2 text-error hover:bg-error/10 border border-error/20 text-sm px-3 py-2 rounded-xl transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Items */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <ListMusic size={48} className="text-text-secondary/30" />
                        <p className="text-text-secondary text-sm">This playlist is empty.</p>
                        {!isSmartPlaylist && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-accent/90 transition-all"
                            >
                                <Plus size={14} />
                                Add Songs or Albums
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {items.map((item) => (
                            <div key={item.item_id} className="flex items-center gap-4 bg-surface border border-border rounded-xl p-3 group">
                                <div className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0">
                                    {item.item_type === "song" ? (
                                        <Music size={16} className="text-text-secondary/50" />
                                    ) : (
                                        <Disc size={16} className="text-text-secondary/50" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-text-primary text-sm font-medium">
                                        {item.item_type === "song" ? "Song" : "Album"} ID: {item.item_id.slice(-8)}
                                    </p>
                                    <p className="text-text-secondary text-xs capitalize">{item.item_type}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        to={`/dashboard/music/${item.item_type}/${item.item_id}`}
                                        className="text-accent text-xs hover:underline"
                                    >
                                        View
                                    </Link>
                                    {!isSmartPlaylist && (
                                        <button
                                            onClick={() => handleRemove(item.item_id)}
                                            className="text-text-secondary hover:text-error transition-colors p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Items Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
                            <h2 className="text-text-primary text-base font-semibold">Add to Playlist</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-border shrink-0">
                            <div className="flex gap-2 mb-3">
                                {(["songs", "albums"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => { setAddTab(t); setSearchQ(""); }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${addTab === t ? "bg-accent text-white" : "bg-bg text-text-secondary hover:text-text-primary border border-border"}`}
                                    >
                                        {t === "songs" ? <Music size={12} /> : <Disc size={12} />}
                                        {t === "songs" ? "Songs" : "Albums"}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder={`Search ${addTab}...`}
                                value={searchQ}
                                onChange={(e) => setSearchQ(e.target.value)}
                                className="w-full bg-bg border border-border rounded-xl py-2 px-3 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            />
                        </div>

                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            {(addTab === "songs" ? addableSongs : addableAlbums).map((item: any) => {
                                const coverUrl = get_full_image_url(item.cover_image);
                                return (
                                    <button
                                        key={item._id}
                                        onClick={() => handleAdd(item._id, addTab === "songs" ? "song" : "album")}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg/60 transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-bg border border-border">
                                            {coverUrl ? (
                                                <img src={coverUrl} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {addTab === "songs" ? <Music size={14} className="text-text-secondary/40" /> : <Disc size={14} className="text-text-secondary/40" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-text-primary text-sm font-medium truncate">{item.title}</p>
                                            <p className="text-text-secondary text-xs truncate flex items-center gap-1">
                                                <Mic size={10} /> {item.artist}
                                            </p>
                                        </div>
                                        {item.rating > 0 && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Star size={11} className="text-amber-400 fill-amber-400" />
                                                <span className="text-text-secondary text-xs">{item.rating}</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                            {(addTab === "songs" ? addableSongs : addableAlbums).length === 0 && (
                                <div className="py-10 text-center text-text-secondary text-sm">
                                    No {addTab} found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Playlist"
                message={`Are you sure you want to delete "${playlist.name}"? This cannot be undone.`}
            />
        </div>
    );
};

export default PlaylistDetail;
