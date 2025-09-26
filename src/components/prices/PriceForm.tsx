"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";
import { CreatePriceData, UpdatePriceData, PriceChart } from "@/types";
import { countryService } from "@/services/countryService";

const weightTierSchema = z.object({
  minWeight: z.number().min(0, "Minimum weight must be 0 or greater"),
  maxWeight: z.number().min(0.1, "Maximum weight must be greater than 0"),
  pricePerKg: z.number().min(0, "Price per kg must be 0 or greater"),
  basePrice: z.number().min(0, "Base price must be 0 or greater"),
});

const priceFormSchema = z.object({
  fromCountry: z.string().min(1, "Origin country is required"),
  toCountry: z.string().min(1, "Destination country is required"),
  serviceType: z.enum(["standard", "express", "overnight"], {
    required_error: "Please select a service type",
  }),
  weightTiers: z.array(weightTierSchema).min(1, "At least one weight tier is required"),
  additionalCharges: z.object({
    fuelSurcharge: z.number().min(0, "Fuel surcharge must be 0 or greater").optional(),
    remoteSurcharge: z.number().min(0, "Remote surcharge must be 0 or greater").optional(),
    securitySurcharge: z.number().min(0, "Security surcharge must be 0 or greater").optional(),
    customsClearance: z.number().min(0, "Customs clearance must be 0 or greater").optional(),
  }),
  isActive: z.boolean().default(true),
});

type PriceFormData = z.infer<typeof priceFormSchema>;

interface PriceFormProps {
  price?: PriceChart;
  onSubmit: (data: CreatePriceData | UpdatePriceData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PriceForm({ 
  price, 
  onSubmit, 
  onCancel, 
  loading = false 
}: PriceFormProps) {
  const isEdit = !!price;
  const [countries, setCountries] = useState<any[]>([]);

  const form = useForm<PriceFormData>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: price ? {
      fromCountry: price.fromCountry,
      toCountry: price.toCountry,
      serviceType: price.serviceType,
      weightTiers: price.weightTiers,
      additionalCharges: price.additionalCharges || {
        fuelSurcharge: 0,
        remoteSurcharge: 0,
        securitySurcharge: 0,
        customsClearance: 0,
      },
      isActive: price.isActive,
    } : {
      fromCountry: "",
      toCountry: "",
      serviceType: "standard",
      weightTiers: [
        {
          minWeight: 0,
          maxWeight: 5,
          pricePerKg: 10,
          basePrice: 25,
        },
      ],
      additionalCharges: {
        fuelSurcharge: 0,
        remoteSurcharge: 0,
        securitySurcharge: 0,
        customsClearance: 0,
      },
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "weightTiers",
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

  const handleSubmit = (data: PriceFormData) => {
    // Sort weight tiers by minWeight
    data.weightTiers.sort((a, b) => a.minWeight - b.minWeight);
    onSubmit(data);
  };

  const addWeightTier = () => {
    const lastTier = fields[fields.length - 1];
    const newMinWeight = lastTier ? lastTier.maxWeight : 0;
    
    append({
      minWeight: newMinWeight,
      maxWeight: newMinWeight + 5,
      pricePerKg: 10,
      basePrice: 25,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card data-testid="price-form-card">
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Price Chart" : "Create New Price Chart"}</CardTitle>
            <CardDescription>
              {isEdit 
                ? "Update pricing information and weight tiers" 
                : "Set up pricing for a specific shipping route and service type"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fromCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="from-country-select">
                          <SelectValue placeholder="Select origin" />
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
                name="toCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="to-country-select">
                          <SelectValue placeholder="Select destination" />
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
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="service-type-select">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="overnight">Overnight</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Weight Tiers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Weight Tiers</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure pricing based on package weight ranges
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWeightTier}
                  data-testid="add-weight-tier-btn"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Tier {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          data-testid={`remove-tier-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`weightTiers.${index}.minWeight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid={`min-weight-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`weightTiers.${index}.maxWeight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid={`max-weight-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`weightTiers.${index}.basePrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Base Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid={`base-price-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`weightTiers.${index}.pricePerKg`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per KG ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid={`price-per-kg-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Additional Charges */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Additional Charges</h3>
                <p className="text-sm text-muted-foreground">
                  Optional surcharges and fees (leave blank for 0)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="additionalCharges.fuelSurcharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Surcharge ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="fuel-surcharge-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalCharges.remoteSurcharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remote Area Surcharge ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="remote-surcharge-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalCharges.securitySurcharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Surcharge ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="security-surcharge-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalCharges.customsClearance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customs Clearance ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="customs-clearance-input"
                        />
                      </FormControl>
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
                    <FormLabel className="text-base">Active Price Chart</FormLabel>
                    <FormDescription>
                      Make this price chart available for shipping calculations
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="price-active-switch"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4" data-testid="price-form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            data-testid="cancel-price-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            data-testid="submit-price-btn"
          >
            {loading ? "Saving..." : isEdit ? "Update Price Chart" : "Create Price Chart"}
          </Button>
        </div>
      </form>
    </Form>
  );
}