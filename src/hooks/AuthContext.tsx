"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type UserType = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  token: string;
  isVerified: boolean;
  isActive: boolean;
  avatar?: string;
  lastLogin?: Date;
};

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<UserType>) => void;
};

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  login: async () => false,
  logout: () => {},
  refreshToken: async () => false,
  updateUser: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem("authUser");
        const accessToken = localStorage.getItem("accessToken");
        
        if (savedUser && accessToken) {
          const userData = JSON.parse(savedUser);
          
          // Validate token with server
          const isValid = await validateToken(accessToken);
          
          if (isValid) {
            setUser(userData);
          } else {
            // Token is invalid, try to refresh
            const refreshed = await refreshToken();
            if (!refreshed) {
              // Refresh failed, clear invalid data
              localStorage.removeItem("authUser");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
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

  // Validate token with server
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/v1/auth/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Login function
  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/v1/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login failed:", data.message);
        toast.error(data.message || "Login failed");
        return false;
      }

      const { user: userData, accessToken, refreshToken: newRefreshToken } = data.data;
      
      // Store user data and tokens
      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData));
      localStorage.setItem("accessToken", accessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      
      return true;
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred during login");
      return false;
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        return false;
      }

      const response = await fetch("/api/v1/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const { user: userData, accessToken, refreshToken: newRefreshToken } = data.data;

      // Update stored data
      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData));
      localStorage.setItem("accessToken", accessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  // Update user data
  const updateUser = (userData: Partial<UserType>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        // Call signout API to invalidate token on server
        fetch("/api/v1/auth/signout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }).catch(() => {}); // Ignore errors during logout
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Always clear local data
      setUser(null);
      localStorage.removeItem("authUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success("Signed out successfully");
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        logout, 
        refreshToken, 
        updateUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};