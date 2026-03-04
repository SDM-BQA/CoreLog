// @components/StepProgressBar/StepProgressBar.tsx

import { CheckIcon } from "lucide-react";
import {
  computeProgressPercent,
  computeStepProgress,
} from "../@utils/step.progress.utils";

type Props = {
  steps: { id: string; label: string }[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
};

export const StepProgressBar = ({
  steps,
  currentIndex,
  onStepClick,
}: Props) => {
  const items = computeStepProgress(steps, currentIndex);
  const percent = computeProgressPercent(currentIndex, steps.length);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Track + Nodes */}
      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2 z-0" />

        {/* Filled line */}
        <div
          className="absolute top-1/2 left-0 h-px bg-primary -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />

        {/* Step nodes */}
        {items.map((step) => {
          const isClickable = step.status === "completed" && onStepClick;
          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.index)}
              className={`
                relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center
                text-xs font-semibold transition-all duration-300
                ${
                  step.status === "completed"
                    ? "bg-primary border-primary text-text-primary cursor-pointer"
                    : step.status === "current"
                      ? "bg-bg-secondary border-primary text-primary"
                      : "bg-bg-secondary border-border text-text-secondary cursor-not-allowed"
                }
              `}
            >
              {step.status === "completed" ? (
                <CheckIcon size={14} />
              ) : (
                step.index + 1
              )}
            </button>
          );
        })}
      </div>

      {/* Labels — each one sits in a flex-1 cell, centered under its node */}
      <div className="flex items-start">
        {items.map((step, i) => (
          <div
            key={step.id}
            className={`
              flex-1 flex
              ${i === 0 ? "justify-start" : i === items.length - 1 ? "justify-end" : "justify-center"}
            `}
          >
            <span
              className={`text-xs transition-colors duration-300 ${
                step.status === "current"
                  ? "text-primary font-medium"
                  : step.status === "completed"
                    ? "text-text-primary"
                    : "text-text-secondary/50"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
