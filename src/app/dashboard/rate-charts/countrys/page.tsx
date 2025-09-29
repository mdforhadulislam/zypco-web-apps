"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { countryService, CountryFilters } from "@/services/countryService";
import { Country, hasPermission } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { createCountryColumns } from "@/components/countries/CountryColumns";
import { CountryForm } from "@/components/countries/CountryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  Globe, 
  MapPin, 
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react";

interface CountryStats {
  total: number;
  active: number;
  inactive: number;
  regions: { [key: string]: number };
  currencies: { [key: string]: number };
}

export default function CountriesPage() {
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [stats, setStats] = useState<CountryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  
  // Filter and pagination
  const [filters, setFilters] = useState<CountryFilters>({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load countries and stats
  const loadCountries = async () => {
    try {
      setLoading(true);
      const response = await countryService.getCountries(filters);
      
      if (response.status==200 && response.data) {
        setCountries(Array.isArray(response.data) ? response.data : [response.data]);
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
      console.error("Failed to load countries:", error);
      toast.error("Failed to load countries");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await countryService.getCountryStats();
      if (response.status==200 && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadCountries();
    if (user?.role === "admin" || user?.role === "moderator") {
      loadStats();
    }
  }, [filters, user?.role]);

  // CRUD handlers
  const handleCreateCountry = async (data: any) => {
    try {
      setActionLoading(true);
      const response = await countryService.createCountry(data);
      
      if (response.status==200) {
        toast.success("Country created successfully");
        setIsCreateModalOpen(false);
        loadCountries();
      }
    } catch (error) {
      console.error("Failed to create country:", error);
      toast.error("Failed to create country");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCountry = async (data: any) => {
    if (!selectedCountry) return;
    
    try {
      setActionLoading(true);
      const response = await countryService.updateCountry(selectedCountry._id, data);
      
      if (response.status==200) {
        toast.success("Country updated successfully");
        setIsEditModalOpen(false);
        setSelectedCountry(null);
        loadCountries();
      }
    } catch (error) {
      console.error("Failed to update country:", error);
      toast.error("Failed to update country");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCountry = async () => {
    if (!selectedCountry) return;
    
    try {
      setActionLoading(true);
      const response = await countryService.deleteCountry(selectedCountry._id);
      
      if (response.status==200) {
        toast.success("Country deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedCountry(null);
        loadCountries();
      }
    } catch (error) {
      console.error("Failed to delete country:", error);
      toast.error("Failed to delete country");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (country: Country) => {
    try {
      const response = await countryService.toggleCountryStatus(country._id, !country.isActive);
      
      if (response.status==200) {
        toast.success(`Country ${!country.isActive ? 'activated' : 'deactivated'} successfully`);
        loadCountries();
      }
    } catch (error) {
      console.error("Failed to toggle country status:", error);
      toast.error("Failed to toggle country status");
    }
  };

  // Event handlers
  const handleViewCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (country: Country) => {
    setSelectedCountry(country);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (country: Country) => {
    setSelectedCountry(country);
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
    loadCountries();
    if (user?.role === "admin" || user?.role === "moderator") {
      loadStats();
    }
  };

  const columns = createCountryColumns({
    userRole: user?.role || "user",
    onView: handleViewCountry,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onToggleStatus: handleToggleStatus,
  });

  if (!user) return null;

  return (
    <div className="space-y-6" data-testid="countries-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="countries-title">Countries</h1>
          <p className="text-muted-foreground">
            Manage countries and their shipping configurations
          </p>
        </div>
      </div>

      {/* Stats Cards - Only for admin/moderator */}
      {(user.role === "admin" || user.role === "moderator") && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Countries</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-countries">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Shipping destinations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Countries</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="active-countries">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.inactive} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regions</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-regions">
                {Object.keys(stats.regions).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Geographic coverage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currencies</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-currencies">
                {Object.keys(stats.currencies).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported currencies
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Countries Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Countries</CardTitle>
          <CardDescription>
            Manage shipping destinations and delivery configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={countries}
            loading={loading}
            searchPlaceholder="Search countries by name, code, or region..."
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            onCreateNew={hasPermission(user.role, "orders", "create") ? () => setIsCreateModalOpen(true) : undefined}
            showCreateNew={hasPermission(user.role, "orders", "create")}
            createNewLabel="Add Country"
            emptyMessage="No countries found"
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

      {/* Create Country Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="create-country-modal-title">Add New Country</DialogTitle>
            <DialogDescription>
              Add a new shipping destination with delivery configurations
            </DialogDescription>
          </DialogHeader>
          <CountryForm
            onSubmit={handleCreateCountry}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={actionLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Country Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="edit-country-modal-title">Edit Country</DialogTitle>
            <DialogDescription>
              Update country information and delivery settings
            </DialogDescription>
          </DialogHeader>
          {selectedCountry && (
            <CountryForm
              country={selectedCountry}
              onSubmit={handleEditCountry}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedCountry(null);
              }}
              loading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Country Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle data-testid="view-country-modal-title">Country Details</DialogTitle>
          
          </DialogHeader>
          {selectedCountry && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Globe className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-xl font-semibold" data-testid="view-country-name">
                    {selectedCountry.name}
                  </h3>
                  <p className="text-muted-foreground" data-testid="view-country-code">
                    Country Code: {selectedCountry.code}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Region</h4>
                  <p data-testid="view-country-region">{selectedCountry.region}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Currency</h4>
                  <p data-testid="view-country-currency">{selectedCountry?.currency}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <Badge variant={selectedCountry.isActive ? "default" : "secondary"}>
                    {selectedCountry.isActive ? "Active" : "Inactive"}
                  </Badge>
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
            <AlertDialogTitle data-testid="delete-country-modal-title">Delete Country</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this country? This action cannot be undone.
              All related shipping routes and price configurations will be affected.
              {selectedCountry && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Country:</strong> {selectedCountry.name} ({selectedCountry.code})
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-country-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCountry}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-country-btn"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Country"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}