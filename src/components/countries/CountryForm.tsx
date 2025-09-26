"use client";

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
import { CreateCountryData, UpdateCountryData, Country } from "@/types";

const countryFormSchema = z.object({
  name: z.string().min(1, "Country name is required").min(2, "Country name must be at least 2 characters"),
  code: z.string().min(1, "Country code is required").min(2, "Country code must be at least 2 characters").max(3, "Country code must be at most 3 characters"),
  region: z.enum([
    "North America",
    "South America", 
    "Europe",
    "Asia",
    "Africa",
    "Oceania"
  ], {
    required_error: "Please select a region",
  }),
  currency: z.string().min(1, "Currency is required").min(3, "Currency must be 3 characters").max(3, "Currency must be 3 characters"),
  isActive: z.boolean().default(true),
  deliveryDays: z.object({
    standard: z.number().min(1, "Standard delivery days must be at least 1").max(30, "Standard delivery days cannot exceed 30"),
    express: z.number().min(1, "Express delivery days must be at least 1").max(15, "Express delivery days cannot exceed 15"),
    overnight: z.number().min(1, "Overnight delivery days must be at least 1").max(3, "Overnight delivery days cannot exceed 3"),
  }),
});

type CountryFormData = z.infer<typeof countryFormSchema>;

interface CountryFormProps {
  country?: Country;
  onSubmit: (data: CreateCountryData | UpdateCountryData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const regions = [
  "North America",
  "South America", 
  "Europe",
  "Asia",
  "Africa",
  "Oceania"
];

const currencies = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD",
  "MXN", "SGD", "HKD", "NOK", "TRY", "ZAR", "BRL", "INR", "KRW", "PLN"
];

export function CountryForm({ 
  country, 
  onSubmit, 
  onCancel, 
  loading = false 
}: CountryFormProps) {
  const isEdit = !!country;

  const form = useForm<CountryFormData>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: country ? {
      name: country.name,
      code: country.code,
      region: country.region as any,
      currency: country.currency,
      isActive: country.isActive,
      deliveryDays: country.deliveryDays,
    } : {
      name: "",
      code: "",
      region: undefined,
      currency: "",
      isActive: true,
      deliveryDays: {
        standard: 7,
        express: 3,
        overnight: 1,
      },
    },
  });

  const handleSubmit = (data: CountryFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card data-testid="country-form-card">
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Country" : "Create New Country"}</CardTitle>
            <CardDescription>
              {isEdit 
                ? "Update country information and delivery settings" 
                : "Add a new country to the system with delivery configurations"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., United States" 
                        {...field} 
                        data-testid="country-name-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., US" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        data-testid="country-code-input"
                      />
                    </FormControl>
                    <FormDescription>
                      ISO country code (2-3 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      data-testid="country-region-select"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
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
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      data-testid="country-currency-select"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      ISO currency code (3 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery Days Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Delivery Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryDays.standard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Delivery (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max="30"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="standard-delivery-input"
                        />
                      </FormControl>
                      <FormDescription>
                        Typical delivery time for standard service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryDays.express"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Express Delivery (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="express-delivery-input"
                        />
                      </FormControl>
                      <FormDescription>
                        Delivery time for express service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryDays.overnight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overnight Delivery (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max="3"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="overnight-delivery-input"
                        />
                      </FormControl>
                      <FormDescription>
                        Delivery time for overnight service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Country</FormLabel>
                    <FormDescription>
                      Allow this country to be used for shipping services
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="country-active-switch"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4" data-testid="country-form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            data-testid="cancel-country-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            data-testid="submit-country-btn"
          >
            {loading ? "Saving..." : isEdit ? "Update Country" : "Create Country"}
          </Button>
        </div>
      </form>
    </Form>
  );
}