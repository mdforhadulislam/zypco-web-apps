"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { OrderService } from "@/services/dashboardService";

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderFormData {
  parcel: {
    from: string;
    to: string;
    weight: string;
    serviceType: string;
    priority: "normal" | "express" | "super-express" | "tax-paid";
    orderType: "document" | "parcel" | "e-commerce";
    customerNote: string;
    sender: {
      name: string;
      phone: string;
      email: string;
      address: {
        address: string;
        city: string;
        zipCode: string;
      };
    };
    receiver: {
      name: string;
      phone: string;
      email: string;
      address: {
        address: string;
        city: string;
        zipCode: string;
      };
    };
    item: OrderItem[];
  };
  payment: {
    pType: string;
    pAmount: number;
  };
}

interface OrderFormProps {
  order?: Partial<OrderFormData>;
  onSuccess?: (order: any) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

export function OrderForm({ order, onSuccess, onCancel, isEdit = false }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    defaultValues: {
      parcel: {
        from: order?.parcel?.from || "",
        to: order?.parcel?.to || "",
        weight: order?.parcel?.weight || "",
        serviceType: order?.parcel?.serviceType || "",
        priority: order?.parcel?.priority || "normal",
        orderType: order?.parcel?.orderType || "parcel",
        customerNote: order?.parcel?.customerNote || "",
        sender: {
          name: order?.parcel?.sender?.name || "",
          phone: order?.parcel?.sender?.phone || "",
          email: order?.parcel?.sender?.email || "",
          address: {
            address: order?.parcel?.sender?.address?.address || "",
            city: order?.parcel?.sender?.address?.city || "",
            zipCode: order?.parcel?.sender?.address?.zipCode || "",
          },
        },
        receiver: {
          name: order?.parcel?.receiver?.name || "",
          phone: order?.parcel?.receiver?.phone || "",
          email: order?.parcel?.receiver?.email || "",
          address: {
            address: order?.parcel?.receiver?.address?.address || "",
            city: order?.parcel?.receiver?.address?.city || "",
            zipCode: order?.parcel?.receiver?.address?.zipCode || "",
          },
        },
        item: order?.parcel?.item || [{ name: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
      },
      payment: {
        pType: order?.payment?.pType || "cash-on-delivery",
        pAmount: order?.payment?.pAmount || 0,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "parcel.item",
  });

  const watchedItems = watch("parcel.item");

  const calculateItemTotal = (index: number) => {
    const item = watchedItems[index];
    if (item) {
      const total = item.quantity * item.unitPrice;
      setValue(`parcel.item.${index}.totalPrice`, total);
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      setLoading(true);

      if (isEdit && order) {
        // Update order - would need order ID
        toast.info("Order update not fully implemented");
      } else {
        const response = await OrderService.createOrder(data);
        if (response.success) {
          toast.success("Order created successfully");
          onSuccess?.(response.data);
        } else {
          toast.error(response.message || "Failed to create order");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card data-testid="order-form">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Order" : "Create Order"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">From Country</Label>
              <Input
                id="from"
                {...register("parcel.from", { required: "Origin country is required" })}
                placeholder="Origin country ID"
                data-testid="order-from-input"
              />
              {errors.parcel?.from && (
                <p className="text-sm text-red-600">{errors.parcel.from.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To Country</Label>
              <Input
                id="to"
                {...register("parcel.to", { required: "Destination country is required" })}
                placeholder="Destination country ID"
                data-testid="order-to-input"
              />
              {errors.parcel?.to && (
                <p className="text-sm text-red-600">{errors.parcel.to.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                {...register("parcel.weight", { required: "Weight is required" })}
                placeholder="Weight in kg"
                data-testid="order-weight-input"
              />
              {errors.parcel?.weight && (
                <p className="text-sm text-red-600">{errors.parcel.weight.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch("parcel.priority")}
                onValueChange={(value: any) => setValue("parcel.priority", value)}
              >
                <SelectTrigger data-testid="order-priority-select">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="super-express">Super Express</SelectItem>
                  <SelectItem value="tax-paid">Tax Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type</Label>
              <Select
                value={watch("parcel.orderType")}
                onValueChange={(value: any) => setValue("parcel.orderType", value)}
              >
                <SelectTrigger data-testid="order-type-select">
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="parcel">Parcel</SelectItem>
                  <SelectItem value="e-commerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Sender Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sender Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  {...register("parcel.sender.name", { required: "Sender name is required" })}
                  placeholder="Full name"
                  data-testid="sender-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Sender Phone</Label>
                <Input
                  id="senderPhone"
                  {...register("parcel.sender.phone", { required: "Sender phone is required" })}
                  placeholder="Phone number"
                  data-testid="sender-phone-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  {...register("parcel.sender.email")}
                  placeholder="email@example.com"
                  data-testid="sender-email-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderAddress">Address</Label>
                <Input
                  id="senderAddress"
                  {...register("parcel.sender.address.address")}
                  placeholder="Street address"
                  data-testid="sender-address-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderCity">City</Label>
                <Input
                  id="senderCity"
                  {...register("parcel.sender.address.city")}
                  placeholder="City"
                  data-testid="sender-city-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderZip">Zip Code</Label>
                <Input
                  id="senderZip"
                  {...register("parcel.sender.address.zipCode")}
                  placeholder="Zip code"
                  data-testid="sender-zip-input"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Receiver Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Receiver Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver Name</Label>
                <Input
                  id="receiverName"
                  {...register("parcel.receiver.name", { required: "Receiver name is required" })}
                  placeholder="Full name"
                  data-testid="receiver-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverPhone">Receiver Phone</Label>
                <Input
                  id="receiverPhone"
                  {...register("parcel.receiver.phone", { required: "Receiver phone is required" })}
                  placeholder="Phone number"
                  data-testid="receiver-phone-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverEmail">Receiver Email</Label>
                <Input
                  id="receiverEmail"
                  type="email"
                  {...register("parcel.receiver.email")}
                  placeholder="email@example.com"
                  data-testid="receiver-email-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverAddress">Address</Label>
                <Input
                  id="receiverAddress"
                  {...register("parcel.receiver.address.address")}
                  placeholder="Street address"
                  data-testid="receiver-address-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverCity">City</Label>
                <Input
                  id="receiverCity"
                  {...register("parcel.receiver.address.city")}
                  placeholder="City"
                  data-testid="receiver-city-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverZip">Zip Code</Label>
                <Input
                  id="receiverZip"
                  {...register("parcel.receiver.address.zipCode")}
                  placeholder="Zip code"
                  data-testid="receiver-zip-input"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", quantity: 1, unitPrice: 0, totalPrice: 0 })}
                data-testid="add-item-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    {...register(`parcel.item.${index}.name`, { required: "Item name is required" })}
                    placeholder="Item name"
                    data-testid={`item-name-${index}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    {...register(`parcel.item.${index}.quantity`, { 
                      required: "Quantity is required",
                      min: 1,
                      onChange: () => calculateItemTotal(index)
                    })}
                    placeholder="Qty"
                    data-testid={`item-quantity-${index}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`parcel.item.${index}.unitPrice`, {
                      required: "Unit price is required",
                      min: 0,
                      onChange: () => calculateItemTotal(index)
                    })}
                    placeholder="Price"
                    data-testid={`item-price-${index}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`parcel.item.${index}.totalPrice`)}
                    placeholder="Total"
                    readOnly
                    data-testid={`item-total-${index}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  data-testid={`remove-item-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Customer Note */}
          <div className="space-y-2">
            <Label htmlFor="customerNote">Customer Note</Label>
            <Textarea
              id="customerNote"
              {...register("parcel.customerNote")}
              placeholder="Additional notes or instructions"
              data-testid="customer-note-input"
            />
          </div>

          {/* Payment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type</Label>
                <Select
                  value={watch("payment.pType")}
                  onValueChange={(value) => setValue("payment.pType", value)}
                >
                  <SelectTrigger data-testid="payment-type-select">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash-on-delivery">Cash on Delivery</SelectItem>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  {...register("payment.pAmount", { required: "Payment amount is required" })}
                  placeholder="0.00"
                  data-testid="payment-amount-input"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                data-testid="order-form-cancel"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              data-testid="order-form-submit"
            >
              {loading ? "Saving..." : isEdit ? "Update Order" : "Create Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}