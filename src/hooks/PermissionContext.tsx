"use client";
import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

type PermissionType = {
  _id: string;
  permissions: string[];
  description?: string;
  isActive: boolean;
  grantedBy: string;
  grantedAt?: string;
  revokedAt?: string;
};

type PermissionContextType = {
  permissions: PermissionType[];
  fetchPermissions: () => Promise<void>;
  grantPermission: (body: { permissions: string[]; grantedBy: string; description?: string }) => Promise<void>;
  updatePermission: (id: string, body: Partial<PermissionType>) => Promise<void>;
  revokePermission: (id: string) => Promise<void>;
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  // Fetch permissions
  const fetchPermissions = async () => {
    if (!user) return;
    const res = await fetch(`/api/v1/permissions/${user.phone}`);
    const data = await res.json();
    if (res.ok) setPermissions(data.data);
  };

  // Grant new permission
  const grantPermission = async (body: { permissions: string[]; grantedBy: string; description?: string }) => {
    if (!user) return;
    await fetch(`/api/v1/permissions/${user.phone}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await fetchPermissions();
  };

  // Update permission
  const updatePermission = async (id: string, body: Partial<PermissionType>) => {
    if (!user) return;
    await fetch(`/api/v1/permissions/${user.phone}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await fetchPermissions();
  };

  // Revoke permission
  const revokePermission = async (id: string) => {
    if (!user) return;
    await fetch(`/api/v1/permissions/${user.phone}/${id}`, {
      method: "DELETE",
    });
    await fetchPermissions();
  };

  return (
    <PermissionContext.Provider
      value={{ permissions, fetchPermissions, grantPermission, updatePermission, revokePermission }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

// Hook
export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) toast.error("Server Said Permission Error");
  return context;
};
