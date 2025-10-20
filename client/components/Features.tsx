/**
 * Features Section
 * 
 * Displays platform features in a responsive bento grid layout.
 * Features are organized in a visually appealing grid with varying sizes.
 * 
 * Features:
 * - Responsive bento grid layout (1 col mobile, 6 cols desktop)
 * - Dynamic card sizes based on content importance
 * - Lazy loading images for performance
 * - Accessible semantic HTML
 * 
 * Layout:
 * - Mobile: Single column, variable heights
 * - Desktop: 6x6 grid with custom spans
 */

import React from "react";
import { FEATURES_DATA, FEATURES_CONFIG } from "@/constants/featuresData";
import { FeatureCard } from "./Features/FeatureCard";

const Features: React.FC = () => {
  return (
    <section 
      className="w-full px-10 xl:px-40 my-40 flex flex-col gap-10 lg:gap-20"
      id="features"
      aria-label="Platform Features"
    >
      {/* Section Heading */}
      <h2 className="font-cabinet-bold text-center w-full text-3xl md:text-4xl lg:text-5xl">
        {FEATURES_CONFIG.SECTION_TITLE}
      </h2>

      {/* Bento Grid Container */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-6 gap-4 lg:gap-6 auto-rows-[180px]"
        role="list"
      >
        {FEATURES_DATA.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  );
};

export default Features;
