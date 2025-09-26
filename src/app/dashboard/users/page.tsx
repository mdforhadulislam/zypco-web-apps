"use client";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/Dashboard/DataTable";
import { RoleGuard } from "@/middleware/roleGuard";
import { UserForm } from "@/components/forms/UserForm";
import { UserService } from "@/services/dashboardService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get("role");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (roleFilter) {
        params.role = roleFilter;
      }

      const response = await UserService.getUsers(params);
      if (response.success) {
        setUsers(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleView = (user: any) => {
    setSelectedUser(user);
    setDialogMode("view");
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`Are you sure you want to delete user ${user.name}?`)) {
      return;
    }

    try {
      const response = await UserService.deleteUser(user.phone);
      if (response.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchUsers();
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
    },
    {
      key: "role",
      label: "Role",
      render: (value: string) => (
        <Badge 
          variant={value === "admin" ? "default" : value === "moderator" ? "secondary" : "outline"}
          className="capitalize"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "isVerified",
      label: "Verified",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const UserDetails = ({ user }: { user: any }) => (
    <div className="space-y-4" data-testid="user-details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="font-medium">{user.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Phone</label>
          <p className="font-medium">{user.phone}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Role</label>
          <Badge 
            variant={user.role === "admin" ? "default" : user.role === "moderator" ? "secondary" : "outline"}
            className="capitalize"
          >
            {user.role}
          </Badge>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <div className="space-y-1">
            <Badge variant={user.isActive ? "default" : "destructive"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={user.isVerified ? "default" : "secondary"} className="ml-2">
              {user.isVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Profile Completion</label>
          <p className="font-medium">{user.profileCompletion?.percentage || 0}%</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Created At</label>
          <p className="font-medium">{new Date(user.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Last Login</label>
          <p className="font-medium">
            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6" data-testid="users-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions
              {roleFilter && ` - Filtered by role: ${roleFilter}`}
            </p>
          </div>
          <Button onClick={handleCreate} data-testid="create-user-btn">
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>

        <DataTable
          title="Users"
          data={users}
          columns={columns}
          searchKeys={["name", "email", "phone"]}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          loading={loading}
          actions={[
            {
              label: "View Details",
              onClick: handleView,
              variant: "default",
            },
            {
              label: "Edit User",
              onClick: handleEdit,
              variant: "default",
            },
            {
              label: "Delete User",
              onClick: handleDelete,
              variant: "destructive",
              condition: (user) => user.role !== "admin", // Prevent deleting admin users
            },
          ]}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "create" && "Create New User"}
                {dialogMode === "edit" && "Edit User"}
                {dialogMode === "view" && "User Details"}
              </DialogTitle>
            </DialogHeader>
            {dialogMode === "view" && selectedUser ? (
              <UserDetails user={selectedUser} />
            ) : (
              <UserForm
                user={selectedUser}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsDialogOpen(false)}
                isEdit={dialogMode === "edit"}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}