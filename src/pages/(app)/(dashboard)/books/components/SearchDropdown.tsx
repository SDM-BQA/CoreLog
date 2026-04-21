import React from "react";
import { Search, Loader2, BookOpen } from "lucide-react";
import { GoogleBook } from "../AddBook";

interface SearchDropdownProps {
  isSearching: boolean;
  searchResults: GoogleBook[];
  onSelect: (book: GoogleBook) => void;
  onClose: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isSearching,
  searchResults,
  onSelect,
  onClose,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {isSearching ? (
          <div className="flex items-center justify-center p-8 gap-3 text-text-secondary">
            <Loader2 size={18} className="animate-spin text-accent" />
            <span className="text-sm">Searching library...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="max-h-[360px] overflow-y-auto py-2 custom-scrollbar">
            {searchResults.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => onSelect(book)}
                className="w-full text-left px-4 py-3 hover:bg-bg/50 transition-colors flex gap-4 items-start group border-b border-border/30 last:border-0"
              >
                <div className="w-12 h-16 rounded bg-bg shrink-0 overflow-hidden border border-border/50">
                  {book.volumeInfo.imageLinks?.thumbnail ? (
                    <img
                      src={book.volumeInfo.imageLinks.thumbnail.replace(
                        "http:",
                        "https:"
                      )}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={16} className="text-text-secondary/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-text-primary text-sm font-bold truncate group-hover:text-accent transition-colors">
                    {book.volumeInfo.title}
                  </h4>
                  <p className="text-text-secondary text-xs mt-1 truncate">
                    {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] bg-bg px-1.5 py-0.5 rounded text-text-secondary">
                      {book.volumeInfo.publishedDate?.split("-")[0] || "N/A"}
                    </span>
                    {book.volumeInfo.pageCount && (
                      <span className="text-[10px] text-text-secondary/60">
                        {book.volumeInfo.pageCount} pages
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-text-secondary/30" />
            </div>
            <p className="text-text-primary text-sm font-medium">
              No books found
            </p>
            <p className="text-text-secondary text-xs mt-1">
              Try a different title or enter manually.
            </p>
          </div>
        )}
        <div className="bg-bg/30 px-4 py-2 border-t border-border flex justify-between items-center">
          <span className="text-[10px] text-text-secondary/70 uppercase font-bold tracking-widest">
            Google Books Search
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] text-accent font-bold hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchDropdown;
