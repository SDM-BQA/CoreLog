import { computeStepProgress } from "../@utils/step.progress.utils";

type Props = {
  steps: { id: string; label: string }[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
};

/** Compact segmented progress: "Step 2 of 3 · Profile" over one bar per step. */
export const StepProgressBar = ({ steps, currentIndex, onStepClick }: Props) => {
  const items = computeStepProgress(steps, currentIndex);
  const current = items[currentIndex];

  return (
    <div className="flex w-full flex-col gap-3" role="group" aria-label="Sign up progress">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-text-primary">{current?.label}</span>
        <span className="text-xs text-text-secondary">
          Step {currentIndex + 1} of {steps.length}
        </span>
      </div>

      <div className="flex gap-2">
        {items.map((step) => {
          const clickable = step.status === "completed" && !!onStepClick;
          return (
            <button
              key={step.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(step.index)}
              aria-label={`${step.label}${step.status === "completed" ? " (completed)" : ""}`}
              aria-current={step.status === "current" ? "step" : undefined}
              className="group flex-1 py-1 disabled:cursor-default"
            >
              <span
                className={`block h-1.5 rounded-full transition-colors duration-300 ${
                  step.status === "upcoming"
                    ? "bg-border"
                    : step.status === "current"
                      ? "bg-accent"
                      : "bg-primary group-hover:bg-accent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
