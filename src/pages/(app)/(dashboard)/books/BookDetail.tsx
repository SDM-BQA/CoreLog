import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  Pencil,
  Trash2,
  Tag,
  BookmarkCheck,
  CalendarPlus,
  BookOpen,
  User,
  ChevronDown,
  Sparkles,
  Hash,
  Globe,
  Building2,
} from "lucide-react";
import { get_book_query, update_book_mutation, delete_book_mutation } from "../../../../@apis/books";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { toast } from "react-toast";
import Modal from "../../../../@components/Modal";

interface Book {
  _id: string;
  title: string;
  author: string;
  cover_image: string;
  rating: number;
  genres: string[];
  status: "read" | "reading" | "want_to_read" | "not_finished";
  review?: string;
  description?: string;
  publication_year?: string;
  page_count?: number;
  publisher?: string;
  language?: string;
  created_at?: string;
}

const STATUS_MAP = {
  want_to_read: "Wants to Read",
  reading: "Reading",
  read: "Read",
  not_finished: "Not Finished",
};

const STATUS_COLORS: Record<string, string> = {
  read: "text-green-500",
  want_to_read: "text-yellow-500",
  reading: "text-blue-500",
  not_finished: "text-red-500",
};

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>("want_to_read");
  
  // Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    rating: 0,
    description: "",
    review: ""
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await get_book_query(id);
        if (data) {
          setBook(data);
          setCurrentStatus(data.status);
        }
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-bg flex-1 flex flex-col items-center justify-center gap-4 p-6 text-text-secondary">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-bg flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-sm">
          <BookOpen size={36} className="text-text-secondary/40" />
        </div>
        <div className="text-center">
          <p className="text-text-primary text-lg font-semibold mb-1">
            Book not found
          </p>
          <p className="text-text-secondary text-sm mb-4">
            The book you're looking for doesn't exist in your collection.
          </p>
          <Link
            to="/dashboard/books"
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface/80 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to collection
          </Link>
        </div>
      </div>
    );
  }

  // Handle status update
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    
    if (newStatus === "read") {
      setModalData({
        rating: book.rating || 0,
        description: book.description || "",
        review: book.review || ""
      });
      setModalError(null);
      setIsStatusModalOpen(true);
      // We don't update status yet, wait for modal save
    } else {
      setCurrentStatus(newStatus);
      try {
        await update_book_mutation(book._id, { status: newStatus });
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  const handleModalSave = async () => {
    if (!book) return;
    if (modalData.rating === 0) {
      setModalError("Please provide a rating for the book you've completed.");
      return;
    }
    setModalError(null);
    try {
      await update_book_mutation(book._id, {
        status: "read",
        rating: modalData.rating,
        description: modalData.description,
        review: modalData.review
      });
      
      // Update local state
      setBook({
        ...book,
        status: "read",
        rating: modalData.rating,
        description: modalData.description,
        review: modalData.review
      });
      setCurrentStatus("read");
      setIsStatusModalOpen(false);
      toast.success("Book details updated successfully!");
    } catch (error) {
      console.error("Error saving status details:", error);
      toast.error("Failed to save changes. Please try again.");
    }
  };

  const handleEditClick = () => {
    setModalData({
      rating: book.rating || 0,
      description: book.description || "",
      review: book.review || ""
    });
    setModalError(null);
    setIsStatusModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!book) return;
    try {
      await delete_book_mutation(book._id);
      toast.success(`"${book.title}" has been deleted.`);
      setIsDeleteModalOpen(false);
      navigate("/dashboard/books");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete the book.");
    }
  };

  return (
    <div className="bg-bg flex-1 overflow-y-auto">
      {/* ── Hero Section with blurred cover background ── */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Blurred backdrop */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={get_full_image_url(book.cover_image)}
            alt=""
            className="w-full h-full object-cover scale-125 blur-3xl opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/80 to-bg" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[920px] mx-auto px-6 pt-8 pb-12">
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard/books")}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-medium mb-8 transition-colors group w-fit"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to collection
          </button>

          <div className="flex flex-col sm:flex-row gap-8 md:gap-10 items-center sm:items-start text-center sm:text-left">
            {/* ── Cover Image ── */}
            <div className="w-[200px] sm:w-[240px] shrink-0">
              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-border shadow-2xl bg-surface">
                <img
                  src={get_full_image_url(book.cover_image, "book")}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* ── Book Info ── */}
            <div className="flex-1 min-w-0 flex flex-col pt-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-text-primary text-3xl sm:text-4xl font-bold tracking-tight font-inter leading-tight">
                  {book.title}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-current opacity-80 ${STATUS_COLORS[currentStatus] || "text-text-secondary border-border"}`}>
                  {STATUS_MAP[currentStatus as keyof typeof STATUS_MAP]}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-text-primary text-lg font-medium mb-6">
                <User size={18} className="text-text-secondary" />
                {book.author}
              </div>

              {/* Status and Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-8">
                {/* Interactive Status Changer */}
                <div className="relative inline-flex items-center">
                  <BookmarkCheck
                    size={14}
                    className={`absolute left-3 pointer-events-none ${STATUS_COLORS[currentStatus] || "text-text-primary"}`}
                  />
                  <select
                    value={currentStatus}
                    onChange={handleStatusChange}
                    className={`appearance-none cursor-pointer pl-9 pr-8 py-2 text-sm font-semibold rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors outline-none focus:ring-2 focus:ring-accent/50 ${
                      STATUS_COLORS[currentStatus] || "text-text-primary"
                    }`}
                    aria-label="Change book status"
                  >
                    {Object.entries(STATUS_MAP).map(([value, label]) => (
                      <option key={value} value={value} className="text-text-primary">
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 pointer-events-none text-text-secondary"
                  />
                </div>

                <div className="h-6 w-px bg-border hidden sm:block"></div>

                {/* Standard Actions */}
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="inline-flex items-center gap-2 bg-surface border border-border hover:bg-surface-hover text-text-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Pencil size={15} className="text-text-secondary" />
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 bg-surface border border-border hover:border-red-500/50 hover:bg-red-500/5 text-text-secondary hover:text-red-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>

              {/* Meta details grid */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 sm:gap-6 text-sm text-text-secondary bg-surface/50 p-4 rounded-xl border border-border/50">
                {/* Rating */}
                {(currentStatus === "read" || book.rating > 0) && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">
                      Rating
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="text-text-primary font-semibold">
                        {book.rating.toFixed(1)}{" "}
                        <span className="text-text-secondary font-normal">
                          / 5.0
                        </span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Published */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">
                    Published
                  </span>
                  <div className="flex items-center gap-1.5 text-text-primary uppercase">
                    <Calendar size={14} className="text-text-secondary" />
                    {book.publication_year || "N/A"}
                  </div>
                </div>

                {/* Page Count */}
                {book.page_count !== undefined && book.page_count > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">
                      Pages
                    </span>
                    <div className="flex items-center gap-1.5 text-text-primary">
                      <Hash size={14} className="text-text-secondary" />
                      {book.page_count}
                    </div>
                  </div>
                )}

                {/* Language */}
                {book.language && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">
                      Language
                    </span>
                    <div className="flex items-center gap-1.5 text-text-primary uppercase">
                      <Globe size={14} className="text-text-secondary" />
                      {book.language}
                    </div>
                  </div>
                )}

                {/* Publisher */}
                {book.publisher && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">
                      Publisher
                    </span>
                    <div className="flex items-center gap-1.5 text-text-primary">
                      <Building2 size={14} className="text-text-secondary" />
                      {book.publisher}
                    </div>
                  </div>
                )}

                {/* Added */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">
                    Added On
                  </span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <CalendarPlus size={14} className="text-text-secondary" />
                    {new Date(book.created_at || Date.now()).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-6 flex-wrap">
                <Tag size={14} className="text-text-secondary" />
                {book.genres?.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary/30 transition-colors cursor-default"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Sections ── */}
      <div className="max-w-[920px] mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Synopsis Section */}
        <section>
          <h2 className="text-text-primary text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-text-secondary" />
            Synopsis
          </h2>
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <p className={book.description ? "text-text-secondary text-base leading-relaxed whitespace-pre-line" : "text-text-secondary/40 text-sm italic"}>
              {book.description || "No synopsis provided for this book yet."}
            </p>
          </div>
        </section>

        {/* Review Section (Conditional to Read) */}
        {currentStatus === "read" && (
          <section>
            <h2 className="text-text-primary text-lg font-bold mb-4 flex items-center gap-2">
              <Pencil size={20} className="text-text-secondary" />
              Personal Review
            </h2>
            <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
              <p className={book.review ? "text-text-secondary text-base leading-relaxed whitespace-pre-line" : "text-text-secondary/40 text-sm italic"}>
                {book.review || "No review added yet. Share your thoughts to help others!"}
              </p>
            </div>
          </section>
        )}
      </div>
      {/* Read Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setCurrentStatus(book.status); // Revert to old status if cancelled
        }}
        title="Completion Details"
        footer={
          <div className="flex justify-end gap-3">
             <button
              onClick={() => {
                setIsStatusModalOpen(false);
                setCurrentStatus(book.status);
              }}
              className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleModalSave}
              className="bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95"
            >
              Update Status
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3 py-4 bg-bg/40 rounded-2xl border border-border/50">
            <label className="text-text-secondary text-[10px] font-bold tracking-widest uppercase italic">
              Rate your adventure
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setModalData({ ...modalData, rating: star })}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-all hover:scale-125"
                >
                  <Star
                    size={32}
                    className={
                      star <= (hoverRating || modalData.rating)
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                        : "fill-transparent text-text-secondary/20"
                    }
                  />
                </button>
              ))}
            </div>
            {(hoverRating || modalData.rating) > 0 && (
              <p className="text-accent font-bold text-lg animate-fade-in">
                {(hoverRating || modalData.rating)}.0 <span className="text-text-secondary font-medium">/ 5.0</span>
              </p>
            )}
          </div>

          {/* Synopsis */}
          <div>
            <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
              Synopsis
            </label>
            <textarea
              placeholder="A brief summary of the book plot..."
              value={modalData.description}
              onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
              rows={3}
              className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
            />
          </div>

          {/* Personal Review */}
          <div>
            <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
              Your Review
            </label>
            <textarea
              placeholder="What did you think of this book? Share your thoughts..."
              value={modalData.review}
              onChange={(e) => setModalData({ ...modalData, review: e.target.value })}
              rows={5}
              className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
            />
            {modalError && (
              <p className="text-error text-xs mt-3 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="w-1 h-1 rounded-full bg-error" />
                {modalError}
              </p>
            )}
            <p className="text-text-secondary text-[10px] mt-2 italic flex items-center gap-1.5 opacity-70">
              <Sparkles size={12} className="text-accent" />
              Tip: Your review helps others explore this book too.
            </p>
          </div>
        </div>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Book"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
            >
              Delete Book
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 size={32} className="text-red-500" />
          </div>
          <h3 className="text-text-primary text-lg font-bold mb-2">Are you sure?</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            This action cannot be undone. This will permanently delete <span className="text-text-primary font-semibold">"{book?.title}"</span> from your collection.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default BookDetail;
