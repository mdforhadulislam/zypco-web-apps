"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/AuthContext";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Database,
  DollarSign,
  Eye,
  Globe,
  Package,
  RefreshCw,
  Server,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

// Types
interface HealthData {
  status: string;
  timestamp: string;
  uptime: string;
  uptimeSeconds: number;
  database: { status: string };
  memory: { used: string; total: string; external: string };
  environment: string;
  version: string;
  services: {
    api: string;
    notifications: string;
    auth: string;
    analytics: string;
  };
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  roleBreakdown: Array<{ _id: string; count: number }>;
  signupTrend: Array<{ _id: string; count: number }>;
  dau: Array<{ day: string; activeUsers: number }>;
  topFailedPhones: Array<{ _id: string; count: number }>;
  topFailedIPs: Array<{ _id: string; count: number }>;
  ordersSummary: {
    totalOrders: Array<{ count: number }>;
    revenueSummary: Array<{
      totalRevenue: number;
      totalRefunds: number;
      avgOrderValue: number;
      totalOrders: number;
    }>;
    ordersByType: Array<{ _id: string; count: number }>;
    monthlyRevenue: Array<{
      year: number;
      month: number;
      revenue: number;
      orders: number;
    }>;
  };
  generatedAt: string;
}

// Stat Card Component
const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "default",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  trend?: string;
  color?: "default" | "success" | "warning" | "error";
}) => {
  const colorClasses = {
    default: "text-blue-600 bg-blue-100",
    success: "text-green-600 bg-green-100",
    warning: "text-yellow-600 bg-yellow-100",
    error: "text-red-600 bg-red-100",
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 rounded-md p-1 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trend && (
          <Badge variant="secondary" className="text-xs mt-2">
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

// Health Status Component
const HealthStatus = ({ health }: { health: HealthData | null }) => {
  if (!health) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Status: Unavailable
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "connected":
      case "running":
      case "active":
        return "success";
      case "warning":
        return "warning";
      case "error":
      case "disconnected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "connected":
      case "running":
      case "active":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>
          Last updated: {new Date(health.timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Uptime</div>
              <div className="text-xs text-gray-500">{health.uptime}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium flex items-center gap-1">
                Database
                <Badge
                  variant={
                    getStatusColor(health.database.status) === "success"
                      ? "default"
                      : "destructive"
                  }
                >
                  {health.database.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Memory</div>
              <div className="text-xs text-gray-500">
                {health.memory.used} / {health.memory.total}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Environment</div>
              <div className="text-xs text-gray-500">{health.environment}</div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700">
            Services Status
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(health.services).map(([service, status]) => {
              const StatusIcon = getStatusIcon(status);
              return (
                <div key={service} className="flex items-center gap-2">
                  <StatusIcon
                    className={`h-4 w-4 ${
                      getStatusColor(status) === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                  <span className="text-sm capitalize">{service}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function DashboardOverview() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealthData = async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      if (data.status==200) {
        setHealth(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch health data:", error);
      setHealth(null);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/v1/analytics?days=30", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status==200) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchHealthData(), fetchAnalytics()]);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => {
    refreshData();

    // Auto refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate derived metrics
  const totalOrders = analytics?.ordersSummary?.totalOrders?.[0]?.count || 0;
  const revenueSummary = analytics?.ordersSummary?.revenueSummary?.[0];
  const totalRevenue = revenueSummary?.totalRevenue || 0;
  const avgOrderValue = revenueSummary?.avgOrderValue || 0;

  const userGrowth =
    analytics?.signupTrend?.length || 0 > 1
      ? (analytics.signupTrend[analytics.signupTrend.length - 1]?.count || 0) -
        (analytics.signupTrend[analytics.signupTrend.length - 2]?.count || 0)
      : 0;

  return (
    <div className="min-h-screen ">
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name}! Here{"'"}s what{"'"}s happening with your
              courier service.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button
              onClick={refreshData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health */}
        <HealthStatus health={health} />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={analytics?.totalUsers || 0}
            description={`${analytics?.verifiedUsers || 0} verified`}
            icon={Users}
            trend={userGrowth > 0 ? `+${userGrowth} this period` : undefined}
            color="default"
          />

          <StatCard
            title="Total Revenue"
            value={`$${(totalRevenue / 1000).toFixed(1)}K`}
            description={`Avg: $${avgOrderValue.toFixed(2)} per order`}
            icon={DollarSign}
            color="success"
          />

          <StatCard
            title="Total Orders"
            value={totalOrders}
            description="All time orders"
            icon={Package}
            color="default"
          />

          <StatCard
            title="Active Users (30d)"
            value={analytics?.activeUsers || 0}
            description={`${Math.round(
              ((analytics?.activeUsers || 0) / (analytics?.totalUsers || 1)) *
                100
            )}% of total`}
            icon={Activity}
            color="success"
          />
        </div>

        {/* Charts and Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.roleBreakdown?.map((role) => (
                  <div
                    key={role._id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium capitalize">
                      {role._id}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-2 w-24">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (role.count / (analytics?.totalUsers || 1)) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {role.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Top Failed Login Attempts
                  </h4>
                  <div className="space-y-2">
                    {analytics?.topFailedPhones
                      ?.slice(0, 3)
                      .map((phone, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-mono">
                            {phone._id?.replace(
                              /(\+\d{1,3})\d{4,}(\d{4})/,
                              "$1****$2"
                            ) || "Unknown"}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {phone.count} failed
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Suspicious IPs
                  </h4>
                  <div className="space-y-2">
                    {analytics?.topFailedIPs?.slice(0, 3).map((ip, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-mono">{ip._id}</span>
                        <Badge variant="outline" className="text-xs">
                          {ip.count} attempts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.ordersSummary?.ordersByType?.map((type) => (
                  <div
                    key={type._id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm capitalize">
                      {type._id || "Unknown"}
                    </span>
                    <Badge variant="secondary">{type.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Active Users Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics?.dau?.slice(-7).map((day, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{new Date(day.day).toLocaleDateString()}</span>
                    <span className="font-medium">{day.activeUsers} users</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open("/dashboard/analytics", "_blank")}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open("/dashboard/users", "_blank")}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open("/dashboard/orders", "_blank")}
              >
                <Package className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center justify-center gap-4">
            <span>System Version: {health?.version || "1.0.0"}</span>
            <span>•</span>
            <span>Environment: {health?.environment || "development"}</span>
            <span>•</span>
            <span>
              Generated:{" "}
              {analytics?.generatedAt
                ? new Date(analytics.generatedAt).toLocaleString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
