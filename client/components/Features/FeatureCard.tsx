/**
 * Feature Card Component
 * 
 * Displays an individual feature card in the bento grid layout.
 * Supports multiple layout variants (vertical, horizontal, image-first).
 * 
 * @param feature - Feature card data with content and styling
 */

import React from "react";
import type { FeatureCard as FeatureCardType } from "@/constants/featuresData";

interface FeatureCardProps {
  feature: FeatureCardType;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const {
    title,
    description,
    image,
    imageAlt,
    gridClass,
    imageSize,
    layout = "vertical",
  } = feature;

  /**
   * Render layout based on feature type
   */
  const renderContent = () => {
    switch (layout) {
      case "horizontal":
        return (
          <>
            <div className="flex flex-col items-center max-w-[300px] gap-3 md:gap-5">
              <h3 className="font-cabinet-bold text-xl md:text-2xl text-center">
                {title}
              </h3>
              {description && (
                <p className="font-quicksand font-medium text-sm text-center">
                  {description}
                </p>
              )}
            </div>
            <img
              src={image}
              alt={imageAlt}
              className={`${imageSize} object-contain`}
              loading="lazy"
            />
          </>
        );

      case "image-first":
        return (
          <>
            <img
              src={image}
              alt={imageAlt}
              className={`${imageSize} object-contain`}
              loading="lazy"
            />
            <div className="flex flex-col items-center gap-3 mt-6">
              <h3 className="font-cabinet-bold text-xl md:text-2xl text-center">
                {title}
              </h3>
              {description && (
                <p className="font-quicksand font-medium text-sm text-center">
                  {description}
                </p>
              )}
            </div>
          </>
        );

      case "vertical":
      default:
        return (
          <>
            <div className="flex flex-col items-center gap-3">
              <h3 className="font-cabinet-bold text-xl md:text-2xl text-center">
                {title}
              </h3>
              {description && (
                <p className="font-quicksand font-medium text-sm text-center">
                  {description}
                </p>
              )}
            </div>
            <img
              src={image}
              alt={imageAlt}
              className={`${imageSize} object-contain mt-4`}
              loading="lazy"
            />
          </>
        );
    }
  };

  /**
   * Get flex classes based on layout
   */
  const getFlexClasses = () => {
    switch (layout) {
      case "horizontal":
        return "flex-col md:flex-row items-center justify-center";
      case "image-first":
        return "flex-col items-center justify-between";
      case "vertical":
      default:
        return "flex-col items-center justify-between";
    }
  };

  return (
    <article
      className={`${gridClass} rounded-3xl p-6 md:p-8 flex ${getFlexClasses()} gap-4 md:gap-6 bg-none border-2 border-zinc-800`}
      aria-label={title}
    >
      {renderContent()}
    </article>
  );
};
