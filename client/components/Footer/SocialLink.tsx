/**
 * Social Link Component
 * 
 * Renders a single social media icon link with hover effects.
 * 
 * @param link - Social link configuration with icon and URL
 */

import React from "react";
import type { SocialLink } from "@/constants/footerData";

interface SocialLinkProps {
  link: SocialLink;
}

export const SocialLinkButton: React.FC<SocialLinkProps> = ({ link }) => {
  const IconComponent = link.icon;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-full border border-zinc-700 hover:border-brand-green hover:bg-brand-green/10 transition-all duration-300"
      aria-label={link.ariaLabel}
    >
      <IconComponent className="w-5 h-5" />
    </a>
  );
};
