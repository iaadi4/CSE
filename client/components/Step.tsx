/**
 * Step Component
 * 
 * Displays a single substep in the How It Works section.
 * Shows title, description, and an illustrative image.
 * 
 * @param title - The substep title
 * @param description - The substep description
 * @param image - The substep image path (defaults to placeholder)
 */

import React from "react";

interface StepProps {
  title: string;
  description: string;
  image?: string;
}

const Step: React.FC<StepProps> = ({
  title,
  description,
  image = "/images/how-it-works/fans-signup.png",
}) => {
  return (
    <article className="flex flex-col items-center gap-4 md:gap-8 lg:gap-12 xl:gap-20 max-w-4xl">
      {/* Text Content */}
      <div className="flex flex-col gap-3 md:gap-4 lg:gap-6 xl:gap-10">
        <h3 className="font-cabinet-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-center">
          {title}
        </h3>
        <p className="font-semibold font-quicksand text-sm md:text-base lg:text-lg text-zinc-700 leading-relaxed text-center">
          {description}
        </p>
      </div>

      {/* Illustration */}
      <img
        src={image}
        alt={title}
        className="h-[200px] md:h-[300px] lg:h-[400px] w-auto object-contain"
        loading="lazy"
      />
    </article>
  );
};

export default Step;
