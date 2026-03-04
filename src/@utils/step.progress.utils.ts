import { StepStatus } from "../@hooks/Form/useMultiStepForm";

export type StepProgressItem = {
    id: string;
    label: string;
    status: StepStatus;
    index: number;
};

/**
 * Derives progress metadata from step definitions + current index.
 * Pure function — no React, reusable anywhere (forms, wizards, checkouts).
 */
export function computeStepProgress(
    steps: { id: string; label: string }[],
    currentIndex: number
): StepProgressItem[] {
    return steps.map((step, index) => ({
        ...step,
        index,
        status:
            index < currentIndex
                ? "completed"
                : index === currentIndex
                    ? "current"
                    : "upcoming",
    }));
}

/**
 * Returns 0–100 percentage for a progress bar fill.
 */
export function computeProgressPercent(
    currentIndex: number,
    totalSteps: number
): number {
    if (totalSteps <= 1) return 100;
    return Math.round((currentIndex / (totalSteps - 1)) * 100);
}