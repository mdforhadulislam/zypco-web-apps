# Notifications API

This document covers the notification system endpoints for managing user notifications, alerts, and messaging.

## Base URL
`/api/v1/notification`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notification/{phone}` | Get user notifications | Yes |
| GET | `/notification/{phone}/{id}` | Get specific notification | Yes |
| PUT | `/notification/{phone}/{id}` | Mark notification as read | Yes |
| DELETE | `/notification/{phone}/{id}` | Delete notification | Yes |
| POST | `/notification` | Create notification (Admin) | Yes (Admin) |
| PUT | `/notification/{phone}/mark-all-read` | Mark all as read | Yes |

---

## Get User Notifications

### **GET** `/api/v1/notification/{phone}`

Retrieve notifications for a specific user.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- `phone` (string, required) - User's phone number in international format

#### Query Parameters
- `read` (boolean, optional) - Filter by read status (`true`, `false`)
- `type` (string, optional) - Filter by notification type (`info`, `success`, `warning`, `error`, `promo`)
- `priority` (string, optional) - Filter by priority (`low`, `normal`, `high`, `urgent`)
- `category` (string, optional) - Filter by category (`order`, `account`, `system`, `marketing`)
- `startDate` (string, optional) - Filter from date (ISO format)
- `endDate` (string, optional) - Filter until date (ISO format)
- `limit` (number, optional) - Number of notifications (default: 20, max: 100)
- `offset` (number, optional) - Number to skip (default: 0)
- `sort` (string, optional) - Sort order (`newest`, `oldest`, `priority`) - default: `newest`

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Notifications retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "notifications": [
      {
        "id": "6744b8c1234567890abcdef7",
        "title": "Order Delivered Successfully",
        "message": "Your order ZYP240115001 has been delivered to Jane Receiver at 456 Receiver Avenue, London. Thank you for choosing Zypco!",
        "type": "success",
        "priority": "high",
        "category": "order",
        "read": false,
        "actionUrl": "/orders/6744b8c1234567890abcdef3",
        "actionText": "View Order Details",
        "data": {
          "orderId": "6744b8c1234567890abcdef3",
          "trackId": "ZYP240115001",
          "deliveryDate": "2024-01-22T15:45:00.000Z"
        },
        "sentAt": "2024-01-22T15:50:00.000Z",
        "expiresAt": "2024-02-22T15:50:00.000Z",
        "channels": ["email", "sms", "push"]
      },
      {
        "id": "6744b8c1234567890abcdef8", 
        "title": "Welcome to Zypco!",
        "message": "Thank you for joining Zypco International Courier. Your account has been verified and you can now start shipping worldwide with confidence.",
        "type": "info",
        "priority": "normal",
        "category": "account",
        "read": true,
        "actionUrl": "/dashboard",
        "actionText": "Explore Dashboard",
        "data": {
          "welcomeBonus": 10,
          "currency": "USD"
        },
        "sentAt": "2024-01-15T10:35:00.000Z",
        "readAt": "2024-01-15T11:20:00.000Z",
        "channels": ["email", "push"]
      },
      {
        "id": "6744b8c1234567890abcdef9",
        "title": "Security Alert",
        "message": "We detected a login to your account from a new device: Chrome on Windows from London, UK. If this wasn't you, please secure your account immediately.",
        "type": "warning", 
        "priority": "urgent",
        "category": "security",
        "read": false,
        "actionUrl": "/account/security",
        "actionText": "Review Security",
        "data": {
          "ipAddress": "192.168.1.100",
          "location": "London, UK",
          "device": "Chrome on Windows",
          "loginTime": "2024-01-20T08:30:00.000Z"
        },
        "sentAt": "2024-01-20T08:32:00.000Z",
        "channels": ["email", "sms"]
      }
    ],
    "pagination": {
      "total": 25,
      "unreadCount": 8,
      "limit": 20,
      "offset": 0,
      "totalPages": 2,
      "currentPage": 1
    },
    "summary": {
      "totalNotifications": 25,
      "unreadCount": 8,
      "typeDistribution": {
        "info": 12,
        "success": 6,
        "warning": 4,
        "error": 2,
        "promo": 1
      },
      "categoryDistribution": {
        "order": 15,
        "account": 5,
        "system": 3,
        "security": 2
      }
    }
  }
}
```

#### Error Responses

**403 - Access Denied**
```json
{
  "status": "403",
  "message": "Access denied",
  "error": "You can only access your own notifications"
}
```

---

## Get Specific Notification

### **GET** `/api/v1/notification/{phone}/{id}`

Retrieve details of a specific notification.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- `phone` (string, required) - User's phone number
- `id` (string, required) - Notification ObjectId

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Notification retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "notification": {
      "id": "6744b8c1234567890abcdef7",
      "title": "Order Delivered Successfully",
      "message": "Your order ZYP240115001 has been delivered to Jane Receiver at 456 Receiver Avenue, London. Thank you for choosing Zypco!",
      "type": "success",
      "priority": "high",
      "category": "order",
      "read": false,
      "actionUrl": "/orders/6744b8c1234567890abcdef3",
      "actionText": "View Order Details",
      "data": {
        "orderId": "6744b8c1234567890abcdef3",
        "trackId": "ZYP240115001",
        "deliveryDate": "2024-01-22T15:45:00.000Z",
        "deliveryAddress": "456 Receiver Avenue, London",
        "recipientName": "Jane Receiver",
        "signature": "J.Receiver"
      },
      "metadata": {
        "source": "tracking_system",
        "template": "order_delivered",
        "locale": "en-US",
        "timezone": "UTC"
      },
      "deliveryStatus": {
        "email": {
          "sent": true,
          "sentAt": "2024-01-22T15:50:00.000Z",
          "delivered": true,
          "deliveredAt": "2024-01-22T15:50:15.000Z",
          "opened": false
        },
        "sms": {
          "sent": true,
          "sentAt": "2024-01-22T15:50:01.000Z",
          "delivered": true,
          "deliveredAt": "2024-01-22T15:50:05.000Z"
        },
        "push": {
          "sent": true,
          "sentAt": "2024-01-22T15:50:02.000Z", 
          "delivered": true,
          "deliveredAt": "2024-01-22T15:50:03.000Z",
          "clicked": false
        }
      },
      "sentAt": "2024-01-22T15:50:00.000Z",
      "expiresAt": "2024-02-22T15:50:00.000Z",
      "createdAt": "2024-01-22T15:50:00.000Z",
      "updatedAt": "2024-01-22T15:50:00.000Z"
    }
  }
}
```

---

## Mark Notification as Read

### **PUT** `/api/v1/notification/{phone}/{id}`

Mark a specific notification as read.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Path Parameters
- `phone` (string, required) - User's phone number
- `id` (string, required) - Notification ObjectId

#### Request Body (Optional)
```json
{
  "readAt": "2024-01-15T11:30:00.000Z"
}
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Notification marked as read",
  "timestamp": "2024-01-15T11:30:00.000Z",
  "data": {
    "notification": {
      "id": "6744b8c1234567890abcdef7",
      "read": true,
      "readAt": "2024-01-15T11:30:00.000Z"
    },
    "unreadCount": 7
  }
}
```

---

## Mark All Notifications as Read

### **PUT** `/api/v1/notification/{phone}/mark-all-read`

Mark all notifications as read for a user.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "All notifications marked as read",
  "timestamp": "2024-01-15T11:45:00.000Z",
  "data": {
    "markedCount": 8,
    "unreadCount": 0
  }
}
```

---

## Delete Notification

### **DELETE** `/api/v1/notification/{phone}/{id}`

Delete a specific notification.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Notification deleted successfully",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

## Create Notification (Admin)

### **POST** `/api/v1/notification`

Create a new notification (admin/system only).

#### Request Headers
```http
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "recipients": [
    {
      "phone": "+8801234567890",
      "email": "user@example.com",
      "userId": "6744b8c1234567890abcdef0"
    }
  ],
  "notification": {
    "title": "System Maintenance Scheduled",
    "message": "Our systems will undergo maintenance on January 20th from 2:00 AM to 4:00 AM UTC. Some services may be temporarily unavailable.",
    "type": "warning",
    "priority": "high",
    "category": "system",
    "actionUrl": "/status",
    "actionText": "View Status Page",
    "data": {
      "maintenanceStart": "2024-01-20T02:00:00.000Z",
      "maintenanceEnd": "2024-01-20T04:00:00.000Z",
      "affectedServices": ["orders", "tracking", "payments"]
    },
    "expiresAt": "2024-01-20T05:00:00.000Z"
  },
  "channels": ["email", "sms", "push"],
  "sendNow": true,
  "template": "system_maintenance"
}
```

#### Success Response (201)
```json
{
  "status": "201",
  "message": "Notification created and sent successfully",
  "timestamp": "2024-01-15T12:30:00.000Z",
  "data": {
    "notificationId": "6744b8c1234567890abcdef10",
    "recipientsCount": 1,
    "deliveryStatus": {
      "email": {
        "queued": 1,
        "sent": 1,
        "failed": 0
      },
      "sms": {
        "queued": 1,
        "sent": 1,
        "failed": 0
      },
      "push": {
        "queued": 1,
        "sent": 1,
        "failed": 0
      }
    }
  }
}
```

---

## Notification Types & Categories

### Notification Types
- **info** - General information (blue)
- **success** - Positive actions completed (green) 
- **warning** - Important alerts requiring attention (orange)
- **error** - Problems or failures (red)
- **promo** - Marketing and promotional content (purple)

### Priority Levels
- **low** - Non-urgent information
- **normal** - Standard notifications
- **high** - Important notifications requiring attention
- **urgent** - Critical notifications requiring immediate action

### Categories
- **order** - Order-related notifications
- **account** - Account and profile updates
- **security** - Security alerts and warnings
- **system** - System maintenance and updates
- **marketing** - Promotional offers and campaigns
- **payment** - Payment and billing notifications

---

## Notification Channels

### Email Notifications
- Rich HTML templates with branding
- Personalized content and dynamic data
- Tracking for opens, clicks, and bounces
- Unsubscribe management and preferences

### SMS Notifications  
- Short, concise messages with key information
- International SMS delivery via multiple providers
- Delivery confirmations and status tracking
- Opt-out support with STOP keywords

### Push Notifications
- Real-time delivery to mobile and web apps
- Rich media support (images, buttons)
- Deep linking to specific app sections
- Badge count management and clearing

### In-App Notifications
- Real-time delivery via WebSocket
- Interactive notification center
- Grouped notifications and smart filtering
- Action buttons for quick responses

---

## User Preferences

### Notification Settings
```json
{
  "preferences": {
    "email": {
      "enabled": true,
      "categories": {
        "order": true,
        "account": true,
        "security": true,
        "system": false,
        "marketing": false
      }
    },
    "sms": {
      "enabled": true,
      "categories": {
        "order": true,
        "account": false,
        "security": true,
        "system": false,
        "marketing": false
      }
    },
    "push": {
      "enabled": true,
      "categories": {
        "order": true,
        "account": true,
        "security": true,
        "system": true,
        "marketing": false
      }
    }
  }
}
```

---

## Webhook Integration

### Notification Events
```json
{
  "event": "notification.sent",
  "timestamp": "2024-01-15T12:30:00.000Z",
  "data": {
    "notificationId": "6744b8c1234567890abcdef7",
    "userId": "6744b8c1234567890abcdef0",
    "type": "success",
    "category": "order",
    "channels": ["email", "sms"],
    "deliveryStatus": "sent"
  }
}
```

---

## Security & Compliance

### Data Protection
- Notification content encrypted at rest
- PII redaction in logs and analytics
- GDPR compliance for EU users
- User consent management for marketing notifications

### Rate Limiting
- **Get notifications**: 100 requests/hour per user
- **Mark as read**: 200 requests/hour per user
- **Admin create**: 1000 notifications/hour
- **Bulk operations**: 10 requests/hour per user

### Access Control
- Users can only access their own notifications
- Admin role required for creating notifications
- System notifications bypass user preferences for critical alerts
- Audit logging for all notification activities

---

**Last Updated:** January 15, 2024