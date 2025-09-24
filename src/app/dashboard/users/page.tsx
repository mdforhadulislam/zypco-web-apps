"use client";
import { ACCOUNT_API } from "@/components/ApiCall/url";
import { DataTable } from "@/components/Dashboard/DataTable";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/AuthContext";
import { useApi } from "@/hooks/UserApi";
import { Crown, Plus, Shield, User, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "moderator" | "admin";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
}

const DashboardUsers = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: users,
    refetch,
    postData,
    updateData,
    deleteData,
  } = useApi<UserAccount[]>(ACCOUNT_API);

  // Only admin can access user management
  if (user?.role !== "admin") {
    return (
      <div
        className="flex items-center justify-center h-96"
        data-testid="access-denied"
      >
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You don{"'"}t have permission to access user management.
          </p>
        </div>
      </div>
    );
  }

  const usersData = users || [];

  // Calculate stats
  const stats = {
    total: usersData.length,
    admins: usersData.filter((u) => u.role === "admin").length,
    moderators: usersData.filter((u) => u.role === "moderator").length,
    regularUsers: usersData.filter((u) => u.role === "user").length,
    active: usersData.filter((u) => u.status === "active").length,
    inactive: usersData.filter((u) => u.status === "inactive").length,
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    moderator: "bg-blue-100 text-blue-800",
    user: "bg-green-100 text-green-800",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
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
        <Badge className={roleColors[value] || "bg-gray-100 text-gray-800"}>
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge className={statusColors[value] || "bg-gray-100 text-gray-800"}>
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (value?: string) =>
        value ? new Date(value).toLocaleDateString() : "Never",
    },
  ];

  const handleCreateUser = async (formData: FormData) => {
    try {
      const userData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        role: formData.get("role"),
        status: "active",
        createdAt: new Date().toISOString(),
      };

      await postData(userData);
      toast.success("User created successfully");
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  const handleEditUser = async (formData: FormData) => {
    if (!selectedUser) return;

    try {
      const updatedData = {
        ...selectedUser,
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        role: formData.get("role"),
        status: formData.get("status"),
      };

      await updateData(updatedData);
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (userToDelete: UserAccount) => {
    if (userToDelete.id === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (confirm(`Are you sure you want to delete user ${userToDelete.name}?`)) {
      try {
        await deleteData();
        toast.success("User deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleChangeRole = async (
    userToUpdate: UserAccount,
    newRole: string
  ) => {
    if (userToUpdate.id === user?.id && newRole !== "admin") {
      toast.error("You cannot change your own admin role");
      return;
    }

    try {
      const updatedUser = { ...userToUpdate, role: newRole };
      await updateData(updatedUser);
      toast.success(`User role updated to ${newRole}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleChangeStatus = async (
    userToUpdate: UserAccount,
    newStatus: string
  ) => {
    if (userToUpdate.id === user?.id && newStatus !== "active") {
      toast.error("You cannot suspend your own account");
      return;
    }

    try {
      const updatedUser = { ...userToUpdate, status: newStatus };
      await updateData(updatedUser);
      toast.success(`User status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  return (
    <div className="space-y-6" data-testid="users-page">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="users-title"
          >
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-user-btn">
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="create-user-modal">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form action={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="create-user-submit">
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          title="Total Users"
          value={stats.total}
          icon={Users}
          trend="neutral"
        />
        <StatsCard
          title="Admins"
          value={stats.admins}
          icon={Crown}
          trend="neutral"
        />
        <StatsCard
          title="Moderators"
          value={stats.moderators}
          icon={Shield}
          trend="neutral"
        />
        <StatsCard
          title="Regular Users"
          value={stats.regularUsers}
          icon={User}
          trend="neutral"
        />
        <StatsCard
          title="Active Users"
          value={stats.active}
          icon={UserCheck}
          trend="up"
        />
        <StatsCard
          title="Inactive"
          value={stats.inactive}
          icon={Users}
          trend="down"
        />
      </div>

      {/* Users Table */}
      <DataTable
        title="All Users"
        data={usersData}
        columns={columns}
        searchKeys={["name", "email", "phone"]}
        onEdit={(userToEdit) => {
          setSelectedUser(userToEdit);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDeleteUser}
        actions={[
          {
            label: "Make Admin",
            onClick: (user) => handleChangeRole(user, "admin"),
          },
          {
            label: "Make Moderator",
            onClick: (user) => handleChangeRole(user, "moderator"),
          },
          {
            label: "Make User",
            onClick: (user) => handleChangeRole(user, "user"),
          },
          {
            label: "Activate",
            onClick: (user) => handleChangeStatus(user, "active"),
          },
          {
            label: "Suspend",
            onClick: (user) => handleChangeStatus(user, "suspended"),
            variant: "destructive" as const,
          },
        ]}
      />

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent data-testid="edit-user-modal">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form action={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={selectedUser.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser.email}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    defaultValue={selectedUser.phone}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select name="role" defaultValue={selectedUser.role}>
                    <SelectTrigger>
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
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={selectedUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="edit-user-submit">
                  Update User
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardUsers;
