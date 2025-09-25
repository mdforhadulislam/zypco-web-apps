// API Base URL configuration
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.zypco.com/api/v1' 
  : '/api/v1';

// Authentication APIs
export const AUTH_SIGNIN_API = `${API_BASE}/auth/signin`;
export const AUTH_SIGNUP_API = `${API_BASE}/auth/signup`;
export const AUTH_SIGNOUT_API = `${API_BASE}/auth/signout`;
export const AUTH_REFRESH_TOKEN_API = `${API_BASE}/auth/refresh-token`;
export const AUTH_EMAIL_VERIFY_API = `${API_BASE}/auth/email-verify`;
export const AUTH_VALIDATE_API = `${API_BASE}/auth/validate`;

// User/Account APIs
export const ACCOUNTS_API = `${API_BASE}/accounts`;
export const USERS_API = `${API_BASE}/accounts`; // Using accounts as users endpoint

// Orders APIs
export const ORDERS_API = `${API_BASE}/orders`;
export const ORDER_BY_ID_API = (id: string) => `${API_BASE}/orders/${id}`;
export const ORDER_PAYMENT_API = (id: string) => `${API_BASE}/orders/${id}/payment`;

// Pickups APIs
export const PICKUP_API = `${API_BASE}/pickups`;
export const PICKUP_BY_ID_API = (id: string) => `${API_BASE}/pickups/${id}`;

// Reviews APIs
export const REVIEW_API = `${API_BASE}/reviews`;
export const REVIEW_BY_ID_API = (id: string) => `${API_BASE}/reviews/${id}`;

// Offers APIs
export const OFFERS_API = `${API_BASE}/offers`;
export const OFFER_BY_ID_API = (id: string) => `${API_BASE}/offers/${id}`;

// Countries APIs
export const COUNTRIES_API = `${API_BASE}/countrys`;
export const COUNTRY_BY_ID_API = (id: string) => `${API_BASE}/countrys/${id}`;

// Notifications APIs
export const NOTIFICATIONS_API = `${API_BASE}/notifications`;
export const NOTIFICATION_BY_ID_API = (id: string) => `${API_BASE}/notifications/${id}`;

// Blogs APIs
export const BLOGS_API = `${API_BASE}/blogs`;
export const BLOG_BY_ID_API = (id: string) => `${API_BASE}/blogs/${id}`;

// Tracks APIs
export const TRACKS_API = `${API_BASE}/tracks`;
export const TRACK_BY_ID_API = (trackId: string) => `${API_BASE}/tracks/${trackId}`;

// Prices APIs
export const PRICES_API = `${API_BASE}/prices`;
export const PRICE_BY_ID_API = (id: string) => `${API_BASE}/prices/${id}`;

// Analytics APIs
export const ANALYTICS_API = `${API_BASE}/analytics`;
export const USER_ANALAYTICS_API = `${ANALYTICS_API}?type=users`;
export const ORDER_ANALAYTICS_API = `${ANALYTICS_API}?type=orders`;
export const REVENUE_ANALAYTICS_API = `${ANALYTICS_API}?type=revenue`;
export const LOGIN_ANALAYTICS_API = `${ANALYTICS_API}?type=login`;
export const COUNTRIES_ANALAYTICS_API = `${ANALYTICS_API}?type=countries`;
export const NOTIFICATIONS_ANALAYTICS_API = `${ANALYTICS_API}?type=notifications`;
export const OPERATIONAL_ANALAYTICS_API = `${ANALYTICS_API}?type=operational`;

// Account specific APIs
export const ACCOUNT_SIGNIN_HISTORY_API = (phone: string) => 
  `${API_BASE}/accounts/${phone}/sigin-historys`;
export const ACCOUNT_NOTIFICATIONS_API = (phone: string) => 
  `${API_BASE}/accounts/${phone}/notifications`;

// Utility function to create API URLs with query parameters
export const createApiUrl = (baseUrl: string, params?: Record<string, string | number | boolean>) => {
  if (!params) return baseUrl;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API response types
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

// Common API error handler
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error.status === 401) {
    // Unauthorized - redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/signin';
    }
  }
  
  return {
    success: false,
    message: error.message || 'An error occurred',
    error
  };
};