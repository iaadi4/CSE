"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatorOnboardingStore } from "@/store/creator-onboarding";
import { z } from "zod";

const documentSchema = z.object({
  government_id_url: z.string().url("Please enter a valid URL").min(1, "Document URL is required"),
});

export default function Step8Document() {
  const router = useRouter();
  const {
    government_id_url,
    setVerification,
    setCurrentStep,
    markStepCompleted,
  } = useCreatorOnboardingStore();

  const [formData, setFormData] = useState({
    government_id_url: government_id_url || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentStep(8);
  }, [setCurrentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      documentSchema.parse(formData);
      setVerification(formData);
      markStepCompleted(8);
      router.push("/creator/step-9");
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
            <span className="text-sm font-medium text-gray-600">8 of 9</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: "89%" }}
            ></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cabinet-bold text-gray-900 mb-3">
            Verify your identity
          </h1>
          <p className="text-gray-600 font-quicksand mb-10">
            Upload your government-issued ID for verification
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                Government ID URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.government_id_url}
                onChange={(e) => {
                  setFormData({ ...formData, government_id_url: e.target.value });
                  setErrors({ ...errors, government_id_url: "" });
                }}
                placeholder="https://example.com/your-document.pdf"
                className={`w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all ${
                  errors.government_id_url
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                }`}
              />
              {errors.government_id_url && (
                <p className="text-red-500 text-sm mt-2 ml-2">{errors.government_id_url}</p>
              )}
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blue-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">How to upload</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload your ID to a secure service (e.g., Google Drive, Dropbox)</li>
                    <li>• Make sure the link is publicly accessible</li>
                    <li>• Accepted documents: Passport, Driver's License, National ID</li>
                    <li>• Your information will be kept confidential</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/creator/step-7")}
                className="px-8 py-4 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!formData.government_id_url}
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
