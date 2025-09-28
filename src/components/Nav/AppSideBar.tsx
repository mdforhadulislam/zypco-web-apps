"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/AuthContext";
import Logo from "@/utilities/Logo";
import { AdminData, ModaretorData, UserData } from "../ApiCall/data";
import { NavUser } from "./NavIUser";
import { NavMain } from "./NavMain";
import { NavSecondary } from "./NavSecondary";

export function AppSideBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAuth();

  const data =
    auth.user?.role == "user"
      ? {
          ...UserData,
          user: {
            name: auth.user?.name ?? "",
            email: auth.user?.email ?? "",
            avatar: "",
          },
        }
      : auth.user?.role == "moderator"
      ? {
          ...ModaretorData,
          user: {
            name: auth.user?.name ?? "",
            email: auth.user?.email ?? "",
            avatar: "",
          },
        }
      : auth.user?.role == "admin"
      ? {
          ...AdminData,
          user: {
            name: auth.user?.name ?? "",
            email: auth.user?.email ?? "",
            avatar: "",
          },
        }
      : {
          ...UserData,
          user: {
            name: auth.user?.name ?? "",
            email: auth.user?.email ?? "",
            avatar: "",
          },
        };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Logo />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">ZYPCO COURIER</span>
                  <span className="truncate text-xs font-semibold">
                    INTERNATIONAL COURIER
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
