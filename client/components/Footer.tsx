/**
 * Footer Component
 * 
 * Main footer with links, social media, and copyright information.
 * 
 * Features:
 * - Multi-column responsive layout
 * - Social media links with hover effects
 * - Navigation organized by category
 * - Contact information
 * - Accessible semantic HTML
 * 
 * Layout:
 * - Mobile: Single column stack
 * - Tablet: 2-column grid
 * - Desktop: 4-column grid (brand + 3 nav columns)
 */

import React from "react";
import { Mail } from "lucide-react";
import { 
  SOCIAL_LINKS, 
  FOOTER_COLUMNS, 
  FOOTER_BRANDING 
} from "@/constants/footerData";
import { SocialLinkButton } from "./Footer/SocialLink";
import { FooterColumn } from "./Footer/FooterColumn";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full bg-zinc-900 text-white border-t border-zinc-800"
      role="contentinfo"
    >
      <div className="px-10 xl:px-40 py-20">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="font-cabinet-bold text-2xl">
              {FOOTER_BRANDING.COMPANY_NAME}
            </h3>
            <p className="font-quicksand text-sm text-zinc-400 leading-relaxed">
              {FOOTER_BRANDING.TAGLINE}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 pt-4" role="list" aria-label="Social media links">
              {SOCIAL_LINKS.map((link) => (
                <SocialLinkButton key={link.name} link={link} />
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} column={column} />
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-quicksand text-sm text-zinc-500">
            © {currentYear} {FOOTER_BRANDING.COMPANY_NAME}. {FOOTER_BRANDING.COPYRIGHT_TEXT}
          </p>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Mail className="w-4 h-4" aria-hidden="true" />
            <a
              href="mailto:support@creatorstockexchange.com"
              className="hover:text-brand-green transition-colors duration-200"
            >
              support@creatorstockexchange.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
