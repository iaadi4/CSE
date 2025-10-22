import React from "react";
import { StepIndicator } from "@/components/creator/step-indicator";

const steps = [
  "Basic Info",
  "Creator Profile",
  "Social Media",
  "Token Details",
  "Verification",
];

export default function CreatorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will be enhanced with step tracking from the store
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl font-cabinet-bold text-gray-900 mb-2">
            Become a Creator
          </h1>
          <p className="text-gray-600 font-quicksand">
            Complete these steps to launch your creator token
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
