"use client";
import {
  deleteRequestSend,
  getRequestSend,
  postRequestSend,
  putRequestSend,
} from "@/components/ApiCall/methord";
import {
  PICKUP_API,
  SINGLE_ACCOUNT_ADDRESS_API,
  SINGLE_PICKUP_API,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/AuthContext";
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  LoaderCircle,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "sonner";

interface Address {
  _id: string;
  name: string;
  label: string;
  addressLine: string;
  area: string;
  city: string;
  state: string;
  zipCode: string;
  country: {
    _id: string;
    name: string;
  };
  phone: string;
  isDefault: boolean;
}

interface Pickup {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  moderator?: {
    _id: string;
    name: string;
    phone: string;
  };
  address: Address;
  preferredDate: string;
  preferredTimeSlot: string;
  status: "pending" | "scheduled" | "picked" | "cancelled";
  notes: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

const DashboardPickups = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
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

  // Fetch pickups with pagination
  const fetchPickups = async (pageNum = 1, reset = false) => {
    try {
      const queryParams = new URLSearchParams();

      // If user is regular user, filter by their user ID
      if (user?.role === "user") {
        queryParams.set("user", user.id);
      }

      queryParams.set("page", pageNum.toString());
      queryParams.set("limit", "10");

      if (searchTerm) {
        queryParams.set("search", searchTerm);
      }

      const url = `${PICKUP_API}?${queryParams.toString()}`;
      const response = await getRequestSend<Pickup[]>(url, {
        Authorization: `Bearer ${user?.token}`,
      });

      if (response.status == 200 && response.data) {
        const newPickups = Array.isArray(response.data) ? response.data : [];

        if (reset || pageNum === 1) {
          setPickups(newPickups);
        } else {
          setPickups((prev) => [...prev, ...newPickups]);
        }

        // Check if there are more pages
        const totalPages = response.meta?.totalPages || 1;
        setHasMore(pageNum < totalPages);

        if (pageNum === 1) {
          toast.success("Pickups loaded successfully");
        }
      } else {
        toast.error(response.message || "Failed to fetch pickups");
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Failed to fetch pickups");
      console.error("Fetch pickups error:", error);
      setHasMore(false);
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch more pickups for infinite scroll
  const fetchMorePickups = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPickups(nextPage, false);
  };

  // Fetch user addresses
  const fetchAddresses = async () => {
    if (!user?.phone) return;

    try {
      const response = await getRequestSend<Address[]>(
        SINGLE_ACCOUNT_ADDRESS_API(user.phone),
        { Authorization: `Bearer ${user.token}` }
      );

      if (response.status === 200 && response.data) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error("Fetch addresses error:", error);
    }
  };

  // Load initial data
  useEffect(() => {
    if (user?.token) {
      fetchPickups(1, true);
      fetchAddresses();
      setPage(1);
    }
  }, [user, searchTerm]);

  // Filter pickups based on search term
  const filteredPickups = pickups.filter(
    (pickup) =>
      pickup._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.address.addressLine
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pickup.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: filteredPickups.length,
    scheduled: filteredPickups.filter((pickup) => pickup.status === "scheduled")
      .length,
    pending: filteredPickups.filter((pickup) => pickup.status === "pending")
      .length,
    picked: filteredPickups.filter((pickup) => pickup.status === "picked")
      .length,
    cancelled: filteredPickups.filter((pickup) => pickup.status === "cancelled")
      .length,
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    picked: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  // Handle create pickup
  const handleCreatePickup = async (formData: FormData) => {
    try {
      setLoading(true);

      const pickupData = {
        user: user?.id,
        address: formData.get("address") as string,
        preferredDate: formData.get("preferredDate") as string,
        preferredTimeSlot: formData.get("preferredTimeSlot") as string,
        notes: formData.get("notes") as string,
        cost: Number(formData.get("cost")) || 0,
        status: "pending",
      };

      const response = await postRequestSend(
        PICKUP_API,
        { Authorization: `Bearer ${user?.token}` },
        pickupData
      );

      if (response.status === 201) {
        toast.success("Pickup scheduled successfully");
        setIsCreateModalOpen(false);
        // Reset and fetch fresh data
        setPickups([]);
        setPage(1);
        setHasMore(true);
        fetchPickups(1, true);
      } else {
        toast.error(response.message || "Failed to schedule pickup");
      }
    } catch (error) {
      toast.error("Failed to schedule pickup");
      console.error("Create pickup error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit pickup
  const handleEditPickup = async (formData: FormData) => {
    if (!selectedPickup) return;

    try {
      setLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        preferredDate: formData.get("preferredDate") as string,
        preferredTimeSlot: formData.get("preferredTimeSlot") as string,
        notes: formData.get("notes") as string,
        cost: Number(formData.get("cost")) || 0,
      };

      // Only allow admins/moderators to change status and moderator assignment
      if (canManage) {
        updateData.status = formData.get("status") as string;

        if (canAssignModerator) {
          const moderatorId = formData.get("moderator") as string;
          if (moderatorId && moderatorId !== "none") {
            updateData.moderator = moderatorId;
          }
        }
      }

      const response = await putRequestSend(
        SINGLE_PICKUP_API(selectedPickup._id),
        { Authorization: `Bearer ${user?.token}` },
        updateData
      );

      if (response.status == 200) {
        toast.success("Pickup updated successfully");
        setIsEditModalOpen(false);
        setSelectedPickup(null);
        // Update the pickup in the list
        setPickups((prev) =>
          prev.map((p) =>
            p._id === selectedPickup._id ? { ...p, ...updateData } : p
          )
        );
      } else {
        toast.error(response.message || "Failed to update pickup");
      }
    } catch (error) {
      toast.error("Failed to update pickup");
      console.error("Edit pickup error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete pickup
  const handleDeletePickup = async (pickup: Pickup) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete pickups");
      return;
    }

    if (confirm(`Are you sure you want to delete this pickup?`)) {
      try {
        const response = await deleteRequestSend(
          SINGLE_PICKUP_API(pickup._id),
          { Authorization: `Bearer ${user?.token}` }
        );

        if (response.status === 200) {
          toast.success("Pickup deleted successfully");
          setPickups((prev) => prev.filter((p) => p._id !== pickup._id));
        } else {
          toast.error(response.message || "Failed to delete pickup");
        }
      } catch (error) {
        toast.error("Failed to delete pickup");
        console.error("Delete pickup error:", error);
      }
    }
  };

  // Handle status update
  const handleUpdateStatus = async (pickup: Pickup, newStatus: string) => {
    if (!canManage) {
      toast.error("You do not have permission to update pickup status");
      return;
    }

    try {
      const response = await putRequestSend(
        SINGLE_PICKUP_API(pickup._id),
        { Authorization: `Bearer ${user?.token}` },
        { status: newStatus }
      );

      if (response.status === 200) {
        toast.success(`Pickup status updated to ${newStatus}`);
        setPickups((prev) =>
          prev.map((p) =>
            p._id === pickup._id
              ? { ...p, status: newStatus as Pickup["status"] }
              : p
          )
        );
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update pickup status");
      console.error("Update status error:", error);
    }
  };

  // Handle moderator assignment
  const handleAssignModerator = async (pickup: Pickup) => {
    if (!canAssignModerator) {
      toast.error("You do not have permission to assign moderators");
      return;
    }

    try {
      const response = await putRequestSend(
        SINGLE_PICKUP_API(pickup._id),
        { Authorization: `Bearer ${user?.token}` },
        {
          moderator: user.id,
          status: "scheduled",
        }
      );

      if (response.status === 200) {
        toast.success("Pickup assigned successfully");
        setPickups((prev) =>
          prev.map((p) =>
            p._id === pickup._id
              ? {
                  ...p,
                  moderator: {
                    _id: user.id,
                    name: user.name,
                    phone: user.phone,
                  },
                  status: "scheduled" as const,
                }
              : p
          )
        );
      } else {
        toast.error(response.message || "Failed to assign pickup");
      }
    } catch (error) {
      toast.error("Failed to assign pickup");
      console.error("Assign moderator error:", error);
    }
  };

  // Pickup Card Component
  const PickupCard = ({ pickup }: { pickup: Pickup }) => (
    <Card className="mb-4 py-2" data-testid={`pickup-card-${pickup._id}`}>
      <CardContent className="py-2 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-semibold text-sm">#{pickup._id}</p>
              {canViewAll && (
                <p className="text-sm text-gray-600">{pickup.user.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              className={
                statusColors[pickup.status] || "bg-gray-100 text-gray-800"
              }
            >
              {pickup.status.toUpperCase()}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPickup(pickup);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                {canManage && !pickup.moderator && canAssignModerator && (
                  <DropdownMenuItem
                    onClick={() => handleAssignModerator(pickup)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Assign to Me
                  </DropdownMenuItem>
                )}

                {canManage && pickup.status === "pending" && (
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(pickup, "scheduled")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Mark Scheduled
                  </DropdownMenuItem>
                )}

                {canManage && pickup.status === "scheduled" && (
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(pickup, "picked")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Picked
                  </DropdownMenuItem>
                )}

                {canManage &&
                  pickup.status !== "picked" &&
                  pickup.status !== "cancelled" && (
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(pickup, "cancelled")}
                      className="text-destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Pickup
                    </DropdownMenuItem>
                  )}

                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => handleDeletePickup(pickup)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-600">Address:</p>
            <p className="font-medium capitalize">
              {pickup.address.addressLine}
            </p>
            <p className="text-gray-500 capitalize">
              {pickup.address.area}, {pickup.address.city}
            </p>
          </div>

          <div>
            <p className="text-gray-600">Preferred Date:</p>
            <p className="font-medium">
              {new Date(pickup.preferredDate).toLocaleDateString()}
            </p>
            {pickup.preferredTimeSlot && (
              <p className="text-gray-500">{pickup.preferredTimeSlot}</p>
            )}
          </div>

          <div>
            <p className="text-gray-600">Cost:</p>
            <p className="font-medium">৳{pickup.cost || 0}</p>
          </div>

          {canManage && pickup.moderator && (
            <div>
              <p className="text-gray-600">Assigned To:</p>
              <div className="flex items-center gap-1">
                <User size={16} />
                <p className="font-medium">{pickup.moderator.name}</p>
              </div>
            </div>
          )}

          {pickup.notes && (
            <div>
              <p className="text-gray-600 text-sm">Notes:</p>
              <p className="text-sm">{pickup.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Created: {new Date(pickup.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" data-testid="pickups-page">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="pickups-title"
          >
            {user?.role === "user" ? "My Pickups" : "Pickups Management"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "user"
              ? "Schedule and track your pickup requests"
              : user?.role === "moderator"
              ? "Manage assigned pickups and update status"
              : "Manage all pickup requests and assignments"}
          </p>
        </div>
        <AlertDialog
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        >
          <AlertDialogTrigger asChild>
            <Button data-testid="create-pickup-btn" disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Pickup
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            data-testid="create-pickup-modal"
            className="max-w-2xl"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Schedule New Pickup</AlertDialogTitle>
            </AlertDialogHeader>
            <form action={handleCreatePickup} className="space-y-4">
              <div>
                <Label htmlFor="address">Pickup Address</Label>
                <select
                  id="address"
                  name="address"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select pickup address</option>
                  {addresses?.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.label} - {addr.addressLine}, {addr.area},{" "}
                      {addr.city}
                    </option>
                  ))}
                </select>
                {addresses?.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No addresses found. Please add an address in your profile
                    first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    name="preferredDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preferredTimeSlot">Preferred Time</Label>
                  <select
                    name="preferredTimeSlot"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Any time</option>
                    <option value="09:00-12:00">9:00 AM - 12:00 PM</option>
                    <option value="12:00-15:00">12:00 PM - 3:00 PM</option>
                    <option value="15:00-18:00">3:00 PM - 6:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="cost">Expected Cost (৳)</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special pickup instructions..."
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
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
                    data-testid="create-pickup-submit"
                    disabled={loading}
                  >
                    {loading && (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Schedule Pickup
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          title="Completed"
          value={stats.picked}
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
          placeholder="Search pickups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
          data-testid="pickup-search-input"
        />
      </div>

      {/* Pickups List with InfiniteScroll */}
      <div data-testid="pickups-list">
        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading pickups...</span>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={filteredPickups.length}
            next={fetchMorePickups}
            hasMore={hasMore}
            loader={
              <div className="flex items-center justify-center py-4">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading more pickups...</span>
              </div>
            }
            endMessage={
              <p className="text-center py-4 text-gray-500">
                {filteredPickups.length === 0
                  ? "No pickups found"
                  : "No more pickups to load"}
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {filteredPickups.map((pickup) => (
              <PickupCard key={pickup._id} pickup={pickup} />
            ))}
          </InfiniteScroll>
        )}
      </div>

      {/* Edit Pickup Modal */}
      <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <AlertDialogContent
          data-testid="edit-pickup-modal"
          className="max-w-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Pickup</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedPickup && (
            <form action={handleEditPickup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-preferredDate">Preferred Date</Label>
                  <Input
                    id="edit-preferredDate"
                    name="preferredDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    defaultValue={selectedPickup.preferredDate?.split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-preferredTimeSlot">Preferred Time</Label>
                  <select
                    name="preferredTimeSlot"
                    defaultValue={selectedPickup.preferredTimeSlot}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Any time</option>
                    <option value="09:00-12:00">9:00 AM - 12:00 PM</option>
                    <option value="12:00-15:00">12:00 PM - 3:00 PM</option>
                    <option value="15:00-18:00">3:00 PM - 6:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-cost">Cost (৳)</Label>
                <Input
                  id="edit-cost"
                  name="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={selectedPickup.cost}
                />
              </div>

              {canManage && (
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    name="status"
                    defaultValue={selectedPickup.status}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="picked">Picked</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                {/* <AlertDialogAction asChild> */}
                <Button
                  type="submit"
                  data-testid="edit-pickup-submit"
                  disabled={loading}
                >
                  {loading && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Pickup
                </Button>
                {/* </AlertDialogAction> */}
              </AlertDialogFooter>
            </form>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardPickups;
