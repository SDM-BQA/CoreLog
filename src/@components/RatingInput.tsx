import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string | null;
}

const RatingInput: React.FC<RatingInputProps> = ({ value, onChange, label, error }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {label && (
        <label className="text-text-primary text-xs font-semibold tracking-wider uppercase">
          {label}
        </label>
      )}
      <div className="flex flex-col items-center gap-3 py-4 px-3 bg-bg/50 rounded-2xl border border-border shadow-inner w-full">
        {/* Stars row — uses percentage-based sizing to always fit the container */}
        <div className="flex items-center justify-evenly w-full">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 active:scale-95 p-1"
            >
              <Star
                size={28}
                className={`transition-all ${
                  star <= (hoverRating || Math.floor(value))
                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]"
                    : "fill-transparent text-text-secondary/20"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Decimal input */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={value || ""}
              placeholder="0.0"
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChange(isNaN(val) ? 0 : Math.min(5, Math.max(0, val)));
              }}
              className="w-14 bg-bg border border-border rounded-lg py-1 px-2 text-center text-accent font-bold text-sm focus:outline-none focus:border-accent transition-all"
            />
            <span className="text-text-secondary text-sm font-medium">/ 5.0</span>
          </div>
          <p className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold italic opacity-60">
            Precision Rating
          </p>
        </div>
      </div>
      {error && (
        <p className="text-error text-[10px] font-medium text-center">{error}</p>
      )}
    </div>
  );
};

export default RatingInput;
