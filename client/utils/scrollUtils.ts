/**
 * Utility function to calculate the scroll position for a specific substep
 */

import type { Step } from "@/types/howItWorks";

interface CalculateScrollPositionParams {
  steps: Step[];
  stepIndex: number;
  substepIndex: number;
  containerTop: number;
}

export const calculateScrollPosition = ({
  steps,
  stepIndex,
  substepIndex,
  containerTop,
}: CalculateScrollPositionParams): number => {
  const flatIndex = steps
    .slice(0, stepIndex)
    .reduce((acc, step) => acc + (step.substeps?.length || 0), 0) + substepIndex;

  return containerTop + flatIndex * window.innerHeight;
};

/**
 * Smooth scroll to a specific position
 */
export const smoothScrollTo = (position: number): void => {
  window.scrollTo({
    top: position,
    behavior: "smooth",
  });
};

/**
 * Flatten steps array to get all substeps with their indices
 */
export const flattenSubsteps = (steps: Step[]) => {
  return steps.flatMap((step, stepIndex) =>
    step.substeps?.map((substep, substepIndex) => ({
      ...substep,
      stepIndex,
      substepIndex,
    })) || []
  );
};
