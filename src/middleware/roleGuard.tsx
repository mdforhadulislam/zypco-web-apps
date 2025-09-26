"use client";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ("admin" | "moderator" | "user")[];
  fallbackRoute?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackRoute = "/" }: RoleGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/auth/signin");
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        router.push("/dashboard/unauthorized");
        return;
      }
    }
  }, [user, loading, isAuthenticated, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  if (user && !allowedRoles.includes(user.role)) {
    return null; // Will redirect to unauthorized
  }

  return <>{children}</>;
}

// Unauthorized page component
export function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" data-testid="unauthorized-page">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
              <p className="text-gray-600">
                You don't have permission to access this resource.
              </p>
              {user && (
                <p className="text-sm text-gray-500">
                  Current role: <span className="font-medium capitalize">{user.role}</span>
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                data-testid="go-back-btn"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                data-testid="dashboard-btn"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}