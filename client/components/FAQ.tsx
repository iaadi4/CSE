"use client";

/**
 * FAQ Section
 * 
 * Displays frequently asked questions in an accordion layout.
 * Only one question can be open at a time for better UX.
 * 
 * Features:
 * - Accordion interaction (expand/collapse)
 * - Smooth animations
 * - Responsive design
 * - Keyboard accessible
 */

import React, { useState } from "react";
import { FAQ_DATA } from "@/constants/faqData";
import { FAQItem } from "./FAQ/FAQItem";

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="w-full px-10 xl:px-40 mt-8 mb-40 md:my-40 flex flex-col gap-10 lg:gap-20"
      aria-label="Frequently Asked Questions"
    >
      {/* Section Heading */}
      <div className="text-center flex flex-col gap-4">
        <h2 className="font-cabinet-bold text-3xl md:text-4xl lg:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="font-quicksand text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto">
          Got questions? We've got answers. Find everything you need to know
          about the Creator Stock Exchange.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-4xl mx-auto w-full">
        {FAQ_DATA.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default FAQ;
