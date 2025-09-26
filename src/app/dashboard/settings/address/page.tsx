"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { addressService, UserAddress } from "@/services/addressService"; 
import { DataTable } from "@/components/ui/data-table";
import { createAddressColumns } from "@/components/addresses/AddressColumns";
import { AddressForm } from "@/components/addresses/AddressForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  MapPin, 
  Home, 
  Plus,
  Star,
  Building
} from "lucide-react";

export default function UserAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

  // Load user addresses
  const loadAddresses = async () => {
    if (!user?.phone) return;
    
    try {
      setLoading(true);
      const response = await addressService.getUserAddresses(user.phone);
      
      if (response.success && response.data) {
        setAddresses(Array.isArray(response.data) ? response.data : [response.data]);
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
  }, [user?.phone]);

  // CRUD handlers
  const handleCreateAddress = async (data: any) => {
    if (!user?.phone) return;
    
    try {
      setActionLoading(true);
      const response = await addressService.createUserAddress(user.phone, data);
      
      if (response.success) {
        toast.success("Address added successfully");
        setIsCreateModalOpen(false);
        loadAddresses();
      }
    } catch (error) {
      console.error("Failed to create address:", error);
      toast.error("Failed to create address");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAddress = async (data: any) => {
    if (!selectedAddress || !user?.phone) return;
    
    try {
      setActionLoading(true);
      const response = await addressService.updateUserAddress(
        user.phone, 
        selectedAddress._id, 
        data
      );
      
      if (response.success) {
        toast.success("Address updated successfully");
        setIsEditModalOpen(false);
        setSelectedAddress(null);
        loadAddresses();
      }
    } catch (error) {
      console.error("Failed to update address:", error);
      toast.error("Failed to update address");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!selectedAddress || !user?.phone) return;
    
    try {
      setActionLoading(true);
      const response = await addressService.deleteUserAddress(
        user.phone, 
        selectedAddress._id
      );
      
      if (response.success) {
        toast.success("Address deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedAddress(null);
        loadAddresses();
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error("Failed to delete address");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefaultAddress = async (address: UserAddress) => {
    if (!user?.phone) return;
    
    try {
      const response = await addressService.setDefaultAddress(user.phone, address._id);
      
      if (response.success) {
        toast.success("Default address updated successfully");
        loadAddresses();
      }
    } catch (error) {
      console.error("Failed to set default address:", error);
      toast.error("Failed to set default address");
    }
  };

  // Event handlers
  const handleViewAddress = (address: UserAddress) => {
    setSelectedAddress(address);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (address: UserAddress) => {
    setSelectedAddress(address);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (address: UserAddress) => {
    setSelectedAddress(address);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = () => {
    loadAddresses();
  };

  const columns = createAddressColumns({
    userRole: user?.role || "user",
    onView: handleViewAddress,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onSetDefault: handleSetDefaultAddress,
    showUserInfo: false,
  });

  const defaultAddress = addresses.find(addr => addr.isDefault);
  const nonDefaultAddresses = addresses.filter(addr => !addr.isDefault);

  if (!user) return null;

  return (
    <div className="space-y-6" data-testid="user-addresses-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="addresses-title">My Addresses</h1>
          <p className="text-muted-foreground">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          data-testid="add-address-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-addresses">{addresses.length}</div>
            <p className="text-xs text-muted-foreground">
              Saved locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Address</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="default-address-count">
              {defaultAddress ? 1 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {defaultAddress ? defaultAddress.label : "None set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Address Types</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="address-types">
              {new Set(addresses.map(addr => addr.label)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different labels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Default Address Card */}
      {defaultAddress && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span>Default Address</span>
            </CardTitle>
            <CardDescription>This address will be used by default for shipping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-lg">{defaultAddress.label}</h4>
                <div className="text-muted-foreground space-y-1">
                  <div>{defaultAddress.address.street}</div>
                  <div>
                    {defaultAddress.address.city}, {defaultAddress.address.state && `${defaultAddress.address.state}, `}
                    {defaultAddress.address.country}
                  </div>
                  {defaultAddress.address.zipCode && <div>{defaultAddress.address.zipCode}</div>}
                </div>
              </div>
              {defaultAddress.contactPerson && (
                <div>
                  <h4 className="font-semibold">Contact Person</h4>
                  <div className="text-muted-foreground space-y-1">
                    <div>{defaultAddress.contactPerson.name}</div>
                    <div>{defaultAddress.contactPerson.phone}</div>
                    {defaultAddress.contactPerson.email && (
                      <div>{defaultAddress.contactPerson.email}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditClick(defaultAddress)}
                data-testid="edit-default-address-btn"
              >
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleViewAddress(defaultAddress)}
                data-testid="view-default-address-btn"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Addresses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Addresses</CardTitle>
          <CardDescription>
            Manage your saved addresses for shipping and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={addresses}
            loading={loading}
            searchPlaceholder="Search addresses by label, city, or country..."
            onRefresh={handleRefresh}
            showSearch={true}
            showFilter={false}
            showExport={false}
            showCreateNew={false}
            emptyMessage="No addresses found. Add your first address to get started."
          />
        </CardContent>
      </Card>

      {/* Create Address Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="create-address-modal-title">Add New Address</DialogTitle>
            <DialogDescription>
              Add a new address to your address book for easy shipping
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            onSubmit={handleCreateAddress}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={actionLoading}
            showContactPerson={true}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Address Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="edit-address-modal-title">Edit Address</DialogTitle>
            <DialogDescription>
              Update your address information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedAddress && (
            <AddressForm
              address={selectedAddress}
              onSubmit={handleEditAddress}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedAddress(null);
              }}
              loading={actionLoading}
              showContactPerson={true}
            />
          )}
        </DialogContent>
      </Dialog>

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
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </h3>
                  <Badge variant="outline">{selectedAddress.address.country}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Address</h4>
                <div className="space-y-1 text-muted-foreground">
                  <div>{selectedAddress.address.street}</div>
                  <div>
                    {selectedAddress.address.city}, {selectedAddress.address.state && `${selectedAddress.address.state}, `}
                    {selectedAddress.address.country}
                  </div>
                  {selectedAddress.address.zipCode && <div>ZIP: {selectedAddress.address.zipCode}</div>}
                  {selectedAddress.address.landmark && (
                    <div className="text-sm">Landmark: {selectedAddress.address.landmark}</div>
                  )}
                </div>
              </div>

              {selectedAddress.contactPerson && (
                <div>
                  <h4 className="font-semibold mb-2">Contact Person</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div><strong>Name:</strong> {selectedAddress.contactPerson.name}</div>
                    <div><strong>Phone:</strong> {selectedAddress.contactPerson.phone}</div>
                    {selectedAddress.contactPerson.email && (
                      <div><strong>Email:</strong> {selectedAddress.contactPerson.email}</div>
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
            <AlertDialogTitle data-testid="delete-address-modal-title">Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
              {selectedAddress?.isDefault && (
                <div className="mt-2 p-2 bg-yellow-100 rounded text-yellow-800">
                  <strong>Warning:</strong> This is your default address. You'll need to set a new default after deletion.
                </div>
              )}
              {selectedAddress && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Address:</strong> {selectedAddress.label} - {selectedAddress.address.street}, {selectedAddress.address.city}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-address-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-address-btn"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Address"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}