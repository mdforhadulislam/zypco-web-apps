"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserAddress, Role } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, MapPin, Star, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AddressColumnsProps {
  userRole: Role;
  onView: (address: UserAddress) => void;
  onEdit: (address: UserAddress) => void;
  onDelete: (address: UserAddress) => void;
  onSetDefault?: (address: UserAddress) => void;
  showUserInfo?: boolean;
}

export const createAddressColumns = ({
  userRole,
  onView,
  onEdit,
  onDelete,
  onSetDefault,
  showUserInfo = false,
}: AddressColumnsProps): ColumnDef<UserAddress>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        data-testid="select-all-addresses"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        data-testid={`select-address-${row.original._id}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "label",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid="sort-label"
        >
          Label
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const address = row.original;
      return (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium flex items-center space-x-2">
              <span data-testid={`address-label-${address._id}`}>{address.label}</span>
              {address.isDefault && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
            </div>
            {showUserInfo && address.phone && (
              <div className="text-sm text-muted-foreground">
                {address.phone}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const { address } = row.original;
      return (
        <div className="max-w-xs">
          <div className="font-medium">{address?.street}</div>
          <div className="text-sm text-muted-foreground">
            {address?.city}, {address?.state && `${address?.state}, `}{address?.country}
          </div>
          {address?.zipCode && (
            <div className="text-sm text-muted-foreground">
              {address?.zipCode}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "contactPerson",
    header: "Contact Person",
    cell: ({ row }) => {
      const { contactPerson } = row.original;
      
      if (!contactPerson) {
        return <span className="text-muted-foreground">-</span>;
      }
      
      return (
        <div>
          <div className="font-medium">{contactPerson.name}</div>
          <div className="text-sm text-muted-foreground">{contactPerson.phone}</div>
          {contactPerson.email && (
            <div className="text-sm text-muted-foreground">{contactPerson.email}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "address.country",
    header: "Country",
    cell: ({ row }) => (
      <Badge variant="outline" data-testid={`address-country-${row.original._id}`}>
        {row.original.address?.country}
      </Badge>
    ),
  },
  {
    accessorKey: "isDefault",
    header: "Default",
    cell: ({ row }) => {
      const isDefault = row.getValue("isDefault") as boolean;
      
      return isDefault ? (
        <Badge className="bg-yellow-100 text-yellow-800" data-testid={`address-default-${row.original._id}`}>
          <Star className="h-3 w-3 mr-1 fill-current" />
          Default
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const address = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              data-testid={`actions-${address._id}`}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            <DropdownMenuItem
              onClick={() => onView(address)}
              data-testid={`view-address-${address._id}`}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onEdit(address)}
              data-testid={`edit-address-${address._id}`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Address
            </DropdownMenuItem>

            {onSetDefault && !address.isDefault && (
              <DropdownMenuItem
                onClick={() => onSetDefault(address)}
                data-testid={`set-default-${address._id}`}
              >
                <Star className="mr-2 h-4 w-4" />
                Set as Default
              </DropdownMenuItem>
            )}

            {/* Delete option */}
            <DropdownMenuItem
              onClick={() => onDelete(address)}
              className="text-red-600 focus:text-red-600"
              data-testid={`delete-address-${address._id}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Address
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];