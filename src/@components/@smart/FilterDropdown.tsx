import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FilterDropdownProps<T extends string | number> {
  label: string;
  options: T[];
  selected: T[];
  onSelect: (val: T) => void;
  renderOption?: (val: T) => string;
  emptyMessage?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
}

function FilterDropdown<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
  renderOption,
  emptyMessage,
  icon: Icon,
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 ${
          selected.length > 0
            ? "border-accent/50 bg-accent/10 text-accent"
            : "border-border bg-surface text-text-secondary hover:text-text-primary hover:border-accent"
        }`}
      >
        {Icon && (
          <Icon size={14} className={selected.length > 0 ? "text-accent" : "text-text-secondary/60"} />
        )}
        {label}
        {selected.length > 0 && (
          <span className="bg-accent/20 text-accent text-[10px] font-bold px-1.5 rounded-full">
            {selected.length}
          </span>
        )}
        <ChevronDown size={14} className={`opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1.5 left-0 min-w-[160px] max-h-64 overflow-y-auto bg-surface border border-border rounded-lg shadow-xl py-1">
            {options.length === 0 ? (
              <p className="px-4 py-3 text-xs text-text-secondary/60 italic">
                {emptyMessage ?? "No options available"}
              </p>
            ) : (
              options.map((opt) => (
                <button
                  key={String(opt)}
                  type="button"
                  onClick={() => onSelect(opt)}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                    selected.includes(opt) ? "bg-accent/15 text-accent" : "text-text-primary hover:bg-bg"
                  }`}
                >
                  {renderOption ? renderOption(opt) : String(opt)}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FilterDropdown;
