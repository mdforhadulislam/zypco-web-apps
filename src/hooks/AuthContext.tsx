"use client";

import { REFRESH_TOKEN } from "@/components/ApiCall/url";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "moderator";
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, tokens: AuthTokens) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshTokenValue: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user && !!accessToken;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("authUser");
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");

        if (storedUser && storedAccessToken && storedRefreshToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setAccessToken(storedAccessToken);
          setRefreshTokenValue(storedRefreshToken);

          // Check if token is close to expiry and refresh if needed
          const shouldRefresh = await checkAndRefreshToken(storedAccessToken);
          if (!shouldRefresh && !isTokenValid(storedAccessToken)) {
            // If token is invalid and refresh failed, logout
            await logout();
          }
        } else {
          // Clear any partial data
          clearAuthData();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto refresh token when it's close to expiry
  useEffect(() => {
    if (!user || !accessToken) return;

    const interval = setInterval(async () => {
      await checkAndRefreshToken(accessToken);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, accessToken]);

  // Helper function to check if token is valid
  const isTokenValid = (token: string): boolean => {
    if (!token) return false;

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = tokenData.exp * 1000;
      const currentTime = Date.now();
      return expiryTime > currentTime;
    } catch (error) {
      console.error("Error parsing token:", error);
      return false;
    }
  };

  // Helper function to check if token needs refresh
  const shouldRefreshToken = (token: string): boolean => {
    if (!token) return false;

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = tokenData.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Refresh if token expires in less than 2 minutes (120000ms)
      return timeUntilExpiry < 120000;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return false;
    }
  };

  // Check and refresh token if needed
  const checkAndRefreshToken = async (
    currentToken: string
  ): Promise<boolean> => {
    if (!shouldRefreshToken(currentToken) || isRefreshing) {
      return true; // Token is still valid or already refreshing
    }

    return await performTokenRefresh();
  };

  // Clear all auth data
  const clearAuthData = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshTokenValue(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  // Store auth data
  const storeAuthData = (userData: User, tokens: AuthTokens) => {
    setUser(userData);
    setAccessToken(tokens.accessToken);
    setRefreshTokenValue(tokens.refreshToken);
    localStorage.setItem("authUser", JSON.stringify(userData));
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  };

  const login = async (
    userData: User,
    tokens: AuthTokens
  ): Promise<boolean> => {
    try {
      // Validate tokens before storing
      if (!tokens.accessToken || !tokens.refreshToken) {
        toast.error("Invalid authentication tokens received");
        return false;
      }

      // Check if access token is valid
      if (!isTokenValid(tokens.accessToken)) {
        toast.error("Received invalid access token");
        return false;
      }

      storeAuthData(userData, tokens);
      toast.success("Successfully signed in!");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in");
      return false;
    }
  };

  const logout = () => {
    // Call signout API in background
    if (accessToken) {
      fetch("/api/v1/auth/signout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }).catch((err) => console.error("Signout API error:", err));
    }

    clearAuthData();
    toast.success("Successfully signed out");

    // Redirect to signin page
    router.push("/auth/signin");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully");
    }
  };

  const performTokenRefresh = async (): Promise<boolean> => {
    if (isRefreshing) return false;

    setIsRefreshing(true);

    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(REFRESH_TOKEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: storedRefreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to refresh token`);
      }

      const data = await response.json();
      console.log(data);
      

      if (!data.status == 200 || !data.data) {
        throw new Error("Invalid refresh response format");
      }

      // Update tokens in state and localStorage
      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token in refresh response");
      }

      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);

      // Update refresh token if provided (token rotation)
      if (newRefreshToken) {
        setRefreshTokenValue(newRefreshToken);
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      // Update user data if provided
      if (data.data.user) {
        const updatedUser = data.data.user;
        setUser(updatedUser);
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
      }

      console.log("Token refresh successful");
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);

      // Clear invalid tokens and logout
      clearAuthData();
      toast.error("Session expired. Please sign in again.");
      router.push("/auth/signin");

      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Public refresh function
  const refreshToken = async (): Promise<boolean> => {
    return await performTokenRefresh();
  };

  // Provide context value
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    refreshToken,
    loading,
    isAuthenticated,
    accessToken,
    refreshTokenValue,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
