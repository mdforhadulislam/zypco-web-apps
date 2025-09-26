"use client";
import { RoleGuard } from "@/middleware/roleGuard";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSideBar } from "@/components/Nav/AppSideBar";
import { useAuth } from "@/hooks/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellRing } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Generate breadcrumb from pathname
  const pathNameArray = pathname
    .split("/")
    .filter((path) => path !== "" && path !== "dashboard")
    .map((path) => path.replace(/-/g, " "));

  return (
    <RoleGuard allowedRoles={["admin", "moderator", "user"]}>
      <SidebarProvider>
        <AppSideBar />
        <SidebarInset>
          <header 
            className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-xl"
            data-testid="dashboard-header"
          >
            <div className="flex items-center gap-2 px-4 relative w-full">
              <SidebarTrigger className="-ml-1" data-testid="sidebar-trigger" />
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
                          href={`/dashboard/${pathNameArray.slice(0, index + 1).join('/')}`}
                          className="capitalize"
                          data-testid={`breadcrumb-${item}`}
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
                        href={`/dashboard/${pathNameArray.join('/')}`}
                        className="capitalize md:hidden block"
                        data-testid={`mobile-breadcrumb-${pathNameArray[pathNameArray.length - 1]}`}
                      >
                        {pathNameArray[pathNameArray.length - 1]}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                </BreadcrumbList>
              </Breadcrumb>

              <div className="absolute right-5 top-[8%] flex justify-center align-middle items-center gap-5">
                <BellRing 
                  size={24} 
                  className="cursor-pointer hover:text-primary transition-colors" 
                  data-testid="notification-bell"
                />
                <Avatar className="h-8 w-8 rounded-lg" data-testid="user-avatar">
                  <AvatarImage src={user?.avatar || ""} alt="USER PROFILE" />
                  <AvatarFallback className="rounded-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4" data-testid="dashboard-content">
            {children}
            <Toaster expand={false} position="top-center" closeButton />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  );
}