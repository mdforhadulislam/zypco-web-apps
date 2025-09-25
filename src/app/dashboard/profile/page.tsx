"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/AuthContext";
import { useApiMutation } from "@/hooks/UserApi";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Camera,
  Edit,
  Save,
  RefreshCw,
  Package,
  Star,
  Clock,
  CreditCard,
  Eye,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Building,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  company: string;
  joinedDate: string;
  lastLogin: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "warning";
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { mutateApi } = useApiMutation();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    bio: "",
    location: "",
    website: "",
    company: "",
    joinedDate: user?.createdAt || "",
    lastLogin: user?.lastLogin || "",
    emailVerified: user?.isVerified || false,
    phoneVerified: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock activity data - in real app, fetch from API
  const activityLogs: ActivityLog[] = [
    {
      id: "1",
      action: "Login",
      description: "Successful login from Chrome on Windows",
      timestamp: "2024-01-15T10:30:00Z",
      ipAddress: "192.168.1.1",
      userAgent: "Chrome 120.0.0.0",
      status: "success"
    },
    {
      id: "2",
      action: "Password Change",
      description: "Password successfully updated",
      timestamp: "2024-01-10T14:22:00Z",
      ipAddress: "192.168.1.1",
      userAgent: "Chrome 120.0.0.0",
      status: "success"
    },
    {
      id: "3",
      action: "Failed Login",
      description: "Failed login attempt - incorrect password",
      timestamp: "2024-01-08T09:15:00Z",
      ipAddress: "203.0.113.0",
      userAgent: "Chrome 119.0.0.0",
      status: "failed"
    },
    {
      id: "4",
      action: "Profile Update",
      description: "Updated profile information",
      timestamp: "2024-01-05T16:45:00Z",
      ipAddress: "192.168.1.1",
      userAgent: "Chrome 120.0.0.0",
      status: "success"
    },
  ];

  // Mock orders data
  const recentOrders = [
    {
      id: "ORD-001",
      trackId: "TRK-123456",
      from: "New York, NY",
      to: "Los Angeles, CA",
      status: "delivered",
      date: "2024-01-10",
      amount: 125.50
    },
    {
      id: "ORD-002", 
      trackId: "TRK-789012",
      from: "Chicago, IL",
      to: "Miami, FL",
      status: "in-transit",
      date: "2024-01-08",
      amount: 89.00
    },
    {
      id: "ORD-003",
      trackId: "TRK-345678",
      from: "Seattle, WA",
      to: "Boston, MA",
      status: "pending",
      date: "2024-01-05",
      amount: 156.25
    },
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
        bio: "",
        location: "",
        website: "",
        company: "",
        joinedDate: user.createdAt || "",
        lastLogin: user.lastLogin || "",
        emailVerified: user.isVerified || false,
        phoneVerified: false,
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    try {
      const result = await mutateApi(`/api/v1/accounts/${user?.id}`, {
        method: "PUT",
        data: {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          company: profileData.company,
        },
        successMessage: "Profile updated successfully",
      });

      if (result?.success) {
        updateUser({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/accounts/${user?.id}/avatar`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({ ...prev, avatar: data.avatarUrl }));
        updateUser({ avatar: data.avatarUrl });
        toast.success("Profile picture updated successfully");
      } else {
        throw new Error("Avatar upload failed");
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="default" className="bg-green-600">Delivered</Badge>;
      case "in-transit":
        return <Badge variant="default">In Transit</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" data-testid="profile-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {user?.role}
          </Badge>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders History</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback className="text-2xl">
                      {profileData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="space-y-2 w-full">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                          <Camera className="h-4 w-4" />
                          <span>Upload New Photo</span>
                        </div>
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isUpdating}
                        />
                      </Label>
                      <p className="text-xs text-gray-500 text-center">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  )}
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">{profileData.name}</h2>
                    <p className="text-gray-600">{profileData.email}</p>
                    <Badge variant="outline" className="mt-2 capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50 pr-10" : "pr-10"}
                      />
                      {profileData.emailVerified && (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {profileData.emailVerified && (
                      <p className="text-xs text-green-600 mt-1">Email verified</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50 pr-10" : "pr-10"}
                      />
                      {profileData.phoneVerified && (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {profileData.joinedDate ? new Date(profileData.joinedDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-gray-600">
                      {profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : "Never"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Account Status</p>
                    <p className="text-sm text-gray-600">
                      {user?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders History Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order History</span>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Track ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.trackId}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <MapPin className="h-3 w-3 text-green-600" />
                            <span>{order.from}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 text-red-600" />
                            <span>{order.to}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">${order.amount}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Activity Log</span>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Export Log
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="mt-1">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{log.action}</h3>
                        <time className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </time>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span>IP: {log.ipAddress}</span>
                        <span>•</span>
                        <span>{log.userAgent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Email Verified</p>
                      <p className="text-xs text-gray-600">Your email is verified</p>
                    </div>
                  </div>
                  <Badge variant="default">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Phone Verification</p>
                      <p className="text-xs text-gray-600">Phone number not verified</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Verify Now
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-600">2FA is not enabled</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Password & Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Password & Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-xs text-gray-600">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Active Sessions</p>
                      <p className="text-xs text-gray-600">3 active sessions</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Sessions
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Login Alerts</p>
                      <p className="text-xs text-gray-600">Get notified of new logins</p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}