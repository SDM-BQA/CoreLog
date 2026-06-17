import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface MultiSearchSelectProps {
  label?: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  onRemove: (option: string) => void;
  placeholder?: string;
  error?: string;
}

const MultiSearchSelect: React.FC<MultiSearchSelectProps> = ({
  label,
  options,
  selected,
  onToggle,
  onRemove,
  placeholder = "Search and select...",
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex flex-col gap-2" ref={containerRef}>
      {label && (
        <label className="text-text-primary text-xs font-semibold uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Selected Items Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-[11px] font-bold border border-accent/20"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="hover:bg-accent/20 rounded-full p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input Trigger */}
      <div
        className={`relative w-full bg-bg border rounded-xl flex items-center gap-2 px-4 transition-all duration-200 ${
          error ? "border-error" : isOpen ? "border-accent ring-2 ring-accent/20" : "border-border"
        }`}
      >
        <Search size={14} className="text-text-secondary/50 shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
        />
        <ChevronDown
          size={16}
          className={`text-text-secondary/60 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {error && <p className="text-error text-[10px] font-medium mt-1 ml-1">{error}</p>}

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+6px)] left-0 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <p className="text-text-secondary/60 text-xs text-center py-6 italic px-4">
                No results match "{search}"
              </p>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onToggle(option);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-text-primary hover:bg-bg"
                    }`}
                  >
                    {option}
                    {isSelected && <Check size={16} className="text-accent" />}
                  </button>
                );
              })
            )}
          </div>
          {search && filteredOptions.length > 0 && (
             <div className="bg-bg/30 px-4 py-2 border-t border-border flex justify-between items-center">
                <span className="text-[10px] text-text-secondary/60 font-medium">
                  {filteredOptions.length} results found
                </span>
                <button 
                   type="button" 
                   onClick={() => {setIsOpen(false); setSearch("");}}
                   className="text-[10px] text-accent font-bold hover:underline"
                >
                  Done
                </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSearchSelect;
