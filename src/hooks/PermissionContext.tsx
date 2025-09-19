"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { SINGLE_ACCOUNT_PERMISSION_API } from "@/components/ApiCall/url";

type PermissionType = string; // শুধু string-based permission রাখব

type PermissionContextType = {
  permissions: PermissionType[];
  fetchPermissions: () => Promise<void>;
  hasPermission: (perm: string | string[]) => boolean;
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  // fetch permissions API call
  const fetchPermissions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(SINGLE_ACCOUNT_PERMISSION_API(user.phone));
      const data = await res.json();

      if (res.ok && data?.data) {
        setPermissions(data.data.permissions || []);
      } else {
        setPermissions([]);
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);                     
      toast.error("Failed to load permissions");
      setPermissions([]);
    }
  }, [user]);

  // check permission
  const hasPermission = (perm: string | string[]) => {
    if (Array.isArray(perm)) return perm.some((p) => permissions.includes(p));
    return permissions.includes(perm);
  };

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return (
    <PermissionContext.Provider value={{ permissions, fetchPermissions, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

// hook
export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermission must be used within PermissionProvider");
  }
  return context;
};
