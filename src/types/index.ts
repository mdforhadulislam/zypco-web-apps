// Core User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "moderator";
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Order Related Types
export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  landmark?: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  address: Address;
}

export interface ParcelItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight?: number;
  description?: string;
}

export interface Payment {
  pType: "cash-on-delivery" | "prepaid" | "credit-card" | "bank-transfer";
  pAmount: number;
  pOfferDiscount: number;
  pExtraCharge: number;
  pDiscount: number;
  pReceived: number;
  pRefunded: number;
  status?: "pending" | "completed" | "failed" | "refunded";
}

export interface Parcel {
  from: string;
  to: string;
  weight: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  orderType: "standard" | "express" | "overnight" | "international";
  priority: "low" | "normal" | "high" | "urgent";
  description?: string;
  sender: ContactInfo;
  receiver: ContactInfo;
  item?: ParcelItem[];
}

export interface Order {
  _id: string;
  trackId: string;
  orderDate: string;
  parcel: Parcel;
  payment: Payment;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Pickup Types
export interface Pickup {
  _id: string;
  orderId?: string;
  trackId?: string;
  scheduledDate: string;
  scheduledTime: string;
  actualPickupDate?: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "failed" | "cancelled";
  address: Address;
  contactPerson: {
    name: string;
    phone: string;
    email?: string;
  };
  instructions?: string;
  driverNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  _id: string;
  user: string | User;
  rating: number; // 1-5
  comment: string;
  orderId?: string;
  serviceType?: "delivery" | "pickup" | "customer-service" | "overall";
  isVerified: boolean;
  isFeatured: boolean;
  helpfulCount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "order" | "pickup" | "system" | "promotion" | "announcement";
  priority: "low" | "normal" | "high" | "urgent";
  isRead: boolean;
  channels: ("inapp" | "email" | "sms" | "push")[];
  actionUrl?: string;
  actionText?: string;
  data?: Record<string, any>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Content Types
export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string | User;
  category: string;
  tags: string[];
  featuredImage?: string;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: "general" | "support" | "complaint" | "suggestion" | "partnership";
  priority: "low" | "normal" | "high";
  status: "new" | "in-progress" | "resolved" | "closed";
  assignedTo?: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
}

// Offer Types
export interface Offer {
  _id: string;
  title: string;
  description: string;
  code?: string;
  type: "discount" | "free-shipping" | "cashback" | "bogo";
  value: number; // percentage or fixed amount
  isPercentage: boolean;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usageCount: number;
  applicableServices: string[];
  status: "active" | "inactive" | "expired";
  createdAt: string;
  updatedAt: string;
}

// Price/Rate Chart Types
export interface Country {
  _id: string;
  name: string;
  code: string; // ISO country code
  region: string;
  currency: string;
  isActive: boolean;
  deliveryDays: {
    standard: number;
    express: number;
    overnight: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PriceChart {
  _id: string;
  fromCountry: string;
  toCountry: string;
  serviceType: "standard" | "express" | "overnight";
  weightTiers: {
    minWeight: number;
    maxWeight: number;
    pricePerKg: number;
    basePrice: number;
  }[];
  additionalCharges: {
    fuelSurcharge?: number;
    remoteSurcharge?: number;
    securitySurcharge?: number;
    customsClearance?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface AnalyticsData {
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string;
  metrics: Record<string, number | string>;
  trends: {
    label: string;
    value: number;
    change: number;
    changeType: "increase" | "decrease" | "stable";
  }[];
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalDeliveries: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
  recentOrders: Order[];
  recentUsers: User[];
  popularRoutes: {
    route: string;
    count: number;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    userRole?: string;
    filteredByRole?: boolean;
  };
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form and UI Types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "select" | "textarea" | "date" | "datetime-local" | "checkbox" | "radio";
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any) => string | null;
  };
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
  className?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: "select" | "date" | "text" | "number";
  options?: { value: string; label: string }[];
  multiple?: boolean;
}

// Settings Types
export interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    timezone: string;
    language: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    categories: {
      orders: boolean;
      promotions: boolean;
      updates: boolean;
    };
  };
  privacy: {
    profileVisibility: "public" | "private";
    showEmail: boolean;
    showPhone: boolean;
  };
}

export interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportPhone: string;
    businessHours: string;
  };
  features: {
    enableRegistration: boolean;
    enableGuestOrders: boolean;
    enableReviews: boolean;
    enableNotifications: boolean;
  };
  integrations: {
    emailProvider: string;
    smsProvider: string;
    paymentGateway: string;
    trackingProvider: string;
  };
}

// Utility Types
export type Role = "admin" | "moderator" | "user";
export type Permission = "create" | "read" | "update" | "delete";
export type EntityType = "orders" | "users" | "pickups" | "reviews" | "notifications" | "content" | "offers" | "settings";

export interface RolePermissions {
  [key: string]: Permission[];
}

// Default role permissions
export const DEFAULT_PERMISSIONS: Record<Role, RolePermissions> = {
  admin: {
    orders: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
    pickups: ["create", "read", "update", "delete"],
    reviews: ["create", "read", "update", "delete"],
    notifications: ["create", "read", "update", "delete"],
    content: ["create", "read", "update", "delete"],
    offers: ["create", "read", "update", "delete"],
    settings: ["create", "read", "update", "delete"],
    analytics: ["read"],
  },
  moderator: {
    orders: ["create", "read", "update", "delete"],
    users: ["read", "update"],
    pickups: ["create", "read", "update", "delete"],
    reviews: ["create", "read", "update", "delete"],
    notifications: ["create", "read", "update", "delete"],
    content: ["create", "read", "update", "delete"],
    offers: ["read", "update"],
    settings: ["read", "update"],
    analytics: ["read"],
  },
  user: {
    orders: ["create", "read", "update"],
    pickups: ["create", "read", "update"],
    reviews: ["create", "read", "update"],
    notifications: ["read"],
    content: ["read"],
    offers: ["read"],
    settings: ["read", "update"],
  },
};

// Utility function to check permissions
export const hasPermission = (userRole: Role, entity: EntityType, permission: Permission): boolean => {
  const permissions = DEFAULT_PERMISSIONS[userRole]?.[entity] || [];
  return permissions.includes(permission);
};