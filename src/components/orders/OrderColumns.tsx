"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order, Role } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Truck, Package } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

interface OrderColumnsProps {
  userRole: Role;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onUpdateStatus: (order: Order, status: Order["status"]) => void;
}

export const createOrderColumns = ({
  userRole,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}: OrderColumnsProps): ColumnDef<Order>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        data-testid="select-all-orders"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        data-testid={`select-order-${row.original._id}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "trackId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid="sort-track-id"
        >
          Track ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium" data-testid={`track-id-${row.original._id}`}>
        {row.getValue("trackId")}
      </div>
    ),
  },
  {
    accessorKey: "parcel",
    header: "Route",
    cell: ({ row }) => {
      const parcel = row.original.parcel;
      return (
        <div className="flex flex-col space-y-1">
          <div className="text-sm font-medium">
            {parcel.from.name} → {parcel.to.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {parcel.sender.name} → {parcel.receiver.name}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        confirmed: "bg-blue-100 text-blue-800 border-blue-200",
        processing: "bg-purple-100 text-purple-800 border-purple-200",
        shipped: "bg-orange-100 text-orange-800 border-orange-200",
        delivered: "bg-green-100 text-green-800 border-green-200",
        cancelled: "bg-red-100 text-red-800 border-red-200",
      };
      
      return (
        <Badge 
          className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
          data-testid={`status-${row.original._id}`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "parcel.priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.parcel.priority;
      const priorityColors = {
        low: "bg-gray-100 text-gray-800",
        normal: "bg-blue-100 text-blue-800",
        high: "bg-orange-100 text-orange-800",
        urgent: "bg-red-100 text-red-800",
      };
      
      return (
        <Badge 
          className={priorityColors[priority as keyof typeof priorityColors]}
          data-testid={`priority-${row.original._id}`}
        >
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "parcel.weight",
    header: "Weight",
    cell: ({ row }) => {
      const weight = row.original.parcel.weight;
      return <div className="text-center">{weight} kg</div>;
    },
  },
  {
    accessorKey: "payment.pAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid="sort-amount"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.original.payment.pAmount;
      return <div className="text-center font-medium">${amount.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid="sort-date"
        >
          Order Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("orderDate"));
      return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              data-testid={`actions-${order._id}`}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onView(order)}
              data-testid={`view-order-${order._id}`}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(order)}
              data-testid={`edit-order-${order._id}`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Order
            </DropdownMenuItem>
            
            {/* Status update options for admin/moderator */}
            {(userRole === "admin" || userRole === "moderator") && (
              <>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(order, "processing")}
                  data-testid={`process-order-${order._id}`}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mark Processing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(order, "shipped")}
                  data-testid={`ship-order-${order._id}`}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Mark Shipped
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(order, "delivered")}
                  data-testid={`deliver-order-${order._id}`}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mark Delivered
                </DropdownMenuItem>
              </>
            )}

            {/* Delete option only for admin/moderator */}
            {(userRole === "admin" || userRole === "moderator") && (
              <DropdownMenuItem
                onClick={() => onDelete(order)}
                className="text-red-600 focus:text-red-600"
                data-testid={`delete-order-${order._id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];