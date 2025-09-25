"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/AuthContext";
import { useAnalytics, useOrders, useUsers, useNotifications } from "@/hooks/UserApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Bell,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Truck,
  Star,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface QuickStatProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ComponentType<any>;
  href?: string;
}

function QuickStat({ title, value, change, trend, icon: Icon, href }: QuickStatProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : null;
  
  const StatContent = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change && (
            <p className={`text-xs flex items-center ${
              trend === "up" ? "text-green-600" : 
              trend === "down" ? "text-red-600" : 
              "text-gray-600"
            }`}>
              {TrendIcon && <TrendIcon className="h-3 w-3 mr-1" />}
              {change}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{StatContent}</Link> : StatContent;
}

function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: "John Doe",
      action: "created a new order",
      target: "TRK-001234",
      time: "2 minutes ago",
      type: "order"
    },
    {
      id: 2,
      user: "Sarah Wilson",
      action: "updated pickup status",
      target: "Pickup #456",
      time: "5 minutes ago",
      type: "pickup"
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "left a review",
      target: "5 stars",
      time: "10 minutes ago",
      type: "review"
    },
    {
      id: 4,
      user: "Lisa Chen",
      action: "registered account",
      target: "New User",
      time: "15 minutes ago",
      type: "user"
    },
    {
      id: 5,
      user: "Admin",
      action: "sent notification",
      target: "System Update",
      time: "20 minutes ago",
      type: "notification"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "pickup":
        return <Truck className="h-4 w-4 text-green-500" />;
      case "review":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "user":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "notification":
        return <Bell className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/activity">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                  <span className="font-medium text-blue-600">{activity.target}</span>
                </p>
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentOrders() {
  const { data: orders, isLoading } = useOrders({ limit: 5 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Orders</span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Track ID</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.slice(0, 5).map((order: any) => (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-sm">{order.trackId}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-xs">
                      <MapPin className="h-3 w-3 text-green-600" />
                      <span>{order.parcel?.from}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <MapPin className="h-3 w-3 text-red-600" />
                      <span>{order.parcel?.to}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    order.payment?.pReceived >= order.payment?.pAmount ? "default" : "secondary"
                  }>
                    {order.payment?.pReceived >= order.payment?.pAmount ? "Paid" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">${order.payment?.pAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SystemStatus() {
  const services = [
    { name: "API Server", status: "operational", uptime: "99.9%" },
    { name: "Database", status: "operational", uptime: "99.8%" },
    { name: "Payment Gateway", status: "operational", uptime: "99.7%" },
    { name: "Email Service", status: "maintenance", uptime: "98.5%" },
    { name: "SMS Service", status: "operational", uptime: "99.6%" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "maintenance":
        return "bg-yellow-500";
      case "down":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>System Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm capitalize text-gray-600">{service.status}</p>
                <p className="text-xs text-gray-500">{service.uptime}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analytics } = useAnalytics();
  const { data: recentNotifications } = useNotifications({ limit: 3, isRead: false });

  // Process analytics data for charts
  const chartData = useMemo(() => {
    if (!analytics) return null;

    // Weekly order data
    const weeklyOrders = [
      { name: 'Mon', orders: 23, revenue: 1200 },
      { name: 'Tue', orders: 34, revenue: 1800 },
      { name: 'Wed', orders: 28, revenue: 1500 },
      { name: 'Thu', orders: 41, revenue: 2200 },
      { name: 'Fri', orders: 37, revenue: 1950 },
      { name: 'Sat', orders: 29, revenue: 1600 },
      { name: 'Sun', orders: 18, revenue: 950 },
    ];

    // Order status distribution
    const orderStatus = [
      { name: 'Completed', value: 45, color: '#10B981' },
      { name: 'In Transit', value: 30, color: '#3B82F6' },
      { name: 'Pending', value: 15, color: '#F59E0B' },
      { name: 'Cancelled', value: 10, color: '#EF4444' },
    ];

    return { weeklyOrders, orderStatus };
  }, [analytics]);

  // Calculate stats from analytics
  const stats = useMemo(() => {
    if (!analytics) {
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeUsers: 0
      };
    }

    return {
      totalUsers: analytics.totalUsers || 0,
      totalOrders: analytics.ordersSummary?.totalOrders?.[0]?.count || 0,
      totalRevenue: analytics.ordersSummary?.revenueSummary?.[0]?.totalRevenue || 0,
      activeUsers: analytics.activeUsers || 0,
    };
  }, [analytics]);

  const canViewAnalytics = user?.role === "admin" || user?.role === "moderator";

  return (
    <div className="space-y-6" data-testid="dashboard-home">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Here{"'"}s what{"'"}s happening with your courier service today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {user?.role}
          </Badge>
          {user?.avatar && (
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <QuickStat
          title="Total Users"
          value={stats.totalUsers}
          change="+12% from last month"
          trend="up"
          icon={Users}
          href="/dashboard/users"
        />
        <QuickStat
          title="Total Orders"
          value={stats.totalOrders}
          change="+8% from last week"
          trend="up"
          icon={Package}
          href="/dashboard/orders"
        />
        <QuickStat
          title="Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          change="+15% from last month"
          trend="up"
          icon={DollarSign}
          href="/dashboard/analytics"
        />
        <QuickStat
          title="Active Users"
          value={stats.activeUsers}
          change="+5% from yesterday"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Section */}
      {canViewAnalytics && chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Weekly Orders & Revenue</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/analytics">View Details</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.weeklyOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.orderStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.orderStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* System Status */}
          <SystemStatus />

          {/* Recent Notifications */}
          {recentNotifications && recentNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/notifications">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentNotifications.slice(0, 3).map((notification: any) => (
                    <div key={notification._id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/orders">
                    <Package className="mr-2 h-4 w-4" />
                    Create New Order
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/pickups">
                    <Truck className="mr-2 h-4 w-4" />
                    Schedule Pickup
                  </Link>
                </Button>
                {user?.role === "admin" && (
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/dashboard/users">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </Button>
                )}
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/settings">
                    <Activity className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}