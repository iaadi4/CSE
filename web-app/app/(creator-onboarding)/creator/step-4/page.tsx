"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatorOnboardingStore } from "@/store/creator-onboarding";
import { z } from "zod";

const bioSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500, "Bio must be less than 500 characters"),
});

export default function Step4Bio() {
  const router = useRouter();
  const {
    bio,
    setCreatorProfile,
    setCurrentStep,
    markStepCompleted,
  } = useCreatorOnboardingStore();

  const [bioText, setBioText] = useState(bio || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      bioSchema.parse({ bio: bioText });
      setCreatorProfile({ bio: bioText });
      markStepCompleted(4);
      router.push("/creator/step-5");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.issues[0]?.message || "Invalid bio");
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">4 of 9</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: "44%" }}
            ></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cabinet-bold text-gray-900 mb-3">
            Tell us about yourself
          </h1>
          <p className="text-gray-600 font-quicksand mb-10">
            Share your story and what makes you unique
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <textarea
                value={bioText}
                onChange={(e) => {
                  setBioText(e.target.value);
                  setError("");
                }}
                placeholder="Tell your audience about your creative journey, what you do, and what makes you unique..."
                rows={6}
                maxLength={500}
                className={`w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all resize-none ${
                  error
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                }`}
              />
              <div className="flex justify-between items-center mt-2 px-2">
                {error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : (
                  <p className="text-sm text-gray-500">At least 50 characters</p>
                )}
                <p className={`text-sm ${bioText.length > 450 ? 'text-orange-600' : 'text-gray-400'}`}>
                  {bioText.length}/500
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/creator/step-3")}
                className="px-8 py-4 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!bioText || bioText.length < 50}
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
