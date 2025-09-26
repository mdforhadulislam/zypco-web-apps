"use client";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/Dashboard/DataTable";
import { RoleGuard } from "@/middleware/roleGuard";
import { NotificationService } from "@/services/dashboardService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface NotificationFormData {
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  category: "account" | "order" | "payment" | "system" | "security";
  channels: ("email" | "sms" | "inapp")[];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "view">("create");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    defaultValues: {
      title: "",
      message: "",
      type: "info",
      category: "system",
      channels: ["inapp"],
    },
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getNotifications({ limit: 50 });
      if (response.success) {
        setNotifications(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch notifications");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    reset();
    setSelectedNotification(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleView = (notification: any) => {
    setSelectedNotification(notification);
    setDialogMode("view");
    setIsDialogOpen(true);
  };

  const handleMarkAsRead = async (notification: any) => {
    try {
      const response = await NotificationService.markAsRead(notification._id);
      if (response.success) {
        toast.success("Notification marked as read");
        fetchNotifications();
      } else {
        toast.error(response.message || "Failed to mark as read");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleDelete = async (notification: any) => {
    if (!confirm(`Are you sure you want to delete this notification?`)) {
      return;
    }

    try {
      const response = await NotificationService.deleteNotification(notification._id);
      if (response.success) {
        toast.success("Notification deleted successfully");
        fetchNotifications();
      } else {
        toast.error(response.message || "Failed to delete notification");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const onSubmit = async (data: NotificationFormData) => {
    try {
      // For creating notifications, we'd need a user ID or broadcast functionality
      // This is a simplified version
      toast.info("Notification creation requires user selection - feature not fully implemented");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
    };
    const Icon = icons[type as keyof typeof icons] || Info;
    return <Icon className="h-4 w-4" />;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      success: "default",
      error: "destructive",
      warning: "secondary",
      info: "outline",
    } as const;
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || "outline"}>
        {getTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => (
    <Badge variant="outline" className="capitalize">
      {category}
    </Badge>
  );

  const columns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => getTypeBadge(value),
    },
    {
      key: "category",
      label: "Category",
      render: (value: string) => getCategoryBadge(value),
    },
    {
      key: "channels",
      label: "Channels",
      render: (value: string[]) => (
        <div className="flex space-x-1">
          {value?.map((channel, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {channel}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "isRead",
      label: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Read" : "Unread"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString(),
    },
  ];

  const NotificationDetails = ({ notification }: { notification: any }) => (
    <Card data-testid="notification-details">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getTypeIcon(notification.type)}
            <span>{notification.title}</span>
          </CardTitle>
          <div className="flex space-x-2">
            {getTypeBadge(notification.type)}
            {getCategoryBadge(notification.category)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Message</Label>
          <p className="mt-1 text-sm">{notification.message}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Channels</Label>
            <div className="flex space-x-1 mt-1">
              {notification.channels?.map((channel: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Status</Label>
            <div className="mt-1">
              <Badge variant={notification.isRead ? "default" : "secondary"}>
                {notification.isRead ? "Read" : "Unread"}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Created At</Label>
            <p className="mt-1 text-sm">{new Date(notification.createdAt).toLocaleString()}</p>
          </div>

          {notification.updatedAt && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Updated At</Label>
              <p className="mt-1 text-sm">{new Date(notification.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const watchedChannels = watch("channels");

  return (
    <RoleGuard allowedRoles={["admin", "moderator"]}>
      <div className="space-y-6" data-testid="notifications-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Manage system notifications and alerts
            </p>
          </div>
          <Button onClick={handleCreate} data-testid="create-notification-btn">
            <Plus className="h-4 w-4 mr-2" />
            Create Notification
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter((n: any) => n.isRead).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter((n: any) => !n.isRead).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter((n: any) => n.type === "error").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          title="Notifications"
          data={notifications}
          columns={columns}
          searchKeys={["title", "message", "category"]}
          onView={handleView}
          loading={loading}
          actions={[
            {
              label: "View Details",
              onClick: handleView,
              variant: "default",
            },
            {
              label: "Mark as Read",
              onClick: handleMarkAsRead,
              variant: "default",
              condition: (notification) => !notification.isRead,
            },
            {
              label: "Delete",
              onClick: handleDelete,
              variant: "destructive",
            },
          ]}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "create" ? "Create Notification" : "Notification Details"}
              </DialogTitle>
            </DialogHeader>

            {dialogMode === "view" && selectedNotification ? (
              <NotificationDetails notification={selectedNotification} />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Notification title"
                    data-testid="notification-title-input"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    {...register("message", { required: "Message is required" })}
                    placeholder="Notification message"
                    rows={4}
                    data-testid="notification-message-input"
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={watch("type")}
                      onValueChange={(value: any) => setValue("type", value)}
                    >
                      <SelectTrigger data-testid="notification-type-select">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={watch("category")}
                      onValueChange={(value: any) => setValue("category", value)}
                    >
                      <SelectTrigger data-testid="notification-category-select">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="order">Order</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Channels</Label>
                  <div className="space-y-2">
                    {["inapp", "email", "sms"].map((channel) => (
                      <div key={channel} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={channel}
                          checked={watchedChannels?.includes(channel as any)}
                          onChange={(e) => {
                            const current = watchedChannels || [];
                            if (e.target.checked) {
                              setValue("channels", [...current, channel as any]);
                            } else {
                              setValue("channels", current.filter(c => c !== channel));
                            }
                          }}
                          data-testid={`notification-channel-${channel}`}
                        />
                        <Label htmlFor={channel} className="capitalize">{channel === "inapp" ? "In-App" : channel}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="notification-form-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="notification-form-submit">
                    Create Notification
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}