"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { CreateOrderData, Order } from "@/types";
import { countryService } from "@/services/countryService";

const addressSchema = z.object({
  address: z.string().min(1, "Address address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "ZIP/Postal Code is required"),
});

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: addressSchema,
});

const parcelItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  totalPrice: z.number().min(0, "Total price cannot be negative"),
  weight: z.number().optional(),
});

const orderFormSchema = z.object({
  parcel: z.object({
    from: z.string().min(1, "Origin country is required"),
    to: z.string().min(1, "Destination country is required"),
    weight: z.number().min(0.1, "Weight must be at least 0.1 kg"),
    dimensions: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    }).optional(),
    orderType: z.enum( ["document", "parcel", "e-commerce"]),
    priority: z.enum(["normal", "express", "super-express", "tax-paid"]),
    customerNote: z.string().optional(),
    sender: contactSchema,
    receiver: contactSchema,
    item: z.array(parcelItemSchema).optional(),
  }),

});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  order?: Order;
  onSubmit: (data: CreateOrderData) => void;
  onCancel: () => void;
  loading?: boolean;
}


export function OrderForm({ order, onSubmit, onCancel, loading = false }: OrderFormProps) {
  const [addItems, setAddItems] = useState(false);
    const [countries, setCountries] = useState<any[]>([]);


  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: order ? {
      parcel: {
        from: order.parcel.from,
        to: order.parcel.to,
        weight: order.parcel.weight,
        dimensions: order.parcel.dimensions || {},
        orderType: order.parcel.orderType,
        priority: order.parcel.priority,
        customerNote: order.parcel.customerNote || "",
        sender: order.parcel.sender,
        receiver: order.parcel.receiver,
        item: order.parcel.item || [],
      },
    } : {
      parcel: {
        from: "",
        to: "",
        weight: 0,
        orderType: "standard",
        priority: "normal",
        customerNote: "",
        sender: {
          name: "",
          phone: "",
          email: "",
          address: {
            address: "",
            city: "",
            country: "",
            zipCode: "",
          },
        },
        receiver: {
          name: "",
          phone: "",
          email: "",
          address: {
            address: "",
            city: "",
            country: "",
            zipCode: "",
          },
          },
          item: [],
        },
      }
  });

  
    useEffect(() => {
      const loadCountries = async () => {
        try {
          const response = await countryService.getActiveCountries();
          console.log(response);
          
          if (response.status == 200 && response.data) {
            setCountries(Array.isArray(response.data) ? response.data : [response.data]);
          }
        } catch (error) {
          console.error("Failed to load countries:", error);
        }
      };
      loadCountries();
    }, []);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parcel.item",
  });

  const handleSubmit = (data: OrderFormData) => {
    // Calculate total prices for items
    if (data.parcel.item) {
      data.parcel.item.forEach((item) => {
        item.totalPrice = item.quantity * item.unitPrice;
      });
    }
    
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Parcel Information */}
        <Card data-testid="parcel-info-card">
          <CardHeader>
            <CardTitle>Parcel Information</CardTitle>
            <CardDescription>Basic details about the shipment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parcel.from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="from-country-select">
                          <SelectValue placeholder="Select origin country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country._id} value={country._id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parcel.to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="to-country-select">
                          <SelectValue placeholder="Select destination country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {countries.map((country) => (
                          <SelectItem key={country._id} value={country._id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="parcel.weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="parcel-weight"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parcel.orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="order-type-select">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="parcel">Parcel</SelectItem>
                        <SelectItem value="e-commerce">E-Commerce</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parcel.priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="priority-select">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="super-express">Super Express</SelectItem>
                        <SelectItem value="tax-paid">Tax Paid</SelectItem> 
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parcel.customerNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the parcel..."
                      {...field}
                      data-testid="parcel-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Sender Information */}
        <Card data-testid="sender-info-card">
          <CardHeader>
            <CardTitle>Sender Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parcel.sender.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sender name" {...field} data-testid="sender-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parcel.sender.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} data-testid="sender-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parcel.sender.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} data-testid="sender-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sender Address */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Sender Address</h4>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="parcel.sender.address.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} data-testid="sender-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="parcel.sender.address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} data-testid="sender-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parcel.sender.address.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP/Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ZIP code" {...field} data-testid="sender-zip" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="parcel.sender.address.country"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Origin Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="sender-country-select">
                          <SelectValue placeholder="Select origin country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country._id} value={country._id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <FormMessage />
                  </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receiver Information */}
        <Card data-testid="receiver-info-card">
          <CardHeader>
            <CardTitle>Receiver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parcel.receiver.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter receiver name" {...field} data-testid="receiver-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parcel.receiver.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} data-testid="receiver-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parcel.receiver.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} data-testid="receiver-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Receiver Address */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Receiver Address</h4>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="parcel.receiver.address.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} data-testid="receiver-street" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="parcel.receiver.address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} data-testid="receiver-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  

                  <FormField
                    control={form.control}
                    name="parcel.receiver.address.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP/Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ZIP code" {...field} data-testid="receiver-zip" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="parcel.receiver.address.country"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Destination Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="receiver-country-select">
                          <SelectValue placeholder="Select destination country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country._id} value={country._id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <FormMessage />
                  </FormItem>
                    )}
                  />

                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Form Actions */}
        <div className="flex justify-end space-x-4" data-testid="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            data-testid="cancel-order-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            data-testid="submit-order-btn"
          >
            {loading ? "Saving..." : order ? "Update Order" : "Create Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}