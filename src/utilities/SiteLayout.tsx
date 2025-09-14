"use client";
import FooterBar from "@/components/Footer/FooterBar";
import NavBar from "@/components/Nav/NavBar";
import { useAuth } from "@/hooks/AuthContext";
import { usePathname, useRouter } from "next/navigation"; 
import React from "react";
import { Toaster } from "sonner";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathName = usePathname().split("/")[1];
  const router =useRouter()
  const auth = useAuth()

  if(pathName== "auth" && auth.user?.token){
    router.push("/dashboard")
  }

  if (pathName == "dashboard") {
    return (
      <> 
        {children} 
        <Toaster expand={false} position="top-center" />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="w-full h-[85px]"></div>
      {children}
      <FooterBar />
      <Toaster expand={false} position="top-center" />
    </>
  );
}
