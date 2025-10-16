/**
 * Navigation component for How It Works section
 * Displays step indicators and substep bullets with animations
 */

import React from "react";
import type { Step } from "@/types/howItWorks";
import { SCROLL_CONFIG } from "@/constants/animationConfig";

interface NavigationProps {
  steps: Step[];
  currentStep: number;
  currentSubstep: number;
  onStepClick: (stepIndex: number, substepIndex: number) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  steps,
  currentStep,
  currentSubstep,
  onStepClick,
}) => {
  return (
    <div className="flex flex-col gap-5 w-full max-w-[300px] mx-auto">
      {steps.map((step, index) => (
        <div key={index}>
          {/* Main Step Button */}
          <button
            className="font-cabinet-bold mb-4 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-full text-left"
            onClick={() => {
              if (step.substeps && step.substeps.length > 0) {
                onStepClick(index, 0);
              }
            }}
            aria-label={`Go to ${step.title}`}
          >
            <div
              className={`h-7 w-7 rounded-full ${
                currentStep === index ? "bg-brand-green" : "bg-zinc-300"
              } text-black flex items-center justify-center text-sm transition-all duration-300 flex-shrink-0`}
              aria-current={currentStep === index ? "step" : undefined}
            >
              {index + 1}
            </div>
            <span
              className={`transition-colors duration-300 ${
                currentStep === index ? "text-black" : "text-zinc-600"
              }`}
            >
              {step.title}
            </span>
          </button>

          {/* Substeps - Only shown for current step */}
          {currentStep === index && step.subheadings && (
            <div className="ml-4 space-y-2 overflow-hidden" role="list">
              {step.subheadings.map((sub, subIndex) => (
                <button
                  key={subIndex}
                  className="text-sm font-cabinet-medium flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all duration-500 ease-out animate-in fade-in slide-in-from-left-2 w-full text-left"
                  style={{
                    animationDelay: `${subIndex * SCROLL_CONFIG.SUBSTEP_ANIMATION_DELAY}ms`,
                    animationDuration: `${SCROLL_CONFIG.SUBSTEP_ANIMATION_DURATION}ms`,
                    animationFillMode: "both",
                  }}
                  onClick={() => onStepClick(index, subIndex)}
                  aria-label={sub}
                  role="listitem"
                >
                  <div
                    className={`h-2 w-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                      currentSubstep === subIndex && currentStep === index
                        ? "bg-brand-green scale-125"
                        : "bg-zinc-400"
                    }`}
                    aria-current={
                      currentSubstep === subIndex && currentStep === index
                        ? "step"
                        : undefined
                    }
                  />
                  <span
                    className={`transition-colors duration-300 ${
                      currentSubstep === subIndex && currentStep === index
                        ? "text-black"
                        : "text-zinc-600"
                    }`}
                  >
                    {sub}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
