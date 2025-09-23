"use client";
import { useState } from "react";
import { DataTable } from "@/components/Dashboard/DataTable";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { useAuth } from "@/hooks/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Package, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin
} from "lucide-react";
import { PICKUP_API } from "@/components/ApiCall/url";

interface Pickup {
  id: string;
  pickupNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  area: string;
  status: 'scheduled' | 'pending' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  items: string;
  createdAt: string;
  assignedTo?: string;
}

const DashboardPickups = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  
  // Mock data for demonstration
  const mockPickups: Pickup[] = [
    {
      id: '1',
      pickupNumber: 'PU-001',
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      address: '123 Main St',
      city: 'New York',
      area: 'Manhattan',
      status: 'scheduled',
      scheduledDate: '2024-01-15',
      scheduledTime: '09:00-12:00',
      items: '1 document envelope',
      createdAt: '2024-01-10',
      notes: 'Handle with care'
    }
  ];

  // Filter pickups based on user role
  const filteredPickups = user?.role === 'user' 
    ? mockPickups.filter(pickup => pickup.customerPhone === user.phone)
    : mockPickups;

  // Calculate stats
  const stats = {
    total: filteredPickups.length,
    scheduled: filteredPickups.filter(pickup => pickup.status === 'scheduled').length,
    pending: filteredPickups.filter(pickup => pickup.status === 'pending').length,
    inProgress: filteredPickups.filter(pickup => pickup.status === 'in-progress').length,
    completed: filteredPickups.filter(pickup => pickup.status === 'completed').length,
    cancelled: filteredPickups.filter(pickup => pickup.status === 'cancelled').length,
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const columns = [
    {
      key: 'pickupNumber',
      label: 'Pickup Number',
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
      key: 'address',
      label: 'Address',
      render: (value: string, row: Pickup) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.area}, {row.city}</div>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      label: 'Scheduled',
      sortable: true,
      render: (value: string, row: Pickup) => (
        <div>
          <div className="font-medium">{new Date(value).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">{row.scheduledTime}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={statusColors[value] || 'bg-gray-100 text-gray-800'}>
          {value.replace('-', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleCreatePickup = async (formData: FormData) => {
    try {
      const pickupData = {
        id: Date.now().toString(),
        pickupNumber: `PU-${Date.now()}`,
        customerName: formData.get('customerName') as string,
        customerPhone: (formData.get('customerPhone') as string) || user?.phone || '',
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        area: formData.get('area') as string,
        scheduledDate: formData.get('scheduledDate') as string,
        scheduledTime: formData.get('scheduledTime') as string,
        items: formData.get('items') as string,
        notes: formData.get('notes') as string,
        status: 'scheduled' as const,
        createdAt: new Date().toISOString(),
      };

      // In a real app, this would be an API call
      setPickups(prev => [...prev, pickupData]);
      toast.success('Pickup scheduled successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to schedule pickup');
    }
  };

  const handleEditPickup = async (formData: FormData) => {
    if (!selectedPickup) return;
    
    try {
      const updatedData = {
        ...selectedPickup,
        customerName: formData.get('customerName') as string,
        customerPhone: formData.get('customerPhone') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        area: formData.get('area') as string,
        scheduledDate: formData.get('scheduledDate') as string,
        scheduledTime: formData.get('scheduledTime') as string,
        items: formData.get('items') as string,
        notes: formData.get('notes') as string,
        status: formData.get('status') as Pickup['status'],
      };

      // In a real app, this would be an API call
      setPickups(prev => prev.map(p => p.id === selectedPickup.id ? updatedData : p));
      toast.success('Pickup updated successfully');
      setIsEditModalOpen(false);
      setSelectedPickup(null);
    } catch (error) {
      toast.error('Failed to update pickup');
    }
  };

  const handleDeletePickup = async (pickup: Pickup) => {
    if (confirm(`Are you sure you want to delete pickup ${pickup.pickupNumber}?`)) {
      try {
        // In a real app, this would be an API call
        setPickups(prev => prev.filter(p => p.id !== pickup.id));
        toast.success('Pickup deleted successfully');
      } catch (error) {
        toast.error('Failed to delete pickup');
      }
    }
  };

  const handleUpdateStatus = async (pickup: Pickup, newStatus: string) => {
    try {
      const updatedPickup = { ...pickup, status: newStatus as Pickup['status'] };
      // In a real app, this would be an API call
      setPickups(prev => prev.map(p => p.id === pickup.id ? updatedPickup : p));
      toast.success(`Pickup status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update pickup status');
    }
  };

  const canManagePickups = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className="space-y-6" data-testid="pickups-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="pickups-title">
            {user?.role === 'user' ? 'My Pickups' : 'Pickups Management'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'user' 
              ? 'Schedule and track your pickup requests'
              : 'Manage all pickup requests and assignments'
            }
          </p>
        </div>
        <AlertDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <AlertDialogTrigger asChild>
            <Button data-testid="create-pickup-btn">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Pickup
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-testid="create-pickup-modal" className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Schedule New Pickup</AlertDialogTitle>
            </AlertDialogHeader>
            <form action={handleCreatePickup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input 
                    id="customerName" 
                    name="customerName" 
                    defaultValue={user?.name}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input 
                    id="customerPhone" 
                    name="customerPhone" 
                    defaultValue={user?.phone}
                    required 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input id="area" name="area" required />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input id="scheduledDate" name="scheduledDate" type="date" required />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">Preferred Time</Label>
                  <select name="scheduledTime" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select time</option>
                    <option value="09:00-12:00">9:00 AM - 12:00 PM</option>
                    <option value="12:00-15:00">12:00 PM - 3:00 PM</option>
                    <option value="15:00-18:00">3:00 PM - 6:00 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="items">Items Description</Label>
                <Input id="items" name="items" placeholder="e.g., 1 document envelope, 2 small packages" required />
              </div>
              <div>
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Any special delivery instructions..."
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <AlertDialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <AlertDialogAction asChild>
                  <Button type="submit" data-testid="create-pickup-submit">
                    Schedule Pickup
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          title="Total Pickups"
          value={stats.total}
          icon={Package}
          trend="neutral"
        />
        <StatsCard
          title="Scheduled"
          value={stats.scheduled}
          icon={Calendar}
          trend="neutral"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          trend="neutral"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={MapPin}
          trend="neutral"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
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

      {/* Pickups Table */}
      <DataTable
        title="Pickups"
        data={filteredPickups}
        columns={columns}
        searchKeys={['pickupNumber', 'customerName', 'address', 'city', 'area']}
        onEdit={canManagePickups || user?.role === 'user' ? (pickup) => {
          setSelectedPickup(pickup);
          setIsEditModalOpen(true);
        } : undefined}
        onDelete={canManagePickups ? handleDeletePickup : undefined}
        actions={canManagePickups ? [
          {
            label: 'Mark as Pending',
            onClick: (pickup) => handleUpdateStatus(pickup, 'pending'),
          },
          {
            label: 'Start Pickup',
            onClick: (pickup) => handleUpdateStatus(pickup, 'in-progress'),
          },
          {
            label: 'Complete Pickup',
            onClick: (pickup) => handleUpdateStatus(pickup, 'completed'),
          },
          {
            label: 'Cancel Pickup',
            onClick: (pickup) => handleUpdateStatus(pickup, 'cancelled'),
            variant: 'destructive' as const,
          },
        ] : []}
      />

      {/* Edit Pickup Modal */}
      <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <AlertDialogContent data-testid="edit-pickup-modal" className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Pickup</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedPickup && (
            <form action={handleEditPickup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-customerName">Customer Name</Label>
                  <Input 
                    id="edit-customerName" 
                    name="customerName" 
                    defaultValue={selectedPickup.customerName}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-customerPhone">Phone</Label>
                  <Input 
                    id="edit-customerPhone" 
                    name="customerPhone" 
                    defaultValue={selectedPickup.customerPhone}
                    required 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input 
                  id="edit-address" 
                  name="address" 
                  defaultValue={selectedPickup.address}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-area">Area</Label>
                  <Input 
                    id="edit-area" 
                    name="area" 
                    defaultValue={selectedPickup.area}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-city">City</Label>
                  <Input 
                    id="edit-city" 
                    name="city" 
                    defaultValue={selectedPickup.city}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-scheduledDate">Scheduled Date</Label>
                  <Input 
                    id="edit-scheduledDate" 
                    name="scheduledDate" 
                    type="date"
                    defaultValue={selectedPickup.scheduledDate}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-scheduledTime">Preferred Time</Label>
                  <select 
                    name="scheduledTime" 
                    defaultValue={selectedPickup.scheduledTime}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="09:00-12:00">9:00 AM - 12:00 PM</option>
                    <option value="12:00-15:00">12:00 PM - 3:00 PM</option>
                    <option value="15:00-18:00">3:00 PM - 6:00 PM</option>
                  </select>
                </div>
                {canManagePickups && (
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <select 
                      name="status" 
                      defaultValue={selectedPickup.status}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="edit-items">Items Description</Label>
                <Input 
                  id="edit-items" 
                  name="items" 
                  defaultValue={selectedPickup.items}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Special Instructions</Label>
                <textarea 
                  id="edit-notes" 
                  name="notes" 
                  defaultValue={selectedPickup.notes}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <AlertDialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <AlertDialogAction asChild>
                  <Button type="submit" data-testid="edit-pickup-submit">
                    Update Pickup
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardPickups;
