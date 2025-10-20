/**
 * Footer Section Data
 * 
 * Contains navigation links, social media links, and footer configuration.
 */

import { Twitter, Github, Linkedin, type LucideIcon } from "lucide-react";

/**
 * Social media link configuration
 */
export interface SocialLink {
  name: string;
  url: string;
  icon: LucideIcon;
  ariaLabel: string;
}

/**
 * Footer navigation link
 */
export interface FooterLink {
  label: string;
  href: string;
}

/**
 * Footer column configuration
 */
export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/**
 * Social media links
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "Twitter",
    url: "https://twitter.com",
    icon: Twitter,
    ariaLabel: "Follow us on Twitter",
  },
  {
    name: "GitHub",
    url: "https://github.com",
    icon: Github,
    ariaLabel: "View our GitHub repository",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com",
    icon: Linkedin,
    ariaLabel: "Connect with us on LinkedIn",
  },
];

/**
 * Footer navigation columns
 */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Platform",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "For Creators", href: "#creators" },
      { label: "For Fans", href: "#fans" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "API Reference", href: "#api" },
      { label: "Blog", href: "#blog" },
      { label: "Support Center", href: "#support" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Cookie Policy", href: "#cookies" },
      { label: "Security", href: "#security" },
      { label: "Compliance", href: "#compliance" },
    ],
  },
];

/**
 * Footer branding configuration
 */
export const FOOTER_BRANDING = {
  COMPANY_NAME: "Creator Stock Exchange",
  TAGLINE: "The revolutionary platform connecting creators and fans through blockchain-powered tokens.",
  COPYRIGHT_TEXT: "All rights reserved.",
} as const;
