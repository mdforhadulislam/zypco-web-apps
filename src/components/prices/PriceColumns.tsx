"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PriceChart, Role } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Calculator, ArrowUpDown, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface PriceColumnsProps {
  userRole: Role;
  onView: (price: PriceChart) => void;
  onEdit: (price: PriceChart) => void;
  onDelete: (price: PriceChart) => void;
  onToggleStatus: (price: PriceChart) => void;
  onCalculate?: (price: PriceChart) => void;
}

export const createPriceColumns = ({
  userRole,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onCalculate,
}: PriceColumnsProps): ColumnDef<PriceChart>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        data-testid="select-all-prices"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        data-testid={`select-price-${row.original._id}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "route",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid="sort-route"
        >
          Route
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.original;
      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium" data-testid={`route-from-${price._id}`}>
            {price.fromCountry}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium" data-testid={`route-to-${price._id}`}>
            {price.toCountry}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "serviceType",
    header: "Service Type",
    cell: ({ row }) => {
      const serviceType = row.getValue("serviceType") as string;
      const serviceColors = {
        standard: "bg-blue-100 text-blue-800 border-blue-200",
        express: "bg-orange-100 text-orange-800 border-orange-200",
        overnight: "bg-red-100 text-red-800 border-red-200",
      };
      
      return (
        <Badge 
          className={serviceColors[serviceType as keyof typeof serviceColors] || "bg-gray-100 text-gray-800"}
          data-testid={`service-type-${row.original._id}`}
        >
          {serviceType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "weightTiers",
    header: "Weight Tiers",
    cell: ({ row }) => {
      const weightTiers = row.original.weightTiers;
      const minWeight = Math.min(...weightTiers.map(tier => tier.minWeight));
      const maxWeight = Math.max(...weightTiers.map(tier => tier.maxWeight));
      
      return (
        <div className="text-sm">
          <div className="font-medium">
            {minWeight} - {maxWeight} kg
          </div>
          <div className="text-muted-foreground">
            {weightTiers.length} tier{weightTiers.length !== 1 ? 's' : ''}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "basePrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid="sort-base-price"
        >
          Base Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const weightTiers = row.original.weightTiers;
      const minBasePrice = Math.min(...weightTiers.map(tier => tier.basePrice));
      
      return (
        <div className="font-medium" data-testid={`base-price-${row.original._id}`}>
          ${minBasePrice.toFixed(2)}+
        </div>
      );
    },
  },
  {
    accessorKey: "pricePerKg",
    header: "Price/KG Range",
    cell: ({ row }) => {
      const weightTiers = row.original.weightTiers;
      const minPricePerKg = Math.min(...weightTiers.map(tier => tier.pricePerKg));
      const maxPricePerKg = Math.max(...weightTiers.map(tier => tier.pricePerKg));
      
      return (
        <div className="text-sm">
          <div>${minPricePerKg.toFixed(2)} - ${maxPricePerKg.toFixed(2)}</div>
          <div className="text-muted-foreground">per kg</div>
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
          data-testid={`price-status-${row.original._id}`}
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
      const price = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              data-testid={`actions-${price._id}`}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            <DropdownMenuItem
              onClick={() => onView(price)}
              data-testid={`view-price-${price._id}`}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            {onCalculate && (
              <DropdownMenuItem
                onClick={() => onCalculate(price)}
                data-testid={`calculate-price-${price._id}`}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Price Calculator
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => onEdit(price)}
              data-testid={`edit-price-${price._id}`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Price Chart
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onToggleStatus(price)}
              data-testid={`toggle-status-${price._id}`}
            >
              {price.isActive ? (
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
                onClick={() => onDelete(price)}
                className="text-red-600 focus:text-red-600"
                data-testid={`delete-price-${price._id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Price Chart
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];