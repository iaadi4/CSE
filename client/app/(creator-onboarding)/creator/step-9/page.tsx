"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatorOnboardingStore } from "@/store/creator-onboarding";
import { z } from "zod";
import { CreatorApi } from "@/lib/api";

const ownershipSchema = z.object({
  content_ownership_declared: z.boolean().refine((val) => val === true, {
    message: "You must declare content ownership to proceed",
  }),
});

export default function Step9Ownership() {
  const router = useRouter();
  const {
    content_ownership_declared,
    setVerification,
    setCurrentStep,
    markStepCompleted,
    getAllData,
    resetOnboarding,
  } = useCreatorOnboardingStore();

  const [formData, setFormData] = useState({
    content_ownership_declared: content_ownership_declared || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentStep(9);
  }, [setCurrentStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      ownershipSchema.parse(formData);
      setVerification(formData);
      markStepCompleted(9);

      setIsSubmitting(true);

      // Get all data from the store
      const applicationData = getAllData();

      // Submit the application
      await CreatorApi.submitApplication(applicationData);

      // Reset the onboarding state
      resetOnboarding();

      // Redirect to dashboard with success message
      router.push("/dashboard?application=submitted");
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      } else {
        // Handle API errors
        console.error("Error submitting application:", error);
        setErrors({ submit: "Failed to submit application. Please try again." });
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">9 of 9</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cabinet-bold text-gray-900 mb-3">
            Final step: Declaration
          </h1>
          <p className="text-gray-600 font-quicksand mb-10">
            Confirm that you own the rights to your content
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.content_ownership_declared}
                  onChange={(e) => {
                    setFormData({ ...formData, content_ownership_declared: e.target.checked });
                    setErrors({ ...errors, content_ownership_declared: "" });
                  }}
                  className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-2">
                    I declare content ownership <span className="text-red-500">*</span>
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    I hereby confirm that I own all rights to the content I will be sharing through
                    this platform, or have obtained all necessary permissions from the rightful
                    owners. I understand that any violation of intellectual property rights may
                    result in the termination of my account and legal consequences.
                  </p>
                </div>
              </label>
              {errors.content_ownership_declared && (
                <p className="text-red-500 text-sm mt-3 ml-9">
                  {errors.content_ownership_declared}
                </p>
              )}
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-green-800 space-y-1.5">
                    <li>• Your application will be reviewed by our team</li>
                    <li>• You'll receive an email notification once the review is complete</li>
                    <li>• The review process typically takes 2-3 business days</li>
                    <li>• You can check your application status in your dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/creator/step-8")}
                disabled={isSubmitting}
                className="px-8 py-4 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!formData.content_ownership_declared || isSubmitting}
                className="flex-1 px-8 py-4 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
