<<<<<<< HEAD
// src/components/ApiCall/url.ts
// Unified API URL configuration and utilities

/** -------------------- ROOT API -------------------- */
const ROOT = process.env.NODE_ENV === "production"
  ? "https://zypco.vercel.app/"
  : "http://localhost:3000/";
=======
// Dynamic URL configuration - fixes hardcoded localhost issue
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the current origin
    return window.location.origin;
  }
  
  // Server-side: use environment variable or fallback
  return process.env.PUBLIC_APP_URL || 'http://localhost:3000';
};
>>>>>>> 089c2160029c35f7edd4bf3f478385d7cb688f7d

export const ROOT = `${getBaseUrl()}/`;
export const ROOT_API = `${ROOT}api/v1/`;

<<<<<<< HEAD
/** -------------------- Auth APIs -------------------- */
=======
// Authentication endpoints
>>>>>>> 089c2160029c35f7edd4bf3f478385d7cb688f7d
export const SIGNIN_API = `${ROOT_API}auth/signin`;
export const SIGNUP_API = `${ROOT_API}auth/signup`;
export const SIGNOUT_API = `${ROOT_API}auth/signout`;
export const EMAIL_VERIFY_API = `${ROOT_API}auth/email-verify`;
export const REFRESH_TOKEN = `${ROOT_API}auth/refresh-token`;

<<<<<<< HEAD
/** -------------------- Account APIs -------------------- */
export const ACCOUNT_API = `${ROOT_API}accounts/`;
export const SINGLE_ACCOUNT_API = (phone: string) => `${ROOT_API}accounts/${phone}`;
export const SINGLE_ACCOUNT_ADDRESS_API = (phone: string) => `${ROOT_API}accounts/${phone}/address`;
export const SINGLE_ACCOUNT_SINGLE_ADDRESS_API = (phone: string, addressId: string) =>
  `${ROOT_API}accounts/${phone}/address/${addressId}`;
export const SINGLE_ACCOUNT_APICONFIG_API = (phone: string) => `${ROOT_API}accounts/${phone}/api-config/`;
export const SINGLE_ACCOUNT_APICONFIG_ACCESSLOG_API = (phone: string) =>
  `${ROOT_API}accounts/${phone}/api-config/access-log/`;
export const SINGLE_ACCOUNT_SINGLE_APICONFIG_SINGLE_ACCESSLOG_API = (phone: string, apiaccessId: string) =>
  `${ROOT_API}accounts/${phone}/api-config/access-log/${apiaccessId}`;
export const SINGLE_ACCOUNT_PERMISSION_API = (phone: string) => `${ROOT_API}accounts/${phone}/permissions`;
export const SINGLE_ACCOUNT_PICKUP_API = (phone: string) => `${ROOT_API}accounts/${phone}/pickup/`;
export const SINGLE_ACCOUNT_SINGLE_PICKUP_API = (phone: string, pickupId: string) =>
  `${ROOT_API}accounts/${phone}/pickup/${pickupId}`;
export const SINGLE_ACCOUNT_REVIEW_API = (phone: string) => `${ROOT_API}accounts/${phone}/review`;
export const SINGLE_ACCOUNT_SINGLE_REVIEW_API = (phone: string, reviewId: string) =>
  `${ROOT_API}accounts/${phone}/review/${reviewId}`;
export const SINGLE_ACCOUNT_NOTIFICATIONS = (phone: string) => `${ROOT_API}accounts/${phone}/notifications/`;
export const SINGLE_ACCOUNT_SINGLE_NOTIFICATIONS = (phone: string, notificationId: string) =>
  `${ROOT_API}accounts/${phone}/notifications/${notificationId}`;
export const SINGLE_ACCOUNT_OFFER = (phone: string) => `${ROOT_API}accounts/${phone}/offers`;
export const SINGLE_ACCOUNT_ORDER_API = (phone: string) => `${ROOT_API}accounts/${phone}/order`;
export const SINGLE_ACCOUNT_SINGLE_ORDER_API = (phone: string, orderId: string) =>
  `${ROOT_API}accounts/${phone}/order/${orderId}`;
export const ACCOUNT_SIGNIN_HISTORY_API = (phone: string) => `${ROOT_API}accounts/${phone}/sigin-historys`;
export const ACCOUNT_NOTIFICATIONS_API = (phone: string) => `${ROOT_API}accounts/${phone}/notifications`;

/** -------------------- Orders -------------------- */
=======
// User account endpoints
export const ACCOUNT_API = `${ROOT_API}accounts/`;
export const SINGLE_ACCOUNT_API = (phone: string) => `${ROOT_API}accounts/${phone}`;

// Address endpoints
export const SINGLE_ACCOUNT_ADDRESS_API = (phone: string) => `${ROOT_API}accounts/${phone}/address`;
export const SINGLE_ACCOUNT_SINGLE_ADDRESS_API = (phone: string, addressId: string) => `${ROOT_API}accounts/${phone}/address/${addressId}`;

// API config endpoints
export const SINGLE_ACCOUNT_APICONFIG_API = (phone: string) => `${ROOT_API}accounts/${phone}/api-config/`;
export const SINGLE_ACCOUNT_APICONFIG_ACCESSLOG_API = (phone: string) => `${ROOT_API}accounts/${phone}/api-config/access-log/`;
export const SINGLE_ACCOUNT_SINGLE_APICONFIG_SINGLE_ACCESSLOG_API = (phone: string, apiaccessId: string) => `${ROOT_API}accounts/${phone}/api-config/access-log/${apiaccessId}`;

// Permission endpoints
export const SINGLE_ACCOUNT_PERMISSION_API = (phone: string) => `${ROOT_API}accounts/${phone}/permissions`;

// Pickup endpoints
export const SINGLE_ACCOUNT_PICKUP_API = (phone: string) => `${ROOT_API}accounts/${phone}/pickup/`;
export const SINGLE_ACCOUNT_SINGLE_PICKUP_API = (phone: string, pickupId: string) => `${ROOT_API}accounts/${phone}/pickup/${pickupId}`;

// Review endpoints
export const SINGLE_ACCOUNT_REVIEW_API = (phone: string) => `${ROOT_API}accounts/${phone}/review`;
export const SINGLE_ACCOUNT_SINGLE_REVIEW_API = (phone: string, reviewId: string) => `${ROOT_API}accounts/${phone}/review/${reviewId}`;

// Notification endpoints
export const SINGLE_ACCOUNT_NOTIFICATIONS = (phone: string) => `${ROOT_API}accounts/${phone}/notifications/`;
export const SINGLE_ACCOUNT_SINGLE_NOTIFICATIONS = (phone: string, notificationId: string) => `${ROOT_API}accounts/${phone}/notifications/${notificationId}`;

// Offer endpoints
export const SINGLE_ACCOUNT_OFFER = (phone: string) => `${ROOT_API}accounts/${phone}/offers`;

// Order endpoints
export const SINGLE_ACCOUNT_ORDER_API = (phone: string) => `${ROOT_API}accounts/${phone}/order`;
export const SINGLE_ACCOUNT_SINGLE_ORDER_API = (phone: string, orderId: string) => `${ROOT_API}accounts/${phone}/order/${orderId}`;

// Global order endpoints
>>>>>>> 089c2160029c35f7edd4bf3f478385d7cb688f7d
export const ORDERS_API = `${ROOT_API}orders`;
export const SINGLE_ORDER_API = (orderId: string) => `${ROOT_API}orders/${orderId}`;
export const ORDER_PAYMENT_API = (orderId: string) => `${ROOT_API}orders/${orderId}/payment`;

<<<<<<< HEAD
/** -------------------- Pickups -------------------- */
export const PICKUP_API = `${ROOT_API}pickups/`;
export const SINGLE_PICKUP_API = (pickupId: string) => `${ROOT_API}pickups/${pickupId}`;

/** -------------------- Reviews -------------------- */
export const REVIEW_API = `${ROOT_API}reviews/`;
export const SINGLE_REVIEW_API = (reviewId: string) => `${ROOT_API}reviews/${reviewId}`;

/** -------------------- Offers -------------------- */
export const OFFER_API = `${ROOT_API}offers/`;
export const SINGLE_OFFER_API = (offerId: string) => `${ROOT_API}offers/${offerId}`;

/** -------------------- Notifications -------------------- */
export const NOTIFICATION_API = `${ROOT_API}notifications/`;
export const SINGLE_NOTIFICATION_API = (notificationId: string) => `${ROOT_API}notifications/${notificationId}`;

/** -------------------- Blogs -------------------- */
export const BLOG_API = `${ROOT_API}blogs/`;
export const SINGLE_BLOG_API = (blogId: string) => `${ROOT_API}blogs/${blogId}`;

/** -------------------- Tracks -------------------- */
export const TRACKS_API = `${ROOT_API}tracks`;
export const SINGLE_TRACK_API = (trackId: string) => `${ROOT_API}tracks/${trackId}`;

/** -------------------- Prices -------------------- */
export const PRICE_API = `${ROOT_API}prices/`;
export const SINGLE_PRICE_API = (priceId: string) => `${ROOT_API}prices/${priceId}`;

/** -------------------- Contacts -------------------- */
export const CONTACT_API = `${ROOT_API}contacts/`;
export const SINGLE_CONTACT_API = (contactId: string) => `${ROOT_API}contacts/${contactId}`;

/** -------------------- Analytics -------------------- */
export const ROOT_ANALYTICS_API = `${ROOT_API}analytics/`;
export const ADDRESS_ANALYTICS_API = `${ROOT_API}analytics/addresses-analytics`;
export const API_KEY_ANALYTICS_API = `${ROOT_API}analytics/api-keys-analytics`;
export const CONTACT_ANALYTICS_API = `${ROOT_API}analytics/contacts-analytics`;
export const CONTENT_ANALYTICS_API = `${ROOT_API}analytics/content-analytics`;
export const COUNTRIES_ANALYTICS_API = `${ROOT_API}analytics/countries-analytics`;
export const LOGIN_ANALYTICS_API = `${ROOT_API}analytics/login-analytics`;
export const NOTIFICATION_ANALYTICS_API = `${ROOT_API}analytics/notifications-analytics`;
export const OFFER_ANALYTICS_API = `${ROOT_API}analytics/offers-analytics`;
export const OPERATIONAL_ANALYTICS_API = `${ROOT_API}analytics/operational-analytics`;
export const ORDER_ANALYTICS_API = `${ROOT_API}analytics/order-analytics`;
export const REVENUE_ANALYTICS_API = `${ROOT_API}analytics/revenue-analytics`;
export const REVIEW_ANALYTICS_API = `${ROOT_API}analytics/reviews-analytics`;
export const USER_ANALYTICS_API = `${ROOT_API}analytics/user-analytics`;

/** -------------------- Utilities -------------------- */

/**
 * Create a full API URL with optional query params
 */
export const createApiUrl = (baseUrl: string, params?: Record<string, string | number | boolean>) => {
  if (!params) return baseUrl;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) searchParams.append(key, String(value));
  });
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Get auth headers including access token
 */
export const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/** -------------------- API Response & Error Handling -------------------- */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: any;
}

/**
 * Unified API error handler
 */
export const handleApiError = (error: any) => {
  console.error("API Error:", error);
  if (error.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("authUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth/signin";
  }
  return {
    success: false,
    message: error.message || "An error occurred",
    error,
  };
};
=======
// Tracking endpoints
export const TRACKS_API = `${ROOT_API}tracks`;
export const SINGLE_TRACK_API = (trackId: string) => `${ROOT_API}tracks/${trackId}`;

// Content endpoints
export const BLOG_API = `${ROOT_API}blogs/`;
export const SINGLE_BLOG_API = (blogId: string) => `${ROOT_API}blogs/${blogId}`;

// Contact endpoints
export const CONTACT_API = `${ROOT_API}contacts/`;
export const SINGLE_CONTACT_API = (contactId: string) => `${ROOT_API}contacts/${contactId}`;

// Notification endpoints
export const NOTIFICATION_API = `${ROOT_API}notifications/`;
export const SINGLE_NOTIFICATION_API = (notificationId: string) => `${ROOT_API}notifications/${notificationId}`;

// Offer endpoints
export const OFFER_API = `${ROOT_API}offers/`;
export const SINGLE_OFFER_API = (offerId: string) => `${ROOT_API}offers/${offerId}`;

// Pickup endpoints
export const PICKUP_API = `${ROOT_API}pickups/`;
export const SINGLE_PICKUP_API = (pickupId: string) => `${ROOT_API}pickups/${pickupId}`;

// Price endpoints
export const PRICE_API = `${ROOT_API}prices/`;
export const SINGLE_PRICE_API = (priceId: string) => `${ROOT_API}prices/${priceId}`;

// Review endpoints
export const REVIEW_API = `${ROOT_API}reviews/`;
export const SINGLE_REVIEW_API = (reviewId: string) => `${ROOT_API}reviews/${reviewId}`;

// Analytics endpoints (Admin only)
export const ROOT_ANALYTICS_API = `${ROOT_API}analytics/`;
export const ADDRESS_ANALYTICS_API = `${ROOT_API}analytics/addresses-analytics`;
export const API_KEY_ANALYTICS_API = `${ROOT_API}analytics/api-keys-analytics`;
export const CONTACT_ANALYTICS_API = `${ROOT_API}analytics/contacts-analytics`;
export const CONTENT_ANALYTICS_API = `${ROOT_API}analytics/content-analytics`;
export const COUNTRIES_ANALYTICS_API = `${ROOT_API}analytics/countries-analytics`;
export const LOGIN_ANALYTICS_API = `${ROOT_API}analytics/login-analytics`;
export const NOTIFICATION_ANALYTICS_API = `${ROOT_API}analytics/notifications-analytics`;
export const OFFER_ANALYTICS_API = `${ROOT_API}analytics/offers-analytics`;
export const OPERATIONAL_ANALYTICS_API = `${ROOT_API}analytics/operational-analytics`;
export const ORDER_ANALYTICS_API = `${ROOT_API}analytics/order-analytics`;
export const REVENUE_ANALYTICS_API = `${ROOT_API}analytics/revenue-analytics`;
export const REVIEW_ANALYTICS_API = `${ROOT_API}analytics/reviews-analytics`;
export const USER_ANALYTICS_API = `${ROOT_API}analytics/user-analytics`;

// Helper types and utilities
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

export const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const handleApiError = (error: any): Error => {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (error?.message) {
    return new Error(error.message);
  }
  
  return new Error('An unexpected error occurred');
};
>>>>>>> 089c2160029c35f7edd4bf3f478385d7cb688f7d
