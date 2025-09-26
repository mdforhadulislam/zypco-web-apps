"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { priceService, PriceFilters } from "@/services/priceService";
import { PriceChart, hasPermission } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { createPriceColumns } from "@/components/prices/PriceColumns";
import { PriceForm } from "@/components/prices/PriceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  Calculator, 
  DollarSign, 
  TrendingUp,
  ArrowUpDown,
  Route
} from "lucide-react";

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
      
      if (response.success && response.data) {
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

  // CRUD handlers
  const handleCreatePrice = async (data: any) => {
    try {
      setActionLoading(true);
      const response = await priceService.createPrice(data);
      
      if (response.success) {
        toast.success("Price chart created successfully");
        setIsCreateModalOpen(false);
        loadPrices();
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
        toast.success(`Price chart ${!price.isActive ? 'activated' : 'deactivated'} successfully`);
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
    // Open price calculator modal (can be implemented later)
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

  if (!user) return null;

  return (
    <div className="space-y-6" data-testid="rate-charts-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="rate-charts-title">Rate Charts</h1>
          <p className="text-muted-foreground">
            Manage shipping rates and pricing configurations
          </p>
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
            <div className="text-2xl font-bold" data-testid="total-routes">{prices.length}</div>
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
              {prices.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {prices.filter(p => !p.isActive).length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Types</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="service-types">
              {new Set(prices.map(p => p.serviceType)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different service levels
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
              ${prices.length > 0 
                ? (prices.reduce((sum, p) => sum + Math.min(...p.weightTiers.map(t => t.basePrice)), 0) / prices.length).toFixed(2)
                : '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average starting price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Price Charts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Price Charts</CardTitle>
          <CardDescription>
            Configure shipping rates for different routes and service types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={prices}
            loading={loading}
            searchPlaceholder="Search by route, service type, or country..."
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            onCreateNew={hasPermission(user.role, "orders", "create") ? () => setIsCreateModalOpen(true) : undefined}
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
            <DialogDescription>
              Set up pricing for a specific shipping route and service type
            </DialogDescription>
          </DialogHeader>
          <PriceForm
            onSubmit={handleCreatePrice}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={actionLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Price Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="edit-price-modal-title">Edit Price Chart</DialogTitle>
            <DialogDescription>
              Update pricing information and weight tiers
            </DialogDescription>
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle data-testid="view-price-modal-title">Price Chart Details</DialogTitle>
          </DialogHeader>
          {selectedPrice && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedPrice.fromCountry} → {selectedPrice.toCountry}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge>{selectedPrice.serviceType}</Badge>
                    <Badge variant={selectedPrice.isActive ? "default" : "secondary"}>
                      {selectedPrice.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Weight Tiers */}
              <div>
                <h4 className="font-semibold mb-3">Weight Tiers</h4>
                <div className="space-y-2">
                  {selectedPrice.weightTiers.map((tier, index) => (
                    <div key={index} className="p-3 bg-muted rounded grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{tier.minWeight} - {tier.maxWeight} kg</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Base Price</div>
                        <div className="font-medium">${tier.basePrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Price/KG</div>
                        <div className="font-medium">${tier.pricePerKg.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total (max weight)</div>
                        <div className="font-medium">
                          ${(tier.basePrice + (tier.maxWeight * tier.pricePerKg)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Charges */}
              {Object.values(selectedPrice.additionalCharges).some(charge => charge && charge > 0) && (
                <div>
                  <h4 className="font-semibold mb-3">Additional Charges</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedPrice.additionalCharges.fuelSurcharge && selectedPrice.additionalCharges.fuelSurcharge > 0 && (
                      <div className="flex justify-between">
                        <span>Fuel Surcharge:</span>
                        <span className="font-medium">${selectedPrice.additionalCharges.fuelSurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedPrice.additionalCharges.remoteSurcharge && selectedPrice.additionalCharges.remoteSurcharge > 0 && (
                      <div className="flex justify-between">
                        <span>Remote Area Surcharge:</span>
                        <span className="font-medium">${selectedPrice.additionalCharges.remoteSurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedPrice.additionalCharges.securitySurcharge && selectedPrice.additionalCharges.securitySurcharge > 0 && (
                      <div className="flex justify-between">
                        <span>Security Surcharge:</span>
                        <span className="font-medium">${selectedPrice.additionalCharges.securitySurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedPrice.additionalCharges.customsClearance && selectedPrice.additionalCharges.customsClearance > 0 && (
                      <div className="flex justify-between">
                        <span>Customs Clearance:</span>
                        <span className="font-medium">${selectedPrice.additionalCharges.customsClearance.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              Are you sure you want to delete this price chart? This action cannot be undone.
              Orders using this pricing configuration may be affected.
              {selectedPrice && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Route:</strong> {selectedPrice.fromCountry} → {selectedPrice.toCountry} ({selectedPrice.serviceType})
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