"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { DataTable } from "@/components/Dashboard/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderService, UserService } from "@/services/dashboardService";
import { useAuth } from "@/hooks/AuthContext";
import { 
  Package, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Plus,
  Truck,
  MapPin,
  Star,
  Bell
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function UserDashboard() {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's orders
      const ordersResponse = await OrderService.getOrders({ 
        limit: 10,
        // The API should filter by user automatically based on auth
      });
      
      if (ordersResponse.success) {
        setMyOrders(ordersResponse.data || []);
      }

      // Fetch user's notifications
      if (user?.phone) {
        const notificationsResponse = await UserService.getUserNotifications(user.phone);
        if (notificationsResponse.success) {
          setNotifications(notificationsResponse.data?.slice(0, 5) || []);
        }
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
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
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const orderStats = {
    total: myOrders.length,
    processing: myOrders.filter((order: any) => order.status === "processing").length,
    shipped: myOrders.filter((order: any) => order.status === "shipped").length,
    delivered: myOrders.filter((order: any) => order.status === "delivered").length,
    totalSpent: myOrders.reduce((sum: number, order: any) => sum + (order.payment?.pAmount || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const orderColumns = [
    {
      key: "trackId",
      label: "Track ID",
      sortable: true,
    },
    {
      key: "parcel.receiver.name",
      label: "Recipient",
      render: (value: string, row: any) => row.parcel?.receiver?.name || "N/A",
    },
    {
      key: "parcel.to",
      label: "Destination",
      render: (value: any) => value || "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => getStatusBadge(value || "pending"),
    },
    {
      key: "payment.pAmount",
      label: "Amount",
      render: (value: number) => `$${value?.toFixed(2) || "0.00"}`,
    },
    {
      key: "orderDate",
      label: "Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6" data-testid="user-dashboard">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your shipping activity and recent orders.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={orderStats.total}
          change={orderStats.total > 0 ? `+1 this month` : "Get started"}
          trend="neutral"
          icon={Package}
        />
        <StatsCard
          title="In Transit"
          value={orderStats.processing + orderStats.shipped}
          change={`${orderStats.processing} processing`}
          trend="neutral"
          icon={Truck}
        />
        <StatsCard
          title="Delivered"
          value={orderStats.delivered}
          change="On time delivery"
          trend="up"
          icon={CheckCircle}
        />
        <StatsCard
          title="Total Spent"
          value={`$${orderStats.totalSpent.toFixed(2)}`}
          change="Across all orders"
          trend="neutral"
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Orders */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button asChild size="sm" data-testid="view-all-orders-btn">
                  <Link href="/ship-and-track/create-shipment">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.slice(0, 5).map((order: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.trackId}</p>
                        <p className="text-sm text-gray-500">
                          To: {order.parcel?.receiver?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status || "pending")}
                        <p className="text-sm text-gray-500 mt-1">
                          ${order.payment?.pAmount?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/orders">View All Orders</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Button asChild data-testid="create-first-order-btn">
                    <Link href="/ship-and-track/create-shipment">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Order
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/ship-and-track/create-shipment">
                  <Package className="h-4 w-4 mr-2" />
                  Create Shipment
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/ship-and-track/track-shipment">
                  <Truck className="h-4 w-4 mr-2" />
                  Track Package
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/ship-and-track/claculate-shipping-charge">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Calculate Rate
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/settings">
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Addresses
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/notifications">View All</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action for New Users */}
      {myOrders.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Get started with your first shipment</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first international shipment and track it all the way to delivery.
              </p>
              <div className="mt-6">
                <Button asChild data-testid="get-started-btn">
                  <Link href="/ship-and-track/create-shipment">
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}