"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { orderService, OrderFilters } from "@/services/orderService";
import { Order, hasPermission } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { createOrderColumns } from "@/components/orders/OrderColumns";
import { OrderForm } from "@/components/orders/OrderForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Package, TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react";

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  todayOrders: number;
  weeklyOrders: number;
  monthlyOrders: number;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Filter and pagination
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load orders and stats
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders(filters);
      
      if (response.success && response.data) {
        setOrders(Array.isArray(response.data) ? response.data : [response.data]);
        if (response.meta) {
          setPagination({
            page: response.meta.page || 1,
            limit: response.meta.limit || 10,
            total: response.meta.total || 0,
            totalPages: response.meta.totalPages || 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await orderService.getOrderStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadOrders();
    if (user?.role === "admin" || user?.role === "moderator") {
      loadStats();
    }
  }, [filters, user?.role]);

  // CRUD handlers
  const handleCreateOrder = async (data: any) => {
    try {
      setActionLoading(true);
      const response = await orderService.createOrder(data);
      
      if (response.success) {
        toast.success("Order created successfully");
        setIsCreateModalOpen(false);
        loadOrders();
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Failed to create order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOrder = async (data: any) => {
    if (!selectedOrder) return;
    
    try {
      setActionLoading(true);
      const response = await orderService.updateOrder(selectedOrder._id, data);
      
      if (response.success) {
        toast.success("Order updated successfully");
        setIsEditModalOpen(false);
        setSelectedOrder(null);
        loadOrders();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setActionLoading(true);
      const response = await orderService.deleteOrder(selectedOrder._id);
      
      if (response.success) {
        toast.success("Order deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedOrder(null);
        loadOrders();
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Failed to delete order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (order: Order, status: Order["status"]) => {
    try {
      const response = await orderService.updateOrderStatus(order._id, status);
      
      if (response.success) {
        toast.success(`Order status updated to ${status}`);
        loadOrders();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Event handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleLimitChange = (limit: number) => {
    setFilters({ ...filters, limit, page: 1 });
  };

  const handleRefresh = () => {
    loadOrders();
    if (user?.role === "admin" || user?.role === "moderator") {
      loadStats();
    }
  };

  const handleExport = async () => {
    try {
      toast.info("Exporting orders...");
      const blob = await orderService.exportOrders(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'orders.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Orders exported successfully");
    } catch (error) {
      console.error("Failed to export orders:", error);
      toast.error("Failed to export orders");
    }
  };

  // Bulk actions
  const bulkActions = [];
  if (hasPermission(user?.role || "user", "orders", "delete")) {
    bulkActions.push({
      label: "Delete Selected",
      variant: "destructive" as const,
      onClick: (selectedOrders: Order[]) => {
        toast.info(`Selected ${selectedOrders.length} orders for deletion`);
      },
    });
  }

  const columns = createOrderColumns({
    userRole: user?.role || "user",
    onView: handleViewOrder,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onUpdateStatus: handleUpdateStatus,
  });

  if (!user) return null;

  return (
    <div className="space-y-6" data-testid="orders-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="orders-title">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all shipment orders
          </p>
        </div>
      </div>

      {/* Stats Cards - Only for admin/moderator */}
      {(user.role === "admin" || user.role === "moderator") && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-orders">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {stats.todayOrders} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="pending-orders">
                {stats.pending}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="delivered-orders">
                {stats.delivered}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="monthly-orders">{stats.monthlyOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.weeklyOrders} this week
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            View and manage orders with detailed tracking information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
            searchPlaceholder="Search orders by track ID, sender, or receiver..."
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onCreateNew={hasPermission(user.role, "orders", "create") ? () => setIsCreateModalOpen(true) : undefined}
            showCreateNew={hasPermission(user.role, "orders", "create")}
            createNewLabel="Create Order"
            emptyMessage="No orders found"
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              onPageChange: handlePageChange,
              onLimitChange: handleLimitChange,
            }}
            bulkActions={bulkActions}
          />
        </CardContent>
      </Card>

      {/* Create Order Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="create-order-modal-title">Create New Order</DialogTitle>
            <DialogDescription>
              Fill in the order details to create a new shipment
            </DialogDescription>
          </DialogHeader>
          <OrderForm
            onSubmit={handleCreateOrder}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={actionLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="edit-order-modal-title">Edit Order</DialogTitle>
            <DialogDescription>
              Update the order details
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <OrderForm
              order={selectedOrder}
              onSubmit={handleEditOrder}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedOrder(null);
              }}
              loading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle data-testid="view-order-modal-title">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Track ID</h3>
                  <p data-testid="view-track-id">{selectedOrder.trackId}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <Badge data-testid="view-status">{selectedOrder.status}</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Route</h3>
                <p>{selectedOrder.parcel.from} → {selectedOrder.parcel.to}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Sender</h3>
                  <div className="space-y-1">
                    <p>{selectedOrder.parcel.sender.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.parcel.sender.phone}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.parcel.sender.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Receiver</h3>
                  <div className="space-y-1">
                    <p>{selectedOrder.parcel.receiver.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.parcel.receiver.phone}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.parcel.receiver.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="delete-order-modal-title">Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
              {selectedOrder && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Track ID:</strong> {selectedOrder.trackId}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-btn"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Order"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}