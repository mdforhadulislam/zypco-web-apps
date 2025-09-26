"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Truck, 
  Search, 
  Plus, 
  Eye, 
  Edit,
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Package
} from "lucide-react";
import { useAuth } from "@/hooks/AuthContext";
import { PICKUP_API } from "@/components/ApiCall/url";

interface Pickup {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  address: {
    _id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
  };
  preferredDate: string;
  preferredTimeSlot: string;
  status: "pending" | "scheduled" | "picked-up" | "completed" | "cancelled";
  notes: string;
  cost: number;
  specialInstructions?: string;
  moderator?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  statusUpdatedAt?: string;
}

export default function PickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPickups, setTotalPickups] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchPickups();
  }, [currentPage, filterStatus]);

  const fetchPickups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sortBy: "preferredDate",
        sortOrder: "asc",
      });

      if (filterStatus !== "all") {
        queryParams.append("status", filterStatus);
      }

      const response = await fetch(`${PICKUP_API}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPickups(data.data);
          setTotalPickups(data.meta?.total || 0);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } else {
        console.error('Failed to fetch pickups:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching pickups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "picked-up":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "picked-up":
        return <Truck className="h-3 w-3" />;
      case "scheduled":
        return <Calendar className="h-3 w-3" />;
      case "cancelled":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Truck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Access Required
          </h3>
          <p className="text-gray-600">
            Please sign in to view pickup requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="pickups-page">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="pickups-title">
            Pickup Management
          </h1>
          <p className="text-muted-foreground">
            {user.role === "admin" || user.role === "moderator" 
              ? "Manage all pickup requests and schedules"
              : "Request and track your package pickups"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Total: {totalPickups}
          </Badge>
          <Button onClick={() => window.location.href = "/dashboard/pickups/create"} className="gap-2">
            <Plus className="h-4 w-4" />
            Request Pickup
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Pickups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex gap-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="picked-up">Picked Up</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={fetchPickups}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pickups List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="text-gray-600">Loading pickups...</p>
              </div>
            </CardContent>
          </Card>
        ) : pickups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No pickups found</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus !== "all" 
                  ? `No pickups with status "${filterStatus}" found.`
                  : user.role === "user" 
                    ? "You haven't requested any pickups yet."
                    : "No pickup requests have been made yet."
                }
              </p>
              <Button onClick={() => window.location.href = "/dashboard/pickups/create"}>
                Request Your First Pickup
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {pickups.map((pickup) => {
              const isScheduledSoon = pickup.status === "scheduled" && isUpcoming(pickup.preferredDate);
              
              return (
                <Card key={pickup._id} className={`hover:shadow-md transition-shadow ${
                  isScheduledSoon ? 'border-orange-200 bg-orange-50/30' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Pickup Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Truck className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">
                                Pickup #{pickup._id.slice(-8)}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={getStatusBadgeColor(pickup.status)}
                              >
                                {getStatusIcon(pickup.status)}
                                <span className="ml-1 capitalize">{pickup.status}</span>
                              </Badge>
                              {isScheduledSoon && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  Upcoming
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(pickup.preferredDate).toLocaleDateString()}
                                  {pickup.preferredTimeSlot && ` (${pickup.preferredTimeSlot})`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{pickup.user.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{pickup.user.phone}</span>
                              </div>
                              {pickup.cost > 0 && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  <span>{formatCurrency(pickup.cost)}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2 text-sm">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-gray-800 font-medium">{pickup.address.name}</p>
                                  <p className="text-gray-600">
                                    {pickup.address.street}, {pickup.address.city}
                                    {pickup.address.state && `, ${pickup.address.state}`}
                                    {pickup.address.zipCode && ` ${pickup.address.zipCode}`}
                                    <br />
                                    {pickup.address.country}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {pickup.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                <strong>Notes:</strong> {pickup.notes}
                              </div>
                            )}

                            {pickup.moderator && (
                              <div className="mt-2 text-xs text-gray-500">
                                Assigned to: {pickup.moderator.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.location.href = `/dashboard/pickups/${pickup._id}`}
                          className="flex-1 lg:flex-none gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        
                        {(user.role === "admin" || user.role === "moderator" || 
                          (user.role === "user" && ["pending", "scheduled"].includes(pickup.status))) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/dashboard/pickups/${pickup._id}/edit`}
                            className="flex-1 lg:flex-none gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({totalPickups} total pickups)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}