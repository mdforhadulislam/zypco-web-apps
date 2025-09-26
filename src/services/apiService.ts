import { getAuthHeaders, handleApiError } from "@/components/ApiCall/url";

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
  requestId?: string;
}

export class ApiService {
  private static instance: ApiService;
  
  private constructor() {}
  
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private getBaseUrl(): string {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.PUBLIC_APP_URL || "http://localhost:3000";
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.getBaseUrl()}/api/v1${endpoint}`;
    
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      // Handle unauthorized responses
      if (response.status === 401) {
        // Try to refresh token
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          // Retry the request with new token
          return this.makeRequest(endpoint, options);
        } else {
          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/auth/signin";
          }
          throw new Error("Authentication required");
        }
      }

      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const response = await fetch(`${this.getBaseUrl()}/api/v1/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (!data.success || !data.data) return false;

      // Update tokens
      localStorage.setItem("accessToken", data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }

      return true;
    } catch {
      return false;
    }
  }

  // Generic CRUD methods
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return this.makeRequest<T>(url, { method: "GET" });
  }

  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "DELETE" });
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();