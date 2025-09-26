"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Country, Role } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Globe, MapPin, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
            <div className="font-medium" data-testid={`country-name-${country._id}`}>
              {country.name}
            </div>
            <div className="text-sm text-muted-foreground" data-testid={`country-code-${country._id}`}>
              {country.code}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row }) => {
      const region = row.getValue("region") as string;
      const regionColors = {
        "North America": "bg-blue-100 text-blue-800",
        "South America": "bg-green-100 text-green-800",
        "Europe": "bg-purple-100 text-purple-800",
        "Asia": "bg-orange-100 text-orange-800",
        "Africa": "bg-yellow-100 text-yellow-800",
        "Oceania": "bg-cyan-100 text-cyan-800",
      };
      
      return (
        <Badge 
          className={regionColors[region as keyof typeof regionColors] || "bg-gray-100 text-gray-800"}
          data-testid={`country-region-${row.original._id}`}
        >
          <MapPin className="h-3 w-3 mr-1" />
          {region}
        </Badge>
      );
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => (
      <div className="font-mono text-sm" data-testid={`country-currency-${row.original._id}`}>
        {row.getValue("currency")}
      </div>
    ),
  },
  {
    accessorKey: "deliveryDays",
    header: "Delivery Days",
    cell: ({ row }) => {
      const deliveryDays = row.original.deliveryDays;
      return (
        <div className="text-sm space-y-1">
          <div>Standard: {deliveryDays.standard} days</div>
          <div>Express: {deliveryDays.express} days</div>
          <div>Overnight: {deliveryDays.overnight} days</div>
        </div>
      );
    },
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