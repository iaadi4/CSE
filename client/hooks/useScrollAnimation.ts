/**
 * Custom hook for managing GSAP ScrollTrigger animations in How It Works section
 */

import { useEffect, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCROLL_CONFIG } from "@/constants/animationConfig";
import type { SubstepWithIndex } from "@/types/howItWorks";

interface UseScrollAnimationProps {
  containerRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  allSubsteps: SubstepWithIndex[];
  setCurrentStep: (step: number) => void;
  setCurrentSubstep: (substep: number) => void;
}

export const useScrollAnimation = ({
  containerRef,
  contentRef,
  allSubsteps,
  setCurrentStep,
  setCurrentSubstep,
}: UseScrollAnimationProps) => {
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    // Only enable scroll animation on desktop (lg breakpoint = 1024px)
    const isDesktop = window.innerWidth >= 1024;
    
    console.log('ScrollAnimation: isDesktop =', isDesktop, 'width =', window.innerWidth);
    
    if (!isDesktop) {
      // Reset any GSAP inline styles on mobile
      gsap.set(contentRef.current, { clearProps: "all" });
      return;
    }

    console.log('ScrollAnimation: Initializing GSAP...');

    const ctx = gsap.context(() => {
      const vh = window.innerHeight;
      const totalDistance = (SCROLL_CONFIG.TOTAL_SUBSTEPS - 1) * vh;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${SCROLL_CONFIG.TOTAL_SUBSTEPS * vh}`,
          pin: true,
          scrub: SCROLL_CONFIG.SCRUB_SPEED,
          markers: false, // Set to true for debugging
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const currentIndex = Math.min(
              Math.floor(self.progress * SCROLL_CONFIG.TOTAL_SUBSTEPS),
              SCROLL_CONFIG.TOTAL_SUBSTEPS - 1
            );

            const substep = allSubsteps[currentIndex];
            if (substep) {
              requestAnimationFrame(() => {
                setCurrentStep(substep.stepIndex);
                setCurrentSubstep(substep.substepIndex);
              });
            }
          },
        },
      });

      tl.fromTo(
        contentRef.current,
        { y: 0 },
        { y: -totalDistance, ease: "none" }
      );
    }, containerRef);

    // Refresh ScrollTrigger after a short delay to ensure layout is ready
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(refreshTimeout);
      ctx.revert();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
