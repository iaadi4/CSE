"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatorOnboardingStore } from "@/store/creator-onboarding";
import { z } from "zod";

const handleSchema = z.object({
  creator_handle: z
    .string()
    .min(3, "Handle must be at least 3 characters")
    .max(30, "Handle must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Handle can only contain letters, numbers, and underscores"),
});

export default function Step2CreatorHandle() {
  const router = useRouter();
  const {
    creator_handle,
    setCreatorProfile,
    setCurrentStep,
    markStepCompleted,
  } = useCreatorOnboardingStore();

  const [handle, setHandle] = useState(creator_handle || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      handleSchema.parse({ creator_handle: handle });
      setCreatorProfile({ creator_handle: handle });
      markStepCompleted(2);
      router.push("/creator/step-3");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.issues[0]?.message || "Invalid handle");
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">2 of 9</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full transition-all duration-500" style={{ width: '22%' }}></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cabinet-bold text-gray-900 mb-3">
            Choose your creator handle
          </h1>
          <p className="text-gray-600 font-quicksand mb-10">
            This is your unique identity on the platform. Make it memorable!
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">
                  @
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    setError("");
                  }}
                  placeholder="yourhandle"
                  className={`w-full pl-12 pr-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all ${
                    error
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  }`}
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 ml-2">{error}</p>
              )}
              {!error && handle && (
                <p className="text-green-600 text-sm mt-2 ml-2">✓ @{handle} looks good!</p>
              )}
              <p className="text-sm text-gray-500 mt-2 ml-2">
                Use only letters, numbers, and underscores (3-30 characters)
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/creator/step-1")}
                className="px-8 py-4 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!handle}
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
