"use client";

import { ApiResponse, getAuthHeaders, handleApiError } from "@/components/ApiCall/url";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import useSWR, { SWRConfiguration, mutate } from "swr";

type RequestMethod = "POST" | "PUT" | "DELETE" | "PATCH";

// ✅ universal fetcher
const fetcher = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
  let headers: Record<string, string> = getAuthHeaders();

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
          const refreshData = (await refreshResponse.json()) as ApiResponse<{ accessToken: string }>;
          localStorage.setItem("accessToken", refreshData.data.accessToken);

          // retry with new token
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
      throw new Error((errorData as { message?: string }).message || `HTTP ${response.status}`);
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ✅ Normal API hook
export const useApi = <T = unknown>(url: string | null, options?: SWRConfiguration) => {
  const { user, refreshToken } = useAuth();
  const router = useRouter();

  const shouldFetch = Boolean(user && url);

  const { data, error, isLoading, isValidating, mutate: mutateSWR } = useSWR<ApiResponse<T>, Error>(
    shouldFetch ? url : null,
    (u: string) => fetcher<T>(u),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      onError: async (err: Error) => {
        if (err?.message?.includes("Authentication failed")) {
          const success = await refreshToken();
          if (!success) router.push("/auth/signin");
        }
      },
      ...options,
    }
  );

  return {
    data: data?.data as T | undefined,
    response: data,
    error,
    isLoading,
    isValidating,
    mutate: mutateSWR,
    success: data?.success ?? false,
  };
};

// ✅ Paginated API hook
export const usePaginatedApi = <T = unknown>(baseUrl: string, params: Record<string, unknown> = {}) => {
  const { page = 1, limit = 20, ...otherParams } = params as { page?: number; limit?: number };

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...Object.fromEntries(
      Object.entries(otherParams).map(([k, v]) => [k, v != null ? String(v) : ""])
    ),
  });

  const url = `${baseUrl}?${queryParams.toString()}`;
  const result = useApi<T[]>(url);

  return {
    ...result,
    meta: result.response?.meta,
    currentPage: Number(page),
    totalPages: result.response?.meta?.totalPages || 1,
    total: result.response?.meta?.total || 0,
  };
};

// ✅ Mutation API hook
export const useApiMutation = () => {
  const { refreshToken } = useAuth();
  const router = useRouter();

  const mutateApi = useCallback(
    async <T = unknown>(
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
        method: RequestMethod;
        data?: unknown;
        onSuccess?: (data: T) => void;
        onError?: (error: unknown) => void;
        showSuccessToast?: boolean;
        showErrorToast?: boolean;
        successMessage?: string;
      }
    ): Promise<ApiResponse<T> | null> => {
      try {
        let headers: Record<string, string> = getAuthHeaders();

        let response = await fetch(url, {
          method,
          headers,
          ...(data ? { body: JSON.stringify(data) } : {}),
        });

        if (response.status === 401) {
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            headers = getAuthHeaders();
            response = await fetch(url, {
              method,
              headers,
              ...(data ? { body: JSON.stringify(data) } : {}),
            });
          } else {
            router.push("/auth/signin");
            return null;
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = (errorData as { message?: string }).message || `HTTP ${response.status}`;
          if (showErrorToast) toast.error(errorMessage);
          onError?.(errorData);
          throw new Error(errorMessage);
        }

        const result = (await response.json()) as ApiResponse<T>;
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

// ✅ Optimistic API hook
export const useOptimisticApi = <T = unknown>(url: string) => {
  const { mutateApi } = useApiMutation();

  const optimisticUpdate = useCallback(
     async (newData: T, mutationUrl: string, mutationOptions: Parameters<typeof mutateApi>[1]) => {
      mutate(
        url,
        (currentData: ApiResponse<T[]> | undefined) =>
          currentData
            ? {
                ...currentData,
                data: Array.isArray(currentData.data)
                  ? [...currentData.data, newData]
                  : [newData],
              }
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
    },[url, mutateApi]);

  return { optimisticUpdate };
};

// ✅ Realtime API hook
export const useRealtimeApi = <T = unknown>(url: string) => {
  const result = useApi<T>(url);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "update" && data.url === url) mutate(url);
      } catch (e) {
        console.warn("Invalid WS message:", e);
      }
    };

    ws.onerror = (err) => console.warn("WebSocket error:", err);
    return () => ws.close();
  }, [url]);

  return result;
};

// ✅ Prebuilt API hooks
export const useUsers = (params?: Record<string, unknown>) => usePaginatedApi("/api/v1/accounts", params);
export const useOrders = (params?: Record<string, unknown>) => usePaginatedApi("/api/v1/orders", params);
export const usePickups = (params?: Record<string, unknown>) => usePaginatedApi("/api/v1/pickups", params);
export const useReviews = (params?: Record<string, unknown>) => usePaginatedApi("/api/v1/reviews", params);
export const useOffers = (params?: Record<string, unknown>) => usePaginatedApi("/api/v1/offers", params);
export const useNotifications = (params?: Record<string, unknown>) =>
  usePaginatedApi("/api/v1/notifications", params);
export const useAnalytics = () => useApi("/api/v1/analytics");

// ✅ Cache utilities
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
