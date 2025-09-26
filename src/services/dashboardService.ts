import { apiService, ApiResponse } from "./apiService";

// User Management Service
export class UserService {
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    return apiService.get("/accounts", params);
  }

  static async getUserByPhone(phone: string): Promise<ApiResponse<any>> {
    return apiService.get(`/accounts/${phone}`);
  }

  static async updateUser(phone: string, data: any): Promise<ApiResponse<any>> {
    return apiService.put(`/accounts/${phone}`, data);
  }

  static async deleteUser(phone: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/accounts/${phone}`);
  }

  static async getUserAddresses(phone: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/accounts/${phone}/address`);
  }

  static async getUserOrders(phone: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/accounts/${phone}/order`);
  }

  static async getUserNotifications(phone: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/accounts/${phone}/notifications`);
  }
}

// Order Management Service
export class OrderService {
  static async getOrders(params?: {
    page?: number;
    limit?: number;
    trackId?: string;
    priority?: string;
    orderType?: string;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    return apiService.get("/orders", params);
  }

  static async getOrder(orderId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/orders/${orderId}`);
  }

  static async createOrder(data: any): Promise<ApiResponse<any>> {
    return apiService.post("/orders", data);
  }

  static async updateOrder(orderId: string, data: any): Promise<ApiResponse<any>> {
    return apiService.put(`/orders/${orderId}`, data);
  }

  static async deleteOrder(orderId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/orders/${orderId}`);
  }

  static async updateOrderPayment(orderId: string, data: any): Promise<ApiResponse<any>> {
    return apiService.put(`/orders/${orderId}/payment`, data);
  }
}

// Analytics Service
export class AnalyticsService {
  static async getOverview(params?: {
    startDate?: string;
    endDate?: string;
    days?: number;
  }): Promise<ApiResponse<any>> {
    return apiService.get("/analytics", params);
  }

  static async getUserAnalytics(): Promise<ApiResponse<any>> {
    return apiService.get("/analytics/user-analytics");
  }

  static async getOrderAnalytics(): Promise<ApiResponse<any>> {
    return apiService.get("/analytics/order-analytics");
  }

  static async getRevenueAnalytics(): Promise<ApiResponse<any>> {
    return apiService.get("/analytics/revenue-analytics");
  }

  static async getLoginAnalytics(): Promise<ApiResponse<any>> {
    return apiService.get("/analytics/login-analytics");
  }
}

// Content Management Service
export class ContentService {
  static async getBlogs(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    return apiService.get("/blogs", params);
  }

  static async getBlog(blogId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/blogs/${blogId}`);
  }

  static async createBlog(data: any): Promise<ApiResponse<any>> {
    return apiService.post("/blogs", data);
  }

  static async updateBlog(blogId: string, data: any): Promise<ApiResponse<any>> {
    return apiService.put(`/blogs/${blogId}`, data);
  }

  static async deleteBlog(blogId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/blogs/${blogId}`);
  }

  static async getReviews(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    return apiService.get("/reviews", params);
  }

  static async getReview(reviewId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/reviews/${reviewId}`);
  }

  static async createReview(data: any): Promise<ApiResponse<any>> {
    return apiService.post("/reviews", data);
  }

  static async updateReview(reviewId: string, data: any): Promise<ApiResponse<any>> {
    return apiService.put(`/reviews/${reviewId}`, data);
  }

  static async deleteReview(reviewId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/reviews/${reviewId}`);
  }
}

// Notification Service
export class NotificationService {
  static async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<ApiResponse<any[]>> {
    return apiService.get("/notifications", params);
  }

  static async getNotification(notificationId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/notifications/${notificationId}`);
  }

  static async createNotification(data: any): Promise<ApiResponse<any>> {
    return apiService.post("/notifications", data);
  }

  static async updateNotification(notificationId: string, data: any): Promise<ApiResponse<any>> {
    return apiService.put(`/notifications/${notificationId}`, data);
  }

  static async markAsRead(notificationId: string): Promise<ApiResponse<any>> {
    return apiService.patch(`/notifications/${notificationId}`, { isRead: true });
  }

  static async deleteNotification(notificationId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/notifications/${notificationId}`);
  }
}

// Pickup Service
export class PickupService {
  static async getPickups(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    return apiService.get("/pickups", params);
  }

  static async getPickup(pickupId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/pickups/${pickupId}`);
  }

  static async createPickup(data: any): Promise<ApiResponse<any>> {
    return apiService.post("/pickups", data);
  }

  static async updatePickup(pickupId: string, data: any): Promise<ApiResponse<any>> {
    return apiService.put(`/pickups/${pickupId}`, data);
  }

  static async deletePickup(pickupId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/pickups/${pickupId}`);
  }
}