"use client";

import { useState } from "react";
import { useRegister } from "@/hooks/use-auth";
import Link from "next/link";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { z } from "zod";
import { FormInput } from "@/components/ui/form-input";
import { Spinner } from "@/components/ui/spinner";
import { CreatorOnboardingDialog } from "@/components/creator/onboarding-dialog";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate form data
    try {
      const validatedData = registerSchema.parse({
        username,
        email,
        password,
        confirmPassword,
      });

      registerMutation.mutate(
        {
          username: validatedData.username,
          email: validatedData.email,
          password: validatedData.password,
          password_confirmation: validatedData.confirmPassword,
        },
        {
          onSuccess: () => {
            // Show the creator onboarding dialog after successful registration
            setShowDialog(true);
          },
        }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof RegisterFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof RegisterFormData] = issue.message;
          }
        });
        setValidationErrors(errors);
      }
    }
  };

  return (
    <>
      <CreatorOnboardingDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
      
      <div className="flex flex-col text-center items-center gap-5">
        <div className="text-6xl font-cabinet-bold">Welcome back!</div>
        <p className="text-sm font-quicksand max-w-[300px]">
          Start investing in your favourite creator with
          <span className="font-bold"> Creator Stock Exchange</span>. Get
          started for free.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 font-quicksand min-w-[500px]"
      >
        {registerMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {registerMutation.error?.response?.data?.message ||
              "Registration failed. Please try again."}
          </div>
        )}

        <FormInput
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          error={validationErrors.username}
        />

        <FormInput
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          error={validationErrors.email}
        />

        <FormInput
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          error={validationErrors.password}
          helperText={
            !validationErrors.password
              ? "Must be at least 8 characters with uppercase, lowercase, number, and special character"
              : undefined
          }
        />

        <FormInput
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          error={validationErrors.confirmPassword}
        />

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full mt-8 bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {registerMutation.isPending ? (
            <>
              <Spinner size="sm" />
              <span>Creating account...</span>
            </>
          ) : (
            "Register"
          )}
        </button>
      </form>
      <div className="text-zinc-900 font-quicksand font-medium">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-zinc-600 hover:underline cursor-pointer"
        >
          Login now
        </Link>
      </div>
    </>
  );
}
