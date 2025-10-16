/**
 * Footer Component
 * 
 * Main footer with links, social media, and copyright information.
 * 
 * Features:
 * - Multi-column layout
 * - Social media links
 * - Newsletter signup
 * - Responsive design
 */

import React from "react";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-zinc-900 text-white border-t border-zinc-800">
      <div className="px-10 xl:px-40 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="font-cabinet-bold text-2xl">Creator Stock Exchange</h3>
            <p className="font-quicksand text-sm text-zinc-400 leading-relaxed">
              The revolutionary platform connecting creators and fans through blockchain-powered tokens.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-zinc-700 hover:border-brand-green hover:bg-brand-green/10 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-zinc-700 hover:border-brand-green hover:bg-brand-green/10 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-zinc-700 hover:border-brand-green hover:bg-brand-green/10 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform Column */}
          <div className="space-y-4">
            <h4 className="font-cabinet-bold text-lg">Platform</h4>
            <ul className="space-y-3 font-quicksand text-sm">
              <li>
                <a href="#how-it-works" className="text-zinc-400 hover:text-brand-green transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#creators" className="text-zinc-400 hover:text-brand-green transition-colors">
                  For Creators
                </a>
              </li>
              <li>
                <a href="#fans" className="text-zinc-400 hover:text-brand-green transition-colors">
                  For Fans
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h4 className="font-cabinet-bold text-lg">Resources</h4>
            <ul className="space-y-3 font-quicksand text-sm">
              <li>
                <a href="#docs" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#api" className="text-zinc-400 hover:text-brand-green transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#blog" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#support" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Support Center
                </a>
              </li>
              <li>
                <a href="#faq" className="text-zinc-400 hover:text-brand-green transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="font-cabinet-bold text-lg">Legal</h4>
            <ul className="space-y-3 font-quicksand text-sm">
              <li>
                <a href="#privacy" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#security" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="#compliance" className="text-zinc-400 hover:text-brand-green transition-colors">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-quicksand text-sm text-zinc-500">
            © {currentYear} Creator Stock Exchange. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Mail className="w-4 h-4" />
            <a
              href="mailto:support@creatorstockexchange.com"
              className="hover:text-brand-green transition-colors"
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
