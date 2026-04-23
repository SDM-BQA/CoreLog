import { useEffect, useState, useRef } from "react";
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
  Hash,
  Globe,
  Building2,
  PlayCircle,
  CheckCircle2,
  Camera,
  Library,
} from "lucide-react";
import { get_book_query, update_book_mutation, delete_book_mutation } from "../../../../@apis/books";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { upload_image_api } from "../../../../@apis/users";
import { toast } from "react-toast";
import Modal from "../../../../@components/Modal";
import DeleteModal from "../../../../@components/DeleteModal";
import RatingInput from "../../../../@components/RatingInput";
import { get_genre_display } from "../../../../@utils/genres";

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
  started_from?: string;
  finished_on?: string;
  series_name?: string;
  series_number?: number;
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
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  // Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    author: "",
    publication_year: "",
    page_count: 0,
    publisher: "",
    language: "",
    started_from: "",
    finished_on: "",
    rating: 0,
    description: "",
    review: "",
    isPartOfSeries: false,
    series_name: "",
    series_number: 0
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editView, setEditView] = useState<"all" | "synopsis" | "review" | "status_update">("all");

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
      setCurrentStatus("read");
      setEditView("status_update");
      setModalData({
        title: book.title,
        author: book.author,
        publication_year: book.publication_year || "",
        page_count: book.page_count || 0,
        publisher: book.publisher || "",
        language: book.language || "",
        rating: book.rating || 0,
        description: book.description || "",
        review: book.review || "",
        started_from: book.started_from ? new Date(book.started_from).toLocaleDateString('en-CA') : "",
        finished_on: book.finished_on ? new Date(book.finished_on).toLocaleDateString('en-CA') : "",
        isPartOfSeries: !!book.series_name,
        series_name: book.series_name || "",
        series_number: book.series_number || 0
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
    if (currentStatus === "read" && modalData.rating === 0) {
      setModalError("Please provide a rating for the book you've completed.");
      return;
    }

    // New Validations
    if (modalData.page_count < 0) {
      setModalError("Page count cannot be negative.");
      return;
    }

    const currentYear = new Date().getFullYear();
    const pubYear = parseInt(modalData.publication_year);
    if (modalData.publication_year && (isNaN(pubYear) || pubYear < 0 || pubYear > currentYear + 5)) {
      setModalError("Please enter a valid publication year.");
      return;
    }

    if (modalData.isPartOfSeries) {
      if (!modalData.series_name || modalData.series_name.trim() === "") {
        setModalError("Series name cannot be blank if 'Part of a series' is checked.");
        return;
      }
      if (modalData.series_number === undefined || modalData.series_number < 0) {
        setModalError("Series number cannot be negative.");
        return;
      }
    }

    setModalError(null);
    try {
      await update_book_mutation(book._id, {
        status: currentStatus === "read" ? "read" : currentStatus, // Keep current status if editing via button
        title: modalData.title,
        author: modalData.author,
        publication_year: modalData.publication_year,
        page_count: modalData.page_count,
        publisher: modalData.publisher,
        language: modalData.language,
        rating: modalData.rating,
        description: modalData.description,
        review: modalData.review,
        started_from: modalData.started_from || undefined,
        finished_on: modalData.finished_on || undefined,
        series_name: modalData.isPartOfSeries ? modalData.series_name : undefined,
        series_number: modalData.isPartOfSeries ? modalData.series_number : undefined
      });
      
      // Update local state
      setBook({
        ...book,
        title: modalData.title,
        author: modalData.author,
        publication_year: modalData.publication_year,
        page_count: modalData.page_count,
        publisher: modalData.publisher,
        language: modalData.language,
        rating: modalData.rating,
        description: modalData.description,
        review: modalData.review,
        started_from: modalData.started_from || undefined,
        finished_on: modalData.finished_on || undefined,
        series_name: modalData.isPartOfSeries ? modalData.series_name : undefined,
        series_number: modalData.isPartOfSeries ? modalData.series_number : undefined
      });
      setIsStatusModalOpen(false);
      toast.success("Book details updated successfully!");
    } catch (error) {
      console.error("Error saving status details:", error);
      toast.error("Failed to save changes. Please try again.");
    }
  };

  const handleEditClick = () => {
    setEditView("all");
    setModalData({
      title: book.title,
      author: book.author,
      publication_year: book.publication_year || "",
      page_count: book.page_count || 0,
      publisher: book.publisher || "",
      language: book.language || "",
      rating: book.rating || 0,
      description: book.description || "",
      review: book.review || "",
      started_from: book.started_from ? new Date(book.started_from).toLocaleDateString('en-CA') : "",
      finished_on: book.finished_on ? new Date(book.finished_on).toLocaleDateString('en-CA') : "",
      isPartOfSeries: !!book.series_name,
      series_name: book.series_name || "",
      series_number: book.series_number || 0
    });
    setModalError(null);
    setIsStatusModalOpen(true);
  };

  const handleSectionEdit = (view: "synopsis" | "review") => {
    setEditView(view);
    setModalData({
      title: book.title,
      author: book.author,
      publication_year: book.publication_year || "",
      page_count: book.page_count || 0,
      publisher: book.publisher || "",
      language: book.language || "",
      rating: book.rating || 0,
      description: book.description || "",
      review: book.review || "",
      started_from: book.started_from ? new Date(book.started_from).toLocaleDateString('en-CA') : "",
      finished_on: book.finished_on ? new Date(book.finished_on).toLocaleDateString('en-CA') : "",
      isPartOfSeries: !!book.series_name,
      series_name: book.series_name || "",
      series_number: book.series_number || 0
    });
    setModalError(null);
    setIsStatusModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !book) return;
    try {
      setCoverUploading(true);
      const url = await upload_image_api(file);
      await update_book_mutation(book._id, { cover_image: url });
      setBook({ ...book, cover_image: url });
      toast.success("Cover image updated!");
    } catch (error) {
      console.error("Error updating cover:", error);
      toast.error("Failed to update cover image.");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
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
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar">
      {/* ── Hero Section with blurred cover background ── */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Blurred backdrop */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={get_full_image_url(book.cover_image)}
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).src = get_full_image_url(undefined, "book"); }}
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
              <div
                className="relative w-full aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-border shadow-2xl bg-surface group cursor-pointer"
                onClick={() => coverInputRef.current?.click()}
              >
                <img
                  src={get_full_image_url(book.cover_image, "book")}
                  alt={book.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = get_full_image_url(undefined, "book"); }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Change Cover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {coverUploading ? (
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera size={28} className="text-white" />
                      <span className="text-white text-xs font-semibold tracking-wide">Change Cover</span>
                    </>
                  )}
                </div>
              </div>
              {/* Hidden file input */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
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

                {/* Series */}
                {book.series_name && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">
                      Series
                    </span>
                    <div className="flex items-center gap-1.5 text-text-primary">
                      <Library size={14} className="text-text-secondary" />
                      {book.series_name} {book.series_number ? `#${book.series_number}` : ""}
                    </div>
                  </div>
                )}

                {/* Added On - Always show */}
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

                {/* Started From - Only for Reading, Read, Not Finished */}
                {currentStatus !== "want_to_read" && book.started_from && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">
                      Started
                    </span>
                    <div className="flex items-center gap-1.5 text-text-primary">
                      <PlayCircle size={14} className="text-blue-400" />
                      {new Date(book.started_from).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                )}

                {/* Finished On - Only for Read */}
                {currentStatus === "read" && book.finished_on && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary/70">
                      Finished
                    </span>
                    <div className="flex items-center gap-1.5 text-text-primary">
                      <CheckCircle2 size={14} className="text-green-400" />
                      {new Date(book.finished_on).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-6 flex-wrap">
                <Tag size={14} className="text-text-secondary" />
                {book.genres?.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary/30 transition-colors cursor-default"
                  >
                    {get_genre_display(g)}
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
          <div className="flex items-center justify-between mb-4 group/header">
            <h2 className="text-text-primary text-lg font-bold flex items-center gap-2">
              <BookOpen size={20} className="text-text-secondary" />
              Synopsis
            </h2>
            <button
              onClick={() => handleSectionEdit("synopsis")}
              className="p-2 text-text-secondary hover:text-accent hover:bg-accent/5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium border border-border/50"
            >
              <Pencil size={14} />
              Edit Synopsis
            </button>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <p className={book.description ? "text-text-secondary text-base leading-relaxed whitespace-pre-line" : "text-text-secondary/40 text-sm italic"}>
              {book.description || "No synopsis provided for this book yet."}
            </p>
          </div>
        </section>

        {/* Review Section (Conditional to Read or Not Finished) */}
        {(currentStatus === "read" || currentStatus === "not_finished") && (
          <section>
            <div className="flex items-center justify-between mb-4 group/header">
              <h2 className="text-text-primary text-lg font-bold flex items-center gap-2">
                <Pencil size={20} className="text-text-secondary" />
                {currentStatus === "not_finished" ? "Notes" : "Personal Review"}
              </h2>
              <button
                onClick={() => handleSectionEdit("review")}
                className="p-2 text-text-secondary hover:text-accent hover:bg-accent/5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium border border-border/50"
              >
                <Pencil size={14} />
                Edit {currentStatus === "not_finished" ? "Notes" : "Review"}
              </button>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
              <p className={book.review ? "text-text-secondary text-base leading-relaxed whitespace-pre-line" : "text-text-secondary/40 text-sm italic"}>
                {book.review || (currentStatus === "not_finished" ? "No notes added yet." : "No review added yet. Share your thoughts to help others!")}
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
        title={
          editView === "synopsis" 
            ? "Edit Synopsis" 
            : editView === "review" 
              ? (currentStatus === "not_finished" ? "Edit Notes" : "Edit Review")
              : editView === "status_update"
                ? "Completion Details"
                : "Edit Details"
        }
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
          {/* Basic Info & Metadata - Only in All mode */}
          {editView === "all" && (
            <>
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    value={modalData.title}
                    onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Author
                  </label>
                  <input
                    type="text"
                    value={modalData.author}
                    onChange={(e) => setModalData({ ...modalData, author: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Year
                  </label>
                  <input
                    type="text"
                    value={modalData.publication_year}
                    onChange={(e) => setModalData({ ...modalData, publication_year: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Pages
                  </label>
                  <input
                    type="number"
                    value={modalData.page_count}
                    onChange={(e) => setModalData({ ...modalData, page_count: parseInt(e.target.value) || 0 })}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Language
                  </label>
                  <input
                    type="text"
                    value={modalData.language}
                    onChange={(e) => setModalData({ ...modalData, language: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all uppercase"
                  />
                </div>
                <div className="col-span-1 sm:col-span-1">
                  <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={modalData.publisher}
                    onChange={(e) => setModalData({ ...modalData, publisher: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>

              {/* Series Information */}
              <div className="mt-2 mb-4 p-4 border border-border rounded-xl bg-surface/50">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-bg/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={modalData.isPartOfSeries}
                    onChange={(e) => setModalData({ ...modalData, isPartOfSeries: e.target.checked })}
                    className="w-4 h-4 rounded text-accent bg-surface border-border focus:ring-accent/20"
                  />
                  <span className="text-sm font-semibold text-text-primary">This book is part of a series</span>
                </label>
                
                {modalData.isPartOfSeries && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                        Series Name
                      </label>
                      <input
                        type="text"
                        value={modalData.series_name}
                        onChange={(e) => setModalData({ ...modalData, series_name: e.target.value })}
                        className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                        Book Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={modalData.series_number || ""}
                        onChange={(e) => setModalData({ ...modalData, series_number: parseInt(e.target.value) || 0 })}
                        className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Date Inputs - Conditional */}
          {(editView === "all" || editView === "status_update") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentStatus !== "want_to_read" && (
                  <div>
                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={modalData.started_from}
                      onChange={(e) => setModalData({ ...modalData, started_from: e.target.value })}
                      className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all"
                    />
                  </div>
                )}
                {currentStatus === "read" && (
                  <div>
                    <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                      Finish Date
                    </label>
                    <input
                      type="date"
                      value={modalData.finished_on}
                      onChange={(e) => setModalData({ ...modalData, finished_on: e.target.value })}
                      className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent transition-all"
                    />
                  </div>
                )}
              </div>
          )}

          {/* Star Rating - Show in All, Review, or Status Update mode if Read */}
          {(editView === "all" || editView === "review" || editView === "status_update") && currentStatus === "read" && (
            <RatingInput
              value={modalData.rating}
              onChange={(val) => setModalData({ ...modalData, rating: val })}
            />
          )}

          {/* Synopsis - Only in Synopsis mode */}
          {editView === "synopsis" && (
            <div>
              <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                Synopsis
              </label>
              <textarea
                placeholder="A brief summary..."
                value={modalData.description}
                onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                rows={12}
                className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
              />
            </div>
          )}

          {/* Personal Review / Notes - Show in Review or Status Update mode if applicable */}
          {(editView === "review" || editView === "status_update") && (currentStatus === "read" || currentStatus === "not_finished") && (
            <div>
              <label className="text-text-primary text-xs font-semibold mb-2 block tracking-wider uppercase">
                {currentStatus === "not_finished" ? "Notes" : "Your Review"}
              </label>
              <textarea
                placeholder={currentStatus === "not_finished" ? "Why did you stop reading this book?" : "What did you think of this book?"}
                value={modalData.review}
                onChange={(e) => setModalData({ ...modalData, review: e.target.value })}
                rows={12}
                className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
              />
            </div>
          )}
          
          {modalError && (
            <p className="text-error text-xs mt-3 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="w-1 h-1 rounded-full bg-error" />
              {modalError}
            </p>
          )}
        </div>
      </Modal>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Book"
        itemName={book?.title ?? ""}
      />
    </div>
  );
};

export default BookDetail;
