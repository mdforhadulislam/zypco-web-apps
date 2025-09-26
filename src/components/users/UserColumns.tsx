"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User, Role } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Key,
  ArrowUpDown
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

interface UserColumnsProps {
  userRole: Role;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onVerifyUser: (user: User) => void;
  onResetPassword: (user: User) => void;
  onViewPermissions: (user: User) => void;
}

export const createUserColumns = ({
  userRole,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onVerifyUser,
  onResetPassword,
  onViewPermissions,
}: UserColumnsProps): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        data-testid="select-all-users"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        data-testid={`select-user-${row.original.id}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid="sort-name"
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-medium" data-testid={`user-name-${user.id}`}>
              {user.name}
            </div>
            <div className="text-sm text-muted-foreground" data-testid={`user-email-${user.id}`}>
              {user.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="font-mono text-sm" data-testid={`user-phone-${row.original.id}`}>
        {row.getValue("phone")}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleColors = {
        admin: "bg-red-100 text-red-800 border-red-200",
        moderator: "bg-blue-100 text-blue-800 border-blue-200",
        user: "bg-green-100 text-green-800 border-green-200",
      };
      
      const roleIcons = {
        admin: <Shield className="h-3 w-3 mr-1" />,
        moderator: <ShieldCheck className="h-3 w-3 mr-1" />,
        user: <UserCheck className="h-3 w-3 mr-1" />,
      };
      
      return (
        <Badge 
          className={`${roleColors[role as keyof typeof roleColors]} flex items-center w-fit`}
          data-testid={`user-role-${row.original.id}`}
        >
          {roleIcons[role as keyof typeof roleIcons]}
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isVerified",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original;
      
      return (
        <div className="flex flex-col space-y-1">
          <Badge 
            variant={user.isActive ? "default" : "secondary"}
            data-testid={`user-active-status-${user.id}`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge 
            variant={user.isVerified ? "default" : "outline"}
            data-testid={`user-verified-status-${user.id}`}
          >
            {user.isVerified ? "Verified" : "Unverified"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid="sort-last-login"
        >
          Last Login
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLogin") as string;
      return (
        <div className="text-sm" data-testid={`user-last-login-${row.original.id}`}>
          {lastLogin ? format(new Date(lastLogin), "MMM dd, yyyy HH:mm") : "Never"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid="sort-created-at"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm" data-testid={`user-created-at-${row.original.id}`}>
          {format(new Date(date), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              data-testid={`actions-${user.id}`}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            <DropdownMenuItem
              onClick={() => onView(user)}
              data-testid={`view-user-${user.id}`}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onEdit(user)}
              data-testid={`edit-user-${user.id}`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Admin/Moderator only actions */}
            {(userRole === "admin" || userRole === "moderator") && (
              <>
                <DropdownMenuItem
                  onClick={() => onToggleStatus(user)}
                  data-testid={`toggle-status-${user.id}`}
                >
                  {user.isActive ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Deactivate User
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Activate User
                    </>
                  )}
                </DropdownMenuItem>

                {!user.isVerified && (
                  <DropdownMenuItem
                    onClick={() => onVerifyUser(user)}
                    data-testid={`verify-user-${user.id}`}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify User
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => onResetPassword(user)}
                  data-testid={`reset-password-${user.id}`}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onViewPermissions(user)}
                  data-testid={`view-permissions-${user.id}`}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  View Permissions
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </>
            )}

            {/* Delete option only for admin */}
            {userRole === "admin" && (
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="text-red-600 focus:text-red-600"
                data-testid={`delete-user-${user.id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];