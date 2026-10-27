import React from "react";
import { Search, Loader2, BookOpen, Film } from "lucide-react";

/**
 * Represents a single book result from the Google Books API.
 */
export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
    pageCount?: number;
    publisher?: string;
    language?: string;
  };
}

/**
 * Represents a single movie result from the TMDB API.
 */
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  genre_ids: number[];
  poster_path: string | null;
  vote_average: number;
  original_language?: string;
}

/**
 * Represents a single series result from the TMDB API.
 */
export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  genre_ids: number[];
  poster_path: string | null;
  vote_average: number;
  original_language?: string;
  origin_country?: string[];
}

type SearchResult = GoogleBook | TMDBMovie | TMDBSeries;

interface SearchDropdownProps {
  isSearching: boolean;
  searchResults: SearchResult[];
  onSelect: (item: any) => void;
  onClose: () => void;
  type?: "book" | "movie" | "series";
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isSearching,
  searchResults,
  onSelect,
  onClose,
  type = "book",
}) => {
  const isBook = (item: SearchResult): item is GoogleBook => "volumeInfo" in item;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {isSearching ? (
          <div className="flex items-center justify-center p-8 gap-3 text-text-secondary">
            <Loader2 size={18} className="animate-spin text-accent" />
            <span className="text-sm">Searching {type === "book" ? "library" : type === "movie" ? "cinema" : "shows"}...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="max-h-[360px] overflow-y-auto py-2 custom-scrollbar">
            {searchResults.map((item) => {
              const id = isBook(item) ? item.id : item.id.toString();
              
              // Handle Movie vs Series vs Book titles
              const title = isBook(item) 
                ? item.volumeInfo.title 
                : (item as TMDBMovie).title || (item as TMDBSeries).name;

              const subtitle = isBook(item) 
                ? item.volumeInfo.authors?.join(", ") || "Unknown Author"
                : item.overview;

              // Handle different date fields
              const rawDate = isBook(item) 
                ? item.volumeInfo.publishedDate 
                : (item as TMDBMovie).release_date || (item as TMDBSeries).first_air_date;
              const date = rawDate?.split("-")[0];

              const image = isBook(item)
                ? item.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:")
                : item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : null;
              
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="w-full text-left px-4 py-3 hover:bg-bg/50 transition-colors flex gap-4 items-start group border-b border-border/30 last:border-0"
                >
                  <div className="w-12 h-16 rounded bg-bg shrink-0 overflow-hidden border border-border/50">
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {type === "book" ? (
                          <BookOpen size={16} className="text-text-secondary/20" />
                        ) : (
                          <Film size={16} className="text-text-secondary/20" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-text-primary text-sm font-bold truncate group-hover:text-accent transition-colors">
                      {title}
                    </h4>
                    <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                      {subtitle || (type === "book" ? "Unknown Author" : "No description available")}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {date && (
                        <span className="text-[10px] bg-bg px-1.5 py-0.5 rounded text-text-secondary">
                          {date}
                        </span>
                      )}
                      {isBook(item) && item.volumeInfo.pageCount && (
                        <span className="text-[10px] text-text-secondary/60">
                          {item.volumeInfo.pageCount} pages
                        </span>
                      )}
                      {!isBook(item) && item.vote_average > 0 && (
                        <span className="text-[10px] text-text-secondary/60">
                          Rating: {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-text-secondary/30" />
            </div>
            <p className="text-text-primary text-sm font-medium">No {type === "book" ? "books" : type === "movie" ? "movies" : "shows"} found</p>
            <p className="text-text-secondary text-xs mt-1">
              Try a different title or enter manually.
            </p>
          </div>
        )}
        <div className="bg-bg/30 px-4 py-2 border-t border-border flex justify-between items-center">
          <span className="text-[10px] text-text-secondary/70 uppercase font-bold tracking-widest">
            {type === "book" ? "Google Books Search" : type === "movie" ? "TMDB Movie Search" : "TMDB Series Search"}
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
