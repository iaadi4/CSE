"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatorOnboardingStore } from "@/store/creator-onboarding";
import { z } from "zod";

const categorySchema = z.object({
  category: z.string().min(1, "Please select a category"),
  custom_category: z.string().optional(),
});

const categories = [
  "Musician",
  "Influencer",
  "Artist",
  "Filmmaker",
  "Gamer",
  "Content Creator",
  "Other",
];

export default function Step3Category() {
  const router = useRouter();
  const {
    category,
    custom_category,
    setCreatorProfile,
    setCurrentStep,
    markStepCompleted,
  } = useCreatorOnboardingStore();

  const [formData, setFormData] = useState({
    category: category || "",
    custom_category: custom_category || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      categorySchema.parse(formData);
      setCreatorProfile(formData);
      markStepCompleted(3);
      router.push("/creator/step-4");
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
            <span className="text-sm font-medium text-gray-600">3 of 9</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: "33%" }}
            ></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cabinet-bold text-gray-900 mb-3">
            What type of creator are you?
          </h1>
          <p className="text-gray-600 font-quicksand mb-10">
            Choose the category that best describes your content
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, category: cat });
                      setErrors({ ...errors, category: "" });
                    }}
                    className={`px-6 py-4 rounded-2xl border-2 font-medium transition-all ${
                      formData.category === cat
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-red-500 text-sm mt-2 ml-2">
                  {errors.category}
                </p>
              )}
            </div>

            {formData.category === "Other" && (
              <div>
                <input
                  type="text"
                  value={formData.custom_category}
                  onChange={(e) => {
                    setFormData({ ...formData, custom_category: e.target.value });
                  }}
                  placeholder="Specify your category"
                  className="w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/creator/step-2")}
                className="px-8 py-4 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!formData.category}
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
