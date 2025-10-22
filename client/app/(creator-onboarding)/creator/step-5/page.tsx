"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatorOnboardingStore } from "@/store/creator-onboarding";
import { z } from "zod";

const tokenBasicSchema = z.object({
  token_name: z.string().min(1, "Token name is required"),
  token_symbol: z.string().min(3, "Symbol must be at least 3 characters").max(10, "Symbol must be 10 characters or less").regex(/^[A-Z]+$/, "Symbol must be uppercase letters only"),
});

export default function Step5TokenBasic() {
  const router = useRouter();
  const {
    token_name,
    token_symbol,
    setTokenDetails,
    setCurrentStep,
    markStepCompleted,
  } = useCreatorOnboardingStore();

  const [formData, setFormData] = useState({
    token_name: token_name || "",
    token_symbol: token_symbol || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      tokenBasicSchema.parse(formData);
      setTokenDetails(formData);
      markStepCompleted(5);
      router.push("/creator/step-6");
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
            <span className="text-sm font-medium text-gray-600">5 of 9</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: "56%" }}
            ></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cabinet-bold text-gray-900 mb-3">
            Name your token
          </h1>
          <p className="text-gray-600 font-quicksand mb-10">
            Create a unique identity for your creator token
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                Token Name
              </label>
              <input
                type="text"
                value={formData.token_name}
                onChange={(e) => {
                  setFormData({ ...formData, token_name: e.target.value });
                  setErrors({ ...errors, token_name: "" });
                }}
                placeholder="e.g., JaneCoin"
                className={`w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all ${
                  errors.token_name
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                }`}
              />
              {errors.token_name && (
                <p className="text-red-500 text-sm mt-2 ml-2">{errors.token_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                Token Symbol
              </label>
              <input
                type="text"
                value={formData.token_symbol}
                onChange={(e) => {
                  const symbol = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                  setFormData({ ...formData, token_symbol: symbol });
                  setErrors({ ...errors, token_symbol: "" });
                }}
                placeholder="e.g., JANE"
                maxLength={10}
                className={`w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all uppercase ${
                  errors.token_symbol
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                }`}
              />
              {errors.token_symbol && (
                <p className="text-red-500 text-sm mt-2 ml-2">{errors.token_symbol}</p>
              )}
              <p className="text-sm text-gray-500 mt-2 ml-2">3-10 uppercase letters</p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/creator/step-4")}
                className="px-8 py-4 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!formData.token_name || !formData.token_symbol}
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
