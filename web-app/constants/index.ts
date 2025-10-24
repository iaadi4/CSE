/**
 * Central export file for all constants
 * Makes imports cleaner throughout the application
 */

export { HOW_IT_WORKS_STEPS } from "./howItWorksData";
export { FAQ_DATA } from "./faqData";
export { FEATURES_DATA, FEATURES_CONFIG } from "./featuresData";
export { SOCIAL_LINKS, FOOTER_COLUMNS, FOOTER_BRANDING } from "./footerData";
export { SCROLL_CONFIG, TRANSITION_CONFIG } from "./animationConfig";

export type { Step, Substep } from "./howItWorksData";
export type { FAQItem } from "./faqData";
export type { FeatureCard } from "./featuresData";
export type { SocialLink, FooterLink, FooterColumn } from "./footerData";
