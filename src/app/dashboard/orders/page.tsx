"use client";
import {
  deleteRequestSend,
  getRequestSend,
  postRequestSend,
  putRequestSend,
} from "@/components/ApiCall/methord";
import {
  ORDERS_API,
  SINGLE_ORDER_API,
  NOTIFICATION_API,
} from "@/components/ApiCall/url";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/AuthContext";
import {
  Package,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Search,
  LoaderCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "sonner";

type Order = {
  _id: string;
  trackId: string;
  orderDate: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  parcel: {
    sender: {
      name: string;
      phone: string;
      email: string;
    };
    receiver: {
      name: string;
      phone: string;
      email: string;
    };
    from: {
      addressLine: string;
      area: string;
      city: string;
      country: {
        name: string;
      };
    };
    to: {
      addressLine: string;
      area: string;
      city: string;
      country: {
        name: string;
      };
    };
    priority: "normal" | "express" | "super-express";
    orderType: "document" | "parcel" | "box";
    weight: number;
    item?: {
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  };
  payment: {
    pType: string;
    pAmount: number;
    pOfferDiscount: number;
    pExtraCharge: number;
    pDiscount: number;
    pReceived: number;
    pRefunded: number;
  };
  moderator?: {
    _id: string;
    name: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
};

const DashboardOrders = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // InfiniteScroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Role-based permissions
  const canViewAll = user?.role === "admin" || user?.role === "moderator";
  const canManage = user?.role === "admin" || user?.role === "moderator";
  const canDelete = user?.role === "admin";
  const canAssignModerator = user?.role === "admin";

  // Fetch orders with pagination
  const fetchOrders = async (pageNum = 1, reset = false) => {
    try {
      const queryParams = new URLSearchParams();

      queryParams.set("page", pageNum.toString());
      queryParams.set("limit", "10");

      if (searchTerm) {
        queryParams.set("search", searchTerm);
      }

      const url = `${ORDERS_API}?${queryParams.toString()}`;
      const response = await getRequestSend<Order[]>(url, {
        Authorization: `Bearer ${user?.token}`,
      });

      if (response.status == 200 && response.data) {
        const newOrders = Array.isArray(response.data) ? response.data : [];

        if (reset || pageNum === 1) {
          setOrders(newOrders);
        } else {
          setOrders((prev) => [...prev, ...newOrders]);
        }

        // Check if there are more pages
        const totalPages = response.meta?.totalPages || 1;
        setHasMore(pageNum < totalPages);

        if (pageNum === 1) {
          toast.success("Orders loaded successfully");
        }
      } else {
        toast.error(response.message || "Failed to fetch orders");
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Fetch orders error:", error);
      setHasMore(false);
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch more orders for infinite scroll
  const fetchMoreOrders = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, false);
  };

  // Load initial data
  useEffect(() => {
    if (user?.token) {
      fetchOrders(1, true);
      setPage(1);
    }
  }, [user, searchTerm]);

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      order.trackId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parcel.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parcel.receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parcel.from.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parcel.to.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter((order) => order.status === "pending").length,
    processing: filteredOrders.filter((order) => order.status === "processing").length,
    shipped: filteredOrders.filter((order) => order.status === "shipped").length,
    delivered: filteredOrders.filter((order) => order.status === "delivered").length,
    cancelled: filteredOrders.filter((order) => order.status === "cancelled").length,
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const priorityColors: Record<string, string> = {
    normal: "bg-gray-100 text-gray-800",
    express: "bg-orange-100 text-orange-800",
    "super-express": "bg-red-100 text-red-800",
  };

  // Handle create order
  const handleCreateOrder = async (formData: FormData) => {
    try {
      setLoading(true);

      const orderData = {
        parcel: {
          sender: {
            name: formData.get("senderName") as string,
            phone: formData.get("senderPhone") as string,
            email: formData.get("senderEmail") as string,
          },
          receiver: {
            name: formData.get("receiverName") as string,
            phone: formData.get("receiverPhone") as string,
            email: formData.get("receiverEmail") as string,
          },
          from: {
            addressLine: formData.get("fromAddress") as string,
            area: formData.get("fromArea") as string,
            city: formData.get("fromCity") as string,
            country: { name: formData.get("fromCountry") as string },
          },
          to: {
            addressLine: formData.get("toAddress") as string,
            area: formData.get("toArea") as string,
            city: formData.get("toCity") as string,
            country: { name: formData.get("toCountry") as string },
          },
          priority: formData.get("priority") as string,
          orderType: formData.get("orderType") as string,
          weight: Number(formData.get("weight")) || 0,
        },
        payment: {
          pType: "cash",
          pAmount: Number(formData.get("amount")) || 0,
          pOfferDiscount: 0,
          pExtraCharge: 0,
          pDiscount: 0,
          pReceived: 0,
          pRefunded: 0,
        },
      };

      const response = await postRequestSend(
        ORDERS_API,
        { Authorization: `Bearer ${user?.token}` },
        orderData
      );

      if (response.status == 201) {
        toast.success("Order created successfully");
        setIsCreateModalOpen(false);
        // Reset and fetch fresh data
        setOrders([]);
        setPage(1);
        setHasMore(true);
        fetchOrders(1, true);
      } else {
        toast.error(response.message || "Failed to create order");
      }
    } catch (error) {
      toast.error("Failed to create order");
      console.error("Create order error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (order: Order) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete orders");
      return;
    }

    if (confirm(`Are you sure you want to delete order ${order.trackId}?`)) {
      try {
        const response = await deleteRequestSend(
          SINGLE_ORDER_API(order._id),
          { Authorization: `Bearer ${user?.token}` }
        );

        if (response.status == 200) {
          toast.success("Order deleted successfully");
          setOrders((prev) => prev.filter((o) => o._id !== order._id));
          
          // Send notification
          postRequestSend(
            NOTIFICATION_API,
            { Authorization: `Bearer ${user?.token}` },
            {
              title: `Order Deleted by ${user?.name}`,
              userId: order.parcel.sender.phone,
              message: `Your order ${order.trackId} has been deleted by admin.`,
            }
          );
        } else {
          toast.error(response.message || "Failed to delete order");
        }
      } catch (error) {
        toast.error("Failed to delete order");
        console.error("Delete order error:", error);
      }
    }
  };

  // Handle status update
  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    if (!canManage) {
      toast.error("You do not have permission to update order status");
      return;
    }
    try {
      const response = await putRequestSend(
        SINGLE_ORDER_API(order._id),
        { Authorization: `Bearer ${user?.token}` },
        {
          ...order,
          status: newStatus,
          moderator: user?.id 
        }
      );

      if (response.status == 200) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id
              ? { 
                  ...o, 
                  status: newStatus as Order["status"],
                  moderator: {
                    _id: user.id,
                    name: user.name,
                    phone: user.phone,
                  }
                }
              : o
          )
        );

        // Send notification
        postRequestSend(
          NOTIFICATION_API,
          { Authorization: `Bearer ${user?.token}` },
          {
            title: `Order Status Updated to ${newStatus}`,
            userId: order.parcel.sender.phone,
            message: `Your order ${order.trackId} status has been updated to ${newStatus} by ${user?.name}.`,
          }
        );
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Update status error:", error);
    }
  };

  // Handle moderator assignment
  const handleAssignModerator = async (order: Order) => {
    if (!canAssignModerator) {
      toast.error("You do not have permission to assign moderators");
      return;
    }

    try {
      const response = await putRequestSend(
        SINGLE_ORDER_API(order._id),
        { Authorization: `Bearer ${user?.token}` },
        {
          ...order,
          moderator: user.id,
          status: "processing",
        }
      );

      if (response.status === 200) {
        toast.success("Order assigned successfully");
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id
              ? {
                  ...o,
                  moderator: {
                    _id: user.id,
                    name: user.name,
                    phone: user.phone,
                  },
                  status: "processing" as const,
                }
              : o
          )
        );
      } else {
        toast.error(response.message || "Failed to assign order");
      }
    } catch (error) {
      toast.error("Failed to assign order");
      console.error("Assign moderator error:", error);
    }
  };

  // Order Card Component (similar to PickupCard pattern)
  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4 py-2" data-testid={`order-card-${order._id}`}>
      <CardContent className="py-2 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-semibold text-sm font-mono">#{order.trackId}</p>
              <p className="text-sm text-gray-600">{order.parcel.sender.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              className={
                statusColors[order.status] || "bg-gray-100 text-gray-800"
              }
            >
              {order.status.toUpperCase()}
            </Badge>
            <Badge
              className={
                priorityColors[order.parcel.priority] || "bg-gray-100 text-gray-800"
              }
            >
              {order.parcel.priority.replace('-', ' ').toUpperCase()}
            </Badge>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedOrder(order);
                  setIsViewModalOpen(true);
                }}
              >
                View
              </Button>

              {canManage && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}

              {canManage && !order.moderator && canAssignModerator && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAssignModerator(order)}
                >
                  <User className="h-4 w-4" />
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteOrder(order)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-600">From:</p>
            <p className="font-medium capitalize">
              {order.parcel.from.city}, {order.parcel.from.country.name}
            </p>
            <p className="text-gray-500 capitalize">
              {order.parcel.from.addressLine}
            </p>
          </div>

          <div>
            <p className="text-gray-600">To:</p>
            <p className="font-medium capitalize">
              {order.parcel.to.city}, {order.parcel.to.country.name}
            </p>
            <p className="text-gray-500 capitalize">
              {order.parcel.to.addressLine}
            </p>
          </div>

          <div>
            <p className="text-gray-600">Payment Amount:</p>
            <p className="font-medium">৳{order.payment.pAmount}</p>
            <p className="text-gray-500">Weight: {order.parcel.weight}kg</p>
          </div>

          {canManage && order.moderator && (
            <div>
              <p className="text-gray-600">Assigned To:</p>
              <div className="flex items-center gap-1">
                <User size={16} />
                <p className="font-medium">{order.moderator.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Action Buttons */}
        {canManage && (
          <div className="mt-3 flex flex-wrap gap-2">
            {order.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(order, "processing")}
              >
                Mark Processing
              </Button>
            )}
            
            {order.status === "processing" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(order, "shipped")}
              >
                Mark Shipped
              </Button>
            )}
            
            {order.status === "shipped" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(order, "delivered")}
              >
                Mark Delivered
              </Button>
            )}
            
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleUpdateStatus(order, "cancelled")}
              >
                Cancel Order
              </Button>
            )}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500">
          Created: {new Date(order.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" data-testid="orders-page">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="orders-title"
          >
            {user?.role === "user" ? "My Orders" : "Orders Management"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "user"
              ? "Track and manage your courier orders"
              : user?.role === "moderator"
              ? "Manage assigned orders and update status"
              : "Manage all courier orders and shipments"}
          </p>
        </div>
        
        {canManage && (
          <AlertDialog
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
          >
            <AlertDialogTrigger asChild>
              <Button data-testid="create-order-btn" disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              data-testid="create-order-modal"
              className="max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Create New Order</AlertDialogTitle>
              </AlertDialogHeader>
              <form action={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sender Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Sender Information</h3>
                    <div>
                      <Label htmlFor="senderName">Full Name</Label>
                      <Input id="senderName" name="senderName" required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="senderPhone">Phone</Label>
                        <Input id="senderPhone" name="senderPhone" required />
                      </div>
                      <div>
                        <Label htmlFor="senderEmail">Email</Label>
                        <Input id="senderEmail" name="senderEmail" type="email" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="fromAddress">Address</Label>
                      <Input id="fromAddress" name="fromAddress" required />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="fromArea">Area</Label>
                        <Input id="fromArea" name="fromArea" required />
                      </div>
                      <div>
                        <Label htmlFor="fromCity">City</Label>
                        <Input id="fromCity" name="fromCity" required />
                      </div>
                      <div>
                        <Label htmlFor="fromCountry">Country</Label>
                        <Input id="fromCountry" name="fromCountry" required />
                      </div>
                    </div>
                  </div>

                  {/* Receiver Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Receiver Information</h3>
                    <div>
                      <Label htmlFor="receiverName">Full Name</Label>
                      <Input id="receiverName" name="receiverName" required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="receiverPhone">Phone</Label>
                        <Input id="receiverPhone" name="receiverPhone" required />
                      </div>
                      <div>
                        <Label htmlFor="receiverEmail">Email</Label>
                        <Input id="receiverEmail" name="receiverEmail" type="email" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="toAddress">Address</Label>
                      <Input id="toAddress" name="toAddress" required />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="toArea">Area</Label>
                        <Input id="toArea" name="toArea" required />
                      </div>
                      <div>
                        <Label htmlFor="toCity">City</Label>
                        <Input id="toCity" name="toCity" required />
                      </div>
                      <div>
                        <Label htmlFor="toCountry">Country</Label>
                        <Input id="toCountry" name="toCountry" required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parcel Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="super-express">Super Express</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select name="orderType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="parcel">Parcel</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount (৳)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <AlertDialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <AlertDialogAction asChild>
                    <Button
                      type="submit"
                      data-testid="create-order-submit"
                      disabled={loading}
                    >
                      {loading && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Order
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          title="Total Orders"
          value={stats.total}
          icon={Package}
          trend="neutral"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          trend="neutral"
        />
        <StatsCard
          title="Processing"
          value={stats.processing}
          icon={AlertCircle}
          trend="neutral"
        />
        <StatsCard
          title="Shipped"
          value={stats.shipped}
          icon={Truck}
          trend="up"
        />
        <StatsCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle}
          trend="up"
        />
        <StatsCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          trend="down"
        />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
          data-testid="order-search-input"
        />
      </div>

      {/* Orders List with InfiniteScroll */}
      <div data-testid="orders-list">
        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading orders...</span>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={filteredOrders.length}
            next={fetchMoreOrders}
            hasMore={hasMore}
            loader={
              <div className="flex items-center justify-center py-4">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading more orders...</span>
              </div>
            }
            endMessage={
              <p className="text-center py-4 text-gray-500">
                {filteredOrders.length === 0
                  ? "No orders found"
                  : "No more orders to load"}
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </InfiniteScroll>
        )}
      </div>

      {/* View Order Modal */}
      <AlertDialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Order Details - {selectedOrder?.trackId}</AlertDialogTitle>
          </AlertDialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sender Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.parcel.sender.name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.parcel.sender.phone}</p>
                    <p><strong>Email:</strong> {selectedOrder.parcel.sender.email}</p>
                    <p><strong>Address:</strong> {selectedOrder.parcel.from.addressLine}</p>
                    <p><strong>City:</strong> {selectedOrder.parcel.from.city}</p>
                    <p><strong>Country:</strong> {selectedOrder.parcel.from.country.name}</p>
                  </CardContent>
                </Card>

                {/* Receiver Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Receiver Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.parcel.receiver.name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.parcel.receiver.phone}</p>
                    <p><strong>Email:</strong> {selectedOrder.parcel.receiver.email}</p>
                    <p><strong>Address:</strong> {selectedOrder.parcel.to.addressLine}</p>
                    <p><strong>City:</strong> {selectedOrder.parcel.to.city}</p>
                    <p><strong>Country:</strong> {selectedOrder.parcel.to.country.name}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Order & Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Track ID:</strong> {selectedOrder.trackId}</p>
                    <p><strong>Status:</strong> <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status.toUpperCase()}</Badge></p>
                    <p><strong>Priority:</strong> <Badge className={priorityColors[selectedOrder.parcel.priority]}>{selectedOrder.parcel.priority.replace('-', ' ').toUpperCase()}</Badge></p>
                    <p><strong>Type:</strong> {selectedOrder.parcel.orderType.toUpperCase()}</p>
                    <p><strong>Weight:</strong> {selectedOrder.parcel.weight} kg</p>
                    <p><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Amount:</strong> ৳{selectedOrder.payment.pAmount}</p>
                    <p><strong>Type:</strong> {selectedOrder.payment.pType}</p>
                    <p><strong>Received:</strong> ৳{selectedOrder.payment.pReceived}</p>
                    <p><strong>Discount:</strong> ৳{selectedOrder.payment.pDiscount}</p>
                    <p><strong>Extra Charge:</strong> ৳{selectedOrder.payment.pExtraCharge}</p>
                  </CardContent>
                </Card>
              </div>

              {selectedOrder.moderator && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assigned Moderator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Name:</strong> {selectedOrder.moderator.name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.moderator.phone}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsViewModalOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardOrders;