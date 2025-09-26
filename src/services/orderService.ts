import { api, withPagination, PaginationParams } from "@/lib/api";
import { Order, ApiResponse, PaginatedResponse } from "@/types";

export interface OrderFilters extends PaginationParams {
  trackId?: string;
  priority?: string;
  orderType?: string;
  from?: string;
  to?: string;
  createdFrom?: string;
  createdTo?: string;
  status?: string;
}

export interface CreateOrderData {
  parcel: {
    from: string;
    to: string;
    weight: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    orderType?: "standard" | "express" | "overnight" | "international";
    priority?: "low" | "normal" | "high" | "urgent";
    description?: string;
    sender: {
      name: string;
      phone: string;
      email?: string;
      address: {
        street: string;
        city: string;
        state?: string;
        country: string;
        zipCode?: string;
        landmark?: string;
      };
    };
    receiver: {
      name: string;
      phone: string;
      email?: string;
      address: {
        street: string;
        city: string;
        state?: string;
        country: string;
        zipCode?: string;
        landmark?: string;
      };
    };
    item?: {
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      weight?: number;
      description?: string;
    }[];
  };
  payment?: {
    pType?: "cash-on-delivery" | "prepaid" | "credit-card" | "bank-transfer";
    pAmount?: number;
    pOfferDiscount?: number;
    pExtraCharge?: number;
    pDiscount?: number;
  };
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
}

class OrderService {
  private baseEndpoint = "/orders";

  async getOrders(filters?: OrderFilters): Promise<ApiResponse<Order[]>> {
    const params = filters ? withPagination(filters) : {};
    return api.get<Order[]>(this.baseEndpoint, params);
  }

  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    return api.get<Order>(`${this.baseEndpoint}/${orderId}`);
  }

  async createOrder(data: CreateOrderData): Promise<ApiResponse<Order>> {
    return api.post<Order>(this.baseEndpoint, data);
  }

  async updateOrder(orderId: string, data: UpdateOrderData): Promise<ApiResponse<Order>> {
    return api.put<Order>(`${this.baseEndpoint}/${orderId}`, data);
  }

  async deleteOrder(orderId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${this.baseEndpoint}/${orderId}`);
  }

  async processPayment(orderId: string, paymentData: any): Promise<ApiResponse<any>> {
    return api.post<any>(`${this.baseEndpoint}/${orderId}/payment`, paymentData);
  }

  async getOrdersByTrackId(trackId: string): Promise<ApiResponse<Order>> {
    return api.get<Order>(`${this.baseEndpoint}`, { trackId });
  }

  async updateOrderStatus(
    orderId: string, 
    status: Order["status"],
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return api.patch<Order>(`${this.baseEndpoint}/${orderId}`, { status, notes });
  }

  async getUserOrders(userId?: string, filters?: OrderFilters): Promise<ApiResponse<Order[]>> {
    const params = filters ? withPagination(filters) : {};
    if (userId) {
      params.userId = userId;
    }
    return api.get<Order[]>(this.baseEndpoint, params);
  }

  async getOrderStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    todayOrders: number;
    weeklyOrders: number;
    monthlyOrders: number;
  }>> {
    return api.get<any>(`${this.baseEndpoint}/stats`);
  }

  async exportOrders(filters?: OrderFilters, format: "csv" | "xlsx" = "csv"): Promise<Blob> {
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

  async bulkUpdateOrders(
    orderIds: string[], 
    updates: Partial<UpdateOrderData>
  ): Promise<ApiResponse<{ updated: number; failed: string[] }>> {
    return api.patch<any>(`${this.baseEndpoint}/bulk`, {
      orderIds,
      updates,
    });
  }
}

export const orderService = new OrderService();