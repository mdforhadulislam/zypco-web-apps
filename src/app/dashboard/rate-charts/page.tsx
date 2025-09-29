"use client";

import { createPriceColumns } from "@/components/prices/PriceColumns";
import { PriceForm } from "@/components/prices/PriceForm";
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
import { useAuth } from "@/hooks/AuthContext";
import { PriceFilters, priceService } from "@/services/priceService";
import { PriceChart, hasPermission } from "@/types";
import {
  ArrowUpDown,
  DollarSign,
  Loader2,
  Route,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RateChartsPage() {
  const { user } = useAuth();
  const [prices, setPrices] = useState<PriceChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceChart | null>(null);

  // Filter and pagination
  const [filters, setFilters] = useState<PriceFilters>({
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

  // Load prices
  const loadPrices = async () => {
    try {
      setLoading(true);
      const response = await priceService.getPrices(filters);

      if (response.status == 200 && response.data) {
        setPrices(Array.isArray(response.data) ? response.data : [response.data]);
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
      console.error("Failed to load price charts:", error);
      toast.error("Failed to load price charts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [filters]);

  // CRUD handlers (unchanged; they call your priceService)
  const handleCreatePrice = async (data: any) => {
    try {
      setActionLoading(true);
      const response = await priceService.createPrice(data);

      if (response.status == 200) {
        setIsCreateModalOpen(false);
        loadPrices();
        toast.success("Price chart created successfully");
      }
    } catch (error) {
      console.error("Failed to create price chart:", error);
      toast.error("Failed to create price chart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPrice = async (data: any) => {
    if (!selectedPrice) return;

    try {
      setActionLoading(true);
      const response = await priceService.updatePrice(selectedPrice._id, data);

      if (response.success) {
        toast.success("Price chart updated successfully");
        setIsEditModalOpen(false);
        setSelectedPrice(null);
        loadPrices();
      }
    } catch (error) {
      console.error("Failed to update price chart:", error);
      toast.error("Failed to update price chart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePrice = async () => {
    if (!selectedPrice) return;

    try {
      setActionLoading(true);
      const response = await priceService.deletePrice(selectedPrice._id);

      if (response.success) {
        toast.success("Price chart deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedPrice(null);
        loadPrices();
      }
    } catch (error) {
      console.error("Failed to delete price chart:", error);
      toast.error("Failed to delete price chart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (price: PriceChart) => {
    try {
      const response = await priceService.togglePriceStatus(price._id, !price.isActive);

      if (response.success) {
        toast.success(`Price chart ${!price.isActive ? "activated" : "deactivated"} successfully`);
        loadPrices();
      }
    } catch (error) {
      console.error("Failed to toggle price status:", error);
      toast.error("Failed to toggle price status");
    }
  };

  // Event handlers
  const handleViewPrice = (price: PriceChart) => {
    setSelectedPrice(price);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (price: PriceChart) => {
    setSelectedPrice(price);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (price: PriceChart) => {
    setSelectedPrice(price);
    setIsDeleteModalOpen(true);
  };

  const handleCalculateClick = (price: PriceChart) => {
    toast.info("Price calculator coming soon!");
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
    loadPrices();
  };

  const columns = createPriceColumns({
    userRole: user?.role || "user",
    onView: handleViewPrice,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onToggleStatus: handleToggleStatus,
    onCalculate: handleCalculateClick,
  });

  // helper to safely compute average of min price per route
  const computeAvgMinBasePrice = () => {
    if (!prices || prices.length === 0) return "0.00";

    const totalMin = prices.reduce((sum, p: any) => {
      // gather all numeric values from each rate.price
      const allPrices: number[] = (p.rate || []).flatMap((r: any) =>
        Object.values(r.price || {}).filter((v) => typeof v === "number")
      );
      const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
      return sum + minPrice;
    }, 0);

    return (totalMin / prices.length).toFixed(2);
  };

  if (!user) return null;

  return (
    <div className="space-y-6" data-testid="rate-charts-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="rate-charts-title">
            Rate Charts
          </h1>
          <p className="text-muted-foreground">Manage shipping rates and pricing configurations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-routes">
              {prices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Active price configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="active-routes">
              {prices.filter((p: any) => p.to?.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {prices.filter((p: any) => !p.to?.isActive).length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Base Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="avg-base-price">
              ${computeAvgMinBasePrice()}
            </div>
            <p className="text-xs text-muted-foreground">Average starting price</p>
          </CardContent>
        </Card>
      </div>

      {/* Price Charts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Price Charts</CardTitle>
          <CardDescription>Configure shipping rates for different routes and service types</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={prices}
            loading={loading}
            searchPlaceholder="Search by route, service type, or country..."
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            onCreateNew={
              hasPermission(user.role, "orders", "create") ? () => setIsCreateModalOpen(true) : undefined
            }
            showCreateNew={hasPermission(user.role, "orders", "create")}
            createNewLabel="Create Price Chart"
            emptyMessage="No price charts found"
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              onPageChange: handlePageChange,
              onLimitChange: handleLimitChange,
            }}
          />
        </CardContent>
      </Card>

      {/* Create Price Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="create-price-modal-title">Create New Price Chart</DialogTitle>
            <DialogDescription>Set up pricing for a specific shipping route and service type</DialogDescription>
          </DialogHeader>
          <PriceForm onSubmit={handleCreatePrice} onCancel={() => setIsCreateModalOpen(false)} loading={actionLoading} />
        </DialogContent>
      </Dialog>

      {/* Edit Price Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="edit-price-modal-title">Edit Price Chart</DialogTitle>
            <DialogDescription>Update pricing information and weight tiers</DialogDescription>
          </DialogHeader>
          {selectedPrice && (
            <PriceForm
              price={selectedPrice}
              onSubmit={handleEditPrice}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedPrice(null);
              }}
              loading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Price Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="view-price-modal-title">Price Chart Details</DialogTitle>
          </DialogHeader>

          {selectedPrice && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedPrice.from?.name} → {selectedPrice.to?.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={selectedPrice?.to?.isActive ? "default" : "secondary"}>
                      {selectedPrice?.to?.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Render rate-wise prices (from API response) */}
              <div>
                <h4 className="font-semibold mb-3">Rates</h4>
                <div className="space-y-4">
                  {(selectedPrice.rate || []).map((r: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Profit: {r.profitPercentage ?? 0}% • Gift: {r.gift ?? 0} • Fuel: {r.fuel ?? 0}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2  gap-2 text-sm">
                        {Object.entries(r.price || {}).map(([k, v]) => (
                          <div key={k} className="p-2 bg-white/5 rounded flex items-center justify-between">
                            
                            <div className="truncate"> {k == "gm500"
                                  ? "500 GM"
                                  : k == "gm1000"
                                  ? "1000 GM"
                                  : k == "gm1500"
                                  ? "1500 GM"
                                  : k == "gm2000"
                                  ? "2000 GM"
                                  : k == "gm2500"
                                  ? "2500 GM"
                                  : k == "gm3000"
                                  ? "3000 GM"
                                  : k == "gm3500"
                                  ? "3500 GM"
                                  : k == "gm4000"
                                  ? "4000 GM"
                                  : k == "gm4500"
                                  ? "4500 GM"
                                  : k == "gm5000"
                                  ? "5000 GM"
                                  : k == "gm5500"
                                  ? "5500 GM"
                                  : k == "kg6to10"
                                  ? "6 TO 10 PER KG"
                                  : k == "kg11to20"
                                  ? "11 TO 20 PER KG"
                                  : k == "kg21to30"
                                  ? "21 TO 30 PER KG"
                                  : k == "kg31to40"
                                  ? "31 TO 40 PER KG"
                                  : k == "kg41to50"
                                  ? "41 TO 50 PER KG"
                                  : k == "kg51to80"
                                  ? "51 TO 80 PER KG"
                                  : k == "kg81to100"
                                  ? "81 TO 100 PER KG"
                                  : k == "kg101to500"
                                  ? "101 TO 500 PER KG"
                                  : k == "kg501to1000"
                                  ? "501 TO 1000 PER KG"
                                  : ""}</div>
                            <div className="font-medium">${Number(v * (1 + r.fuel / 100) * (1 + r.profitPercentage / 100)).toFixed(3)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
            <AlertDialogTitle data-testid="delete-price-modal-title">Delete Price Chart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this price chart? This action cannot be undone. Orders using this pricing configuration may be affected.
              {selectedPrice && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Route:</strong> {selectedPrice.from?.name} → {selectedPrice.to?.name}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-price-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrice}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-price-btn"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Price Chart"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}