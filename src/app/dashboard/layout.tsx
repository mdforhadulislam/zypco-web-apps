"use client";
import { AppSideBar } from "@/components/Nav/AppSideBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/AuthContext";
import { BellRing } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathNameArray = usePathname().split("/").filter(Boolean);
  const router = useRouter();
  const auth = useAuth();

  // For development/demo purposes, let's create a mock user if none exists
  useEffect(() => {
    if (!auth.user && !auth.loading) {
      // Create a mock user for development
      const mockUser = {
        id: "1",
        name: "Admin User",
        email: "admin@zypco.com",
        phone: "+1234567890",
        role: "admin",
        token: "mock-token-123"
      };
      
      // Simulate login for development
      localStorage.setItem("authUser", JSON.stringify(mockUser));
      window.location.reload(); // Refresh to pick up the mock user
    }
  }, [auth.user, auth.loading]);

  // Show loading while auth is initializing
  if (auth.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, redirect to auth (in production)
  // For now, we'll create a mock user above
  if (!auth.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Setting up dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4 relative w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {pathNameArray.map((item, index) => (
                  <div key={item} className="hidden items-center align-middle gap-2 md:flex">
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href={`/${pathNameArray.slice(0, index + 1).join('/')}`}
                        className="capitalize"
                      >
                        {item}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < pathNameArray.length - 1 && <BreadcrumbSeparator />}
                  </div>
                ))}
                {pathNameArray.length > 0 && (
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/${pathNameArray.join('/')}`}
                      className="capitalize md:hidden block"
                    >
                      {pathNameArray[pathNameArray.length - 1]}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>

            <div className="absolute right-5 top-[8%] flex justify-center align-middle items-center gap-5">
              <BellRing size={24} />
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/" alt="USER PROFILE" />
                <AvatarFallback className="rounded-lg">
                  {auth.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div>
          <div className="w-full h-auto p-4">{children}</div>
          <Toaster expand={false} position="top-center" closeButton />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}