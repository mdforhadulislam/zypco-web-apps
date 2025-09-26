"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Truck,
  AlertCircle,
  CheckCircle,
  RefreshCcw
} from "lucide-react";
import { useAuth } from "@/hooks/AuthContext";
import { ORDERS_API } from "@/components/ApiCall/url";

interface Order {
  _id: string;
  trackId: string;
  parcel: {
    from: string;
    to: string;
    weight: number;
    priority: "normal" | "express" | "super-express";
    orderType: "standard" | "express" | "super-express";
    sender: {
      name: string;
      phone: string;
      email?: string;
    };
    receiver: {
      name: string;
      phone: string;
      address?: string;
    };
    description?: string;
    item?: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
  payment: {
    pType: string;
    pAmount: number;
    pReceived: number;
    pRefunded: number;
  };
  createdAt: string;
  orderDate: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus, filterPriority]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm.trim());
      }

      if (filterPriority !== "all") {
        queryParams.append("priority", filterPriority);
      }

      const response = await fetch(`${ORDERS_API}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setOrders(data.data);
          setTotalOrders(data.meta?.total || 0);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } else {
        console.error('Failed to fetch orders:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "super-express":
        return "bg-red-100 text-red-800 border-red-200";
      case "express":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getPaymentStatus = (order: Order) => {
    const { pAmount, pReceived } = order.payment;
    if (pReceived >= pAmount && pAmount > 0) return "paid";
    if (pReceived > 0) return "partial";
    return "pending";
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Access Required
          </h3>
          <p className="text-gray-600">
            Please sign in to view your orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="orders-page">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="orders-title">
            Orders Management
          </h1>
          <p className="text-muted-foreground">
            {user.role === "admin" || user.role === "moderator" 
              ? "Manage all courier orders and shipments"
              : "Track and manage your orders"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Total: {totalOrders}
          </Badge>
          <Button onClick={() => window.location.href = "/dashboard/orders/create"} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search Orders</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by tracking ID, sender, or receiver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="super-express">Super Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={fetchOrders}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterPriority !== "all" 
                  ? "Try adjusting your search criteria or filters."
                  : user.role === "user" 
                    ? "You haven't created any orders yet."
                    : "No orders have been created yet."
                }
              </p>
              <Button onClick={() => window.location.href = "/dashboard/orders/create"}>
                Create Your First Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {orders.map((order) => {
              const paymentStatus = getPaymentStatus(order);
              
              return (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">
                                #{order.trackId}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={getPriorityBadgeColor(order.parcel.priority)}
                              >
                                {order.parcel.priority}
                              </Badge>
                              {getPaymentStatusBadge(paymentStatus)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{order.parcel.from} → {order.parcel.to}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span>{order.parcel.weight}kg • {order.parcel.orderType}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatCurrency(order.payment.pAmount)}</span>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm">
                              <p className="text-gray-800">
                                <span className="font-medium">From:</span> {order.parcel.sender.name} ({order.parcel.sender.phone})
                              </p>
                              <p className="text-gray-800">
                                <span className="font-medium">To:</span> {order.parcel.receiver.name} ({order.parcel.receiver.phone})
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.location.href = `/dashboard/orders/${order._id}`}
                          className="flex-1 lg:flex-none gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        
                        {(user.role === "admin" || user.role === "moderator" || 
                          (user.role === "user" && paymentStatus === "pending")) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/dashboard/orders/${order._id}/edit`}
                            className="flex-1 lg:flex-none gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Order Items (if available) */}
                    {order.parcel.item && order.parcel.item.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2 text-sm text-gray-700">Package Contents:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {order.parcel.item.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                              {item.name} (Qty: {item.quantity}) - {formatCurrency(item.totalPrice)}
                            </div>
                          ))}
                          {order.parcel.item.length > 3 && (
                            <div className="text-sm text-gray-500 italic">
                              +{order.parcel.item.length - 3} more items...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({totalOrders} total orders)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}