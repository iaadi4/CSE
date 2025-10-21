"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { z } from "zod";
import { FormInput } from "@/components/ui/form-input";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate form data
    try {
      const validatedData = loginSchema.parse({ email, password });
      loginMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof LoginFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof LoginFormData] = issue.message;
          }
        });
        setValidationErrors(errors);
      }
    }
  };

  return (
    <>
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
        {loginMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {loginMutation.error?.response?.data?.message ||
              "Login failed. Please check your credentials."}
          </div>
        )}

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
        />

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-8 bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loginMutation.isPending ? (
            <>
              <Spinner size="sm" />
              <span>Signing in...</span>
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="text-zinc-900 font-quicksand font-medium">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="text-zinc-600 hover:underline cursor-pointer"
        >
          Register now
        </Link>
      </div>
    </>
  );
}
