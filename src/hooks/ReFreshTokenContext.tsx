"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

// Updated UserType with refreshToken
export type UserType = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  token: string;         // access token
  refreshToken: string;  // refresh token
  avatar?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  lastLogin?: Date;
};

type RefreshTokenContextType = {
  user: UserType | null;
  loading: boolean;
  refreshUserData: () => Promise<boolean>;
};

const defaultContext: RefreshTokenContextType = {
  user: null,
  loading: true,
  refreshUserData: async () => false,
};

const RefreshTokenContext = createContext<RefreshTokenContextType>(defaultContext);

export const RefreshTokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async (): Promise<boolean> => {
    if (!user?.refreshToken) return false;

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      });

      const data = await res.json();

      if (!res.ok || !data.data) {
        toast.error(data.message || "Failed to refresh user data");
        setLoading(false);
        return false;
      }

      const updatedUser: UserType = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        phone: data.data.user.phone,
        role: data.data.user.role,
        token: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        avatar: data.data.user.avatar || null,
        isVerified: data.data.user.isVerified,
        isActive: data.data.user.isActive,
        lastLogin: data.data.user.lastLogin,
      };

      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      localStorage.setItem("accessToken", updatedUser.token);
      localStorage.setItem("refreshToken", updatedUser.refreshToken);

      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error refreshing user data:", err);
      toast.error("Server error while refreshing user data");
      setLoading(false);
      return false;
    }
  };
  // Load saved user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
    refreshUserData()
  }, []);


  return (
    <RefreshTokenContext.Provider value={{ user, loading, refreshUserData }}>
      {children}
    </RefreshTokenContext.Provider>
  );
};

// Hook to use the context
export const useRefreshUser = () => {
  const context = useContext(RefreshTokenContext);
  if (!context) throw new Error("RefreshTokenContext not found");
  return context;
};
