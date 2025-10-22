"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatorOnboardingStore } from "@/store/creator-onboarding";
import { z } from "zod";

const tokenSupplySchema = z.object({
  ico_supply: z.number().min(1000, "ICO supply must be at least 1000 tokens"),
  funding_goal: z.number().optional(),
});

export default function Step6TokenSupply() {
  const router = useRouter();
  const {
    ico_supply,
    funding_goal,
    setTokenDetails,
    setCurrentStep,
    markStepCompleted,
  } = useCreatorOnboardingStore();

  const [formData, setFormData] = useState({
    ico_supply: ico_supply || 0,
    funding_goal: funding_goal || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentStep(6);
  }, [setCurrentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validationData = {
        ico_supply: formData.ico_supply,
        funding_goal: formData.funding_goal > 0 ? formData.funding_goal : undefined,
      };
      tokenSupplySchema.parse(validationData);
      setTokenDetails(validationData);
      markStepCompleted(6);
      router.push("/creator/step-7");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">6 of 9</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: "67%" }}
            ></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cabinet-bold text-gray-900 mb-3">
            Token economics
          </h1>
          <p className="text-gray-600 font-quicksand mb-10">
            Set your initial coin offering details
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                ICO Supply <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.ico_supply || ""}
                onChange={(e) => {
                  setFormData({ ...formData, ico_supply: parseInt(e.target.value) || 0 });
                  setErrors({ ...errors, ico_supply: "" });
                }}
                placeholder="e.g., 1000000"
                className={`w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all ${
                  errors.ico_supply
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                }`}
              />
              {errors.ico_supply && (
                <p className="text-red-500 text-sm mt-2 ml-2">{errors.ico_supply}</p>
              )}
              <p className="text-sm text-gray-500 mt-2 ml-2">Minimum 1,000 tokens</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                Funding Goal (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  $
                </span>
                <input
                  type="number"
                  value={formData.funding_goal || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, funding_goal: parseInt(e.target.value) || 0 });
                    setErrors({ ...errors, funding_goal: "" });
                  }}
                  placeholder="e.g., 50000"
                  className={`w-full pl-12 pr-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all ${
                    errors.funding_goal
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  }`}
                />
              </div>
              {errors.funding_goal && (
                <p className="text-red-500 text-sm mt-2 ml-2">{errors.funding_goal}</p>
              )}
              <p className="text-sm text-gray-500 mt-2 ml-2">Your fundraising target in USD</p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/creator/step-5")}
                className="px-8 py-4 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!formData.ico_supply || formData.ico_supply < 1000}
                className="flex-1 px-8 py-4 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
