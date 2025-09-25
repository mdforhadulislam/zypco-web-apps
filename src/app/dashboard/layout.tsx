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

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push("/auth/signin");
    }
  }, [auth.user, auth.loading, router]);

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

  // Redirect if no user after loading
  if (!auth.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Check if email verification is required
  if (!auth.user.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <BellRing className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email Verification Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please verify your email address to access the dashboard.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/auth/email-verify?email=${encodeURIComponent(auth.user!.email)}`)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Verify Email
            </button>
            <button
              onClick={auth.logout}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if account is active
  if (!auth.user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <BellRing className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Account Deactivated
          </h2>
          <p className="text-gray-600 mb-4">
            Your account has been deactivated. Please contact support for assistance.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push("/contact")}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={auth.logout}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-xl">
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
                <AvatarImage src={auth.user?.avatar || ""} alt="USER PROFILE" />
                <AvatarFallback className="rounded-lg">
                  {auth.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
          <Toaster expand={false} position="top-center" closeButton />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}