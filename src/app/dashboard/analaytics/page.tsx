"use client";
import {
  COUNTRIES_ANALYTICS_API,
  LOGIN_ANALYTICS_API,
  OPERATIONAL_ANALYTICS_API,
  ORDER_ANALYTICS_API,
  REVENUE_ANALYTICS_API,
  USER_ANALYTICS_API,
} from "@/components/ApiCall/url";
import { DashboardChart } from "@/components/Dashboard/DashboardChart";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { useAuth } from "@/hooks/AuthContext";
import { useApi } from "@/hooks/UserApi";
import {
  Activity,
  BarChart3,
  DollarSign,
  MapPin,
  Package,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";

const DashboardAnalytics = () => {
  const { user } = useAuth();

  // Check access permissions first
  const canViewAnalytics = user?.role === "admin" || user?.role === "moderator";

  // Fetch analytics data only if user has permission
  const { data: userAnalytics, isLoading: userLoading, error: userError } = useApi(
    canViewAnalytics ? USER_ANALYTICS_API : null
  );
  const { data: orderAnalytics, isLoading: orderLoading, error: orderError } = useApi(
    canViewAnalytics ? ORDER_ANALYTICS_API : null
  );
  const { data: revenueAnalytics, isLoading: revenueLoading, error: revenueError } = useApi(
    canViewAnalytics ? REVENUE_ANALYTICS_API : null
  );
  const { data: loginAnalytics, isLoading: loginLoading, error: loginError } = useApi(
    canViewAnalytics ? LOGIN_ANALYTICS_API : null
  );
  const { data: countryAnalytics, isLoading: countryLoading, error: countryError } = useApi(
    canViewAnalytics ? COUNTRIES_ANALYTICS_API : null
  );
  const { data: operationalAnalytics, isLoading: operationalLoading, error: operationalError } = useApi(
    canViewAnalytics ? OPERATIONAL_ANALYTICS_API : null
  );

  // Access denied for regular users
  if (!canViewAnalytics) {
    return (
      <div
        className="flex items-center justify-center h-96"
        data-testid="access-denied"
      >
        <div className="text-center max-w-md mx-auto">
          <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analytics Access Restricted
          </h3>
          <p className="text-gray-600">
            Analytics dashboard is available for admin and moderator users only.
            Please contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  const isLoading = userLoading || orderLoading || revenueLoading || loginLoading || countryLoading || operationalLoading;
  
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="analytics-loading">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        </div>
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  const hasError = userError || orderError || revenueError || loginError || countryError || operationalError;
  
  if (hasError) {
    return (
      <div className="space-y-6" data-testid="analytics-error">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            Unable to load analytics data. Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  // Process analytics data - use real data if available, fallback to mock data
  const mockStats = {
    totalUsers: userAnalytics?.totals?.totalUsers || 1250,
    newUsers: userAnalytics?.newVsReturning?.newUsersCount || 85,
    totalOrders: orderAnalytics?.totals?.totalOrders || 856,
    pendingOrders: orderAnalytics?.totals?.pendingOrders || 23,
    totalRevenue: revenueAnalytics?.totals?.totalRevenue || 45672,
    monthlyGrowth: revenueAnalytics?.growth?.monthlyGrowth || 15.2,
    avgOrderValue: revenueAnalytics?.totals?.avgOrderValue || 53.4,
    deliveryRate: operationalAnalytics?.performance?.deliveryRate || 96.8,
  };

  // Chart data - use real data if available, fallback to mock data
  const monthlyRevenueData = revenueAnalytics?.monthly || [
    { name: "Jan", revenue: 12500, orders: 65 },
    { name: "Feb", revenue: 15200, orders: 59 },
    { name: "Mar", revenue: 18900, orders: 80 },
    { name: "Apr", revenue: 20100, orders: 81 },
    { name: "May", revenue: 14300, orders: 56 },
    { name: "Jun", revenue: 16800, orders: 55 },
    { name: "Jul", revenue: 22100, orders: 89 },
    { name: "Aug", revenue: 24300, orders: 95 },
  ];

  const userGrowthData = userAnalytics?.signupTrend?.map((item: any) => ({
    name: new Date(item._id).toLocaleDateString('en-US', { month: 'short' }),
    users: item.count,
  })) || [
    { name: "Jan", users: 1050 },
    { name: "Feb", users: 1089 },
    { name: "Mar", users: 1134 },
    { name: "Apr", users: 1167 },
    { name: "May", users: 1198 },
    { name: "Jun", users: 1234 },
    { name: "Jul", users: 1267 },
    { name: "Aug", users: 1290 },
  ];

  const orderTypeData = orderAnalytics?.byType || [
    { name: "Express", value: 45, count: 385 },
    { name: "Standard", value: 35, count: 299 },
    { name: "Super Express", value: 20, count: 172 },
  ];

  const countryData = countryAnalytics?.topCountries || [
    { name: "USA", value: 35, orders: 300 },
    { name: "Canada", value: 25, orders: 214 },
    { name: "UK", value: 20, orders: 171 },
    { name: "Australia", value: 15, orders: 128 },
    { name: "Others", value: 5, orders: 43 },
  ];

  return (
    <div className="space-y-6" data-testid="analytics-page">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="analytics-title"
          >
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your courier operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            Access Level: <span className="font-medium capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={mockStats.totalUsers}
          change={`+${mockStats.newUsers} new this month`}
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Total Orders"
          value={mockStats.totalOrders}
          change={`${mockStats.pendingOrders} pending`}
          icon={Package}
          trend="up"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${mockStats.totalRevenue.toLocaleString()}`}
          change={`+${mockStats.monthlyGrowth}% from last month`}
          icon={DollarSign}
          trend="up"
        />
        <StatsCard
          title="Delivery Rate"
          value={`${mockStats.deliveryRate}%`}
          change="Excellent performance"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Revenue and Orders Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardChart
          title="Monthly Revenue"
          description="Revenue trend over the last 8 months"
          data={monthlyRevenueData}
          type="bar"
          dataKey="revenue"
        />
        <DashboardChart
          title="User Growth"
          description="Total users over time"
          data={userGrowthData}
          type="line"
          dataKey="users"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardChart
          title="Order Types Distribution"
          description="Breakdown by service type"
          data={orderTypeData}
          type="pie"
          dataKey="value"
        />
        <DashboardChart
          title="Orders by Country"
          description="Geographic distribution"
          data={countryData}
          type="pie"
          dataKey="value"
        />
        <div className="space-y-4">
          <StatsCard
            title="Average Order Value"
            value={`$${mockStats.avgOrderValue}`}
            change="+8.2% from last month"
            icon={DollarSign}
            trend="up"
          />
          <StatsCard
            title="Active Countries"
            value={countryData.length}
            change="Global reach expanding"
            icon={MapPin}
            trend="up"
          />
          <StatsCard
            title="Processing Time"
            value="2.3 days"
            change="0.5 days improvement"
            icon={Activity}
            trend="up"
          />
        </div>
      </div>

      {/* Admin-only detailed metrics */}
      {user?.role === "admin" && (
        <>
          {/* Operational Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="On-Time Delivery"
              value="96.1%"
              change="823 orders"
              icon={Package}
              trend="up"
            />
            <StatsCard
              title="Customer Satisfaction"
              value="4.8/5"
              change="Based on 1,234 reviews"
              icon={Users}
              trend="up"
            />
            <StatsCard
              title="Return Rate"
              value="0.8%"
              change="Industry leading"
              icon={TrendingUp}
              trend="down"
            />
            <StatsCard
              title="Cost per Delivery"
              value="$12.45"
              change="-5% from last month"
              icon={DollarSign}
              trend="down"
            />
          </div>

          {/* Admin Insights Panel */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Admin Insights</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Performance Highlights</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• {mockStats.monthlyGrowth}% increase in monthly revenue</li>
                  <li>• {mockStats.deliveryRate}% on-time delivery rate</li>
                  <li>• {mockStats.newUsers} new user registrations this month</li>
                  <li>• Express orders growing by 22%</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Areas for Improvement</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Reduce processing time by 0.2 days</li>
                  <li>• Expand to 2 new countries</li>
                  <li>• Increase customer reviews by 15%</li>
                  <li>• Optimize super express pricing</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Data freshness indicator */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleString()} | 
        Data source: {userAnalytics ? 'Live' : 'Mock'} data
      </div>
    </div>
  );
};

export default DashboardAnalytics;