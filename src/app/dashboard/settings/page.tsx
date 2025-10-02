"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/AuthContext";
import { RoleGuard } from "@/middleware/roleGuard";
import { UserService } from "@/services/dashboardService";
import { Bell, MapPin, Save, Settings, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private";
  dataSharing: boolean;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      email: true,
      sms: true,
      push: true,
    });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    dataSharing: false,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("phone", user.phone);

      // Load user-specific settings
      if (user.phone) {
        fetchUserAddresses();
      }
    }
  }, [user]);

  const fetchUserAddresses = async () => {
    try {
      if (!user?.phone) return;

      const response = await UserService.getUserAddresses(user.phone);
      if (response.status == 200) {
        setUserAddresses(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setLoading(true);

      if (!user?.phone) {
        toast.error("User phone not available");
        return;
      }

      const response = await UserService.updateUser(user.phone, data);

      if (response.status == 200) {
        updateUser(data);
        toast.success("Profile updated successfully");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    try {
      const updatedSettings = { ...notificationSettings, [key]: value };
      setNotificationSettings(updatedSettings);

      // Update user preferences
      if (user?.phone) {
        const response = await UserService.updateUser(user.phone, {
          preferences: {
            notifications: updatedSettings,
            privacy: privacySettings,
          },
        });

        if (response.status == 200) {
          toast.success("Notification settings updated");
        } else {
          // Revert on failure
          setNotificationSettings(notificationSettings);
          toast.error("Failed to update settings");
        }
      }
    } catch (error) {
      setNotificationSettings(notificationSettings);
      toast.error("An error occurred");
    }
  };

  const handlePrivacyUpdate = async (
    key: keyof PrivacySettings,
    value: any
  ) => {
    try {
      const updatedSettings = { ...privacySettings, [key]: value };
      setPrivacySettings(updatedSettings);

      if (user?.phone) {
        const response = await UserService.updateUser(user.phone, {
          preferences: {
            notifications: notificationSettings,
            privacy: updatedSettings,
          },
        });

        if (response.status == 200) {
          toast.success("Privacy settings updated");
        } else {
          setPrivacySettings(privacySettings);
          toast.error("Failed to update settings");
        }
      }
    } catch (error) {
      setPrivacySettings(privacySettings);
      toast.error("An error occurred");
    }
  };

  return (
    <RoleGuard allowedRoles={["admin", "moderator", "user"]}>
      <div className="space-y-6" data-testid="settings-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger
              value="profile"
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center space-x-2"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Addresses</span>
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card data-testid="profile-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(onSubmitProfile)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...register("name", { required: "Name is required" })}
                        data-testid="profile-name-input"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                        })}
                        data-testid="profile-email-input"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        disabled
                        data-testid="profile-phone-input"
                      />
                      <p className="text-xs text-gray-500">
                        Phone number cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Status</Label>
                      <div className="flex space-x-2">
                        <Badge
                          variant={user?.isActive ? "default" : "destructive"}
                        >
                          {user?.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge
                          variant={user?.isVerified ? "default" : "secondary"}
                        >
                          {user?.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {user?.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      data-testid="save-profile-btn"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card data-testid="notification-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) =>
                        handleNotificationUpdate("email", checked)
                      }
                      data-testid="email-notifications-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notificationSettings.sms}
                      onCheckedChange={(checked) =>
                        handleNotificationUpdate("sms", checked)
                      }
                      data-testid="sms-notifications-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive push notifications in the app
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.push}
                      onCheckedChange={(checked) =>
                        handleNotificationUpdate("push", checked)
                      }
                      data-testid="push-notifications-switch"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card data-testid="privacy-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile-visibility">
                        Profile Visibility
                      </Label>
                      <p className="text-sm text-gray-500">
                        Control who can see your profile
                      </p>
                    </div>
                    <select
                      id="profile-visibility"
                      value={privacySettings.profileVisibility}
                      onChange={(e) =>
                        handlePrivacyUpdate("profileVisibility", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="profile-visibility-select"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-sharing">Data Sharing</Label>
                      <p className="text-sm text-gray-500">
                        Allow sharing of anonymized data for analytics
                      </p>
                    </div>
                    <Switch
                      id="data-sharing"
                      checked={privacySettings.dataSharing}
                      onCheckedChange={(checked) =>
                        handlePrivacyUpdate("dataSharing", checked)
                      }
                      data-testid="data-sharing-switch"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <Card data-testid="address-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Saved Addresses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userAddresses.length > 0 ? (
                  <div className="space-y-4">
                    {userAddresses.map((address: any, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">
                              {address.label || "Address"}
                            </p>
                            <Badge variant="outline">
                              {address.type || "Other"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.address}
                            <br />
                            {address.city}, {address.zipCode}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No saved addresses found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Addresses will appear here when you create orders
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card data-testid="advanced-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Advanced Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Account Information</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-sm text-gray-500">User ID</Label>
                        <p className="font-mono text-sm">{user?.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          Last Login
                        </Label>
                        <p className="text-sm">
                          {user?.lastLogin
                            ? new Date(user.lastLogin).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {user?.role === "admin" && (
                    <div>
                      <Label>Admin Tools</Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Additional administrative functions and system settings
                      </p>
                      <Button variant="outline" className="mr-2">
                        System Configuration
                      </Button>
                      <Button variant="outline">User Management</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
