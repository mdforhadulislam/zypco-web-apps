"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriceChart } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

interface PriceColumnsProps {
  userRole: "admin" | "user";
  onView: (price: PriceChart) => void;
  onEdit: (price: PriceChart) => void;
  onDelete: (price: PriceChart) => void;
}

export const createPriceColumns = ({
  userRole,
  onView,
  onEdit,
  onDelete,
}: PriceColumnsProps): ColumnDef<PriceChart>[] => [
  {
    accessorKey: "route",

    header: "Route",
    accessorFn: (row) =>
      `${row.from?.name ?? "N/A"} → ${row.to?.name ?? "N/A"}`,
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "rateSummary",
    header: "Couriers / Price Summary",
    cell: ({ row }) => {
      const price = row.original;
      const courierCount = price.rate.length;

      if (courierCount === 0) {
        return <div>No couriers</div>;
      }

      let minPrice = Infinity;
      let maxPrice = 0;

      price.rate.forEach((c) => {
        const values = Object.values(c.price);
        if (values.length > 0) {
          const localMin = Math.min(...values);
          const localMax = Math.max(...values);
          if (localMin < minPrice) minPrice = localMin;
          if (localMax > maxPrice) maxPrice = localMax;
        }
      });

      if (minPrice === Infinity) minPrice = 0;

      return (
        <div>
          <div>
            {courierCount} courier{courierCount > 1 ? "s" : ""}
          </div>
          <div>
            ${minPrice.toFixed(2)} – ${maxPrice.toFixed(2)}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const price = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(price)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(price)}>
              Edit
            </DropdownMenuItem>
            {userRole === "admin" && (
              <DropdownMenuItem
                onClick={() => onDelete(price)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
