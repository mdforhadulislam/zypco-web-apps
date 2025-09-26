"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { REFRESH_TOKEN } from "@/components/ApiCall/url";

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

interface AuthContextType {
  user: User | null;
  login: (userData: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userAccessToken, setUserAccessToken] = useState<string>("")
  const [userRefreshToken, setUserRefreshToken] = useState<string>("")
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("authUser");
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (storedUser && accessToken && refreshToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setUserAccessToken(accessToken)
          setUserRefreshToken(refreshToken)
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid data
        localStorage.removeItem("authUser");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto refresh token when it's close to expiry
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const accessToken = localStorage.getItem("accessToken"); 
      if (!accessToken) {
        logout();
        return;
      }

      // Check if token is close to expiry (refresh 2 minutes before expiry)
      try {
        const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
        const expiryTime = tokenData.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        // Refresh if token expires in less than 2 minutes
        if (timeUntilExpiry < 2 * 60 * 1000) {
          const success = await refreshToken();
          if (!success) {
            logout();
          }
        }
      } catch (error) {
        console.error("Error checking token expiry:", error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  const login = (userData: User, tokens: { accessToken: string; refreshToken: string }) => {
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    // Redirect to signin page
    router.push("/auth/signin");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  const refreshToken = async (): Promise<boolean> => {
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
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error("Invalid refresh response");
      }

      // Update tokens
      localStorage.setItem("accessToken", data.data.accessToken);
      
      // Update refresh token if provided
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }

      // Update user data if provided
      if (data.data.user) {
        setUser(data.data.user);
        localStorage.setItem("authUser", JSON.stringify(data.data.user));
      }

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      
      // Clear invalid tokens
      localStorage.removeItem("authUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      
      return false;
    }
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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
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