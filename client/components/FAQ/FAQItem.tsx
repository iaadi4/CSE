"use client";

/**
 * FAQ Item Component
 * Individual accordion item for a single FAQ
 */

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="border-b border-zinc-300">
      <button
        className="w-full py-6 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h3 className="font-cabinet-bold text-xl lg:text-2xl pr-8">
          {question}
        </h3>
        <ChevronDown
          className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"
        }`}
      >
        <p className="font-quicksand text-base lg:text-lg text-zinc-700 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};
