import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

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

// Creator API
export interface SocialLink {
  platform: "youtube" | "tiktok" | "instagram" | "twitter" | "other";
  handle: string;
  url: string;
  follower_count?: number;
}

export interface CreatorApplicationData {
  // Basic Information
  full_name: string;
  phone_number?: string;
  
  // Creator Profile
  creator_handle: string;
  bio: string;
  profile_picture?: string;
  category: string;
  custom_category?: string;
  
  // Social Media
  social_links: SocialLink[];
  engagement_metrics?: string;
  
  // Token Details
  token_name: string;
  token_symbol: string;
  ico_supply: number;
  funding_goal?: number;
  token_pitch: string;
  
  // Verification
  government_id_url: string;
  content_ownership_declared: boolean;
}

export const CreatorApi = {
  submitApplication: (data: CreatorApplicationData) =>
    apiClient.post<ApiResponse<any>>("/api/creators/apply", data),

  getApplicationStatus: () =>
    apiClient.get<ApiResponse<any>>("/api/creators/application"),

  updateProfile: (data: Partial<CreatorApplicationData>) =>
    apiClient.patch<ApiResponse<any>>("/api/creators/profile", data),

  uploadFile: (file: File, type: "profile_picture" | "government_id") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    return apiClient.post<ApiResponse<{ url: string }>>("/api/creators/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Admin API
export interface CreatorApplication {
  id: string;
  user_id: string;
  full_name: string;
  creator_handle: string;
  email: string;
  token_name: string;
  token_symbol: string;
  bio: string;
  category: string;
  state: "pending_submission" | "under_review" | "kyc_pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  social_links?: SocialLink[];
  phone_number?: string;
  profile_picture?: string;
  engagement_metrics?: string;
  ico_supply: number;
  funding_goal?: number;
  token_pitch: string;
  government_id_url: string;
  content_ownership_declared: boolean;
}

export const AdminApi = {
  getAllApplications: () =>
    apiClient.get<ApiResponse<CreatorApplication[]>>("/api/admin/creator-applications"),

  getApplicationById: (id: string) =>
    apiClient.get<ApiResponse<CreatorApplication>>(`/api/admin/creator-applications/${id}`),

  approveApplication: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/api/admin/creator-applications/${id}/approve`),

  rejectApplication: (id: string, reason: string) =>
    apiClient.post<ApiResponse<any>>(`/api/admin/creator-applications/${id}/reject`, { reason }),

  updateApplicationState: (id: string, state: string) =>
    apiClient.patch<ApiResponse<any>>(`/api/admin/creator-applications/${id}/state`, { state }),

  createCreatorToken: (creatorUserId: string, icoSupply: number) =>
    apiClient.post<ApiResponse<any>>(`/api/admin/creator-applications/create-token`, {
      ico_supply: icoSupply,
      userId: creatorUserId,
    })
};

export interface Balance {
  currency: string;
  available: number;
  locked: number;
  total: number;
}

export const BalanceApi = {
  getBalances: () =>
    apiClient.get<ApiResponse<{ balances: Record<string, { available: number; locked: number }> }>>("/api/balance"),

  getBalance: (currency: string) =>
    apiClient.get<ApiResponse<Balance>>(`/api/balance/${currency}`),

  lockFunds: (currency: string, amount: number) =>
    apiClient.post<ApiResponse<any>>("/api/balance/lock", { currency, amount }),

  unlockFunds: (currency: string, amount: number) =>
    apiClient.post<ApiResponse<any>>("/api/balance/unlock", { currency, amount }),

  updateBalance: (currency: string, amount: number, operation: "add" | "subtract") =>
    apiClient.post<ApiResponse<any>>("/api/balance/update", { currency, amount, operation }),
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
