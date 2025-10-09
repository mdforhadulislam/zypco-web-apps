"use client";

import { DataTable } from "@/components/Dashboard/DataTable";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/AuthContext";
import { RoleGuard } from "@/middleware/roleGuard";
import { PickupService, UserService } from "@/services/dashboardService";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Loader2,
  MapPin,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Pickup {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  address: any;
  preferredDate: string;
  preferredTimeSlot: string;
  status: "pending" | "scheduled" | "in-progress" | "completed" | "cancelled";
  notes: string;
  cost: number;
  moderator?: any;
  createdAt: string;
  updatedAt: string;
}

export default function PickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const { user } = useAuth();

  const [createFormData, setCreateFormData] = useState({
    address: "",
    preferredDate: "",
    preferredTimeSlot: "",
    notes: "",
  });

  const [editFormData, setEditFormData] = useState({
    preferredDate: "",
    preferredTimeSlot: "",
    notes: "",
  });

  const [statusFormData, setStatusFormData] = useState({
    status: "",
    cost: 0,
    notes: "",
  });

  useEffect(() => {
    fetchPickups();
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const response = await PickupService.getPickups({ limit: 100 });
      console.log(response);

      if (response.status == 200) {
        setPickups(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch pickups");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      if (!user?.phone) return;
      const response = await UserService.getUserAddresses(user.phone);
      if (response.status == 200) {
        setAddresses(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const handleCreatePickup = async () => {
    try {
      setCreating(true);

      if (!createFormData.address || !createFormData.preferredDate) {
        toast.error("Please fill all required fields");
        return;
      }

      const payload = {
        user: user?.id,
        address: createFormData.address,
        preferredDate: new Date(createFormData.preferredDate).toISOString(),
        preferredTimeSlot: createFormData.preferredTimeSlot,
        notes: createFormData.notes,
      };

      const response = await PickupService.createPickup(payload);

      if (response.status == 201) {
        toast.success("Pickup scheduled successfully!");
        setShowCreateModal(false);
        setCreateFormData({
          address: "",
          preferredDate: "",
          preferredTimeSlot: "",
          notes: "",
        });
        fetchPickups();
      } else {
        toast.error(response.message || "Failed to schedule pickup");
      }
    } catch (error: any) {
      toast.error(error.message || "Error creating pickup");
    } finally {
      setCreating(false);
    }
  };

  const handleEditPickup = async () => {
    if (!selectedPickup) return;

    try {
      setCreating(true);

      const payload = {
        preferredDate: new Date(editFormData.preferredDate).toISOString(),
        preferredTimeSlot: editFormData.preferredTimeSlot,
        notes: editFormData.notes,
      };

      const response = await PickupService.updatePickup(
        selectedPickup._id,
        payload
      );

      if (response.status == 200) {
        toast.success("Pickup updated successfully!");
        setShowEditModal(false);
        setSelectedPickup(null);
        fetchPickups();
      } else {
        toast.error(response.message || "Failed to update pickup");
      }
    } catch (error: any) {
      toast.error(error.message || "Error updating pickup");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedPickup) return;

    try {
      setCreating(true);

      const payload: any = {
        status: statusFormData.status,
      };

      if (statusFormData.cost > 0) {
        payload.cost = statusFormData.cost;
      }

      if (statusFormData.notes) {
        payload.notes = statusFormData.notes;
      }

      const response = await PickupService.updatePickup(
        selectedPickup._id,
        payload
      );

      if (response.status == 200) {
        toast.success("Pickup status updated successfully!");
        setShowStatusModal(false);
        setSelectedPickup(null);
        setStatusFormData({ status: "", cost: 0, notes: "" });
        fetchPickups();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error.message || "Error updating status");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePickup = async () => {
    if (!selectedPickup) return;

    try {
      setCreating(true);

      const response = await PickupService.deletePickup(selectedPickup._id);

      if (response.status == 200) {
        toast.success("Pickup deleted successfully!");
        setShowDeleteModal(false);
        setSelectedPickup(null);
        fetchPickups();
      } else {
        toast.error(response.message || "Failed to delete pickup");
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting pickup");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (pickup: Pickup) => {
    setSelectedPickup(pickup);
    setEditFormData({
      preferredDate:
        pickup.preferredDate.split("T")[0] +
        "T" +
        pickup.preferredDate.split("T")[1].slice(0, 5),
      preferredTimeSlot: pickup.preferredTimeSlot || "",
      notes: pickup.notes || "",
    });
    setShowEditModal(true);
  };

  const openStatusModal = (pickup: Pickup) => {
    setSelectedPickup(pickup);
    setStatusFormData({
      status: pickup.status,
      cost: pickup.cost || 0,
      notes: pickup.notes || "",
    });
    setShowStatusModal(true);
  };

  const openViewModal = (pickup: Pickup) => {
    setSelectedPickup(pickup);
    setShowViewModal(true);
  };

  const openDeleteModal = (pickup: Pickup) => {
    setSelectedPickup(pickup);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "outline", color: "text-yellow-600" },
      scheduled: { variant: "secondary", color: "text-blue-600" },
      "in-progress": { variant: "default", color: "text-purple-600" },
      completed: { variant: "default", color: "text-green-600" },
      cancelled: { variant: "destructive", color: "text-red-600" },
    };

    const config = variants[status] || { variant: "outline", color: "" };

    return (
      <Badge variant={config.variant as any} className={config.color}>
        {status}
      </Badge>
    );
  };

  const canEditPickup = (pickup: Pickup) => {
    if (user?.role === "admin" || user?.role === "moderator") return true;
    if (user?.role === "user" && pickup.user._id === user.id) {
      return ["pending", "scheduled"].includes(pickup.status);
    }
    return false;
  };

  const canUpdateStatus = () => {
    return user?.role === "admin" || user?.role === "moderator";
  };

  const canDeletePickup = () => {
    return user?.role === "admin";
  };

  const columns = [
    {
      key: "_id",
      label: "Pickup ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value.slice(-8)}</span>
      ),
    },
    {
      key: "address",
      label: "Pickup Address",
      render: (value: any) => (
        <div>
          <p className="font-medium">
            {value?.addressLine || value?.street || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            {value?.city}, {value?.zipCode}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => getStatusBadge(value || "pending"),
    },
    {
      key: "preferredDate",
      label: "Preferred Date",
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleString() : "Not scheduled",
    },
    {
      key: "cost",
      label: "Cost",
      render: (value: number) => (
        <span className="font-medium">
          {value > 0 ? `$${value.toFixed(2)}` : "TBD"}
        </span>
      ),
    },
    {
      key: "address",
      label: "User Contact",
      render: (value: any) => (
        <div>
          <p className="font-medium">{value?.name || "N/A"}</p>
          <p className="text-sm text-gray-500">{value?.phone || "No phone"}</p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, pickup: Pickup) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openViewModal(pickup)}
            data-testid={`view-pickup-${pickup._id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canEditPickup(pickup) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditModal(pickup)}
              data-testid={`edit-pickup-${pickup._id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canUpdateStatus() && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openStatusModal(pickup)}
              data-testid={`status-pickup-${pickup._id}`}
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          )}
          {canDeletePickup() && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openDeleteModal(pickup)}
              data-testid={`delete-pickup-${pickup._id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={["admin", "moderator", "user"]}>
      <div className="space-y-6" data-testid="pickups-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Pickup Management
            </h1>
            <p className="text-muted-foreground">
              Schedule and manage package pickups
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            data-testid="create-pickup-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Pickup
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Pickups
                  </p>
                  <p className="text-2xl font-bold" data-testid="total-pickups">
                    {pickups.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p
                    className="text-2xl font-bold"
                    data-testid="pending-pickups"
                  >
                    {pickups.filter((p: any) => p.status === "pending").length}
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
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p
                    className="text-2xl font-bold"
                    data-testid="completed-pickups"
                  >
                    {
                      pickups.filter((p: any) => p.status === "completed")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p
                    className="text-2xl font-bold"
                    data-testid="inprogress-pickups"
                  >
                    {
                      pickups.filter((p: any) => p.status === "in-progress")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pickups Table */}
        <DataTable
          title="Pickup Requests"
          data={pickups}
          columns={columns}
          searchKeys={["_id", "address.addressLine", "user.name"]}
          loading={loading}
        />

        {/* Empty State */}
        {pickups.length === 0 && !loading && (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No pickups scheduled
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by scheduling your first pickup.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Pickup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Pickup Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent data-testid="create-pickup-modal">
            <DialogHeader>
              <DialogTitle>Schedule a New Pickup</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule a pickup request
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Address *</Label>
                <Select
                  value={createFormData.address}
                  onValueChange={(value) =>
                    setCreateFormData({ ...createFormData, address: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select from saved addresses" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.length > 0 ? (
                      addresses.map((addr: any) => (
                        <SelectItem key={addr._id} value={addr._id}>
                          {addr.label
                            ? `${addr.label} — ${addr.city} - ${addr.name}`
                            : `${addr.city}, ${addr.country}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="no-address">
                        No saved addresses found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground mt-1">
                  Choose one of your saved addresses
                </p>
              </div>

              <div>
                <Label>Preferred Pickup Date *</Label>
                <Input
                  type="datetime-local"
                  value={createFormData.preferredDate}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      preferredDate: e.target.value,
                    })
                  }
                  data-testid="create-date-input"
                />
              </div>

              <div>
                <Label>Preferred Time Slot</Label>
                <Input
                  placeholder="e.g., 09:00-12:00"
                  value={createFormData.preferredTimeSlot}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      preferredTimeSlot: e.target.value,
                    })
                  }
                  data-testid="create-timeslot-input"
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any special instructions..."
                  value={createFormData.notes}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      notes: e.target.value,
                    })
                  }
                  data-testid="create-notes-input"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePickup}
                disabled={creating}
                data-testid="submit-create-pickup"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Pickup"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Pickup Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent data-testid="edit-pickup-modal">
            <DialogHeader>
              <DialogTitle>Edit Pickup</DialogTitle>
              <DialogDescription>Update pickup details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Preferred Pickup Date</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.preferredDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      preferredDate: e.target.value,
                    })
                  }
                  data-testid="edit-date-input"
                />
              </div>

              <div>
                <Label>Preferred Time Slot</Label>
                <Input
                  placeholder="e.g., 09:00-12:00"
                  value={editFormData.preferredTimeSlot}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      preferredTimeSlot: e.target.value,
                    })
                  }
                  data-testid="edit-timeslot-input"
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  data-testid="edit-notes-input"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditPickup}
                disabled={creating}
                data-testid="submit-edit-pickup"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Pickup"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Modal */}
        <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
          <DialogContent data-testid="status-pickup-modal">
            <DialogHeader>
              <DialogTitle>Update Pickup Status</DialogTitle>
              <DialogDescription>
                Update status and cost information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={statusFormData.status}
                  onValueChange={(value) =>
                    setStatusFormData({ ...statusFormData, status: value })
                  }
                >
                  <SelectTrigger data-testid="status-select">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cost ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={statusFormData.cost}
                  onChange={(e) =>
                    setStatusFormData({
                      ...statusFormData,
                      cost: parseFloat(e.target.value) || 0,
                    })
                  }
                  data-testid="status-cost-input"
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={statusFormData.notes}
                  onChange={(e) =>
                    setStatusFormData({
                      ...statusFormData,
                      notes: e.target.value,
                    })
                  }
                  data-testid="status-notes-input"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={creating}
                data-testid="submit-status-update"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent data-testid="view-pickup-modal">
            <DialogHeader>
              <DialogTitle>Pickup Details</DialogTitle>
            </DialogHeader>
            {selectedPickup && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Pickup ID</Label>
                    <p className="font-mono" data-testid="view-pickup-id">
                      {selectedPickup._id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div data-testid="view-pickup-status">
                      {getStatusBadge(selectedPickup.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedPickup.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPickup.user.phone} • {selectedPickup.user.email}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">
                    Pickup Address
                  </Label>
                  <p>
                    {selectedPickup.address?.addressLine ||
                      selectedPickup.address?.street}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPickup.address?.city},{" "}
                    {selectedPickup.address?.state}{" "}
                    {selectedPickup.address?.zipCode}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Preferred Date
                    </Label>
                    <p>
                      {new Date(selectedPickup.preferredDate).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Time Slot</Label>
                    <p>{selectedPickup.preferredTimeSlot || "Not specified"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Cost</Label>
                    <p className="font-medium">
                      {selectedPickup.cost > 0
                        ? `$${selectedPickup.cost.toFixed(2)}`
                        : "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="text-sm">
                      {new Date(selectedPickup.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedPickup.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="text-sm">{selectedPickup.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <AlertDialogContent data-testid="delete-pickup-modal">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Pickup</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this pickup? This action cannot
                be undone.
                {selectedPickup && (
                  <div className="mt-2 p-2 bg-muted rounded">
                    <strong>Pickup ID:</strong> {selectedPickup._id}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="cancel-delete-pickup">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePickup}
                disabled={creating}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="confirm-delete-pickup"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Pickup"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}
