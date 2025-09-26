"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { CreateUserData, UpdateUserData, User } from "@/types";
import { Eye, EyeOff } from "lucide-react";

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["admin", "moderator", "user"], {
    required_error: "Please select a role",
  }),
  password: z.string().optional(),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
});

// For create mode, password is required
const createUserSchema = userFormSchema.extend({
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

// For edit mode, password is optional
const editUserSchema = userFormSchema.extend({
  password: z.string().optional().refine((val) => {
    if (val && val.length > 0) {
      return val.length >= 8;
    }
    return true;
  }, "Password must be at least 8 characters if provided"),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserData | UpdateUserData) => void;
  onCancel: () => void;
  loading?: boolean;
  currentUserRole: "admin" | "moderator" | "user";
}

export function UserForm({ 
  user, 
  onSubmit, 
  onCancel, 
  loading = false,
  currentUserRole 
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: "",
      isActive: user.isActive,
      isVerified: user.isVerified,
    } : {
      name: "",
      email: "",
      phone: "",
      role: "user",
      password: "",
      isActive: true,
      isVerified: false,
    },
  });

  const handleSubmit = (data: UserFormData) => {
    const submitData = { ...data };
    
    // Remove password if it's empty in edit mode
    if (isEdit && !submitData.password) {
      delete submitData.password;
    }
    
    onSubmit(submitData);
  };

  // Role options based on current user's role
  const getRoleOptions = () => {
    const options = [
      { value: "user", label: "User", description: "Basic user with limited permissions" },
    ];

    if (currentUserRole === "admin" || currentUserRole === "moderator") {
      options.push({
        value: "moderator",
        label: "Moderator",
        description: "Moderate content and manage users",
      });
    }

    if (currentUserRole === "admin") {
      options.push({
        value: "admin",
        label: "Administrator",
        description: "Full system access and permissions",
      });
    }

    return options;
  };

  const roleOptions = getRoleOptions();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card data-testid="user-form-card">
          <CardHeader>
            <CardTitle>{isEdit ? "Edit User" : "Create New User"}</CardTitle>
            <CardDescription>
              {isEdit 
                ? "Update user information and settings" 
                : "Fill in the details to create a new user account"
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
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter full name" 
                        {...field} 
                        data-testid="user-name-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="Enter email address" 
                        {...field} 
                        data-testid="user-email-input"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter phone number" 
                        {...field} 
                        data-testid="user-phone-input"
                      />
                    </FormControl>
                    <FormDescription>
                      Phone number is used as the unique identifier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      data-testid="user-role-select"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password {isEdit && "(Leave blank to keep current password)"}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder={isEdit ? "Enter new password (optional)" : "Enter password"} 
                        {...field} 
                        data-testid="user-password-input"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="toggle-password-visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {!isEdit && "Password must be at least 8 characters long"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Switches - Only for Admin/Moderator */}
            {(currentUserRole === "admin" || currentUserRole === "moderator") && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Account Status</h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Account</FormLabel>
                            <FormDescription>
                              Allow user to login and access the system
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="user-active-switch"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isVerified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Verified Account</FormLabel>
                            <FormDescription>
                              Mark account as verified (bypasses email verification)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="user-verified-switch"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4" data-testid="user-form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            data-testid="cancel-user-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            data-testid="submit-user-btn"
          >
            {loading ? "Saving..." : isEdit ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}