"use client"; 
import { DashboardOverview } from "@/components/Dashboard/DashboardOverview";
import { UserDashboard } from "@/components/Dashboard/UserDashboard";
import { useAuth } from "@/hooks/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Show user-specific dashboard for regular users
  if (user?.role === "user") {
    return <UserDashboard />;
  }
  
  // Show admin/moderator dashboard for admin and moderator roles
  return <DashboardOverview />;
}