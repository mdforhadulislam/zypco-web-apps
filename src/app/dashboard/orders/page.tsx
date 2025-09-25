"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/AuthContext";
import { useOrders, useApiMutation } from "@/hooks/UserApi";
import { ORDERS_API, ORDER_BY_ID_API } from "@/components/ApiCall/url";
import {
  Eye,
  Filter,
  Package,
  Plus,
  Search,
  Truck,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Order {
  _id: string;
  trackId: string;
  orderDate: string;
  parcel: {
    from: string;
    to: string;
    weight: number;
    priority: string;
    orderType: string;
    sender: {
      name: string;
      phone: string;
      address: string;
    };
    receiver: {
      name: string;
      phone: string;
      address: string;
    };
    item?: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    description?: string;
  };
  payment: {
    pType: string;
    pAmount: number;
    pReceived: number;
    pDiscount: number;
    pOfferDiscount: number;
    pExtraCharge: number;
    pRefunded: number;
  };
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Build filter params
  const filterParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(orderTypeFilter !== "all" && { orderType: orderTypeFilter }),
    ...(priorityFilter !== "all" && { priority: priorityFilter }),
  };

  const {
    data: orders,
    meta,
    isLoading,
    error,
    mutate: refreshOrders,
  } = useOrders(filterParams);

  const { mutateApi } = useApiMutation();

  const getOrderStatusBadge = (order: Order) => {
    // You can derive status from payment and other fields
    if (order.payment.pReceived >= order.payment.pAmount) {
      return <Badge variant="default">Paid</Badge>;
    } else if (order.payment.pReceived > 0) {
      return <Badge variant="secondary">Partially Paid</Badge>;
    } else {
      return <Badge variant="destructive">Unpaid</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "express":
        return <Badge variant="destructive">Express</Badge>;
      case "super-express":
        return <Badge variant="destructive">Super Express</Badge>;
      case "normal":
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    await mutateApi(ORDER_BY_ID_API(orderId), {
      method: "DELETE",
      successMessage: "Order deleted successfully",
      onSuccess: () => {
        refreshOrders();
        setShowOrderDialog(false);
      },
    });
  };

  const handleCreateOrder = async (orderData: any) => {
    await mutateApi(ORDERS_API, {
      method: "POST",
      data: orderData,
      successMessage: "Order created successfully",
      onSuccess: () => {
        refreshOrders();
        setShowCreateDialog(false);
      },
    });
  };

  // Check permissions
  const canCreateOrders = user?.role === "admin" || user?.role === "moderator";
  const canDeleteOrders = user?.role === "admin";

  return (
    <div className="space-y-6" data-testid="orders-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Order Management</h1>
        </div>
        {canCreateOrders && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            data-testid="create-order-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Track ID, sender, receiver..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="order-type-filter">Order Type</Label>
              <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                <SelectTrigger data-testid="order-type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="super-express">Super Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="priority-filter">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="super-express">Super Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setOrderTypeFilter("all");
                  setPriorityFilter("all");
                  setPage(1);
                }}
                data-testid="clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({meta?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load orders</p>
              <Button onClick={() => refreshOrders()} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Table data-testid="orders-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Track ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order: Order) => (
                    <TableRow key={order._id} data-testid={`order-row-${order._id}`}>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {order.trackId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <MapPin className="h-3 w-3 text-green-600" />
                            <span className="truncate max-w-[120px]">{order.parcel.from}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 text-red-600" />
                            <span className="truncate max-w-[120px]">{order.parcel.to}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(order.parcel.priority)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{order.parcel.weight} kg</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            ${order.payment.pAmount}
                          </div>
                          <div className="text-xs text-gray-600">
                            Paid: ${order.payment.pReceived}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getOrderStatusBadge(order)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(order.orderDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDialog(true);
                            }}
                            data-testid={`view-order-${order._id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canDeleteOrders && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteOrder(order._id)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`delete-order-${order._id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((meta.page - 1) * 20) + 1} to {Math.min(meta.page * 20, meta.total)} of {meta.total} orders
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      data-testid="prev-page"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage(page + 1)}
                      data-testid="next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-2xl" data-testid="order-details-dialog">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete order information and tracking details
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Track ID</Label>
                  <p className="font-mono text-sm">{selectedOrder.trackId}</p>
                </div>
                <div>
                  <Label>Order Date</Label>
                  <p className="text-sm">{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  {getPriorityBadge(selectedOrder.parcel.priority)}
                </div>
                <div>
                  <Label>Weight</Label>
                  <p className="text-sm">{selectedOrder.parcel.weight} kg</p>
                </div>
              </div>

              {/* Route Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Route Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-green-600">From (Sender)</Label>
                    <div className="p-3 border rounded-lg bg-green-50">
                      <p className="font-medium">{selectedOrder.parcel.sender.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.parcel.sender.phone}</p>
                      <p className="text-sm">{selectedOrder.parcel.sender.address}</p>
                      <p className="text-sm text-green-600 font-medium">{selectedOrder.parcel.from}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-600">To (Receiver)</Label>
                    <div className="p-3 border rounded-lg bg-red-50">
                      <p className="font-medium">{selectedOrder.parcel.receiver.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.parcel.receiver.phone}</p>
                      <p className="text-sm">{selectedOrder.parcel.receiver.address}</p>
                      <p className="text-sm text-red-600 font-medium">{selectedOrder.parcel.to}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              {selectedOrder.parcel.item && selectedOrder.parcel.item.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.parcel.item.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unitPrice}</TableCell>
                            <TableCell>${item.totalPrice}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <p className="text-sm">{selectedOrder.payment.pType}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <p className="text-sm font-medium">${selectedOrder.payment.pAmount}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Received</Label>
                    <p className="text-sm text-green-600">${selectedOrder.payment.pReceived}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Discount</Label>
                    <p className="text-sm">${selectedOrder.payment.pDiscount}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Offer Discount</Label>
                    <p className="text-sm">${selectedOrder.payment.pOfferDiscount}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Extra Charges</Label>
                    <p className="text-sm">${selectedOrder.payment.pExtraCharge}</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Outstanding Balance:</span>
                    <span className={`font-bold ${
                      selectedOrder.payment.pAmount - selectedOrder.payment.pReceived <= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      ${selectedOrder.payment.pAmount - selectedOrder.payment.pReceived}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedOrder.parcel.description && (
                <div className="space-y-2">
                  <Label>Description</Label>
                  <p className="text-sm p-3 bg-gray-50 rounded-lg">
                    {selectedOrder.parcel.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <CreateOrderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}

// Create Order Dialog Component
function CreateOrderDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (orderData: any) => Promise<any>;
}) {
  const [formData, setFormData] = useState({
    parcel: {
      from: "",
      to: "",
      weight: 0,
      priority: "normal",
      orderType: "normal",
      sender: {
        name: "",
        phone: "",
        address: "",
      },
      receiver: {
        name: "",
        phone: "",
        address: "",
      },
      description: "",
    },
    payment: {
      pType: "cash",
      pAmount: 0,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.parcel.from || !formData.parcel.to || !formData.parcel.weight) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        parcel: {
          from: "",
          to: "",
          weight: 0,
          priority: "normal",
          orderType: "normal",
          sender: { name: "", phone: "", address: "" },
          receiver: { name: "", phone: "", address: "" },
          description: "",
        },
        payment: {
          pType: "cash",
          pAmount: 0,
        },
      });
    } catch (error) {
      console.error("Failed to create order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="create-order-dialog">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Create a new order with sender and receiver details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Route Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Route Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">From Country</Label>
                <Input
                  id="from"
                  value={formData.parcel.from}
                  onChange={(e) => setFormData({
                    ...formData,
                    parcel: {...formData.parcel, from: e.target.value}
                  })}
                  placeholder="Origin country"
                  required
                />
              </div>
              <div>
                <Label htmlFor="to">To Country</Label>
                <Input
                  id="to"
                  value={formData.parcel.to}
                  onChange={(e) => setFormData({
                    ...formData,
                    parcel: {...formData.parcel, to: e.target.value}
                  })}
                  placeholder="Destination country"
                  required
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.parcel.weight}
                  onChange={(e) => setFormData({
                    ...formData,
                    parcel: {...formData.parcel, weight: parseFloat(e.target.value) || 0}
                  })}
                  placeholder="0.0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.parcel.priority} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    parcel: {...formData.parcel, priority: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="super-express">Super Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sender Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sender Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sender-name">Sender Name</Label>
                <Input
                  id="sender-name"
                  value={formData.parcel.sender.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    parcel: {
                      ...formData.parcel,
                      sender: {...formData.parcel.sender, name: e.target.value}
                    }
                  })}
                  placeholder="Sender full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sender-phone">Sender Phone</Label>
                <Input
                  id="sender-phone"
                  value={formData.parcel.sender.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    parcel: {
                      ...formData.parcel,
                      sender: {...formData.parcel.sender, phone: e.target.value}
                    }
                  })}
                  placeholder="Sender phone number"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="sender-address">Sender Address</Label>
                <Textarea
                  id="sender-address"
                  value={formData.parcel.sender.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    parcel: {
                      ...formData.parcel,
                      sender: {...formData.parcel.sender, address: e.target.value}
                    }
                  })}
                  placeholder="Complete sender address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Receiver Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Receiver Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="receiver-name">Receiver Name</Label>
                <Input
                  id="receiver-name"
                  value={formData.parcel.receiver.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    parcel: {
                      ...formData.parcel,
                      receiver: {...formData.parcel.receiver, name: e.target.value}
                    }
                  })}
                  placeholder="Receiver full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="receiver-phone">Receiver Phone</Label>
                <Input
                  id="receiver-phone"
                  value={formData.parcel.receiver.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    parcel: {
                      ...formData.parcel,
                      receiver: {...formData.parcel.receiver, phone: e.target.value}
                    }
                  })}
                  placeholder="Receiver phone number"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="receiver-address">Receiver Address</Label>
                <Textarea
                  id="receiver-address"
                  value={formData.parcel.receiver.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    parcel: {
                      ...formData.parcel,
                      receiver: {...formData.parcel.receiver, address: e.target.value}
                    }
                  })}
                  placeholder="Complete receiver address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment-type">Payment Type</Label>
                <Select 
                  value={formData.payment.pType} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    payment: {...formData.payment, pType: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment-amount">Amount ($)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  value={formData.payment.pAmount}
                  onChange={(e) => setFormData({
                    ...formData,
                    payment: {...formData.payment, pAmount: parseFloat(e.target.value) || 0}
                  })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.parcel.description}
              onChange={(e) => setFormData({
                ...formData,
                parcel: {...formData.parcel, description: e.target.value}
              })}
              placeholder="Additional notes or special instructions"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="submit-create-order">
              {isSubmitting ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}