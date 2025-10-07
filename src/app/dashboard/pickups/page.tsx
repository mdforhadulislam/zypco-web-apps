"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/Dashboard/DataTable";
import { RoleGuard } from "@/middleware/roleGuard";
import { PickupService } from "@/services/dashboardService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthContext";

export default function PickupsPage() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    zipCode: "",
    note: "",
    preferredDate: "",
  });

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const response = await PickupService.getPickups({ limit: 50 });
      if (response.status === 200) {
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

  const handleCreatePickup = async () => {
    try {
      setCreating(true);

      if (!formData.preferredDate) {
        toast.error("Please select a preferred pickup date");
        return;
      }

      const payload = {
        ...formData,
        preferredDate: new Date(formData.preferredDate),
        status: "scheduled",
        user: user?._id,
      };

      const response = await PickupService.createPickup(payload);

      if (response.status === 201 || response.status === 200) {
        toast.success("Pickup scheduled successfully!");
        setShowModal(false);
        setFormData({
          name: "",
          phone: "",
          addressLine: "",
          city: "",
          state: "",
          zipCode: "",
          note: "",
          preferredDate: "",
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

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "secondary",
      "in-progress": "default",
      completed: "default",
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
      key: "_id",
      label: "Pickup ID",
      sortable: true,
    },
    {
      key: "address",
      label: "Pickup Address",
      render: (value: any) => (
        <div>
          <p className="font-medium">
            {value?.street || value?.addressLine || "N/A"}
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
      render: (value: string) => getStatusBadge(value || "scheduled"),
    },
    {
      key: "preferredDate",
      label: "Preferred Date",
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleString() : "Not scheduled",
    },
    {
      key: "user",
      label: "User Contact",
      render: (value: any) => (
        <div>
          <p className="font-medium">{value?.name || "N/A"}</p>
          <p className="text-sm text-gray-500">{value?.phone || "No phone"}</p>
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
          <Button onClick={() => setShowModal(true)}>
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
                  <p className="text-2xl font-bold">{pickups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold">
                    {
                      pickups.filter((p: any) => p.status === "scheduled")
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
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed
                  </p>
                  <p className="text-2xl font-bold">
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
                  <p className="text-2xl font-bold">
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
          searchKeys={["_id", "address.street", "user.name"]}
          loading={loading}
          actions={[
            {
              label: "View Details",
              onClick: (pickup) => toast.info(`Viewing pickup ${pickup._id}`),
              variant: "default",
            },
            {
              label: "Update Status",
              onClick: (pickup) => toast.info(`Status update for ${pickup._id}`),
              variant: "default",
              condition: () => user?.role === "admin" || user?.role === "moderator",
            },
          ]}
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
                  <Button onClick={() => setShowModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Pickup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Pickup Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a New Pickup</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                ["Name", "name"],
                ["Phone", "phone"],
                ["Address Line", "addressLine"],
                ["City", "city"],
                ["State", "state"],
                ["ZIP Code", "zipCode"],
              ].map(([label, key]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    value={(formData as any)[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                  />
                </div>
              ))}

              <div>
                <Label>Preferred Pickup Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.preferredDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Pickup Note</Label>
                <Textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleCreatePickup}
                disabled={creating}
                className="w-full"
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
      </div>
    </RoleGuard>
  );
}
