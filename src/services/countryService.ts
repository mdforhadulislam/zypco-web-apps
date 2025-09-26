import { api, withPagination, PaginationParams } from "@/lib/api";
import { Country, ApiResponse } from "@/types";

export interface CountryFilters extends PaginationParams {
  region?: string;
  currency?: string;
  isActive?: boolean;
  code?: string;
  name?: string;
}

export interface CreateCountryData {
  name: string;
  code: string;
  region: string;
  currency: string;
  isActive?: boolean;
  deliveryDays: {
    standard: number;
    express: number;
    overnight: number;
  };
}

export interface UpdateCountryData extends Partial<CreateCountryData> {}

class CountryService {
  private baseEndpoint = "/countrys";

  async getCountries(filters?: CountryFilters): Promise<ApiResponse<Country[]>> {
    const params = filters ? withPagination(filters) : {};
    return api.get<Country[]>(this.baseEndpoint, params);
  }

  async getCountry(countryId: string): Promise<ApiResponse<Country>> {
    return api.get<Country>(`${this.baseEndpoint}/${countryId}`);
  }

  async createCountry(data: CreateCountryData): Promise<ApiResponse<Country>> {
    return api.post<Country>(this.baseEndpoint, data);
  }

  async updateCountry(countryId: string, data: UpdateCountryData): Promise<ApiResponse<Country>> {
    return api.put<Country>(`${this.baseEndpoint}/${countryId}`, data);
  }

  async deleteCountry(countryId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${this.baseEndpoint}/${countryId}`);
  }

  async getCountryStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    regions: { [key: string]: number };
    currencies: { [key: string]: number };
  }>> {
    return api.get<any>(`${this.baseEndpoint}/stats`);
  }

  async toggleCountryStatus(countryId: string, isActive: boolean): Promise<ApiResponse<Country>> {
    return api.patch<Country>(`${this.baseEndpoint}/${countryId}`, { isActive });
  }

  // Get all active countries for dropdowns
  async getActiveCountries(): Promise<ApiResponse<Country[]>> {
    return api.get<Country[]>(`${this.baseEndpoint}`, { isActive: true });
  }
}

export const countryService = new CountryService();