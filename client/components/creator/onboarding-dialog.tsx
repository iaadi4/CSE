"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AiOutlineClose } from "react-icons/ai";

interface CreatorOnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorOnboardingDialog: React.FC<
  CreatorOnboardingDialogProps
> = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleBecomeCreator = () => {
    onClose();
    router.push("/creator/step-1");
  };

  const handleSkip = () => {
    onClose();
    router.push("/dashboard");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <AiOutlineClose size={24} />
        </button>

        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">🚀</span>
            </div>
          </div>

          <h2 className="text-2xl font-cabinet-bold text-gray-900 mb-3">
            Welcome to CSE!
          </h2>

          <p className="text-gray-600 font-quicksand mb-6">
            Want to launch your own creator token and let fans invest in your
            journey? Become a creator today!
          </p>

          <div className="space-y-3">
            <button
              onClick={handleBecomeCreator}
              className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-full transition"
            >
              Yes, Become a Creator
            </button>
            <button
              onClick={handleSkip}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            You can always apply to become a creator from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
};
