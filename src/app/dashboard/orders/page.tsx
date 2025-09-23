"use client";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/Dashboard/DataTable";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { useApi } from "@/hooks/UserApi";
import { useAuth } from "@/hooks/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Package, 
  Plus, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { ORDERS_API, SINGLE_ORDER_API } from "@/components/ApiCall/url";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  type: 'normal' | 'express' | 'super-express';
  amount: number;
  createdAt: string;
  trackingNumber?: string;
  destination: string;
  weight: number;
}

const DashboardOrders = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { data: orders, loading, error, refetch, postData, updateData, deleteData } = useApi<Order[]>(ORDERS_API);

  // Filter orders based on user role
  const filteredOrders = orders?.filter((order) => {
    if (user?.role === 'user') {
      return order.customerPhone === user.phone; // Users see only their orders
    }
    return true; // Admin and moderator see all orders
  }) || [];

  // Calculate stats
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(order => order.status === 'pending').length,
    processing: filteredOrders.filter(order => order.status === 'processing').length,
    shipped: filteredOrders.filter(order => order.status === 'shipped').length,
    delivered: filteredOrders.filter(order => order.status === 'delivered').length,
    cancelled: filteredOrders.filter(order => order.status === 'cancelled').length,
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const typeColors: Record<string, string> = {
    normal: 'bg-gray-100 text-gray-800',
    express: 'bg-orange-100 text-orange-800',
    'super-express': 'bg-red-100 text-red-800',
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'destination',
      label: 'Destination',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <Badge className={typeColors[value] || 'bg-gray-100 text-gray-800'}>
          {value.replace('-', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={statusColors[value] || 'bg-gray-100 text-gray-800'}>
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'weight',
      label: 'Weight (kg)',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleCreateOrder = async (formData: FormData) => {
    try {
      const orderData = {
        orderNumber: `ORD-${Date.now()}`,
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        customerPhone: formData.get('customerPhone'),
        destination: formData.get('destination'),
        weight: Number(formData.get('weight')),
        type: formData.get('type'),
        amount: Number(formData.get('amount')),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await postData(orderData);
      toast.success('Order created successfully');
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const handleEditOrder = async (formData: FormData) => {
    if (!selectedOrder) return;
    
    try {
      const updatedData = {
        ...selectedOrder,
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        destination: formData.get('destination'),
        weight: Number(formData.get('weight')),
        type: formData.get('type'),
        amount: Number(formData.get('amount')),
        status: formData.get('status'),
      };

      await updateData(updatedData);
      toast.success('Order updated successfully');
      setIsEditModalOpen(false);
      setSelectedOrder(null);
      refetch();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      try {
        await deleteData();
        toast.success('Order deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete order');
      }
    }
  };

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    try {
      const updatedOrder = { ...order, status: newStatus };
      await updateData(updatedOrder);
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const canManageOrders = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className="space-y-6" data-testid="orders-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="orders-title">
            {user?.role === 'user' ? 'My Orders' : 'Orders Management'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'user' 
              ? 'Track and manage your courier orders'
              : 'Manage all courier orders and shipments'
            }
          </p>
        </div>
        {canManageOrders && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-order-btn">
                <Plus className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="create-order-modal">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
              </DialogHeader>
              <form action={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" name="customerName" required />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input id="customerEmail" name="customerEmail" type="email" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input id="customerPhone" name="customerPhone" required />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input id="destination" name="destination" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" name="weight" type="number" step="0.1" required />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="super-express">Super Express</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="create-order-submit">
                    Create Order
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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

      {/* Orders Table */}
      <DataTable
        title="Orders"
        data={filteredOrders}
        columns={columns}
        searchKeys={['orderNumber', 'customerName', 'destination', 'customerEmail']}
        onEdit={canManageOrders ? (order) => {
          setSelectedOrder(order);
          setIsEditModalOpen(true);
        } : undefined}
        onDelete={canManageOrders ? handleDeleteOrder : undefined}
        actions={canManageOrders ? [
          {
            label: 'Mark as Processing',
            onClick: (order) => handleUpdateStatus(order, 'processing'),
          },
          {
            label: 'Mark as Shipped',
            onClick: (order) => handleUpdateStatus(order, 'shipped'),
          },
          {
            label: 'Mark as Delivered',
            onClick: (order) => handleUpdateStatus(order, 'delivered'),
          },
          {
            label: 'Cancel Order',
            onClick: (order) => handleUpdateStatus(order, 'cancelled'),
            variant: 'destructive' as const,
          },
        ] : []}
      />

      {/* Edit Order Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent data-testid="edit-order-modal">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <form action={handleEditOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-customerName">Customer Name</Label>
                  <Input 
                    id="edit-customerName" 
                    name="customerName" 
                    defaultValue={selectedOrder.customerName}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-customerEmail">Email</Label>
                  <Input 
                    id="edit-customerEmail" 
                    name="customerEmail" 
                    type="email" 
                    defaultValue={selectedOrder.customerEmail}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-destination">Destination</Label>
                  <Input 
                    id="edit-destination" 
                    name="destination" 
                    defaultValue={selectedOrder.destination}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={selectedOrder.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-weight">Weight (kg)</Label>
                  <Input 
                    id="edit-weight" 
                    name="weight" 
                    type="number" 
                    step="0.1"
                    defaultValue={selectedOrder.weight}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select name="type" defaultValue={selectedOrder.type}>
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
                <div>
                  <Label htmlFor="edit-amount">Amount ($)</Label>
                  <Input 
                    id="edit-amount" 
                    name="amount" 
                    type="number" 
                    step="0.01"
                    defaultValue={selectedOrder.amount}
                    required 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="edit-order-submit">
                  Update Order
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardOrders;