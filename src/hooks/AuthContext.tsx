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

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  login: async () => false,
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch("/api/v1/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Login failed:", data.message);
        return false;
      }

      const userData = data.data;
      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData));
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) toast.error("server said error");
  return context;
};
