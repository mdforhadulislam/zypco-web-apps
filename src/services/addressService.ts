import { api, withPagination, PaginationParams } from "@/lib/api";
import { Address, ApiResponse } from "@/types";

export interface AddressFilters extends PaginationParams {
  country?: string;
  city?: string;
  state?: string;
  userId?: string;
}

export interface UserAddress {
  _id: string;
  userId?: string;
  phone?: string;
  label: string; // e.g., "Home", "Office", "Warehouse"
  isDefault: boolean;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
    landmark?: string;
  };
  contactPerson?: {
    name: string;
    phone: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  label: string;
  isDefault?: boolean;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
    landmark?: string;
  };
  contactPerson?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

class AddressService {
  // User address management using existing API structure
  async getUserAddresses(phone: string): Promise<ApiResponse<UserAddress[]>> {
    return api.get<UserAddress[]>(`/accounts/${phone}/address`);
  }

  async getUserAddress(phone: string, addressId: string): Promise<ApiResponse<UserAddress>> {
    return api.get<UserAddress>(`/accounts/${phone}/address/${addressId}`);
  }

  async createUserAddress(phone: string, data: CreateAddressData): Promise<ApiResponse<UserAddress>> {
    return api.post<UserAddress>(`/accounts/${phone}/address`, data);
  }

  async updateUserAddress(
    phone: string, 
    addressId: string, 
    data: UpdateAddressData
  ): Promise<ApiResponse<UserAddress>> {
    return api.put<UserAddress>(`/accounts/${phone}/address/${addressId}`, data);
  }

  async deleteUserAddress(phone: string, addressId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/accounts/${phone}/address/${addressId}`);
  }

  async setDefaultAddress(phone: string, addressId: string): Promise<ApiResponse<UserAddress>> {
    return api.patch<UserAddress>(`/accounts/${phone}/address/${addressId}`, {
      isDefault: true,
    });
  }

  // Global address book (admin/moderator only) - using accounts API
  async getAllAddresses(filters?: AddressFilters): Promise<ApiResponse<UserAddress[]>> {
    const params = filters ? withPagination(filters) : {};
    return api.get<UserAddress[]>("/address", params);
  }

  // Address validation
  async validateAddress(address: Address): Promise<ApiResponse<{
    isValid: boolean;
    suggestions?: Address[];
    errors?: string[];
  }>> {
    return api.post<any>("/addresses/validate", { address });
  }

  // Address autocomplete/suggestions
  async getAddressSuggestions(query: string, country?: string): Promise<ApiResponse<{
    suggestions: {
      street: string;
      city: string;
      state?: string;
      country: string;
      zipCode?: string;
    }[];
  }>> {
    const params = { query, ...(country && { country }) };
    return api.get<any>("/addresses/suggestions", params);
  }
}

export const addressService = new AddressService();