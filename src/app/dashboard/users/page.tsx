"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { userService, UserFilters } from "@/services/userService";
import { User, hasPermission } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { createUserColumns } from "@/components/users/UserColumns";
import { UserForm } from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Loader2, 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldCheck,
  TrendingUp,
  Clock
} from "lucide-react";

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
  adminCount: number;
  moderatorCount: number;
  userCount: number;
  todayRegistrations: number;
  weeklyRegistrations: number;
  monthlyRegistrations: number;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Filter and pagination
  const [filters, setFilters] = useState<UserFilters>({
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

  // Load users and stats
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(filters);
      
      if (response.success && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : [response.data]);
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
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await userService.getUserStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    if (currentUser?.role === "admin" || currentUser?.role === "moderator") {
      loadStats();
    }
  }, [filters, currentUser?.role]);

  // CRUD handlers
  const handleCreateUser = async (data: any) => {
    try {
      setActionLoading(true);
      const response = await userService.createUser(data);
      
      if (response.success) {
        toast.success("User created successfully");
        setIsCreateModalOpen(false);
        loadUsers();
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (data: any) => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      const response = await userService.updateUser(selectedUser.phone, data);
      
      if (response.success) {
        toast.success("User updated successfully");
        setIsEditModalOpen(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      const response = await userService.deleteUser(selectedUser.phone);
      
      if (response.success) {
        toast.success("User deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const response = await userService.toggleUserStatus(user.phone, !user.isActive);
      
      if (response.success) {
        toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
        loadUsers();
      }
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      toast.error("Failed to toggle user status");
    }
  };

  const handleVerifyUser = async (user: User) => {
    try {
      const response = await userService.verifyUser(user.phone);
      
      if (response.success) {
        toast.success("User verified successfully");
        loadUsers();
      }
    } catch (error) {
      console.error("Failed to verify user:", error);
      toast.error("Failed to verify user");
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      const response = await userService.resetUserPassword(user.phone);
      
      if (response.success) {
        toast.success("Password reset email sent successfully");
      }
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error("Failed to reset password");
    }
  };

  // Event handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleViewPermissions = (user: User) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
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
    loadUsers();
    if (currentUser?.role === "admin" || currentUser?.role === "moderator") {
      loadStats();
    }
  };

  const handleExport = async () => {
    try {
      toast.info("Exporting users...");
      const blob = await userService.exportUsers(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'users.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Users exported successfully");
    } catch (error) {
      console.error("Failed to export users:", error);
      toast.error("Failed to export users");
    }
  };

  // Bulk actions
  const bulkActions = [];
  if (hasPermission(currentUser?.role || "user", "users", "update")) {
    bulkActions.push({
      label: "Activate Selected",
      onClick: (selectedUsers: User[]) => {
        toast.info(`Selected ${selectedUsers.length} users for activation`);
      },
    });
    bulkActions.push({
      label: "Deactivate Selected",
      variant: "outline" as const,
      onClick: (selectedUsers: User[]) => {
        toast.info(`Selected ${selectedUsers.length} users for deactivation`);
      },
    });
  }

  const columns = createUserColumns({
    userRole: currentUser?.role || "user",
    onView: handleViewUser,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onToggleStatus: handleToggleUserStatus,
    onVerifyUser: handleVerifyUser,
    onResetPassword: handleResetPassword,
    onViewPermissions: handleViewPermissions,
  });

  if (!currentUser) return null;

  return (
    <div className="space-y-6" data-testid="users-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="users-title">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards - Only for admin/moderator */}
      {(currentUser.role === "admin" || currentUser.role === "moderator") && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-users">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {stats.todayRegistrations} registered today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="active-users">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.inactive} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="verified-users">
                {stats.verified}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.unverified} pending verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="role-distribution">{stats.adminCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.moderatorCount} mods, {stats.userCount} users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            searchPlaceholder="Search users by name, email, or phone..."
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onCreateNew={hasPermission(currentUser.role, "users", "create") ? () => setIsCreateModalOpen(true) : undefined}
            showCreateNew={hasPermission(currentUser.role, "users", "create")}
            createNewLabel="Create User"
            emptyMessage="No users found"
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              onPageChange: handlePageChange,
              onLimitChange: handleLimitChange,
            }}
            bulkActions={bulkActions}
          />
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="create-user-modal-title">Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with specified role and permissions
            </DialogDescription>
          </DialogHeader>
          <UserForm
            currentUserRole={currentUser.role}
            onSubmit={handleCreateUser}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={actionLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="edit-user-modal-title">Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              currentUserRole={currentUser.role}
              onSubmit={handleEditUser}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
              }}
              loading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle data-testid="view-user-modal-title">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold" data-testid="view-user-name">
                    {selectedUser.name}
                  </h3>
                  <p className="text-muted-foreground" data-testid="view-user-email">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p data-testid="view-user-phone">{selectedUser.phone}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Role</h4>
                  <Badge data-testid="view-user-role">{selectedUser.role}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <div className="flex space-x-2">
                    <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant={selectedUser.isVerified ? "default" : "outline"}>
                      {selectedUser.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Last Login</h4>
                  <p data-testid="view-user-last-login">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "Never"}
                  </p>
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
            <AlertDialogTitle data-testid="delete-user-modal-title">Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              All user data, orders, and associated information will be permanently removed.
              {selectedUser && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>User:</strong> {selectedUser.name} ({selectedUser.email})
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-user-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-user-btn"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}