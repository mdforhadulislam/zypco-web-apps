"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { addressService, AddressFilters } from "@/services/addressService";
import { UserAddress, hasPermission } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { createAddressColumns } from "@/components/addresses/AddressColumns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  MapPin, 
  Building, 
  Globe,
  Users,
  TrendingUp
} from "lucide-react";

export default function AddressBookPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Filter and pagination
  const [filters, setFilters] = useState<AddressFilters>({
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

  // Load addresses
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAllAddresses(filters);
      
      if (response.status==200   && response.data) {
        setAddresses(Array.isArray(response.data) ? response.data : [response.data]);
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
      console.error("Failed to load addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [filters]);

  // Event handlers
  const handleViewAddress = (address: UserAddress) => {
    setSelectedAddress(address);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (address: UserAddress) => {
    // For global address book, editing would require user context
    toast.info("Contact the user to modify their address");
  };

  const handleDeleteClick = (address: UserAddress) => {
    // For global address book, deletion would require admin privileges
    toast.info("Address deletion requires user consent");
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
    loadAddresses();
  };

  const columns = createAddressColumns({
    userRole: user?.role || "user",
    onView: handleViewAddress,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    showUserInfo: true, // Show user information in global address book
  });

  // Calculate stats
  const uniqueCountries = new Set(addresses?.map(addr => addr?.address?.country)).size ?? 0;
  const uniqueCities = new Set(addresses?.map(addr => addr?.address?.city)).size?? 0;
  const defaultAddresses = addresses?.filter(addr => addr?.isDefault).length?? 0;

  if (!user) return null;

  // Check permissions for viewing global address book
  if (!hasPermission(user.role, "users", "read")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">
                You don{"'"}t have permission to view the global address book.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="address-book-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="address-book-title">Address Book</h1>
          <p className="text-muted-foreground">
            Global address directory for all users
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-addresses">{addresses.length}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="unique-countries">{uniqueCountries}</div>
            <p className="text-xs text-muted-foreground">
              Global coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="unique-cities">{uniqueCities}</div>
            <p className="text-xs text-muted-foreground">
              Different locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Addresses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="default-addresses">{defaultAddresses}</div>
            <p className="text-xs text-muted-foreground">
              User defaults set
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Address Book Table */}
      <Card>
        <CardHeader>
          <CardTitle>Global Address Directory</CardTitle>
          <CardDescription>
            View and manage addresses across all user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={addresses}
            loading={loading}
            searchPlaceholder="Search addresses by user, label, city, or country..."
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            showCreateNew={false}
            showExport={true}
            emptyMessage="No addresses found in the system"
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

      {/* View Address Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle data-testid="view-address-modal-title">Address Details</DialogTitle>
          </DialogHeader>
          {selectedAddress && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold flex items-center space-x-2">
                    <span>{selectedAddress.label}</span>
                    {selectedAddress.isDefault && (
                      <Badge className="bg-yellow-100 text-yellow-800">Default</Badge>
                    )}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedAddress.phone && `User: ${selectedAddress?.phone}`}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Address</h4>
                <div className="space-y-1 text-muted-foreground">
                  <div>{selectedAddress?.address?.street}</div>
                  <div>
                    {selectedAddress?.address?.city}, {selectedAddress?.address?.state && `${selectedAddress?.address?.state}, `}
                    {selectedAddress?.address?.country}
                  </div>
                  {selectedAddress?.address?.zipCode && <div>ZIP: {selectedAddress?.address?.zipCode}</div>}
                  {selectedAddress?.address?.landmark && (
                    <div className="text-sm">Landmark: {selectedAddress?.address?.landmark}</div>
                  )}
                </div>
              </div>

              {selectedAddress.contactPerson && (
                <div>
                  <h4 className="font-semibold mb-2">Contact Person</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div><strong>Name:</strong> {selectedAddress.contactPerson?.name}</div>
                    <div><strong>Phone:</strong> {selectedAddress.contactPerson?.phone}</div>
                    {selectedAddress.contactPerson?.email && (
                      <div><strong>Email:</strong> {selectedAddress.contactPerson?.email}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                <div>Created: {new Date(selectedAddress.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(selectedAddress.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}