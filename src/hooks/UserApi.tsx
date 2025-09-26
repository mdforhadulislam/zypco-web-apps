"use client";

import { ApiResponse, getAuthHeaders, handleApiError } from "@/components/ApiCall/url";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import useSWR, { SWRConfiguration, mutate } from "swr";


const fetcher = async (url: string) => {
  let headers = getAuthHeaders();

  try {
    let response = await fetch(url, { headers });

    if (response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const refreshResponse = await fetch("/api/v1/auth/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem("accessToken", refreshData.data.accessToken);

          // retry original request
          headers = {
            ...headers,
            Authorization: `Bearer ${refreshData.data.accessToken}`,
          };
          response = await fetch(url, { headers });
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
};


export const useApi = <T = any>(url: string | null, options?: SWRConfiguration) => {
  const { user, refreshToken } = useAuth();
  const router = useRouter();

  const shouldFetch = !!(user && url);

  const { data, error, isLoading, isValidating, mutate: mutateSWR } = useSWR<ApiResponse<T>>(
    shouldFetch ? url : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      onError: async (err) => {
        if (err.message?.includes("Authentication failed")) {
          const success = await refreshToken();
          if (!success) router.push("/auth/signin");
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

export const usePaginatedApi = <T = any>(baseUrl: string, params: Record<string, any> = {}) => {
  const { page = 1, limit = 20, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...Object.fromEntries(Object.entries(otherParams).map(([k, v]) => [k, String(v)])),
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


export const useApiMutation = () => {
  const { refreshToken } = useAuth();
  const router = useRouter();

  const mutateApi = useCallback(
    async <T = any>(
      url: string,
      {
        method,
        data,
        onSuccess,
        onError,
        showSuccessToast = true,
        showErrorToast = true,
        successMessage,
      }: {
        method: "POST" | "PUT" | "DELETE" | "PATCH";
        data?: any;
        onSuccess?: (data: T) => void;
        onError?: (error: any) => void;
        showSuccessToast?: boolean;
        showErrorToast?: boolean;
        successMessage?: string;
      }
    ): Promise<ApiResponse<T> | null> => {
      try {
        let headers = getAuthHeaders();
        let response = await fetch(url, {
          method,
          headers,
          ...(data && { body: JSON.stringify(data) }),
        });

        if (response.status === 401) {
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            headers = getAuthHeaders();
            response = await fetch(url, {
              method,
              headers,
              ...(data && { body: JSON.stringify(data) }),
            });
          } else {
            router.push("/auth/signin");
            return null;
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `HTTP ${response.status}`;
          if (showErrorToast) toast.error(errorMessage);
          onError?.(errorData);
          throw new Error(errorMessage);
        }

        const result = await response.json();
        if (showSuccessToast) toast.success(successMessage || result.message || "Operation successful");
        onSuccess?.(result.data);
        return result;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Operation failed";
        if (showErrorToast) toast.error(msg);
        onError?.(error);
        console.error("API Mutation Error:", error);
        return null;
      }
    },
    [refreshToken, router]
  );

  return { mutateApi };
};


export const useOptimisticApi = <T = any>(url: string) => {
  const { mutateApi } = useApiMutation();

  const optimisticUpdate = useCallback(
    async (newData: T, mutationUrl: string, mutationOptions: Parameters<typeof mutateApi>[1]) => {
      mutate(
        url,
        (currentData: ApiResponse<T[]> | undefined) =>
          currentData
            ? { ...currentData, data: Array.isArray(currentData.data) ? [...currentData.data, newData] : newData }
            : currentData,
        false
      );

      try {
        const result = await mutateApi(mutationUrl, mutationOptions);
        mutate(url); // revalidate
        return result;
      } catch (error) {
        mutate(url); // rollback
        throw error;
      }
    },
    [url, mutateApi]
  );

  return { optimisticUpdate };
};


export const useRealtimeApi = <T = any>(url: string) => {
  const result = useApi<T>(url);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update" && data.url === url) mutate(url);
    };

    ws.onerror = (err) => console.warn("WebSocket error:", err);
    return () => ws.close();
  }, [url]);

  return result;
};

// Prebuilt API hooks
export const useUsers = (params?: Record<string, any>) => usePaginatedApi("/api/v1/accounts", params);
export const useOrders = (params?: Record<string, any>) => usePaginatedApi("/api/v1/orders", params);
export const usePickups = (params?: Record<string, any>) => usePaginatedApi("/api/v1/pickups", params);
export const useReviews = (params?: Record<string, any>) => usePaginatedApi("/api/v1/reviews", params);
export const useOffers = (params?: Record<string, any>) => usePaginatedApi("/api/v1/offers", params);
export const useNotifications = (params?: Record<string, any>) => usePaginatedApi("/api/v1/notifications", params);
export const useAnalytics = () => useApi("/api/v1/analytics");

// Cache utilities
export const invalidateCache = (pattern?: string) => {
  if (pattern) {
    mutate((key) => typeof key === "string" && key.includes(pattern), undefined, { revalidate: true });
  } else {
    mutate(() => true, undefined, { revalidate: true });
  }
};

export const preloadData = (url: string) => {
  mutate(url, fetcher(url));
};

export default useApi;
