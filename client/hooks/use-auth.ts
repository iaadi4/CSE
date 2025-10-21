import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import type { ApiError } from "@/lib/api";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// Get current user
export function useUser() {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await AuthApi.getUser();
      setUser(response.data.data);
      return response.data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Login mutation
export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      AuthApi.login(email, password),
    onSuccess: (response) => {
      setUser(response.data.data);
      queryClient.setQueryData(authKeys.user(), response.data.data);
      router.push("/dashboard");
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error("Login failed:", error.response?.data?.message || error.message);
    },
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      username,
      email,
      password,
      password_confirmation,
      role = "investor",
    }: {
      username: string;
      email: string;
      password: string;
      password_confirmation: string;
      role?: "investor" | "creator";
    }) => AuthApi.register(username, email, password, password_confirmation, role),
    onSuccess: (response) => {
      setUser(response.data.data);
      queryClient.setQueryData(authKeys.user(), response.data.data);
      router.push("/dashboard");
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error("Registration failed:", error.response?.data?.message || error.message);
    },
  });
}

// Logout mutation
export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthApi.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Still clear local state even if API fails
      logout();
      queryClient.clear();
      router.push("/login");
    },
  });
}

// Auto-refresh token hook
export function useAutoRefresh() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useQuery({
    queryKey: ["auth", "refresh"],
    queryFn: async () => {
      const response = await AuthApi.refreshToken();
      console.log("Token auto-refreshed");
      return response.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
}
