/**
 * Type definitions for How It Works section
 */

export interface Substep {
  title: string;
  description: string;
  image: string;
}

export interface Step {
  title: string;
  subheadings: string[];
  substeps: Substep[];
}

export interface SubstepWithIndex extends Substep {
  stepIndex: number;
  substepIndex: number;
}
