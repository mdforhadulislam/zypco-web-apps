import { api, withPagination, PaginationParams } from "@/lib/api";
import { PriceChart, ApiResponse } from "@/types";

export interface PriceFilters extends PaginationParams {
  fromCountry?: string;
  toCountry?: string;
  serviceType?: "standard" | "express" | "overnight";
  isActive?: boolean;
}

export interface CreatePriceData {
  fromCountry: string;
  toCountry: string;
  serviceType: "standard" | "express" | "overnight";
  weightTiers: {
    minWeight: number;
    maxWeight: number;
    pricePerKg: number;
    basePrice: number;
  }[];
  additionalCharges: {
    fuelSurcharge?: number;
    remoteSurcharge?: number;
    securitySurcharge?: number;
    customsClearance?: number;
  };
  isActive?: boolean;
}

export interface UpdatePriceData extends Partial<CreatePriceData> {}

class PriceService {
  private baseEndpoint = "/prices";

  async getPrices(filters?: PriceFilters): Promise<ApiResponse<PriceChart[]>> {
    const params = filters ? withPagination(filters) : {};
    return api.get<PriceChart[]>(this.baseEndpoint, params);
  }

  async getPrice(priceId: string): Promise<ApiResponse<PriceChart>> {
    return api.get<PriceChart>(`${this.baseEndpoint}/${priceId}`);
  }

  async createPrice(data: CreatePriceData): Promise<ApiResponse<PriceChart>> {
    return api.post<PriceChart>(this.baseEndpoint, data);
  }

  async updatePrice(priceId: string, data: UpdatePriceData): Promise<ApiResponse<PriceChart>> {
    return api.put<PriceChart>(`${this.baseEndpoint}/${priceId}`, data);
  }

  async deletePrice(priceId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${this.baseEndpoint}/${priceId}`);
  }

  async calculatePrice(
    fromCountry: string,
    toCountry: string,
    weight: number,
    serviceType: "standard" | "express" | "overnight"
  ): Promise<ApiResponse<{
    basePrice: number;
    weightCharge: number;
    additionalCharges: number;
    totalPrice: number;
    estimatedDays: number;
  }>> {
    return api.post<any>(`${this.baseEndpoint}/calculate`, {
      fromCountry,
      toCountry,
      weight,
      serviceType,
    });
  }

  async togglePriceStatus(priceId: string, isActive: boolean): Promise<ApiResponse<PriceChart>> {
    return api.patch<PriceChart>(`${this.baseEndpoint}/${priceId}`, { isActive });
  }
}

export const priceService = new PriceService();