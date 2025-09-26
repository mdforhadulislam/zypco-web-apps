"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
import { useAnalytics, useOrders, useNotifications } from "@/hooks/UserApi";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Bell,
  Activity,
  Clock,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Eye,
  Truck,
} from "lucide-react";

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
          <p className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
          {change && (
            <p
              className={`text-xs flex items-center ${
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
              }`}
            >
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
    { id: 1, user: "John Doe", action: "created a new order", target: "TRK-001234", time: "2 minutes ago", type: "order" },
    { id: 2, user: "Sarah Wilson", action: "updated pickup status", target: "Pickup #456", time: "5 minutes ago", type: "pickup" },
    { id: 3, user: "Mike Johnson", action: "left a review", target: "5 stars", time: "10 minutes ago", type: "review" },
    { id: 4, user: "Lisa Chen", action: "registered account", target: "New User", time: "15 minutes ago", type: "user" },
    { id: 5, user: "Admin", action: "sent notification", target: "System Update", time: "20 minutes ago", type: "notification" },
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
          {activities.map((a) => (
            <div key={a.id} className="flex items-start space-x-3">
              <div className="mt-0.5">{getActivityIcon(a.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{a.user}</span> {a.action}{" "}
                  <span className="font-medium text-blue-600">{a.target}</span>
                </p>
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> {a.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dynamic SystemStatus - fetches /api/health and updates periodically
 */
function SystemStatus() {
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // polling interval in ms
  const POLL_INTERVAL = 15000;

  const mapStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (["running", "operational", "active", "connected", "healthy"].includes(s)) return "bg-green-500";
    if (["maintenance", "warning"].includes(s)) return "bg-yellow-500";
    if (["error", "disconnected", "down", "failed"].includes(s)) return "bg-red-500";
    return "bg-gray-500";
  };

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/health", { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setHealth(json?.data ?? json);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch health:", err);
          setError(err.message || "Failed to fetch health");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHealth();
    const id = setInterval(fetchHealth, POLL_INTERVAL);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
    };
  }, []);

  // build service list we want to display (fall back when keys missing)
  const services = useMemo(() => {
    if (!health) return [];
    const s = health.services || {};
    return [
      { name: "API Server", status: s.api ?? health.status ?? "unknown", uptime: health.uptime ?? undefined },
      { name: "Database", status: health.database?.status ?? "unknown", uptime: undefined },
      { name: "Payment Gateway", status: s.payment ?? s.payments ?? "operational", uptime: undefined },
      { name: "Email Service", status: s.email ?? s.notifications ?? "operational", uptime: undefined },
      { name: "SMS Service", status: s.sms ?? "operational", uptime: undefined },
    ];
  }, [health]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>System Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Loading system status...</p>
        ) : error ? (
          <p className="text-sm text-red-500">Failed to load status: {error}</p>
        ) : (
          <>
            {/* optional top summary */}
            {health && (
              <div className="mb-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="mr-2">Status:</strong> <span className="capitalize">{health.status ?? "unknown"}</span>
                  </div>
                  <div className="text-right">
                    <div>{health.timestamp ? new Date(health.timestamp).toLocaleString() : ""}</div>
                    {health.uptime && <div className="text-xs text-gray-500">Uptime: {health.uptime}</div>}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {services.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${mapStatusColor(svc.status)}`} />
                    <span className="text-sm font-medium">{svc.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm capitalize text-gray-600">{svc.status}</p>
                    {svc.uptime && <p className="text-xs text-gray-500">{svc.uptime}</p>}
                  </div>
                </div>
              ))}

              {/* memory & db details */}
              {health && (
                <div className="mt-3 border-t pt-3">
                  <div className="text-xs text-gray-600 space-y-1">
                    {health.database && (
                      <div>
                        <strong>DB:</strong> <span className="capitalize">{health.database.status}</span>
                      </div>
                    )}
                    {health.memory && (
                      <div>
                        <strong>Memory:</strong> {health.memory.used} / {health.memory.total}
                      </div>
                    )}
                    {health.version && (
                      <div>
                        <strong>Version:</strong> {health.version}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RecentOrders() {
  const { data: orders, isLoading } = useOrders({ limit: 5 });

  if (isLoading)
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
                  <Badge variant={order.payment?.pReceived >= order.payment?.pAmount ? "default" : "secondary"}>
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analytics } = useAnalytics();
  const { data: recentNotifications } = useNotifications({ limit: 3, isRead: false });

  const chartData = useMemo(() => {
    if (!analytics) return null;
    return {
      weeklyOrders: [
        { name: "Mon", orders: 23, revenue: 1200 },
        { name: "Tue", orders: 34, revenue: 1800 },
        { name: "Wed", orders: 28, revenue: 1500 },
        { name: "Thu", orders: 41, revenue: 2200 },
        { name: "Fri", orders: 37, revenue: 1950 },
        { name: "Sat", orders: 29, revenue: 1600 },
        { name: "Sun", orders: 18, revenue: 950 },
      ],
      orderStatus: [
        { name: "Completed", value: 45, color: "#10B981" },
        { name: "In Transit", value: 30, color: "#3B82F6" },
        { name: "Pending", value: 15, color: "#F59E0B" },
        { name: "Cancelled", value: 10, color: "#EF4444" },
      ],
    };
  }, [analytics]);

  const stats = useMemo(() => {
    if (!analytics) return { totalUsers: 0, totalOrders: 0, totalRevenue: 0, activeUsers: 0 };
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600">Here{"'"}s what{"'"}s happening with your courier service today.</p>
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
        <QuickStat title="Total Users" value={stats.totalUsers} change="+12% from last month" trend="up" icon={Users} href="/dashboard/users" />
        <QuickStat title="Total Orders" value={stats.totalOrders} change="+8% from last week" trend="up" icon={Package} href="/dashboard/orders" />
        <QuickStat title="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} change="+15% from last month" trend="up" icon={DollarSign} href="/dashboard/analytics" />
        <QuickStat title="Active Users" value={stats.activeUsers} change="+5% from yesterday" trend="up" icon={TrendingUp} />
      </div>

      {/* Charts */}
      {canViewAnalytics && chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Orders */}
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
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData.orderStatus} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {chartData.orderStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
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
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>

        <div className="space-y-6">
          <SystemStatus />

          {recentNotifications?.length > 0 && (
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
                  {recentNotifications.slice(0, 3).map((n: any) => (
                    <div key={n._id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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

      <RecentActivity />
    </div>
  );
}
