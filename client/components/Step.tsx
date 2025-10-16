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
  image = "/fans-signup.png",
}) => {
  return (
    <article className="flex flex-col items-center gap-20">
      {/* Text Content */}
      <div className="flex flex-col gap-10">
        <h3 className="font-cabinet-bold text-4xl lg:text-5xl text-center lg:text-left">
          {title}
        </h3>
        <p className="font-semibold font-quicksand text-base lg:text-lg text-zinc-700 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Illustration */}
      <img
        src={image}
        alt={title}
        className="h-[300px] lg:h-[400px] object-contain"
        loading="lazy"
      />
    </article>
  );
};

export default Step;
