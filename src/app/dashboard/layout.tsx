"use client";
import { RoleGuard } from "@/middleware/roleGuard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSideBar } from "@/components/Nav/AppSideBar";
import { useAuth } from "@/hooks/AuthContext";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["admin", "moderator", "user"]}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full" data-testid="dashboard-layout">
          <AppSideBar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </RoleGuard>
  );
}