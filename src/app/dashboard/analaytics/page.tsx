"use client";
import {
  COUNTRIES_ANALAYTICS_API,
  LOGIN_ANALAYTICS_API,
  OPERATIONAL_ANALAYTICS_API,
  ORDER_ANALAYTICS_API,
  REVENUE_ANALAYTICS_API,
  USER_ANALAYTICS_API,
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
} from "lucide-react";

const DashboardAnalytics = () => {
  const { user } = useAuth();

  // Fetch analytics data
  const { data: userAnalytics } = useApi(USER_ANALAYTICS_API);
  const { data: orderAnalytics } = useApi(ORDER_ANALAYTICS_API);
  const { data: revenueAnalytics } = useApi(REVENUE_ANALAYTICS_API);
  const { data: loginAnalytics } = useApi(LOGIN_ANALAYTICS_API);
  const { data: countryAnalytics } = useApi(COUNTRIES_ANALAYTICS_API);
  const { data: operationalAnalytics } = useApi(OPERATIONAL_ANALAYTICS_API);

  // Check access permissions
  if (user?.role === "user") {
    return (
      <div
        className="flex items-center justify-center h-96"
        data-testid="access-denied"
      >
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Analytics Access
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Analytics dashboard is available for admin and moderator users only.
          </p>
        </div>
      </div>
    );
  }

  // Mock analytics data for demonstration
  const mockStats = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    totalUsers: userAnalytics?.totalUsers || 1250,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    newUsers: userAnalytics?.newUsers || 85,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    totalOrders: orderAnalytics?.totalOrders || 856,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    pendingOrders: orderAnalytics?.pendingOrders || 23,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    totalRevenue: revenueAnalytics?.totalRevenue || 45672,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    monthlyGrowth: revenueAnalytics?.monthlyGrowth || 15.2,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    avgOrderValue: revenueAnalytics?.avgOrderValue || 53.4,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    deliveryRate: operationalAnalytics?.deliveryRate || 96.8,
  };

  // Chart data
  const monthlyRevenueData = [
    { name: "Jan", revenue: 12500, orders: 65 },
    { name: "Feb", revenue: 15200, orders: 59 },
    { name: "Mar", revenue: 18900, orders: 80 },
    { name: "Apr", revenue: 20100, orders: 81 },
    { name: "May", revenue: 14300, orders: 56 },
    { name: "Jun", revenue: 16800, orders: 55 },
    { name: "Jul", revenue: 22100, orders: 89 },
    { name: "Aug", revenue: 24300, orders: 95 },
  ];

  const userGrowthData = [
    { name: "Jan", users: 1050 },
    { name: "Feb", users: 1089 },
    { name: "Mar", users: 1134 },
    { name: "Apr", users: 1167 },
    { name: "May", users: 1198 },
    { name: "Jun", users: 1234 },
    { name: "Jul", users: 1267 },
    { name: "Aug", users: 1290 },
  ];

  const orderTypeData = [
    { name: "Express", value: 45, count: 385 },
    { name: "Standard", value: 35, count: 299 },
    { name: "Super Express", value: 20, count: 172 },
  ];

  const countryData = [
    { name: "USA", value: 35, orders: 300 },
    { name: "Canada", value: 25, orders: 214 },
    { name: "UK", value: 20, orders: 171 },
    { name: "Australia", value: 15, orders: 128 },
    { name: "Others", value: 5, orders: 43 },
  ];

  const operationalData = [
    { name: "On Time", delivered: 823, percentage: 96.1 },
    { name: "Delayed", delivered: 28, percentage: 3.3 },
    { name: "Failed", delivered: 5, percentage: 0.6 },
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
          
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
          data={monthlyRevenueData}
          type="bar"
          dataKey="revenue"
        />
        <DashboardChart
          title="User Growth"
          description="Total users over time"
          
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
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

      {/* Operational Metrics */}
      {user?.role === "admin" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="On-Time Delivery"
            value={`${operationalData[0].percentage}%`}
            change={`${operationalData[0].delivered} orders`}
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
      )}

      {/* Additional Insights for Admin */}
      {user?.role === "admin" && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Performance Highlights</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 15% increase in monthly revenue</li>
                <li>• 96.8% on-time delivery rate</li>
                <li>• 85 new user registrations this month</li>
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
      )}
    </div>
  );
};

export default DashboardAnalytics;
