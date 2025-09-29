"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Country, Role } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  Eye,
  Globe,
  MoreHorizontal,
  Phone,
  Trash2,
} from "lucide-react";

interface CountryColumnsProps {
  userRole: Role;
  onView: (country: Country) => void;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
  onToggleStatus: (country: Country) => void;
}

export const createCountryColumns = ({
  userRole,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: CountryColumnsProps): ColumnDef<Country>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        data-testid="select-all-countries"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        data-testid={`select-country-${row.original._id}`}
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
          data-testid="sort-country-name"
        >
          Country
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const country = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div>
            <div
              className="font-medium"
              data-testid={`country-name-${country._id}`}
            >
              {country.name}
            </div>
            <div
              className="text-sm text-muted-foreground"
              data-testid={`country-code-${country._id}`}
            >
              {country.code}
            </div>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "phoneCode",
    header: "Phone Code",
    cell: ({ row }) => (
      <div
        className="flex items-center space-x-1 font-mono text-sm"
        data-testid={`country-phonecode-${row.original._id}`}
      >
        <Phone className="h-3 w-3 text-muted-foreground" />
        {row.getValue("phoneCode")}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;

      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          data-testid={`country-status-${row.original._id}`}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const country = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              data-testid={`actions-${country._id}`}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => onView(country)}
              data-testid={`view-country-${country._id}`}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onEdit(country)}
              data-testid={`edit-country-${country._id}`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Country
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onToggleStatus(country)}
              data-testid={`toggle-status-${country._id}`}
            >
              {country.isActive ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>

            {/* Delete option only for admin */}
            {userRole === "admin" && (
              <DropdownMenuItem
                onClick={() => onDelete(country)}
                className="text-red-600 focus:text-red-600"
                data-testid={`delete-country-${country._id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Country
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
