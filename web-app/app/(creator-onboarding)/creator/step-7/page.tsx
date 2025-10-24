"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatorOnboardingStore } from "@/store/creator-onboarding";
import { z } from "zod";

const tokenPitchSchema = z.object({
  token_pitch: z.string().min(100, "Pitch must be at least 100 characters").max(1000, "Pitch must be 1000 characters or less"),
});

export default function Step7TokenPitch() {
  const router = useRouter();
  const {
    token_pitch,
    setTokenDetails,
    setCurrentStep,
    markStepCompleted,
  } = useCreatorOnboardingStore();

  const [formData, setFormData] = useState({
    token_pitch: token_pitch || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentStep(7);
  }, [setCurrentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      tokenPitchSchema.parse(formData);
      setTokenDetails(formData);
      markStepCompleted(7);
      router.push("/creator/step-8");
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

  const charCount = formData.token_pitch.length;
  const isWarningZone = charCount > 900;
  const charCountColor = isWarningZone ? "text-orange-500" : "text-gray-500";

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">7 of 9</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: "78%" }}
            ></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cabinet-bold text-gray-900 mb-3">
            Pitch your token
          </h1>
          <p className="text-gray-600 font-quicksand mb-10">
            Convince supporters why they should invest in your creator token
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                Token Pitch <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.token_pitch}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setFormData({ ...formData, token_pitch: e.target.value });
                    setErrors({ ...errors, token_pitch: "" });
                  }
                }}
                placeholder="Share your vision, plans, and why supporters should invest in your token..."
                rows={8}
                className={`w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all resize-none ${
                  errors.token_pitch
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                }`}
              />
              <div className="flex justify-between items-center mt-2 ml-2">
                {errors.token_pitch ? (
                  <p className="text-red-500 text-sm">{errors.token_pitch}</p>
                ) : (
                  <p className="text-sm text-gray-500">100-1000 characters</p>
                )}
                <span className={`text-sm font-medium ${charCountColor}`}>
                  {charCount}/1000
                </span>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/creator/step-6")}
                className="px-8 py-4 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={charCount < 100 || charCount > 1000}
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
