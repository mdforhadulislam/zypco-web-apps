"use client";

import { ApiResponse, getAuthHeaders, handleApiError } from "@/components/ApiCall/url";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import useSWR, { SWRConfiguration, mutate } from "swr";

// Enhanced fetcher with auth handling
const fetcher = async (url: string) => {
  const headers = getAuthHeaders();
  
  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch('/api/v1/auth/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.data.accessToken);
            
            // Retry original request with new token
            const retryResponse = await fetch(url, {
              headers: {
                ...headers,
                Authorization: `Bearer ${refreshData.data.accessToken}`,
              },
            });
            
            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
        }
        
        // If refresh fails, redirect to login
        localStorage.removeItem('authUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/signin';
        throw new Error('Authentication failed');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
};

// Custom hook for API calls with SWR
export const useApi = <T = any>(
  url: string | null, 
  options?: SWRConfiguration
) => {
  const { user, refreshToken } = useAuth();
  const router = useRouter();
  
  // Don't fetch if no user or URL
  const shouldFetch = user && url;
  
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutateSWR,
  } = useSWR<ApiResponse<T>>(
    shouldFetch ? url : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      onError: async (error) => {
        if (error.message?.includes('Authentication failed')) {
          // Try to refresh token one more time
          const success = await refreshToken();
          if (!success) {
            router.push('/auth/signin');
          }
        }
      },
      ...options,
    }
  );
  
  return {
    data: data?.data,
    response: data,
    error,
    isLoading,
    isValidating,
    mutate: mutateSWR,
    success: data?.success ?? false,
  };
};

// Hook for paginated data
export const usePaginatedApi = <T = any>(
  baseUrl: string,
  params: Record<string, any> = {}
) => {
  const { page = 1, limit = 20, ...otherParams } = params;
  
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...Object.fromEntries(
      Object.entries(otherParams).map(([key, value]) => [key, String(value)])
    ),
  });
  
  const url = `${baseUrl}?${queryParams}`;
  
  const result = useApi<T[]>(url);
  
  return {
    ...result,
    meta: result.response?.meta,
    currentPage: page,
    totalPages: result.response?.meta?.totalPages || 1,
    total: result.response?.meta?.total || 0,
  };
};

// Hook for mutations (POST, PUT, DELETE)
export const useApiMutation = () => {
  const { refreshToken } = useAuth();
  const router = useRouter();
  
  const mutateApi = useCallback(async <T = any>(
    url: string,
    options: {
      method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data?: any;
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
      successMessage?: string;
    }
  ): Promise<ApiResponse<T> | null> => {
    const {
      method,
      data,
      onSuccess,
      onError,
      showSuccessToast = true,
      showErrorToast = true,
      successMessage,
    } = options;
    
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(url, {
        method,
        headers,
        ...(data && { body: JSON.stringify(data) }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            // Retry with new token
            const newHeaders = getAuthHeaders();
            const retryResponse = await fetch(url, {
              method,
              headers: newHeaders,
              ...(data && { body: JSON.stringify(data) }),
            });
            
            if (retryResponse.ok) {
              const result = await retryResponse.json();
              
              if (showSuccessToast) {
                toast.success(successMessage || result.message || 'Operation successful');
              }
              
              onSuccess?.(result.data);
              return result;
            }
          } else {
            router.push('/auth/signin');
            return null;
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}`;
        
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        
        onError?.(errorData);
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (showSuccessToast) {
        toast.success(successMessage || result.message || 'Operation successful');
      }
      
      onSuccess?.(result.data);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      onError?.(error);
      console.error('API Mutation Error:', error);
      return null;
    }
  }, [refreshToken, router]);
  
  return { mutateApi };
};

// Hook for optimistic updates
export const useOptimisticApi = <T = any>(url: string) => {
  const { mutateApi } = useApiMutation();
  
  const optimisticUpdate = useCallback(async (
    newData: T,
    mutationUrl: string,
    mutationOptions: Parameters<typeof mutateApi>[1]
  ) => {
    // Optimistically update the cache
    mutate(url, (currentData: ApiResponse<T[]> | undefined) => {
      if (!currentData) return currentData;
      
      return {
        ...currentData,
        data: Array.isArray(currentData.data) 
          ? [...currentData.data, newData]
          : newData,
      };
    }, false);
    
    try {
      // Perform the actual mutation
      const result = await mutateApi(mutationUrl, mutationOptions);
      
      // Revalidate to sync with server
      mutate(url);
      
      return result;
    } catch (error) {
      // Revert optimistic update on error
      mutate(url);
      throw error;
    }
  }, [url, mutateApi]);
  
  return { optimisticUpdate };
};

// Hook for real-time updates (WebSocket integration)
export const useRealtimeApi = <T = any>(url: string) => {
  const result = useApi<T>(url);
  
  useEffect(() => {
    // Set up WebSocket connection for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Check if this update is relevant to our URL
        if (data.type === 'update' && data.url === url) {
          mutate(url);
        }
      };
      
      ws.onerror = (error) => {
        console.warn('WebSocket connection error:', error);
      };
      
      return () => {
        ws.close();
      };
    } catch (error) {
      console.warn('WebSocket not available:', error);
    }
  }, [url]);
  
  return result;
};

// Export commonly used patterns
export const useUsers = (params?: Record<string, any>) => 
  usePaginatedApi('/api/v1/accounts', params);

export const useOrders = (params?: Record<string, any>) => 
  usePaginatedApi('/api/v1/orders', params);

export const usePickups = (params?: Record<string, any>) => 
  usePaginatedApi('/api/v1/pickups', params);

export const useReviews = (params?: Record<string, any>) => 
  usePaginatedApi('/api/v1/reviews', params);

export const useOffers = (params?: Record<string, any>) => 
  usePaginatedApi('/api/v1/offers', params);

export const useNotifications = (params?: Record<string, any>) => 
  usePaginatedApi('/api/v1/notifications', params);

export const useAnalytics = () => 
  useApi('/api/v1/analytics');

// Cache management utilities
export const invalidateCache = (pattern?: string) => {
  if (pattern) {
    mutate(
      key => typeof key === 'string' && key.includes(pattern),
      undefined,
      { revalidate: true }
    );
  } else {
    mutate(() => true, undefined, { revalidate: true });
  }
};

export const preloadData = (url: string) => {
  mutate(url, fetcher(url));
};

export default useApi;