"use client";
import { DashboardChart } from "@/components/Dashboard/DashboardChart";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleGuard } from "@/middleware/roleGuard";
import { AnalyticsService } from "@/services/dashboardService";
import {
  Activity,
  BarChart3,
  Bell,
  DollarSign,
  Package,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AnalyticsData {
  totalUsers?: number;
  activeUsers?: number;
  verifiedUsers?: number;
  totalOrders?: number;
  ordersByType?: Array<{ _id: string; count: number }>;
  revenueSummary?: Array<{
    totalRevenue: number;
    totalRefunds: number;
    avgOrderValue: number;
    totalOrders: number;
  }>;
  monthlyRevenue?: Array<{
    year: number;
    month: number;
    revenue: number;
    orders: number;
  }>;
  signupTrend?: Array<{
    _id: string;
    count: number;
  }>;
  dau?: Array<{
    day: string;
    activeUsers: number;
  }>;
  topFailedPhones?: Array<{
    _id: string;
    count: number;
  }>;
  roleBreakdown?: Array<{
    _id: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const days =
        selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
      const response = await AnalyticsService.getOverview({ days });

      if (response.status == 200) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to fetch analytics");
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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading analytics: {error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const revenueSummary = data.revenueSummary?.[0];

  return (
    <RoleGuard allowedRoles={["admin", "moderator"]}>
      <div className="space-y-6" data-testid="analytics-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your business performance
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod("7d")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedPeriod === "7d"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              data-testid="period-7d"
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedPeriod("30d")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedPeriod === "30d"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              data-testid="period-30d"
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedPeriod("90d")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedPeriod === "90d"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              data-testid="period-90d"
            >
              90 Days
            </button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Users"
                value={data.totalUsers || 0}
                change="+12% from last period"
                trend="up"
                icon={Users}
              />
              <StatsCard
                title="Active Users"
                value={data.activeUsers || 0}
                change="+5% from last period"
                trend="up"
                icon={Activity}
              />
              <StatsCard
                title="Total Revenue"
                value={`$${
                  revenueSummary?.totalRevenue?.toLocaleString() || 0
                }`}
                change="+18% from last period"
                trend="up"
                icon={DollarSign}
              />
              <StatsCard
                title="Total Orders"
                value={revenueSummary?.totalOrders || 0}
                change="+8% from last period"
                trend="up"
                icon={Package}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {data.monthlyRevenue && data.monthlyRevenue.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Revenue Trend</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DashboardChart
                      title="Revenue Trend"
                      description="Monthly revenue performance"
                      type="area" // ✅ area chart is good for trends
                      data={data.ordersSummary.monthlyRevenue.map((item) => ({
                        name: `${item.month}/${item.year}`,
                        value: item.revenue,
                        orders: item.orders,
                      }))}
                      dataKey="value"
                      color="#8884d8"
                    />
                  </CardContent>
                </Card>
              )}

              {data?.ordersSummary?.ordersByType &&
                data.ordersSummary?.ordersByType?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Orders by Type</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DashboardChart
                        title="Orders by Type"
                        description="Distribution of order categories"
                        type="bar" // ✅ bar chart works well for categories
                        data={data.ordersSummary.ordersByType.map((item) => ({
                          name: item._id || "Unknown",
                          value: item.count,
                        }))}
                        dataKey="value"
                        color="#82ca9d"
                      />
                    </CardContent>
                  </Card>
                )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Total Users"
                value={data.totalUsers || 0}
                icon={Users}
              />
              <StatsCard
                title="Active Users"
                value={data.activeUsers || 0}
                icon={Activity}
              />
              <StatsCard
                title="Verified Users"
                value={data.verifiedUsers || 0}
                icon={Shield}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {data.signupTrend && data.signupTrend.length > 0 && (
                <DashboardChart
                  data={data.signupTrend.map((item) => ({
                    name: item._id,
                    value: item.count,
                  }))}
                  title="User Registrations"
                  description="New users per month"
                  type="bar"
                  dataKey="value"
                  color="#ff7300"
                />
              )}

              {data.roleBreakdown && data.roleBreakdown.length > 0 && (
                <DashboardChart
                  title="Users by Role"
                  description="System user distribution"
                  type="pie"
                  dataKey="value"
                  data={data.roleBreakdown.map((role) => ({
                    name: role._id,
                    value: role.count,
                  }))}
                />
              )}
            </div>

            {data.dau && data.dau.length > 0 && (
              <DashboardChart
                title="Daily Active Users"
                description="Number of users active each day"
                type="line" // or "area" যেটা চাই
                data={data.dau.map((item) => ({
                  name: item.day, // x-axis label (যেমন: Mon, Tue)
                  value: item.activeUsers, // y-axis value
                }))}
                dataKey="value"
                color="#4ade80"
              />
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Total Orders"
                value={revenueSummary?.totalOrders || 0}
                icon={Package}
              />
              <StatsCard
                title="Average Order Value"
                value={`$${
                  revenueSummary?.avgOrderValue?.toFixed(2) || "0.00"
                }`}
                icon={DollarSign}
              />
              <StatsCard
                title="Order Growth"
                value="+12%"
                trend="up"
                icon={TrendingUp}
              />
            </div>

            {data.ordersSummary.ordersByType &&
              data.ordersSummary.ordersByType.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Orders by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data.ordersSummary.ordersByType.map((type, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="capitalize font-medium">
                              {type._id}
                            </span>
                            <span className="text-2xl font-bold">
                              {type.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Order Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DashboardChart
                        data={data.ordersByType.map((item) => ({
                          name: item._id,
                          value: item.count,
                        }))}
                        dataKey="value"
                        color="#8884d8"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title="Total Revenue"
                value={`$${
                  revenueSummary?.totalRevenue?.toLocaleString() || 0
                }`}
                icon={DollarSign}
              />
              <StatsCard
                title="Total Refunds"
                value={`$${
                  revenueSummary?.totalRefunds?.toLocaleString() || 0
                }`}
                icon={TrendingUp}
              />
              <StatsCard
                title="Average Order Value"
                value={`$${
                  revenueSummary?.avgOrderValue?.toFixed(2) || "0.00"
                }`}
                icon={Package}
              />
              <StatsCard
                title="Net Revenue"
                value={`$${(
                  (revenueSummary?.totalRevenue || 0) -
                  (revenueSummary?.totalRefunds || 0)
                ).toLocaleString()}`}
                icon={DollarSign}
              />
            </div>

            {data.ordersSummary.monthlyRevenue &&
              data.ordersSummary.monthlyRevenue.length > 0 && (
                <DashboardChart
                  title="Monthly Revenue Trend"
                  data={data.ordersSummary.monthlyRevenue.map((item) => ({
                    name: `${item.month}/${item.year}`,
                    value: item.revenue,
                    orders: item.orders,
                  }))}
                  dataKey="value"
                  color="#8884d8"
                />
              )}
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Failed Login Attempts"
                value={
                  data.topFailedPhones?.reduce(
                    (sum, item) => sum + item.count,
                    0
                  ) || 0
                }
                icon={Shield}
              />
              <StatsCard title="Security Alerts" value="0" icon={Bell} />
              <StatsCard title="Blocked IPs" value="0" icon={Activity} />
            </div>

            {data.topFailedPhones && data.topFailedPhones.length > 0 && (
              <>
                <DashboardChart
                  title="Top Failed Phones"
                  description="Most frequent failed login attempts"
                  type="bar"
                  data={data.topFailedPhones.slice(0, 10).map((item) => ({
                    name: item._id, // phone number
                    value: item.count, // number of attempts
                  }))}
                  dataKey="value"
                  color="#f87171" // red tone for failed attempts
                />
                {/* optional: keep your list too */}
                <div className="mt-6 space-y-4">
                  {data.topFailedPhones.slice(0, 10).map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-red-50 rounded"
                    >
                      <span className="font-medium">{item._id}</span>
                      <span className="text-red-600 font-bold">
                        {item.count} attempts
                      </span>
                    </div>
                  ))}
                </div>{" "}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
