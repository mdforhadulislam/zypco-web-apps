import { api, withPagination, PaginationParams } from "@/lib/api";
import { User, ApiResponse } from "@/types";

export interface UserFilters extends PaginationParams {
  role?: "admin" | "moderator" | "user";
  isActive?: boolean;
  isVerified?: boolean;
  email?: string;
  phone?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  role: "admin" | "moderator" | "user";
  password: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: "admin" | "moderator" | "user";
  isActive?: boolean;
  isVerified?: boolean;
  avatar?: string;
}

class UserService {
  private baseEndpoint = "/accounts";

  async getUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const params = filters ? withPagination(filters) : {};
    return api.get<User[]>(this.baseEndpoint, params);
  }

  async getUser(phone: string): Promise<ApiResponse<User>> {
    return api.get<User>(`${this.baseEndpoint}/${phone}`);
  }

  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    return api.post<User>(this.baseEndpoint, data);
  }

  async updateUser(phone: string, data: UpdateUserData): Promise<ApiResponse<User>> {
    return api.put<User>(`${this.baseEndpoint}/${phone}`, data);
  }

  async deleteUser(phone: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${this.baseEndpoint}/${phone}`);
  }

  async getUserStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    adminCount: number;
    moderatorCount: number;
    userCount: number;
    todayRegistrations: number;
    weeklyRegistrations: number;
    monthlyRegistrations: number;
  }>> {
    return api.get<any>(`${this.baseEndpoint}/stats`);
  }

  async getUserPermissions(phone: string): Promise<ApiResponse<any>> {
    return api.get<any>(`${this.baseEndpoint}/${phone}/permissions`);
  }

  async updateUserPermissions(phone: string, permissions: any): Promise<ApiResponse<any>> {
    return api.put<any>(`${this.baseEndpoint}/${phone}/permissions`, permissions);
  }

  async getUserOrders(phone: string): Promise<ApiResponse<any[]>> {
    return api.get<any[]>(`${this.baseEndpoint}/${phone}/order`);
  }

  async getUserNotifications(phone: string): Promise<ApiResponse<any[]>> {
    return api.get<any[]>(`${this.baseEndpoint}/${phone}/notifications`);
  }

  async getUserSigninHistory(phone: string): Promise<ApiResponse<any[]>> {
    return api.get<any[]>(`${this.baseEndpoint}/${phone}/sigin-historys`);
  }

  async exportUsers(filters?: UserFilters, format: "csv" | "xlsx" = "csv"): Promise<Blob> {
    const params = filters ? withPagination(filters) : {};
    params.format = format;
    
    const response = await fetch(`/api/v1${this.baseEndpoint}/export?${new URLSearchParams(params)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Export failed");
    }

    return response.blob();
  }

  async bulkUpdateUsers(
    phones: string[], 
    updates: Partial<UpdateUserData>
  ): Promise<ApiResponse<{ updated: number; failed: string[] }>> {
    return api.patch<any>(`${this.baseEndpoint}/bulk`, {
      phones,
      updates,
    });
  }

  async toggleUserStatus(phone: string, isActive: boolean): Promise<ApiResponse<User>> {
    return api.patch<User>(`${this.baseEndpoint}/${phone}`, { isActive });
  }

  async verifyUser(phone: string): Promise<ApiResponse<User>> {
    return api.patch<User>(`${this.baseEndpoint}/${phone}`, { isVerified: true });
  }

  async resetUserPassword(phone: string): Promise<ApiResponse<{ message: string }>> {
    return api.post<any>(`${this.baseEndpoint}/${phone}/reset-password`, {});
  }
}

export const userService = new UserService();