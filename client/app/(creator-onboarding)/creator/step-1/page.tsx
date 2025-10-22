"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatorOnboardingStore } from "@/store/creator-onboarding";
import { basicInfoSchema, type BasicInfoFormData } from "@/lib/validations/creator";
import { z } from "zod";

export default function Step1BasicInfo() {
  const router = useRouter();
  const {
    full_name,
    phone_number,
    setBasicInfo,
    setCurrentStep,
    markStepCompleted,
  } = useCreatorOnboardingStore();

  const [formData, setFormData] = useState({
    full_name: full_name || "",
    phone_number: phone_number || "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof BasicInfoFormData, string>>
  >({});

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      const validatedData = basicInfoSchema.parse(formData);
      setBasicInfo(validatedData);
      markStepCompleted(1);
      router.push("/creator/step-2");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof BasicInfoFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof BasicInfoFormData] = issue.message;
          }
        });
        setValidationErrors(errors);
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">1 of 9</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full transition-all duration-500" style={{ width: '11%' }}></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cabinet-bold text-gray-900 mb-3">
            What's your full name?
          </h1>
          <p className="text-gray-600 font-quicksand mb-10">
            This will be displayed on your creator profile
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => {
                  setFormData({ ...formData, full_name: e.target.value });
                  setValidationErrors({ ...validationErrors, full_name: undefined });
                }}
                placeholder="John Doe"
                className={`w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all ${
                  validationErrors.full_name
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                }`}
              />
              {validationErrors.full_name && (
                <p className="text-red-500 text-sm mt-2 ml-2">{validationErrors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => {
                  setFormData({ ...formData, phone_number: e.target.value });
                  setValidationErrors({ ...validationErrors, phone_number: undefined });
                }}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all ${
                  validationErrors.phone_number
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                }`}
              />
              {validationErrors.phone_number && (
                <p className="text-red-500 text-sm mt-2 ml-2">{validationErrors.phone_number}</p>
              )}
              <p className="text-sm text-gray-500 mt-2 ml-2">For account verification purposes</p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-8 py-4 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-all hover:shadow-lg"
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
