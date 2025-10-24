/**
 * Animation configuration constants for GSAP ScrollTrigger
 */

export const SCROLL_CONFIG = {
  // Total number of substeps in How It Works section
  TOTAL_SUBSTEPS: 14,
  
  // Scrub speed (1 = smooth, higher = more responsive)
  SCRUB_SPEED: 1,
  
  // Animation delays for staggered effects (in ms)
  SUBSTEP_ANIMATION_DELAY: 100,
  SUBSTEP_ANIMATION_DURATION: 400,
} as const;

export const TRANSITION_CONFIG = {
  // Duration for CSS transitions (in ms)
  DEFAULT_DURATION: 300,
  SLOW_DURATION: 500,
  
  // Easing functions
  EASE_OUT: "ease-out",
  EASE_IN_OUT: "ease-in-out",
} as const;
