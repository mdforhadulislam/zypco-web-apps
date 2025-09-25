"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/AuthContext";
import { useUsers, useApiMutation } from "@/hooks/UserApi";
import { ACCOUNTS_API } from "@/components/ApiCall/url";
import {
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Build filter params
  const filterParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(roleFilter !== "all" && { role: roleFilter }),
    ...(statusFilter === "active" && { isActive: true }),
    ...(statusFilter === "inactive" && { isActive: false }),
    ...(statusFilter === "verified" && { isVerified: true }),
    ...(statusFilter === "unverified" && { isVerified: false }),
  };

  const {
    data: users,
    meta,
    isLoading,
    error,
    mutate: refreshUsers,
  } = useUsers(filterParams);

  const { mutateApi } = useApiMutation();

  // Check if current user can manage users
  const canManageUsers = currentUser?.role === "admin";

  const handleUserAction = async (userId: string, action: string) => {
    const user = users?.find((u: User) => u._id === userId);
    if (!user) return;

    let endpoint = `${ACCOUNTS_API}/${userId}`;
    let method: "PUT" | "DELETE" = "PUT";
    let data: any = {};
    let successMessage = "";

    switch (action) {
      case "activate":
        data = { isActive: true };
        successMessage = `User ${user.name} activated successfully`;
        break;
      case "deactivate":
        data = { isActive: false };
        successMessage = `User ${user.name} deactivated successfully`;
        break;
      case "verify":
        data = { isVerified: true };
        successMessage = `User ${user.name} verified successfully`;
        break;
      case "delete":
        method = "DELETE";
        successMessage = `User ${user.name} deleted successfully`;
        break;
      case "promote":
        data = { role: user.role === "user" ? "moderator" : "admin" };
        successMessage = `User ${user.name} promoted to ${data.role}`;
        break;
      case "demote":
        data = { role: user.role === "admin" ? "moderator" : "user" };
        successMessage = `User ${user.name} demoted to ${data.role}`;
        break;
      default:
        return;
    }

    const result = await mutateApi(endpoint, {
      method,
      data: method === "PUT" ? data : undefined,
      successMessage,
      onSuccess: () => {
        refreshUsers();
        setShowUserDialog(false);
      },
    });

    return result;
  };

  const handleCreateUser = async (userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
  }) => {
    const result = await mutateApi(ACCOUNTS_API, {
      method: "POST",
      data: userData,
      successMessage: "User created successfully",
      onSuccess: () => {
        refreshUsers();
        setShowCreateDialog(false);
      },
    });

    return result;
  };

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <UserX className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Access Denied</h3>
          <p className="mt-2 text-gray-600">
            You don't have permission to manage users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="users-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          data-testid="create-user-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger data-testid="role-filter">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="moderator">Moderators</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                  setPage(1);
                }}
                data-testid="clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({meta?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load users</p>
              <Button onClick={() => refreshUsers()} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Table data-testid="users-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: User) => (
                    <TableRow key={user._id} data-testid={`user-row-${user._id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">{user.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "destructive"
                              : user.role === "moderator"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isVerified ? "default" : "secondary"}>
                          {user.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDialog(true);
                            }}
                            data-testid={`view-user-${user._id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user._id !== currentUser?.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user._id, user.isActive ? "deactivate" : "activate")}
                                data-testid={`toggle-user-status-${user._id}`}
                              >
                                {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user._id, "delete")}
                                className="text-red-600 hover:text-red-700"
                                data-testid={`delete-user-${user._id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((meta.page - 1) * 20) + 1} to {Math.min(meta.page * 20, meta.total)} of {meta.total} users
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      data-testid="prev-page"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage(page + 1)}
                      data-testid="next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-lg" data-testid="user-details-dialog">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <span className="text-xl font-medium">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <p className="text-gray-500">{selectedUser.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <Badge
                    variant={
                      selectedUser.role === "admin"
                        ? "destructive"
                        : selectedUser.role === "moderator"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedUser.isActive ? "default" : "destructive"}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label>Verification</Label>
                  <Badge variant={selectedUser.isVerified ? "default" : "secondary"}>
                    {selectedUser.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedUser._id !== currentUser?.id && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUserAction(selectedUser._id, selectedUser.isActive ? "deactivate" : "activate")}
                  >
                    {selectedUser.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  {!selectedUser.isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserAction(selectedUser._id, "verify")}
                    >
                      Verify User
                    </Button>
                  )}
                  {selectedUser.role !== "admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserAction(selectedUser._id, "promote")}
                    >
                      Promote
                    </Button>
                  )}
                  {selectedUser.role !== "user" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserAction(selectedUser._id, "demote")}
                    >
                      Demote
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleUserAction(selectedUser._id, "delete")}
                  >
                    Delete User
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}

// Create User Dialog Component
function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userData: any) => Promise<any>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "user",
        password: "",
      });
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="create-user-dialog">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account with basic information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter full name"
              required
              data-testid="create-user-name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter email address"
              required
              data-testid="create-user-email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Enter phone number"
              required
              data-testid="create-user-phone"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger data-testid="create-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Enter password"
              required
              data-testid="create-user-password"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="submit-create-user">
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}