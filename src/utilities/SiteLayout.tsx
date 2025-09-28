"use client";
import FooterBar from "@/components/Footer/FooterBar";
import NavBar from "@/components/Nav/NavBar";
import { useAuth } from "@/hooks/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
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

  useEffect(() => {
    // The AuthContext already handles auto-refresh, so no need to manually trigger it here
  }, []);

  if (pathName == "auth" && auth?.accessToken) {
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
        <Toaster expand={false} position="top-center" closeButton />
      </>
    );
  }
}
