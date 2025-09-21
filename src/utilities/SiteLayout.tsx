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

  if (pathName == "dashboard" && auth.user?.token) {
    return (
      <>
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
                    {pathNameArray.map((item) => (
                      <div key={item}>
                        <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink
                            href={`/${pathName}`}
                            className=" capitalize"
                          >
                            {item}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {pathNameArray.length >= 3 ? (
                          <BreadcrumbSeparator className="hidden md:block" />
                        ) : (
                          ""
                        )}
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>

                <div className=" absolute right-5 top-[8%] flex justify-center align-middle items-center gap-5">
                  <BellRing size={24} />
                  <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={"/"} alt={"USER PROFILE"} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                </div>

              </div>
            </header>
            <div>
              <div className="w-full h-auto p-2">{children}</div>

              <Toaster expand={false} position="top-center" closeButton  />
            </div>
          </SidebarInset>
        </SidebarProvider>
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
