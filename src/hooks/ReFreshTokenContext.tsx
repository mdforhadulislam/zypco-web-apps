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
};

type ReFreshTokenContextType = {
  user: UserType | null;
  loading: boolean;
  refreshUserData: () => Promise<boolean>;
};

const defaultContext: ReFreshTokenContextType = {
  user: null,
  loading: false,
  refreshUserData: async () => false,
};

const ReFreshTokenContext = createContext<ReFreshTokenContextType>(defaultContext);

export const ReFreshTokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load saved user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  // Function to refresh user data from backend
  const refreshUserData = async (): Promise<boolean> => {
    if (!user?.token) return false;

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: user.token  }),
      });

      const data = await res.json();

      if (!res.ok || !data.data) {
        toast.error(data.message || "Failed to refresh user data");
        setLoading(false);
        return false;
      }

      const updatedUser: UserType = {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        phone: user.phone, // keep phone from old user if not returned
        role: data.data.role,
        token: data.data.token, // updated token from backend
      };

      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error refreshing user data:", err);
      toast.error("Server error while refreshing user data");
      setLoading(false);
      return false;
    }
  };

  return (
    <ReFreshTokenContext.Provider value={{ user, loading, refreshUserData }}>
      {children}
    </ReFreshTokenContext.Provider>
  );
};

// Hook to use ReFreshTokenContext
export const useRefreshUser = () => {
  const context = useContext(ReFreshTokenContext);
  if (!context) toast.error("RefreshTokenContext not found");
  return context;
};