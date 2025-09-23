"use client";
import FooterBar from "@/components/Footer/FooterBar";
import { AppSideBar } from "@/components/Nav/AppSideBar";
import NavBar from "@/components/Nav/NavBar";
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
import React from "react";
import { Toaster } from "sonner";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathNameArray = usePathname().split("/");
  const pathName = usePathname().split("/")[1];
  const router = useRouter();
  const auth = useAuth();

  if (pathName == "auth" && auth.user?.token) {
    router.push("/dashboard");
  }

  // Dashboard has its own layout, so don't handle it here
  if (pathName == "dashboard") {
    return (
      <>
        {children}
        <Toaster expand={false} position="top-center" closeButton />
      </>
    );
  }

  if (pathName != "dashboard") {
    return (
      <>
        <NavBar />
        <div className="w-full h-[99px]"></div>
        {children}
        <FooterBar />
        <Toaster expand={false} position="top-center" closeButton  />
      </>
    );
  }
}
