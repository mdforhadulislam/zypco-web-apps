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
import { CreateAddressData, UpdateAddressData, UserAddress } from "@/types";
import { countryService } from "@/services/countryService";

const addressFormSchema = z.object({
  label: z.string().min(1, "Address label is required").min(2, "Label must be at least 2 characters"),
  isDefault: z.boolean().default(false),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    zipCode: z.string().optional(),
    landmark: z.string().optional(),
  }),
  contactPerson: z.object({
    name: z.string().min(1, "Contact name is required"),
    phone: z.string().min(1, "Contact phone is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
  }).optional(),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  address?: UserAddress;
  onSubmit: (data: CreateAddressData | UpdateAddressData) => void;
  onCancel: () => void;
  loading?: boolean;
  showContactPerson?: boolean;
}

const addressLabels = [
  "Home",
  "Office", 
  "Warehouse",
  "Pickup Point",
  "Delivery Address",
  "Billing Address",
  "Other"
];

export function AddressForm({ 
  address, 
  onSubmit, 
  onCancel, 
  loading = false,
  showContactPerson = true
}: AddressFormProps) {
  const isEdit = !!address;
  const [countries, setCountries] = useState<any[]>([]);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: address ? {
      label: address.label,
      isDefault: address.isDefault,
      address: address.address,
      contactPerson: address.contactPerson || undefined,
    } : {
      label: "",
      isDefault: false,
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        landmark: "",
      },
      contactPerson: showContactPerson ? {
        name: "",
        phone: "",
        email: "",
      } : undefined,
    },
  });

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await countryService.getActiveCountries();
        if (response.success && response.data) {
          setCountries(Array.isArray(response.data) ? response.data : [response.data]);
        }
      } catch (error) {
        console.error("Failed to load countries:", error);
      }
    };
    
    loadCountries();
  }, []);

  const handleSubmit = (data: AddressFormData) => {
    // Clean up empty strings and undefined values
    const submitData = {
      ...data,
      address: {
        ...data.address,
        state: data.address.state || undefined,
        zipCode: data.address.zipCode || undefined,
        landmark: data.address.landmark || undefined,
      },
    };

    // Clean up contact person if not needed or empty
    if (!showContactPerson || !data.contactPerson || 
        (!data.contactPerson.name && !data.contactPerson.phone)) {
      delete submitData.contactPerson;
    } else if (data.contactPerson) {
      submitData.contactPerson = {
        ...data.contactPerson,
        email: data.contactPerson.email || undefined,
      };
    }

    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card data-testid="address-form-card">
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Address" : "Add New Address"}</CardTitle>
            <CardDescription>
              {isEdit 
                ? "Update address information and settings" 
                : "Add a new address to your address book"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Address Label and Default */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Label</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="address-label-select">
                          <SelectValue placeholder="Select address type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {addressLabels.map((label) => (
                          <SelectItem key={label} value={label}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose a label to easily identify this address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Default Address</FormLabel>
                      <FormDescription>
                        Use as default for shipping
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="address-default-switch"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter full street address" 
                        {...field} 
                        data-testid="address-street-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter city" 
                          {...field} 
                          data-testid="address-city-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter state or province" 
                          {...field} 
                          data-testid="address-state-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="address-country-select">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country._id} value={country.name}>
                              {country.name} ({country.code})
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
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter ZIP or postal code" 
                          {...field} 
                          data-testid="address-zip-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address.landmark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Landmark (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nearby landmark for easy identification" 
                        {...field} 
                        data-testid="address-landmark-input"
                      />
                    </FormControl>
                    <FormDescription>
                      Any notable landmark near this address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Person (Optional) */}
            {showContactPerson && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Contact Person (Optional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Person to contact for deliveries or pickups at this address
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPerson.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter contact person name" 
                              {...field} 
                              data-testid="contact-name-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPerson.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter contact phone number" 
                              {...field} 
                              data-testid="contact-phone-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contactPerson.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter contact email address" 
                            {...field} 
                            data-testid="contact-email-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4" data-testid="address-form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            data-testid="cancel-address-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            data-testid="submit-address-btn"
          >
            {loading ? "Saving..." : isEdit ? "Update Address" : "Add Address"}
          </Button>
        </div>
      </form>
    </Form>
  );
}