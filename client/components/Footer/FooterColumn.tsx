/**
 * Footer Column Component
 * 
 * Renders a column of navigation links in the footer.
 * 
 * @param title - Column heading
 * @param links - Array of navigation links
 */

import React from "react";
import type { FooterColumn as FooterColumnType } from "@/constants/footerData";

interface FooterColumnProps {
  column: FooterColumnType;
}

export const FooterColumn: React.FC<FooterColumnProps> = ({ column }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-cabinet-bold text-lg">{column.title}</h4>
      <nav aria-label={`${column.title} navigation`}>
        <ul className="space-y-3 font-quicksand text-sm">
          {column.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-zinc-400 hover:text-brand-green transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
