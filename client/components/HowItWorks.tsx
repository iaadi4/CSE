/**
 * How It Works Section
 * 
 * A pinned scroll section showcasing the platform's workflow through 7 main steps,
 * each with 2 substeps (14 total). Uses GSAP ScrollTrigger for smooth animations.
 * 
 * Features:
 * - Pin container during scroll
 * - Vertical content animation with scrub
 * - Left sidebar navigation with step indicators
 * - Collapsible substeps (only current step shows substeps)
 * - Smooth scroll navigation on click
 */

"use client";

import React, { useState, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HOW_IT_WORKS_STEPS } from "@/constants/howItWorksData";
import { Navigation } from "./HowItWorks/Navigation";
import { Content } from "./HowItWorks/Content";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { flattenSubsteps, calculateScrollPosition, smoothScrollTo } from "@/utils/scrollUtils";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const HowItWorks: React.FC = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSubstep, setCurrentSubstep] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement[]>([]);

  // Memoize flattened substeps array to prevent recalculation
  const allSubsteps = useMemo(
    () => flattenSubsteps(HOW_IT_WORKS_STEPS),
    []
  );

  // Initialize scroll animation
  useScrollAnimation({
    containerRef,
    contentRef,
    allSubsteps,
    setCurrentStep,
    setCurrentSubstep,
  });

  /**
   * Handle navigation click - scroll to specific substep
   */
  const handleStepClick = (stepIndex: number, substepIndex: number): void => {
    if (!containerRef.current) return;

    const scrollPosition = calculateScrollPosition({
      steps: HOW_IT_WORKS_STEPS,
      stepIndex,
      substepIndex,
      containerTop: containerRef.current.offsetTop,
    });

    smoothScrollTo(scrollPosition);
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      id="how-it-works"
      aria-label="How It Works"
    >
      <div className="absolute inset-0 flex p-40">
        {/* Left Sidebar Navigation */}
        <aside className="w-[30%] h-full border-r-[1px] border-zinc-500 flex items-center justify-center px-8">
          <Navigation
            steps={HOW_IT_WORKS_STEPS}
            currentStep={currentStep}
            currentSubstep={currentSubstep}
            onStepClick={handleStepClick}
          />
        </aside>

        {/* Right Content Area */}
        <main className="w-[70%] h-full pl-40">
          <Content
            allSubsteps={allSubsteps}
            contentRef={contentRef}
            stepsRef={stepsRef}
          />
        </main>
      </div>
    </section>
  );
};

export default HowItWorks;
