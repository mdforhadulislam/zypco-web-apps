"use client";
import { AdminData, ModaretorData, UserData } from "@/components/ApiCall/data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { DashboardChart } from "@/components/Dashboard/DashboardChart";
import { useAuth } from "@/hooks/AuthContext";
import { useApi } from "@/hooks/UserApi";
import Link from "next/link";
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  Boxes,
  Star,
  Clock,
  CheckCircle
} from "lucide-react";
import { 
  USER_ANALAYTICS_API, 
  ORDER_ANALAYTICS_API, 
  REVENUE_ANALAYTICS_API,
  ORDERS_API,
  PICKUP_API,
  REVIEW_API
} from "@/components/ApiCall/url";

const DashBoard = () => {
  const auth = useAuth();
  
  // Fetch analytics data
  const { data: userAnalytics } = useApi(USER_ANALAYTICS_API);
  const { data: orderAnalytics } = useApi(ORDER_ANALAYTICS_API);
  const { data: revenueAnalytics } = useApi(REVENUE_ANALAYTICS_API);
  const { data: orders } = useApi(ORDERS_API);
  const { data: pickups } = useApi(PICKUP_API);
  const { data: reviews } = useApi(REVIEW_API);

  const headerBar =
    auth.user?.role == "user"
      ? [...UserData.navMain]
      : auth.user?.role == "moderator"
      ? [...ModaretorData.navMain]
      : auth.user?.role == "admin"
      ? [...AdminData.navMain]
      : [...UserData.navMain];

  // Mock data for demonstration - replace with real API data
  const mockStats = {
    totalUsers: userAnalytics?.totalUsers || 1250,
    totalOrders: orderAnalytics?.totalOrders || 856,
    totalRevenue: revenueAnalytics?.totalRevenue || 45672,
    pendingOrders: orderAnalytics?.pendingOrders || 23,
    completedOrders: orderAnalytics?.completedOrders || 789,
    avgRating: 4.8,
  };

  const chartData = [
    { name: 'Jan', orders: 65, revenue: 12500 },
    { name: 'Feb', orders: 59, revenue: 15200 },
    { name: 'Mar', orders: 80, revenue: 18900 },
    { name: 'Apr', orders: 81, revenue: 20100 },
    { name: 'May', orders: 56, revenue: 14300 },
    { name: 'Jun', orders: 55, revenue: 16800 },
  ];

  const orderTypeData = [
    { name: 'Express', value: 45 },
    { name: 'Standard', value: 35 },
    { name: 'Super Express', value: 20 },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-main">
      {/* Quick Navigation */}
      <Carousel className="pt-1 pb-2 w-auto sm:w-full border-b" data-testid="dashboard-navigation">
        <CarouselContent className="-ml-1">
          {headerBar.map((item, index) => (
            <CarouselItem
              key={index}
              className="pl-1 md:basis-1/3 basis-1/2 sm:basis-1/3 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7"
            >
              <div className="p-1">
                <Link
                  href={item.url}
                  className="w-full h-auto rounded-lg border-[#241F21] border bg-[#FEF400]/10 text-[#241F21] flex justify-center align-middle items-center shadow-3xl py-5 px-0 flex-col gap-1 hover:bg-defult/10 transition-all duration-300 text-center"
                  data-testid={`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon size={38} strokeWidth={1.25} />
                  <span className="text-sm font-semibold">{item.title}</span>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={mockStats.totalUsers}
          change="+12% from last month"
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Total Orders"
          value={mockStats.totalOrders}
          change="+8% from last month"
          icon={Package}
          trend="up"
        />
        <StatsCard
          title="Revenue"
          value={`$${mockStats.totalRevenue.toLocaleString()}`}
          change="+15% from last month"
          icon={DollarSign}
          trend="up"
        />
        <StatsCard
          title="Pending Orders"
          value={mockStats.pendingOrders}
          change="-5% from last month"
          icon={Clock}
          trend="down"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardChart
            title="Orders & Revenue Trend"
            description="Monthly orders and revenue overview"
            data={chartData}
            type="bar"
            dataKey="orders"
          />
        </div>
        <DashboardChart
          title="Order Types"
          description="Distribution of order types"
          data={orderTypeData}
          type="pie"
          dataKey="value"
        />
      </div>

      {/* Recent Activity */}
      {auth.user?.role === "admin" || auth.user?.role === "moderator" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Completed Orders"
            value={mockStats.completedOrders}
            change="+23% from last month"
            icon={CheckCircle}
            trend="up"
          />
          <StatsCard
            title="Average Rating"
            value={mockStats.avgRating}
            change="Excellent service quality"
            icon={Star}
            trend="up"
          />
          <StatsCard
            title="Growth Rate"
            value="18.2%"
            change="Monthly growth"
            icon={TrendingUp}
            trend="up"
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <StatsCard
            title="My Orders"
            value={orders?.filter((order: any) => order.userId === auth.user?.id)?.length || 0}
            change="Active orders"
            icon={Boxes}
            trend="neutral"
          />
          <StatsCard
            title="My Pickups"
            value={pickups?.filter((pickup: any) => pickup.userId === auth.user?.id)?.length || 0}
            change="Scheduled pickups"
            icon={Package}
            trend="neutral"
          />
        </div>
      )}

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-2" data-testid="welcome-message">
          Welcome back, {auth.user?.name || "User"}! 👋
        </h2>
        <p className="text-gray-600">
          {auth.user?.role === "admin" 
            ? "You have full access to manage all aspects of the courier system."
            : auth.user?.role === "moderator"
            ? "You can manage orders, pickups, and customer support."
            : "Track your shipments and manage your orders from your dashboard."
          }
        </p>
      </div>
    </div>
  );
};

export default DashBoard;