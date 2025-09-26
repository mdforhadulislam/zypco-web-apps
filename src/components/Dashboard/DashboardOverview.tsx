"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { DashboardChart } from "@/components/Dashboard/DashboardChart";
import { AnalyticsService } from "@/services/dashboardService";
import { useAuth } from "@/hooks/AuthContext";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";

interface OverviewData {
  totalUsers?: number;
  activeUsers?: number;
  verifiedUsers?: number;
  totalOrders?: number;
  totalRevenue?: number;
  monthlyRevenue?: Array<{
    month: number;
    year: number;
    revenue: number;
    orders: number;
  }>;
  ordersByType?: Array<{
    _id: string;
    count: number;
  }>;
  signupTrend?: Array<{
    _id: string;
    count: number;
  }>;
}

export function DashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<OverviewData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const response = await AnalyticsService.getOverview({
        days: 30
      });

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to fetch overview data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card data-testid="overview-error">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading dashboard: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatsCardsForRole = () => {
    const baseStats = [
      {
        title: "Total Orders",
        value: data.totalOrders || 0,
        change: "+12% from last month",
        trend: "up" as const,
        icon: Package,
      },
      {
        title: "Revenue",
        value: `$${(data.totalRevenue || 0).toLocaleString()}`,
        change: "+8% from last month",
        trend: "up" as const,
        icon: DollarSign,
      },
    ];

    if (user?.role === "admin") {
      return [
        {
          title: "Total Users",
          value: data.totalUsers || 0,
          change: "+5% from last month",
          trend: "up" as const,
          icon: Users,
        },
        {
          title: "Active Users",
          value: data.activeUsers || 0,
          change: "+2% from last month",
          trend: "up" as const,
          icon: CheckCircle,
        },
        ...baseStats,
      ];
    }

    if (user?.role === "moderator") {
      return [
        {
          title: "Active Users",
          value: data.activeUsers || 0,
          change: "+2% from last month",
          trend: "up" as const,
          icon: Users,
        },
        ...baseStats,
        {
          title: "Pending Reviews",
          value: 0, // This would come from review analytics
          change: "-3% from last month",
          trend: "down" as const,
          icon: Star,
        },
      ];
    }

    // User role
    return [
      {
        title: "My Orders",
        value: 0, // This would come from user-specific data
        change: "+1 this month",
        trend: "up" as const,
        icon: Package,
      },
      {
        title: "Completed",
        value: 0,
        change: "2 delivered",
        trend: "up" as const,
        icon: CheckCircle,
      },
      {
        title: "In Transit",
        value: 0,
        change: "1 shipping",
        trend: "neutral" as const,
        icon: Clock,
      },
      {
        title: "Total Spent",
        value: "$0",
        change: "+$50 this month",
        trend: "up" as const,
        icon: DollarSign,
      },
    ];
  };

  const statsCards = getStatsCardsForRole();

  return (
    <div className="space-y-6" data-testid="dashboard-overview">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here{"'"}s what{"'"}s happening with your {user?.role === "user" ? "shipments" : "business"} today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Charts Section */}
      {(user?.role === "admin" || user?.role === "moderator") && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Chart */}
          {data.monthlyRevenue && data.monthlyRevenue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardChart
                  data={data.monthlyRevenue.map(item => ({
                    name: `${item.month}/${item.year}`,
                    value: item.revenue
                  }))}
                  dataKey="value"
                  color="#8884d8"
                />
              </CardContent>
            </Card>
          )}

          {/* Orders by Type */}
          {data.ordersByType && data.ordersByType.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Orders by Type</CardTitle>
                <CardDescription>Distribution of order types</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardChart
                  data={data.ordersByType.map(item => ({
                    name: item._id,
                    value: item.count
                  }))}
                  dataKey="value"
                  color="#82ca9d"
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* User-specific sections */}
      {user?.role === "user" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest shipments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No recent orders found. Create your first shipment to get started.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full p-2 text-left hover:bg-gray-50 rounded-md transition-colors">
                  Create New Shipment
                </button>
                <button className="w-full p-2 text-left hover:bg-gray-50 rounded-md transition-colors">
                  Track Existing Order
                </button>
                <button className="w-full p-2 text-left hover:bg-gray-50 rounded-md transition-colors">
                  Calculate Shipping Cost
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}