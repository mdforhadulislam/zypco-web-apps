"use client";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/Dashboard/DataTable";
import { RoleGuard } from "@/middleware/roleGuard";
import { PickupService } from "@/services/dashboardService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Clock, CheckCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthContext";

export default function PickupsPage() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const response = await PickupService.getPickups({ limit: 50 });
      if (response.success) {
        setPickups(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch pickups");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePickup = () => {
    toast.info("Pickup scheduling feature coming soon");
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
      key: "id",
      label: "Pickup ID",
      sortable: true,
    },
    {
      key: "address",
      label: "Pickup Address",
      render: (value: any) => (
        <div>
          <p className="font-medium">{value?.address || "N/A"}</p>
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
      key: "scheduledDate",
      label: "Scheduled Date",
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleString() : "Not scheduled",
    },
    {
      key: "contact",
      label: "Contact",
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
            <h1 className="text-3xl font-bold tracking-tight">Pickup Management</h1>
            <p className="text-muted-foreground">
              Schedule and manage package pickups
            </p>
          </div>
          <Button onClick={handleSchedulePickup} data-testid="schedule-pickup-btn">
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
                  <p className="text-sm font-medium text-gray-600">Total Pickups</p>
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
                    {pickups.filter((pickup: any) => pickup.status === "scheduled").length}
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
                  <p className="text-2xl font-bold">
                    {pickups.filter((pickup: any) => pickup.status === "completed").length}
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
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">
                    {pickups.filter((pickup: any) => pickup.status === "in-progress").length}
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
          searchKeys={["id", "address.address", "contact.name"]}
          loading={loading}
          actions={[
            {
              label: "View Details",
              onClick: (pickup) => toast.info(`Viewing pickup ${pickup.id}`),
              variant: "default",
            },
            {
              label: "Update Status",
              onClick: (pickup) => toast.info(`Status update for ${pickup.id}`),
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pickups scheduled</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by scheduling your first pickup.
                </p>
                <div className="mt-6">
                  <Button onClick={handleSchedulePickup}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Pickup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}