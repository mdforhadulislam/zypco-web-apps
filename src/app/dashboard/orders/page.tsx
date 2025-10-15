"use client";

import { createOrderColumns } from "@/components/orders/OrderColumns";
import { OrderForm } from "@/components/orders/OrderForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/AuthContext";
import { OrderFilters, orderService } from "@/services/orderService";
import { Order, hasPermission } from "@/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

      if (response.status == 200 && response.data) {
        setOrders(
          Array.isArray(response.data) ? response.data : [response.data]
        );
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

  useEffect(() => {
    loadOrders();
  }, [filters, user?.role]);

  // CRUD handlers
  const handleCreateOrder = async (data: any) => {
    try {
      setActionLoading(true);
      const response = await orderService.createOrder(data);

      if (response.status == 201) {
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

      if (response.status == 200) {
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

      if (response.status == 200) {
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

      if (response.status == 200) {
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
  };

  const handleExport = async () => {
    try {
      toast.info("Exporting orders...");
      const blob = await orderService.exportOrders(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "orders.csv";
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
          <h1 className="text-3xl font-bold" data-testid="orders-title">
            Orders
          </h1>
          <p className="text-muted-foreground">
            Manage and track all shipment orders
          </p>
        </div>
      </div>

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
            onCreateNew={
              hasPermission(user.role, "orders", "create")
                ? () => setIsCreateModalOpen(true)
                : undefined
            }
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
            <DialogTitle data-testid="create-order-modal-title">
              Create New Order
            </DialogTitle>
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
            <DialogTitle data-testid="edit-order-modal-title">
              Edit Order
            </DialogTitle>
            <DialogDescription>Update the order details</DialogDescription>
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
        <DialogContent className="max-w-3xl overflow-auto h-auto">
          <DialogHeader>
            <DialogTitle data-testid="view-order-modal-title">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Track ID</h3>
                  <p data-testid="view-track-id">{selectedOrder.trackId}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Order Type</h3>
                  <Badge data-testid="view-order-type">
                    {selectedOrder.parcel.orderType}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Weight</h3>
                  <p data-testid="view-weight">{selectedOrder.parcel.weight} KG</p>
                </div>
                <div>
                  <h3 className="font-semibold">Priority</h3>
                  <Badge data-testid="view-order-priority">
                    {selectedOrder.parcel.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Route</h3>
                <p>
                  {selectedOrder.parcel.from.name} →{" "}
                  {selectedOrder.parcel.to.name}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Sender</h3>
                  <div className="space-y-1">
                    <p>{selectedOrder.parcel.sender.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.parcel.sender.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.parcel.sender.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.parcel.sender.address.address}{" "}
                      {selectedOrder.parcel.sender.address.address ? ", " : ""}
                      {selectedOrder.parcel.sender.address.city}{" "}
                      {selectedOrder.parcel.sender.address.city ? ", " : ""}
                      {selectedOrder.parcel.sender.address.zipcode}{" "}
                      {selectedOrder.parcel.sender.address.zipcode ? ", " : ""}
                      {selectedOrder.parcel.sender.address.country.name}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Receiver</h3>
                  <div className="space-y-1">
                    <p>{selectedOrder.parcel.receiver.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.parcel.receiver.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.parcel.receiver.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.parcel.receiver.address.address}{" "}
                      {selectedOrder.parcel.receiver.address.address
                        ? ", "
                        : ""}
                      {selectedOrder.parcel.receiver.address.city}{" "}
                      {selectedOrder.parcel.receiver.address.city ? ", " : ""}
                      {selectedOrder.parcel.receiver.address.zipcode}{" "}
                      {selectedOrder.parcel.receiver.address.zipcode
                        ? ", "
                        : ""}
                      {selectedOrder.parcel.receiver.address.country.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full">
                <div className="mt-4 w-full">
                  <h3 className="font-semibold mb-3">Packing List</h3>

                  {selectedOrder?.parcel?.item &&
                  selectedOrder.parcel.item.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px] text-center">
                              #
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-center">
                              Quantity
                            </TableHead>
                            <TableHead className="text-right">
                              Value ($)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.parcel.item.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-center font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell>{item.name || "—"}</TableCell>
                              <TableCell className="text-center">
                                {item.quantity || "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.unitPrice
                                  ? `$${item.unitPrice.toFixed(2)}`
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          ))}

                          <TableRow className="bg-muted/40 font-semibold">
                            <TableCell colSpan={3}>Total</TableCell>

                            <TableCell className="text-right">
                              $
                              {selectedOrder.parcel.item
                                .reduce(
                                  (unitPrice, item) =>
                                    unitPrice + (item.unitPrice || 0),
                                  0
                                )
                                .toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No items in this order
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Payment</h3>
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedOrder.payment.pType || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> $
                    {selectedOrder.payment.pAmount?.toFixed(2) || "0.00"}
                  </p>
                  <p>
                    <span className="font-medium">Discount:</span> $
                    {selectedOrder.payment.pDiscount?.toFixed(2) || "0.00"}
                  </p>
                  <p>
                    <span className="font-medium">Extra Charge:</span> $
                    {selectedOrder.payment.pExtraCharge?.toFixed(2) || "0.00"}
                  </p>
                  <p>
                    <span className="font-medium">Received:</span> $
                    {selectedOrder.payment.pReceived?.toFixed(2) || "0.00"}
                  </p>
                  <p>
                    <span className="font-medium">Refunded:</span> $
                    {selectedOrder.payment.pRefunded?.toFixed(2) || "0.00"}
                  </p>
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
            <AlertDialogTitle data-testid="delete-order-modal-title">
              Delete Order
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
              {selectedOrder && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Track ID:</strong> {selectedOrder.trackId}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-btn">
              Cancel
            </AlertDialogCancel>
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
