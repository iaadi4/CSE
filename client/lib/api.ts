import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface ApiResponse<T = any> {
  ok: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  ok: boolean;
  message: string;
  data: any;
  errors?: Record<string, string[]>;
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track refresh state
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Process queued requests after refresh
const processQueue = (error: any = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  refreshQueue = [];
};

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/")) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/api/auth/refresh-token");
        processQueue();
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Redirect to login or emit logout event
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const AuthApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ id: string; username: string; email: string }>>(
      "/api/auth/login",
      { email, password }
    ),

  register: (
    username: string,
    email: string,
    password: string,
    password_confirmation: string,
    role: "investor" | "creator" = "investor"
  ) =>
    apiClient.post<ApiResponse<{ id: string; username: string; email: string }>>(
      "/api/auth/register",
      { username, email, password, password_confirmation, role }
    ),

  logout: () => apiClient.post<ApiResponse<null>>("/api/auth/logout"),

  refreshToken: () => apiClient.post<ApiResponse<{ message: string }>>("/api/auth/refresh-token"),

  getUser: () =>
    apiClient.get<ApiResponse<{ id: string; username: string; email: string; role: string }>>(
      "/api/user/info"
    ),
};

// Export legacy ApiClient for backward compatibility (will be removed)
export class ApiClient {
  static async login(email: string, password: string) {
    const response = await AuthApi.login(email, password);
    return response.data;
  }

  static async register(
    username: string,
    email: string,
    password: string,
    password_confirmation: string,
    role: "investor" | "creator" = "investor"
  ) {
    const response = await AuthApi.register(username, email, password, password_confirmation, role);
    return response.data;
  }

  static async logout() {
    const response = await AuthApi.logout();
    return response.data;
  }

  static async getUser() {
    const response = await AuthApi.getUser();
    return response.data;
  }
}
