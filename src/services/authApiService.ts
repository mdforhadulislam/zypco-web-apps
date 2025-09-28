import { getAuthHeaders } from "@/components/ApiCall/url";

type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T | null;
  meta?: any;
};

class AuthApiService {
  private baseUrl = '/api/v1';

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Check if response has content before parsing JSON
      let data;
      const contentType = response.headers.get('content-type');
      const hasContent = response.headers.get('content-length') !== '0';
      
      if (contentType && contentType.includes('application/json') && hasContent) {
        try {
          const responseText = await response.text();
          if (responseText.trim()) {
            data = JSON.parse(responseText);
          } else {
            data = { message: 'Empty response from server' };
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          data = { 
            message: 'Invalid JSON response from server',
            error: parseError instanceof Error ? parseError.message : 'Parse failed'
          };
        }
      } else {
        data = { 
          message: response.ok ? 'Success' : `HTTP ${response.status}: ${response.statusText}` 
        };
      }

      // Handle token expiry
      if (response.status === 401 && data.message?.toLowerCase().includes('token')) {
        // Try to refresh token automatically
        const refreshResult = await this.refreshToken();
        if (refreshResult.success) {
          // Retry the original request with new token
          return this.makeRequest(endpoint, options);
        } else {
          // Refresh failed, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin';
          }
        }
      }

      return {
        success: response.ok,
        status: response.status,
        message: data.message || (response.ok ? 'Success' : 'Request failed'),
        data: data.data || null,
        meta: data.meta,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      };
    }
  }

  // Authentication methods - use direct fetch without auth headers for signin/signup
  async signin(phone: string, password: string) {
    try {
      const response = await fetch('/api/v1/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const responseText = await response.text();
      let data;
      
      if (responseText.trim()) {
        data = JSON.parse(responseText);
      } else {
        data = { message: 'Empty response from server' };
      }

      return {
        success: response.ok,
        status: response.status,
        message: data.message || (response.ok ? 'Success' : 'Request failed'),
        data: data.data || null,
        meta: data.meta,
      };
    } catch (error) {
      console.error('Signin API error:', error);
      return {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      };
    }
  }

  async signup(userData: {
    name: string;
    phone: string;
    email: string;
    password: string;
    agreeToTerms: boolean;
  }) {
    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const responseText = await response.text();
      let data;
      
      if (responseText.trim()) {
        data = JSON.parse(responseText);
      } else {
        data = { message: 'Empty response from server' };
      }

      return {
        success: response.ok,
        status: response.status,
        message: data.message || (response.ok ? 'Success' : 'Request failed'),
        data: data.data || null,
        meta: data.meta,
      };
    } catch (error) {
      console.error('Signup API error:', error);
      return {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      };
    }
  }

  async signout() {
    return this.makeRequest<{ userId: string; phone: string }>('/auth/signout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return {
        success: false,
        status: 400,
        message: 'No refresh token available',
        data: null,
      };
    }

    return this.makeRequest<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async verifyEmail(email: string, code: string) {
    return this.makeRequest<{ user: any }>('/auth/email-verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  // Generic methods for other API calls
  async get<T>(endpoint: string) {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any) {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any) {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string) {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Create a singleton instance
export const authApiService = new AuthApiService();
export default authApiService;