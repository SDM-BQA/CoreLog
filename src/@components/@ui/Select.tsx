import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string | any) => void;
  placeholder?: string;
  icon?: React.ElementType;
  className?: string;
  error?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  icon: Icon,
  className = "",
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const SelectedIcon = selectedOption?.icon || Icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-text-primary text-xs font-semibold mb-2 block uppercase tracking-wider">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-bg border rounded-xl text-sm transition-all duration-200 outline-none
          ${isOpen ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/50"}
          ${error ? "border-error focus:ring-error/20" : ""}
          ${!selectedOption ? "text-text-secondary/60" : "text-text-primary"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex items-center gap-2.5 truncate">
          {SelectedIcon && <SelectedIcon size={16} className={selectedOption ? "text-accent" : "text-text-secondary/40"} />}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-text-secondary/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {error && <p className="text-error text-xs mt-1.5 pl-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[240px] overflow-y-auto py-1.5 custom-scrollbar">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-text-secondary text-center italic">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                      ${option.value === value ? "bg-accent/10 text-accent font-semibold" : "text-text-primary hover:bg-bg"}
                    `}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {OptionIcon && <OptionIcon size={14} className={option.value === value ? "text-accent" : "text-text-secondary/60"} />}
                      <span>{option.label}</span>
                    </div>
                    {option.value === value && <Check size={14} className="text-accent" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
