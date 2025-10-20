/**
 * Content display component for How It Works section
 * Renders all substeps in a vertically scrollable container
 */

import React from "react";
import type { SubstepWithIndex } from "@/types/howItWorks";
import Step from "../Step";

interface ContentProps {
  allSubsteps: SubstepWithIndex[];
  contentRef: React.RefObject<HTMLDivElement | null>;
  stepsRef: React.MutableRefObject<HTMLDivElement[]>;
}

export const Content: React.FC<ContentProps> = ({
  allSubsteps,
  contentRef,
  stepsRef,
}) => {
  return (
    <div ref={contentRef} className="w-full lg:h-full flex flex-col">
      {allSubsteps.map((substep, index) => (
        <div
          key={`${substep.stepIndex}-${substep.substepIndex}`}
          ref={(el) => {
            if (el) stepsRef.current[index] = el;
          }}
          className="lg:h-screen w-full flex items-center justify-center px-4 md:px-10 lg:px-20 py-8 lg:py-0 flex-shrink-0"
        >
          <Step
            title={substep.title}
            description={substep.description}
            image={substep.image}
          />
        </div>
      ))}
    </div>
  );
};
