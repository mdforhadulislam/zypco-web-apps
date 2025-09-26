"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { UserService } from "@/services/dashboardService";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  isVerified: boolean;
}

interface UserFormProps {
  user?: Partial<UserFormData>;
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

export function UserForm({ user, onSuccess, onCancel, isEdit = false }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "user",
      isActive: user?.isActive ?? true,
      isVerified: user?.isVerified ?? false,
    },
  });

  const watchedRole = watch("role");
  const watchedIsActive = watch("isActive");
  const watchedIsVerified = watch("isVerified");

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);

      if (isEdit && user?.phone) {
        const response = await UserService.updateUser(user.phone, data);
        if (response.success) {
          toast.success("User updated successfully");
          onSuccess?.(response.data);
        } else {
          toast.error(response.message || "Failed to update user");
        }
      } else {
        // For new users, we would need a create endpoint
        toast.info("User creation not implemented in current API");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card data-testid="user-form">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit User" : "Create User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Full name"
                data-testid="user-name-input"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder="email@example.com"
                data-testid="user-email-input"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone", { required: "Phone is required" })}
                placeholder="+1234567890"
                disabled={isEdit} // Phone cannot be changed in edit mode
                data-testid="user-phone-input"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={watchedRole}
                onValueChange={(value: "user" | "admin" | "moderator") => 
                  setValue("role", value)
                }
              >
                <SelectTrigger data-testid="user-role-select">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={watchedIsActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
                data-testid="user-active-switch"
              />
              <Label htmlFor="isActive">Active Account</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isVerified"
                checked={watchedIsVerified}
                onCheckedChange={(checked) => setValue("isVerified", checked)}
                data-testid="user-verified-switch"
              />
              <Label htmlFor="isVerified">Email Verified</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                data-testid="user-form-cancel"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              data-testid="user-form-submit"
            >
              {loading ? "Saving..." : isEdit ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}