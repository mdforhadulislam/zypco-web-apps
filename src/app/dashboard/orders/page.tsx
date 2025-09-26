"use client";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/Dashboard/DataTable";
import { RoleGuard } from "@/middleware/roleGuard";
import { OrderForm } from "@/components/forms/OrderForm";
import { OrderService } from "@/services/dashboardService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, DollarSign, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthContext";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await OrderService.getOrders({ limit: 50 });
      if (response.success) {
        setOrders(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleView = (order: any) => {
    setSelectedOrder(order);
    setDialogMode("view");
    setIsDialogOpen(true);
  };

  const handleDelete = async (order: any) => {
    if (!confirm(`Are you sure you want to delete order ${order.trackId}?`)) {
      return;
    }

    try {
      const response = await OrderService.deleteOrder(order._id);
      if (response.success) {
        toast.success("Order deleted successfully");
        fetchOrders();
      } else {
        toast.error(response.message || "Failed to delete order");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchOrders();
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      normal: "outline",
      express: "secondary",
      "super-express": "default",
      "tax-paid": "destructive",
    } as const;
    
    return (
      <Badge variant={variants[priority as keyof typeof variants] || "outline"}>
        {priority}
      </Badge>
    );
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

  const columns = [
    {
      key: "trackId",
      label: "Track ID",
      sortable: true,
    },
    {
      key: "parcel.sender.name",
      label: "Sender",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{row.parcel?.sender?.name}</p>
          <p className="text-sm text-gray-500">{row.parcel?.sender?.phone}</p>
        </div>
      ),
    },
    {
      key: "parcel.receiver.name",
      label: "Receiver",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{row.parcel?.receiver?.name}</p>
          <p className="text-sm text-gray-500">{row.parcel?.receiver?.phone}</p>
        </div>
      ),
    },
    {
      key: "parcel.priority",
      label: "Priority",
      render: (value: string) => getPriorityBadge(value),
    },
    {
      key: "parcel.orderType",
      label: "Type",
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "payment.pAmount",
      label: "Amount",
      render: (value: number) => `$${value?.toFixed(2) || "0.00"}`,
    },
    {
      key: "orderDate",
      label: "Order Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const OrderDetails = ({ order }: { order: any }) => (
    <Tabs defaultValue="details" className="w-full" data-testid="order-details">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="details">Order Details</TabsTrigger>
        <TabsTrigger value="parcel">Parcel Info</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
        <TabsTrigger value="tracking">Tracking</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Track ID</label>
            <p className="font-medium text-lg">{order.trackId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Order Date</label>
            <p className="font-medium">{new Date(order.orderDate).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Priority</label>
            {getPriorityBadge(order.parcel?.priority)}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Order Type</label>
            <Badge variant="outline" className="capitalize">
              {order.parcel?.orderType}
            </Badge>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="parcel" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sender Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="font-medium">{order.parcel?.sender?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="font-medium">{order.parcel?.sender?.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="font-medium">{order.parcel?.sender?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm">
                  {order.parcel?.sender?.address?.address}<br />
                  {order.parcel?.sender?.address?.city} {order.parcel?.sender?.address?.zipCode}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receiver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="font-medium">{order.parcel?.receiver?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="font-medium">{order.parcel?.receiver?.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="font-medium">{order.parcel?.receiver?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm">
                  {order.parcel?.receiver?.address?.address}<br />
                  {order.parcel?.receiver?.address?.city} {order.parcel?.receiver?.address?.zipCode}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Weight</label>
            <p className="font-medium">{order.parcel?.weight} kg</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Service Type</label>
            <p className="font-medium">{order.parcel?.serviceType || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Customer Note</label>
            <p className="text-sm">{order.parcel?.customerNote || "No notes"}</p>
          </div>
        </div>

        {order.parcel?.item && order.parcel.item.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.parcel.item.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.unitPrice}</p>
                    </div>
                    <p className="font-medium">${item.totalPrice}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="payment" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Type</label>
                <p className="font-medium capitalize">{order.payment?.pType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="font-medium text-lg">${order.payment?.pAmount?.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Discount</label>
                <p className="font-medium">${order.payment?.pDiscount?.toFixed(2) || "0.00"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Received</label>
                <p className="font-medium">${order.payment?.pReceived?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tracking" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tracking Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Handover Company</label>
                <p className="font-medium">{order.handover_by?.company || "Not assigned"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tracking Number</label>
                <p className="font-medium">{order.handover_by?.tracking || "Not available"}</p>
              </div>
              <p className="text-sm text-gray-500">
                Detailed tracking information will be available once the order is processed.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  return (
    <RoleGuard allowedRoles={["admin", "moderator"]}>
      <div className="space-y-6" data-testid="orders-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground">
              Manage orders, shipments, and tracking information
            </p>
          </div>
          <Button onClick={handleCreate} data-testid="create-order-btn">
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold">
                    {orders.filter((order: any) => order.status === "processing").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold">
                    {orders.filter((order: any) => order.status === "delivered").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">
                    ${orders.reduce((sum: number, order: any) => sum + (order.payment?.pAmount || 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          title="Orders"
          data={orders}
          columns={columns}
          searchKeys={["trackId", "parcel.sender.name", "parcel.receiver.name"]}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={user?.role === "admin" ? handleDelete : undefined}
          loading={loading}
          actions={[
            {
              label: "View Details",
              onClick: handleView,
              variant: "default",
            },
            {
              label: "Edit Order",
              onClick: handleEdit,
              variant: "default",
              condition: () => user?.role === "admin",
            },
            {
              label: "Delete Order",
              onClick: handleDelete,
              variant: "destructive",
              condition: () => user?.role === "admin",
            },
          ]}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "create" && "Create New Order"}
                {dialogMode === "edit" && "Edit Order"}
                {dialogMode === "view" && `Order Details - ${selectedOrder?.trackId}`}
              </DialogTitle>
            </DialogHeader>
            {dialogMode === "view" && selectedOrder ? (
              <OrderDetails order={selectedOrder} />
            ) : (
              <OrderForm
                order={selectedOrder}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsDialogOpen(false)}
                isEdit={dialogMode === "edit"}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}