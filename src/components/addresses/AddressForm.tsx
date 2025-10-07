"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { countryService } from "@/services/countryService";

const addressFormSchema = z.object({
  label: z.string().min(1, "Address label is required"),
  isDefault: z.boolean().default(false),
  address: z.object({
    street: z.string().min(1, "Address line is required"),
    area: z.string().optional(),
    subCity: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  contactPerson: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
  }).optional(),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  address?: any; // matches API object
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const addressLabels = ["Home", "Office", "Warehouse", "Pickup Point", "Billing Address", "Other"];

export function AddressForm({ address, onSubmit, onCancel, loading = false }: AddressFormProps) {
  const [countries, setCountries] = useState<any[]>([]);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: address
      ? {

          label: address.label || "",
          isDefault: address.isDefault || false,
          address: {
            street: address.addressLine || "",
            area: address.area || "",
            subCity: address.subCity || "",
            city: address.city || "",
            state: address.state || "",
            zipCode: address.zipCode || "",
            country: address.country || "",
          },
          contactPerson: {
            name: address.name || "",
            phone: address.phone || "",
            email: "",
          },
        }
      : {
          label: "",
          isDefault: false,
          address: {
            street: "",
            area: "",
            subCity: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          contactPerson: {
            name: "",
            phone: "",
            email: "",
          },
        },
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

  const handleSubmit = (data: AddressFormData) => {
    const formatted = { 
      label: data.label,
      isDefault: data.isDefault,
      name: data.contactPerson?.name || "",
      phone: data.contactPerson?.phone || "",
      addressLine: data.address.street,
      area: data.address.area,
      subCity: data.address.subCity,
      city: data.address.city,
      state: data.address.state,
      zipCode: data.address.zipCode,
      country: data.address.country,
    };
    console.log(formatted.country);
    

    onSubmit(formatted);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{address ? "Edit Address" : "Add New Address"}</CardTitle>
            <CardDescription>
              {address ? "Update address details" : "Add a new address"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Label + Default Switch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select label" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {addressLabels.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <FormLabel>Default Address</FormLabel>
                      <FormDescription>Set as default shipping address</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Address Inputs */}
            <div className="space-y-3">
              <FormField control={form.control} name="address.street" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line</FormLabel>
                  <FormControl><Input placeholder="e.g., House 193, Road 01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address.area" render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl><Input placeholder="e.g., Mohakhali DOHS" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address.subCity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub City</FormLabel>
                  <FormControl><Input placeholder="e.g., Dhaka North" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address.city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="Enter city" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address.state" render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl><Input placeholder="Enter state" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address.zipCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl><Input placeholder="e.g., 1206" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address.country" render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Contact Person</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="contactPerson.name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="Enter contact name" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactPerson.phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="Enter phone number" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : address ? "Update" : "Add"}</Button>
        </div>
      </form>
    </Form>
  );
}
