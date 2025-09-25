"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/AuthContext";
import { useNotifications, useApiMutation } from "@/hooks/UserApi";
import { NOTIFICATIONS_API, NOTIFICATION_BY_ID_API } from "@/components/ApiCall/url";
import {
  Eye,
  Filter,
  Bell,
  Plus,
  Search,
  Edit,
  Trash2,
  Send,
  BellRing,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  Clock,
  Calendar,
  MarkAsRead,
  Archive,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "all" | "users" | "moderators" | "admins";
  isRead: boolean;
  isArchived: boolean;
  scheduledFor?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdBy: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  readBy?: Array<{
    user: string;
    readAt: string;
  }>;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Build filter params
  const filterParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(typeFilter !== "all" && { type: typeFilter }),
    ...(priorityFilter !== "all" && { priority: priorityFilter }),
    ...(audienceFilter !== "all" && { targetAudience: audienceFilter }),
    ...(statusFilter === "read" && { isRead: true }),
    ...(statusFilter === "unread" && { isRead: false }),
    ...(statusFilter === "archived" && { isArchived: true }),
    ...(statusFilter === "active" && { isArchived: false }),
  };

  const {
    data: notifications,
    meta,
    isLoading,
    error,
    mutate: refreshNotifications,
  } = useNotifications(filterParams);

  const { mutateApi } = useApiMutation();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "info":
        return <Badge variant="default">Info</Badge>;
      case "success":
        return <Badge variant="default" className="bg-green-600">Success</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-600">Warning</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="destructive" className="bg-orange-600">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const handleMarkAsRead = async (notificationIds: string[]) => {
    for (const id of notificationIds) {
      await mutateApi(NOTIFICATION_BY_ID_API(id), {
        method: "PUT",
        data: { isRead: true },
        showSuccessToast: false,
        onSuccess: () => refreshNotifications(),
      });
    }
    toast.success(`${notificationIds.length} notification(s) marked as read`);
    setSelectedNotifications([]);
  };

  const handleArchive = async (notificationIds: string[]) => {
    for (const id of notificationIds) {
      await mutateApi(NOTIFICATION_BY_ID_API(id), {
        method: "PUT",
        data: { isArchived: true },
        showSuccessToast: false,
        onSuccess: () => refreshNotifications(),
      });
    }
    toast.success(`${notificationIds.length} notification(s) archived`);
    setSelectedNotifications([]);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    await mutateApi(NOTIFICATION_BY_ID_API(notificationId), {
      method: "DELETE",
      successMessage: "Notification deleted successfully",
      onSuccess: () => {
        refreshNotifications();
        setShowNotificationDialog(false);
      },
    });
  };

  const handleCreateNotification = async (notificationData: any) => {
    await mutateApi(NOTIFICATIONS_API, {
      method: "POST",
      data: {
        ...notificationData,
        createdBy: user?._id,
      },
      successMessage: "Notification created successfully",
      onSuccess: () => {
        refreshNotifications();
        setShowCreateDialog(false);
      },
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications?.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications?.map((n: Notification) => n._id) || []);
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Check permissions
  const canManageNotifications = user?.role === "admin" || user?.role === "moderator";

  return (
    <div className="space-y-6" data-testid="notifications-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BellRing className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications Management</h1>
        </div>
        {canManageNotifications && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            data-testid="create-notification-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
                <p className="text-2xl font-bold">{meta?.total || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">
                  {notifications?.filter((n: Notification) => !n.isRead).length || 0}
                </p>
              </div>
              <BellRing className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">
                  {notifications?.filter((n: Notification) => n.priority === "high" || n.priority === "urgent").length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold">
                  {notifications?.filter((n: Notification) => n.isArchived).length || 0}
                </p>
              </div>
              <Archive className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="priority-filter">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="audience-filter">Audience</Label>
              <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                <SelectTrigger data-testid="audience-filter">
                  <SelectValue placeholder="All audiences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All audiences</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="moderators">Moderators</SelectItem>
                  <SelectItem value="admins">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setPriorityFilter("all");
                  setAudienceFilter("all");
                  setStatusFilter("all");
                  setPage(1);
                }}
                data-testid="clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedNotifications.length} notification(s) selected
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsRead(selectedNotifications)}
                  data-testid="bulk-mark-read"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchive(selectedNotifications)}
                  data-testid="bulk-archive"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNotifications([])}
                  data-testid="clear-selection"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications ({meta?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load notifications</p>
              <Button onClick={() => refreshNotifications()} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Table data-testid="notifications-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedNotifications.length === notifications?.length && notifications?.length > 0}
                        onCheckedChange={handleSelectAll}
                        data-testid="select-all"
                      />
                    </TableHead>
                    <TableHead>Notification</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications?.map((notification: Notification) => (
                    <TableRow 
                      key={notification._id} 
                      className={!notification.isRead ? "bg-blue-50" : ""}
                      data-testid={`notification-row-${notification._id}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedNotifications.includes(notification._id)}
                          onCheckedChange={() => handleSelectNotification(notification._id)}
                          data-testid={`select-notification-${notification._id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(notification.type)}
                            <span className="font-medium">{notification.title}</span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(notification.type)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(notification.priority)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {notification.targetAudience}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {notification.isRead ? (
                              <Badge variant="secondary">Read</Badge>
                            ) : (
                              <Badge variant="default">Unread</Badge>
                            )}
                          </div>
                          {notification.isArchived && (
                            <Badge variant="outline">Archived</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{notification.createdBy?.name}</p>
                          <p className="text-xs text-gray-600 capitalize">{notification.createdBy?.role}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedNotification(notification);
                              setShowNotificationDialog(true);
                            }}
                            data-testid={`view-notification-${notification._id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead([notification._id])}
                              className="text-blue-600 hover:text-blue-700"
                              data-testid={`mark-read-${notification._id}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {canManageNotifications && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification._id)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`delete-notification-${notification._id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((meta.page - 1) * 20) + 1} to {Math.min(meta.page * 20, meta.total)} of {meta.total} notifications
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      data-testid="prev-page"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage(page + 1)}
                      data-testid="next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Details Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="sm:max-w-2xl" data-testid="notification-details-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedNotification && getTypeIcon(selectedNotification.type)}
              <span>Notification Details</span>
            </DialogTitle>
            <DialogDescription>
              Complete notification information
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{selectedNotification.title}</h3>
                  <div className="flex items-center space-x-2">
                    {getTypeBadge(selectedNotification.type)}
                    {getPriorityBadge(selectedNotification.priority)}
                    <Badge variant="outline" className="capitalize">
                      {selectedNotification.targetAudience}
                    </Badge>
                  </div>
                </div>
                {!selectedNotification.isRead && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label>Message</Label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>
              </div>

              {/* Action Button */}
              {selectedNotification.actionUrl && selectedNotification.actionText && (
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedNotification.actionUrl, '_blank')}
                  >
                    {selectedNotification.actionText}
                  </Button>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created By</Label>
                  <p className="text-sm font-medium">{selectedNotification.createdBy?.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{selectedNotification.createdBy?.role}</p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p className="text-sm">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                </div>
                {selectedNotification.scheduledFor && (
                  <div>
                    <Label>Scheduled For</Label>
                    <p className="text-sm">{new Date(selectedNotification.scheduledFor).toLocaleString()}</p>
                  </div>
                )}
                {selectedNotification.expiresAt && (
                  <div>
                    <Label>Expires At</Label>
                    <p className="text-sm">{new Date(selectedNotification.expiresAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Read Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedNotification.isRead ? (
                    <Badge variant="secondary">Read</Badge>
                  ) : (
                    <Badge variant="default">Unread</Badge>
                  )}
                  {selectedNotification.isArchived && (
                    <Badge variant="outline">Archived</Badge>
                  )}
                </div>
              </div>

              {/* Read By Stats */}
              {selectedNotification.readBy && selectedNotification.readBy.length > 0 && (
                <div className="space-y-2">
                  <Label>Read by {selectedNotification.readBy.length} user(s)</Label>
                  <div className="max-h-32 overflow-y-auto">
                    {selectedNotification.readBy.map((read: any, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{read.user}</span>
                        <span>{new Date(read.readAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {!selectedNotification.isRead && (
                  <Button
                    onClick={() => handleMarkAsRead([selectedNotification._id])}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Mark as Read
                  </Button>
                )}
                {canManageNotifications && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteNotification(selectedNotification._id)}
                  >
                    Delete Notification
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Notification Dialog would go here */}
    </div>
  );
}