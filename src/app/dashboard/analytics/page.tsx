"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/UserApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  UserCheck,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/AuthContext";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<any>;
  trend: "up" | "down" | "neutral";
}

function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p className={`text-xs ${
            trend === "up" ? "text-green-600" : 
            trend === "down" ? "text-red-600" : 
            "text-gray-600"
          }`}>
            {change}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("30");
  const { data: analytics, isLoading, error } = useAnalytics();

  // Check if user can view analytics
  const canViewAnalytics = user?.role === "admin" || user?.role === "moderator";

  // Process analytics data
  const processedData = useMemo(() => {
    if (!analytics) return null;

    const {
      totalUsers,
      activeUsers,
      verifiedUsers,
      roleBreakdown = [],
      signupTrend = [],
      dau = [],
      ordersSummary = {},
      topFailedIPs = [],
      topFailedPhones = [],
    } = analytics;

    // Monthly revenue and orders data
    const monthlyData = ordersSummary?.monthlyRevenue?.map((item: any) => ({
      name: `${item.month}/${item.year}`,
      revenue: item.revenue || 0,
      orders: item.orders || 0,
    })) || [];

    // User role distribution
    const roleData = roleBreakdown.map((item: any) => ({
      name: item._id,
      value: item.count,
    }));

    // Order type distribution
    const orderTypeData = ordersSummary?.ordersByType?.map((item: any) => ({
      name: item._id,
      value: item.count,
    })) || [];

    // Daily active users trend
    const dauTrend = dau.map((item: any) => ({
      date: item.day,
      users: item.activeUsers,
    }));

    // Signup trend
    const signupData = signupTrend.map((item: any) => ({
      date: item._id,
      signups: item.count,
    }));

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      roleData,
      monthlyData,
      orderTypeData,
      dauTrend,
      signupData,
      ordersSummary,
      topFailedIPs,
      topFailedPhones,
    };
  }, [analytics]);

  if (!canViewAnalytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Access Denied</h3>
          <p className="mt-2 text-gray-600">
            You don't have permission to view analytics.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !processedData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium">Error Loading Analytics</h3>
          <p className="mt-2 text-gray-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={processedData.totalUsers}
          change="+12% from last month"
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Active Users"
          value={processedData.activeUsers}
          change="+8% from last month"
          icon={UserCheck}
          trend="up"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${processedData.ordersSummary?.revenueSummary?.[0]?.totalRevenue?.toFixed(2) || 0}`}
          change="+15% from last month"
          icon={DollarSign}
          trend="up"
        />
        <StatsCard
          title="Total Orders"
          value={processedData.ordersSummary?.totalOrders?.[0]?.count || 0}
          change="+5% from last month"
          icon={Package}
          trend="up"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue & Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Monthly Revenue & Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>User Role Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processedData.roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {processedData.roleData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Daily Active Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData.dauTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Order Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.orderTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Signup Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>User Signup Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={processedData.signupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="signups"
                stroke="#FF8042"
                fill="#FF8042"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Security Insights */}
      {user?.role === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Failed IPs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>Top Failed Login IPs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processedData.topFailedIPs?.slice(0, 5).map((ip: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-mono text-sm">{ip._id}</span>
                    <Badge variant="destructive">{ip.count} attempts</Badge>
                  </div>
                ))}
                {(!processedData.topFailedIPs || processedData.topFailedIPs.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No failed login attempts</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Failed Phones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span>Top Failed Login Phones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processedData.topFailedPhones?.slice(0, 5).map((phone: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-mono text-sm">{phone._id}</span>
                    <Badge variant="secondary">{phone.count} attempts</Badge>
                  </div>
                ))}
                {(!processedData.topFailedPhones || processedData.topFailedPhones.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No failed phone attempts</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-semibold">{processedData.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="font-semibold text-green-600">{processedData.activeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Verified Users:</span>
              <span className="font-semibold text-blue-600">{processedData.verifiedUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Verification Rate:</span>
              <span className="font-semibold">
                {((processedData.verifiedUsers / processedData.totalUsers) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-semibold">
                ${processedData.ordersSummary?.revenueSummary?.[0]?.totalRevenue?.toFixed(2) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Refunds:</span>
              <span className="font-semibold text-red-600">
                ${processedData.ordersSummary?.revenueSummary?.[0]?.totalRefunds?.toFixed(2) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Order Value:</span>
              <span className="font-semibold">
                ${processedData.ordersSummary?.revenueSummary?.[0]?.avgOrderValue?.toFixed(2) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Orders:</span>
              <span className="font-semibold">
                {processedData.ordersSummary?.revenueSummary?.[0]?.totalOrders || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {processedData.ordersSummary?.paymentMethods?.map((method: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="capitalize">{method._id}:</span>
                <div className="text-right">
                  <div className="font-semibold">{method.count}</div>
                  <div className="text-xs text-gray-600">${method.total?.toFixed(2) || 0}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}