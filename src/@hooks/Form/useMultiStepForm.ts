// @hooks/MultiStepForm/useMultiStepForm.ts
import { useState, useCallback } from "react";

export type StepStatus = "upcoming" | "current" | "completed";

export type Step = {
    id: string;
    label: string;
};

type UseMultiStepFormProps = {
    steps: Step[];
    onComplete: (allData: Record<string, any>) => void;
};

export function useMultiStepForm({ steps, onComplete }: UseMultiStepFormProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [collectedData, setCollectedData] = useState<Record<string, any>>({});

    const isFirst = currentStepIndex === 0;
    const isLast = currentStepIndex === steps.length - 1;
    const currentStep = steps[currentStepIndex];

    const getStepStatus = useCallback(
        (index: number): StepStatus => {
            if (index < currentStepIndex) return "completed";
            if (index === currentStepIndex) return "current";
            return "upcoming";
        },
        [currentStepIndex]
    );

    // Called by each step's onSubmit — merges data and advances
    const nextStep = useCallback(
        (stepId: string, stepData: Record<string, any>) => {
            const merged = { ...collectedData, [stepId]: stepData };
            setCollectedData(merged);

            if (isLast) {
                onComplete(merged);
            } else {
                setCurrentStepIndex((i) => i + 1);
            }
        },
        [collectedData, isLast, onComplete]
    );

    const prevStep = useCallback(() => {
        if (!isFirst) setCurrentStepIndex((i) => i - 1);
    }, [isFirst]);

    const goToStep = useCallback((index: number) => {
        // Only allow going back to completed steps
        setCurrentStepIndex((current) => (index < current ? index : current));
    }, []);

    return {
        currentStepIndex,
        currentStep,
        steps,
        isFirst,
        isLast,
        collectedData,
        getStepStatus,
        nextStep,
        prevStep,
        goToStep,
    };
}