import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isCurrent
                      ? "bg-green-600 text-white ring-4 ring-green-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <span
                  className={`text-xs mt-2 text-center max-w-[80px] ${
                    isCurrent ? "text-green-700 font-semibold" : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
              {stepNumber < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    isCompleted ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
