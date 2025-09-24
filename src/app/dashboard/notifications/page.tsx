"use client";
import {
    deleteRequestSend,
    getRequestSend,
    postRequestSend,
    putRequestSend,
} from "@/components/ApiCall/methord";
import {
    NOTIFICATION_API,
    SINGLE_NOTIFICATION_API,
} from "@/components/ApiCall/url";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/hooks/AuthContext";
import {
    AlertTriangle,
    Bell,
    BellRing,
    CheckCircle,
    Info,
    LoaderCircle,
    Mail,
    Plus,
    Search,
    Trash2,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "sonner";

type Notification = {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
};

const DashboardNotifications = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");

  // InfiniteScroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Role-based permissions
  const canViewAll = user?.role === "admin" || user?.role === "moderator";
  const canManage = user?.role === "admin" || user?.role === "moderator";
  const canDelete = user?.role === "admin";
  const canCreate = user?.role === "admin";

  // Fetch notifications with pagination and filters
  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      const queryParams = new URLSearchParams();

      // Add user filter for non-admin users
      if (user?.role === "user") {
        queryParams.set("user", user.id);
      }

      queryParams.set("page", pageNum.toString());
      queryParams.set("limit", "10");

      if (searchTerm) {
        queryParams.set("search", searchTerm);
      }

      if (filterRead !== "all") {
        queryParams.set("read", filterRead);
      }

      const url = `${NOTIFICATION_API}?${queryParams.toString()}`;
      const response = await getRequestSend<Notification[]>(url, {
        Authorization: `Bearer ${user?.token}`,
      });

      if (response.status == 200 && response.data) {
        const newNotifications = Array.isArray(response.data) ? response.data : [];

        if (reset || pageNum == 1) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }

        // Check if there are more pages
        const totalPages = response.meta?.totalPages || 1;
        setHasMore(pageNum < totalPages);

        if (pageNum === 1) {
          toast.success("Notifications loaded successfully");
        }
      } else {
        toast.error(response.message || "Failed to fetch notifications");
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Failed to fetch notifications");
      console.error("Fetch notifications error:", error);
      setHasMore(false);
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch more notifications for infinite scroll
  const fetchMoreNotifications = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, false);
  };

  // Load initial data
  useEffect(() => {
    if (user?.token) {
    //   fetchNotifications(1, true);
    
      
      setPage(1);
    }
  }, [user, searchTerm, filterType, filterRead]);

  // Filter notifications based on search term and filters
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType == "all" || notification.type === filterType;
    const matchesRead = filterRead == "all" || 
      (filterRead === "true" ? notification.read : !notification.read);

    return matchesSearch && matchesType && matchesRead;
  });

  // Calculate stats
  const stats = {
    total: filteredNotifications.length,
    unread: filteredNotifications.filter((n) => !n.read).length,
    read: filteredNotifications.filter((n) => n.read).length,
    info: filteredNotifications.filter((n) => n.type == "info").length,
    warning: filteredNotifications.filter((n) => n.type == "warning").length,
    error: filteredNotifications.filter((n) => n.type == "error").length,
    success: filteredNotifications.filter((n) => n.type == "success").length,
  };

  const typeColors: Record<string, string> = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
  };

  const typeIcons: Record<string, React.ReactNode> = {
    info: <Info className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
  };

  // Handle create notification
  const handleCreateNotification = async (formData: FormData) => {
    try {
      setLoading(true);

      const notificationData = {
        userId: formData.get("userId") as string,
        title: formData.get("title") as string,
        message: formData.get("message") as string,
        type: formData.get("type") as string,
        read: false,
      };

      const response = await postRequestSend(
        NOTIFICATION_API,
        { Authorization: `Bearer ${user?.token}` },
        notificationData
      );

      if (response.status === 201) {
        toast.success("Notification created successfully");
        setIsCreateModalOpen(false);
        // Reset and fetch fresh data
        setNotifications([]);
        setPage(1);
        setHasMore(true);
        fetchNotifications(1, true);
      } else {
        toast.error(response.message || "Failed to create notification");
      }
    } catch (error) {
      toast.error("Failed to create notification");
      console.error("Create notification error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notification: Notification) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete notifications");
      return;
    }

    if (confirm(`Are you sure you want to delete this notification?`)) {
      try {
        const response = await deleteRequestSend(
          SINGLE_NOTIFICATION_API(notification._id),
          { Authorization: `Bearer ${user?.token}` }
        );

        if (response.status == 200) {
          toast.success("Notification deleted successfully");
          setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
        } else {
          toast.error(response.message || "Failed to delete notification");
        }
      } catch (error) {
        toast.error("Failed to delete notification");
        console.error("Delete notification error:", error);
      }
    }
  };

  // Handle mark as read/unread
  const handleToggleRead = async (notification: Notification) => {
    try {
      const response = await putRequestSend(
        SINGLE_NOTIFICATION_API(notification._id),
        { Authorization: `Bearer ${user?.token}` },
        { 
          ...notification,
          read: !notification.read 
        }
      );

      if (response.status == 200) {
        const status = !notification.read ? "read" : "unread";
        toast.success(`Notification marked as ${status}`);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id
              ? { ...n, read: !n.read }
              : n
          )
        );
      } else {
        toast.error(response.message || "Failed to update notification");
      }
    } catch (error) {
      toast.error("Failed to update notification");
      console.error("Toggle read error:", error);
    }
  };

  // Handle bulk mark as read
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) {
      toast.info("All notifications are already read");
      return;
    }

    try {
      // Update all unread notifications
      const updatePromises = unreadNotifications.map(notification =>
        putRequestSend(
          SINGLE_NOTIFICATION_API(notification._id),
          { Authorization: `Bearer ${user?.token}` },
          { ...notification, read: true }
        )
      );

      await Promise.all(updatePromises);
      
      toast.success(`Marked ${unreadNotifications.length} notifications as read`);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
      console.error("Bulk mark as read error:", error);
    }
  };

  // Notification Card Component (similar to PickupCard pattern)
  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card 
      className={`mb-4 py-2 ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`} 
      data-testid={`notification-card-${notification._id}`}
    >
      <CardContent className="py-2 px-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              {typeIcons[notification.type] || <Bell className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className={`font-semibold text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                  {notification.title}
                </p>
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs">
                    NEW
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                {notification.message.substring(0, 120)}
                {notification.message.length > 120 && '...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge
              className={
                typeColors[notification.type] || "bg-gray-100 text-gray-800"
              }
            >
              {notification.type.toUpperCase()}
            </Badge>
            
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedNotification(notification);
                  setIsViewModalOpen(true);
                }}
              >
                View
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleToggleRead(notification)}
                title={notification.read ? "Mark as unread" : "Mark as read"}
              >
                {notification.read ? (
                  <Mail className="h-4 w-4" />
                ) : (
                  <BellRing className="h-4 w-4" />
                )}
              </Button>

              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNotification(notification)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>
          {notification.read && (
            <span className="text-green-600">✓ Read</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" data-testid="notifications-page">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="notifications-title"
          >
            {user?.role === "user" ? "My Notifications" : "Notifications Management"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "user"
              ? "View and manage your notifications"
              : user?.role === "moderator"
              ? "Manage user notifications and system alerts"
              : "Manage all system notifications and user communications"}
          </p>
        </div>
        
        <div className="flex gap-2">
          {stats.unread > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              data-testid="mark-all-read-btn"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Read ({stats.unread})
            </Button>
          )}
          
          {canCreate && (
            <AlertDialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <AlertDialogTrigger asChild>
                <Button data-testid="create-notification-btn" disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Notification
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                data-testid="create-notification-modal"
                className="max-w-2xl"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Create New Notification</AlertDialogTitle>
                </AlertDialogHeader>
                <form action={handleCreateNotification} className="space-y-4">
                  <div>
                    <Label htmlFor="userId">User ID</Label>
                    <Input 
                      id="userId" 
                      name="userId" 
                      placeholder="Enter user ID to send notification"
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="Notification title"
                      required 
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Notification message..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <AlertDialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <AlertDialogAction asChild>
                      <Button
                        type="submit"
                        data-testid="create-notification-submit"
                        disabled={loading}
                      >
                        {loading && (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Send Notification
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <StatsCard
          title="Total Notifications"
          value={stats.total}
          icon={Bell}
          trend="neutral"
        />
        <StatsCard
          title="Unread"
          value={stats.unread}
          icon={BellRing}
          trend="neutral"
        />
        <StatsCard
          title="Read"
          value={stats.read}
          icon={Mail}
          trend="neutral"
        />
        <StatsCard
          title="Info"
          value={stats.info}
          icon={Info}
          trend="neutral"
        />
        <StatsCard
          title="Success"
          value={stats.success}
          icon={CheckCircle}
          trend="up"
        />
        <StatsCard
          title="Warning"
          value={stats.warning}
          icon={AlertTriangle}
          trend="neutral"
        />
        <StatsCard
          title="Error"
          value={stats.error}
          icon={XCircle}
          trend="down"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            data-testid="notification-search-input"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterRead} onValueChange={setFilterRead}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="false">Unread</SelectItem>
            <SelectItem value="true">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List with InfiniteScroll */}
      <div data-testid="notifications-list">
        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading notifications...</span>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={filteredNotifications.length}
            next={fetchMoreNotifications}
            hasMore={hasMore}
            loader={
              <div className="flex items-center justify-center py-4">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading more notifications...</span>
              </div>
            }
            endMessage={
              <p className="text-center py-4 text-gray-500">
                {filteredNotifications.length === 0
                  ? "No notifications found"
                  : "No more notifications to load"}
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {filteredNotifications.map((notification) => (
              <NotificationCard key={notification._id} notification={notification} />
            ))}
          </InfiniteScroll>
        )}
      </div>

      {/* View Notification Modal */}
      <AlertDialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {selectedNotification && typeIcons[selectedNotification.type]}
              Notification Details
            </AlertDialogTitle>
          </AlertDialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedNotification.title}</span>
                    <Badge className={typeColors[selectedNotification.type]}>
                      {selectedNotification.type.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-700">Message:</p>
                    <p className="text-gray-600 mt-1">{selectedNotification.message}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Status:</p>
                      <p className={selectedNotification.read ? "text-green-600" : "text-blue-600"}>
                        {selectedNotification.read ? "Read" : "Unread"}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Sent At:</p>
                      <p className="text-gray-600">
                        {new Date(selectedNotification.sentAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">User ID:</p>
                      <p className="text-gray-600 font-mono text-xs">
                        {selectedNotification.userId}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Created:</p>
                      <p className="text-gray-600">
                        {new Date(selectedNotification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <AlertDialogFooter>
            {selectedNotification && (
              <Button
                variant="outline"
                onClick={() => {
                  handleToggleRead(selectedNotification);
                  setIsViewModalOpen(false);
                }}
              >
                Mark as {selectedNotification.read ? "Unread" : "Read"}
              </Button>
            )}
            <AlertDialogAction onClick={() => setIsViewModalOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardNotifications;