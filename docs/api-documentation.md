# Zypco API Documentation

## Overview

The Zypco API is a RESTful web service designed for international courier and logistics operations. It provides comprehensive endpoints for user management, order processing, address management, pricing, notifications, and tracking services.

**Base URL:** `https://your-domain.com/api`
**Current Version:** `v1`
**All endpoints are prefixed with:** `/api/v1`

---

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Health & System](#health--system)
  - [Authentication & User Management](#authentication--user-management)
  - [Address Management](#address-management)
  - [Order Management](#order-management)
  - [Pricing & Rates](#pricing--rates)
  - [Notifications](#notifications)
  - [Blog & Content](#blog--content)
  - [Contact Management](#contact-management)
  - [Country & Location](#country--location)
  - [Pickup Services](#pickup-services)
  - [Tracking & Analytics](#tracking--analytics)
- [Security](#security)
- [Rate Limiting](#rate-limiting)
- [Notifications System](#notifications-system)

---

## Authentication

The API uses **JWT (JSON Web Token)** authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting an Auth Token

First, register or login to obtain a JWT token that expires after a specified time period.

---

## Response Format

All API responses follow a consistent format:

```json
{
  "status": "200",
  "message": "Success message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "path": "/api/v1/endpoint",
  "method": "GET",
  "requestId": "uuid-v4-string",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "env": "production",
  "data": {},
  "meta": {},
  "debugInfo": {
    "memoryUsage": {},
    "cpuUsage": {},
    "platform": "linux"
  }
}
```

---

## Error Handling

Error responses include detailed information:

```json
{
  "status": "400",
  "message": "Validation error",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": "Detailed error information",
  "data": null
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized  
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## API Endpoints

### Health & System

#### Check API Health
**GET** `/api/health`

**Description:** Check if the API service is running and healthy.

**Headers:** None required

**Response:**
```json
{
  "status": "200",
  "message": "API is healthy",
  "data": [],
  "debug": true
}
```

**cURL Example:**
```bash
curl -X GET "https://your-domain.com/api/health" \
  -H "Content-Type: application/json"
```

**JavaScript Example:**
```javascript
const response = await fetch('https://your-domain.com/api/health');
const data = await response.json();
console.log(data);
```

**Notifications:** None

---

#### API Root Information
**GET** `/api/v1`

**Description:** Get information about available API routes.

**Headers:** None required

**Response:**
```json
{
  "status": "200",
  "message": "Welcome to API v1 root. Below are the available routes.",
  "data": [
    {
      "route": "/api/v1",
      "method": "ALL",
      "description": "API version 1 root with route overview"
    }
  ]
}
```

**Notifications:** None

---

### Authentication & User Management

#### User Registration
**POST** `/api/v1/auth/signup`

**Description:** Register a new user account.

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+8801234567890",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "201",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "phone": "+8801234567890",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false
    },
    "token": "jwt-token-here"
  }
}
```

**cURL Example:**
```bash
curl -X POST "https://your-domain.com/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+8801234567890",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Notifications:** 
- Welcome email sent to user
- SMS verification code sent to phone
- Admin notification for new user registration

---

#### User Login
**POST** `/api/v1/auth/signin`

**Description:** Authenticate user and get access token.

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "phone": "+8801234567890",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "200",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "phone": "+8801234567890",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt-token-here",
    "expiresIn": "24h"
  }
}
```

**Notifications:**
- Login notification email sent
- Security alert if login from new device

---

#### User Logout
**POST** `/api/v1/auth/signout`

**Description:** Logout user and invalidate session.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Request Body:** None

**Response:**
```json
{
  "status": "200",
  "message": "Logged out successfully"
}
```

**Notifications:**
- Logout confirmation email sent

---

#### Email Verification
**POST** `/api/v1/auth/verify-email`

**Description:** Verify user email with verification code.

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "code": "ABC123"
}
```

**Response:**
```json
{
  "status": "200",
  "message": "Email verified successfully",
  "data": {
    "isVerified": true
  }
}
```

**Notifications:**
- Email verification confirmation sent

---

#### Get User Account Details
**GET** `/api/v1/auth/accounts/{phone}`

**Description:** Get detailed account information for a specific user.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `phone` (string) - User's phone number

**Response:**
```json
{
  "status": "200",
  "message": "Account details retrieved",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "phone": "+8801234567890",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "isVerified": true,
      "preferences": {
        "notifications": {
          "email": true,
          "sms": true
        }
      }
    }
  }
}
```

**Notifications:** None

---

#### Get User Login History
**GET** `/api/v1/auth/signin-history/{phone}`

**Description:** Get login history for a user.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `phone` (string) - User's phone number

**Query Parameters:**
- `limit` (number, optional) - Number of records to return (default: 10)
- `offset` (number, optional) - Number of records to skip (default: 0)

**Response:**
```json
{
  "status": "200",
  "message": "Login history retrieved",
  "data": {
    "history": [
      {
        "id": "history_id",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "success": true,
        "location": "Dhaka, Bangladesh"
      }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

**Notifications:** None

---

### Address Management

#### Create Address
**POST** `/api/v1/auth/address`

**Description:** Add a new address for the authenticated user.

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "label": "Home",
  "addressLine": "123 Main Street",
  "area": "Dhanmondi",
  "subCity": "Dhanmondi-15",
  "city": "Dhaka",
  "state": "Dhaka",
  "zipCode": "1205",
  "country": "country_object_id",
  "phone": "+8801234567890",
  "isDefault": true,
  "location": {
    "type": "Point",
    "coordinates": [90.3742, 23.7515]
  }
}
```

**Response:**
```json
{
  "status": "201",
  "message": "Address created successfully",
  "data": {
    "address": {
      "id": "address_id",
      "name": "John Doe",
      "label": "Home",
      "addressLine": "123 Main Street",
      "city": "Dhaka",
      "country": "Bangladesh",
      "isDefault": true
    }
  }
}
```

**Notifications:**
- Address added confirmation email

---

#### Get User Addresses
**GET** `/api/v1/auth/accounts/{phone}/address`

**Description:** Get all addresses for a specific user.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `phone` (string) - User's phone number

**Response:**
```json
{
  "status": "200",
  "message": "Addresses retrieved successfully",
  "data": {
    "addresses": [
      {
        "id": "address_id",
        "name": "John Doe",
        "label": "Home",
        "addressLine": "123 Main Street",
        "city": "Dhaka",
        "country": "Bangladesh",
        "isDefault": true
      }
    ]
  }
}
```

**Notifications:** None

---

#### Update Address
**PUT** `/api/v1/auth/address/{id}`

**Description:** Update an existing address.

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `id` (string) - Address ID

**Request Body:** Same as create address

**Response:**
```json
{
  "status": "200",
  "message": "Address updated successfully",
  "data": {
    "address": {
      "id": "address_id",
      "name": "John Doe Updated",
      "label": "Home",
      "addressLine": "456 Updated Street"
    }
  }
}
```

**Notifications:**
- Address update confirmation email

---

#### Delete Address
**DELETE** `/api/v1/auth/address/{id}`

**Description:** Soft delete an address (sets isDeleted flag).

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `id` (string) - Address ID

**Response:**
```json
{
  "status": "200",
  "message": "Address deleted successfully"
}
```

**Notifications:**
- Address deletion confirmation email

---

### Order Management

#### Create Order
**POST** `/api/v1/order`

**Description:** Create a new shipping order.

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "parcel": {
    "from": "country_object_id",
    "to": "country_object_id",
    "sender": {
      "name": "John Sender",
      "phone": "+8801111111111",
      "email": "sender@example.com",
      "address": {
        "address": "123 Sender St",
        "city": "Dhaka",
        "zipCode": "1205",
        "country": "country_object_id"
      }
    },
    "receiver": {
      "name": "Jane Receiver",
      "phone": "+8802222222222",
      "email": "receiver@example.com",
      "address": {
        "address": "456 Receiver St",
        "city": "London",
        "zipCode": "SW1A 1AA",
        "country": "country_object_id"
      }
    },
    "box": [
      {
        "length": 20,
        "width": 15,
        "height": 10,
        "fragile": true
      }
    ],
    "weight": "2.5kg",
    "serviceType": "DHL Express",
    "priority": "express",
    "orderType": "parcel",
    "item": [
      {
        "name": "Electronics",
        "quantity": 1,
        "unitPrice": 100,
        "totalPrice": 100
      }
    ],
    "customerNote": "Handle with care"
  },
  "payment": {
    "pType": "cash",
    "pAmount": 150,
    "pOfferDiscount": 10,
    "pExtraCharge": 5,
    "pDiscount": 0,
    "pReceived": 145,
    "pRefunded": 0
  }
}
```

**Response:**
```json
{
  "status": "201",
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order_id",
      "trackId": "ZYP123456789",
      "orderDate": "2024-01-15T10:30:00.000Z",
      "status": "pending",
      "totalAmount": 145
    }
  }
}
```

**Notifications:**
- Order confirmation email to sender
- Order notification email to receiver
- SMS confirmation to sender
- Admin notification for new order

---

#### Get Order Details
**GET** `/api/v1/order/{id}`

**Description:** Get detailed information about a specific order.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `id` (string) - Order ID

**Response:**
```json
{
  "status": "200",
  "message": "Order details retrieved",
  "data": {
    "order": {
      "id": "order_id",
      "trackId": "ZYP123456789",
      "orderDate": "2024-01-15T10:30:00.000Z",
      "status": "in_transit",
      "parcel": {
        "from": "Bangladesh",
        "to": "United Kingdom",
        "weight": "2.5kg",
        "serviceType": "DHL Express"
      },
      "payment": {
        "pAmount": 150,
        "pReceived": 145
      }
    }
  }
}
```

**Notifications:** None

---

#### Get User Orders
**GET** `/api/v1/auth/accounts/{phone}/order`

**Description:** Get all orders for a specific user.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `phone` (string) - User's phone number

**Query Parameters:**
- `status` (string, optional) - Filter by order status
- `limit` (number, optional) - Number of orders to return
- `offset` (number, optional) - Number of orders to skip

**Response:**
```json
{
  "status": "200",
  "message": "User orders retrieved",
  "data": {
    "orders": [
      {
        "id": "order_id",
        "trackId": "ZYP123456789",
        "orderDate": "2024-01-15T10:30:00.000Z",
        "status": "delivered",
        "totalAmount": 145
      }
    ],
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

**Notifications:** None

---

### Pricing & Rates

#### Get Pricing Information
**GET** `/api/v1/price/{id}`

**Description:** Get pricing details for shipping between specific countries.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `id` (string) - Price configuration ID

**Response:**
```json
{
  "status": "200",
  "message": "Pricing information retrieved",
  "data": {
    "pricing": {
      "id": "price_id",
      "from": {
        "id": "country_id",
        "country": "Bangladesh"
      },
      "to": {
        "id": "country_id",
        "country": "United Kingdom"
      },
      "rate": [
        {
          "name": "premium",
          "profitPercentage": 20,
          "gift": 15,
          "price": {
            "gm500": 25,
            "gm1000": 35,
            "kg6to10": 120,
            "kg11to20": 180
          }
        }
      ]
    }
  }
}
```

**Notifications:** None

---

### Notifications

#### Get User Notifications
**GET** `/api/v1/notification/{phone}`

**Description:** Get all notifications for a specific user.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `phone` (string) - User's phone number

**Query Parameters:**
- `read` (boolean, optional) - Filter by read status
- `type` (string, optional) - Filter by notification type
- `limit` (number, optional) - Number of notifications to return
- `offset` (number, optional) - Number of notifications to skip

**Response:**
```json
{
  "status": "200",
  "message": "Notifications retrieved",
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "title": "Order Shipped",
        "message": "Your order ZYP123456789 has been shipped",
        "type": "info",
        "read": false,
        "sentAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 10,
    "unreadCount": 3
  }
}
```

**Notifications:** None

---

#### Mark Notification as Read
**PUT** `/api/v1/notification/{phone}/{id}`

**Description:** Mark a specific notification as read.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `phone` (string) - User's phone number
- `id` (string) - Notification ID

**Response:**
```json
{
  "status": "200",
  "message": "Notification marked as read"
}
```

**Notifications:** None

---

### Blog & Content

#### Get Blog Posts
**GET** `/api/v1/blog`

**Description:** Get list of blog posts.

**Query Parameters:**
- `limit` (number, optional) - Number of posts to return
- `offset` (number, optional) - Number of posts to skip
- `status` (string, optional) - Filter by post status

**Response:**
```json
{
  "status": "200",
  "message": "Blog posts retrieved",
  "data": {
    "posts": [
      {
        "id": "post_id",
        "title": "International Shipping Guide",
        "excerpt": "Learn about international shipping...",
        "publishedAt": "2024-01-15T10:30:00.000Z",
        "slug": "international-shipping-guide"
      }
    ]
  }
}
```

**Notifications:** None

---

#### Get Blog Post
**GET** `/api/v1/blog/{id}`

**Description:** Get a specific blog post by ID.

**Path Parameters:**
- `id` (string) - Blog post ID

**Response:**
```json
{
  "status": "200",
  "message": "Blog post retrieved",
  "data": {
    "post": {
      "id": "post_id",
      "title": "International Shipping Guide",
      "content": "Full blog post content here...",
      "publishedAt": "2024-01-15T10:30:00.000Z",
      "author": "Zypco Team"
    }
  }
}
```

**Notifications:** None

---

### Contact Management

#### Submit Contact Form
**POST** `/api/v1/contact`

**Description:** Submit a contact form or inquiry.

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+8801234567890",
  "subject": "Inquiry about services",
  "message": "I would like to know more about your international shipping rates."
}
```

**Response:**
```json
{
  "status": "201",
  "message": "Contact form submitted successfully",
  "data": {
    "contact": {
      "id": "contact_id",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Inquiry about services",
      "submittedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Notifications:**
- Contact form submission confirmation email to user
- New inquiry notification email to admin team
- Auto-reply email with expected response time

---

#### Get Contact Inquiry
**GET** `/api/v1/contact/{id}`

**Description:** Get details of a specific contact inquiry (admin only).

**Headers:**
- `Authorization: Bearer <admin-jwt-token>`

**Path Parameters:**
- `id` (string) - Contact inquiry ID

**Response:**
```json
{
  "status": "200",
  "message": "Contact inquiry retrieved",
  "data": {
    "contact": {
      "id": "contact_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+8801234567890",
      "subject": "Inquiry about services",
      "message": "Full inquiry message...",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Notifications:** None

---

### Country & Location

#### Get Countries
**GET** `/api/v1/country`

**Description:** Get list of supported countries.

**Query Parameters:**
- `zone` (string, optional) - Filter by geographic zone
- `active` (boolean, optional) - Filter by active status

**Response:**
```json
{
  "status": "200",
  "message": "Countries retrieved",
  "data": {
    "countries": [
      {
        "id": "country_id",
        "name": "Bangladesh",
        "code": "BD",
        "phoneCode": "+880",
        "timezone": "Asia/Dhaka",
        "zone": "South Asia",
        "isActive": true
      }
    ]
  }
}
```

**Notifications:** None

---

#### Get Country Details
**GET** `/api/v1/country/{id}`

**Description:** Get detailed information about a specific country.

**Path Parameters:**
- `id` (string) - Country ID

**Response:**
```json
{
  "status": "200",
  "message": "Country details retrieved",
  "data": {
    "country": {
      "id": "country_id",
      "name": "Bangladesh",
      "code": "BD",
      "phoneCode": "+880",
      "flagUrl": "https://example.com/flags/bd.png",
      "timezone": "Asia/Dhaka",
      "zone": "South Asia",
      "isActive": true
    }
  }
}
```

**Notifications:** None

---

### Pickup Services

#### Schedule Pickup
**POST** `/api/v1/pickup/{phone}`

**Description:** Schedule a pickup for a user's order.

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `phone` (string) - User's phone number

**Request Body:**
```json
{
  "orderId": "order_id",
  "pickupDate": "2024-01-16",
  "pickupTime": "10:00-12:00",
  "address": {
    "addressLine": "123 Pickup Street",
    "city": "Dhaka",
    "zipCode": "1205"
  },
  "contactPerson": "John Doe",
  "contactPhone": "+8801234567890",
  "specialInstructions": "Ring doorbell twice"
}
```

**Response:**
```json
{
  "status": "201",
  "message": "Pickup scheduled successfully",
  "data": {
    "pickup": {
      "id": "pickup_id",
      "orderId": "order_id",
      "pickupDate": "2024-01-16",
      "pickupTime": "10:00-12:00",
      "status": "scheduled"
    }
  }
}
```

**Notifications:**
- Pickup confirmation email to customer
- SMS reminder one day before pickup
- Pickup assignment notification to courier

---

#### Get Pickup Details
**GET** `/api/v1/auth/accounts/{phone}/pickup/{id}`

**Description:** Get details of a specific pickup.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Path Parameters:**
- `phone` (string) - User's phone number
- `id` (string) - Pickup ID

**Response:**
```json
{
  "status": "200",
  "message": "Pickup details retrieved",
  "data": {
    "pickup": {
      "id": "pickup_id",
      "orderId": "order_id",
      "pickupDate": "2024-01-16",
      "pickupTime": "10:00-12:00",
      "status": "completed",
      "completedAt": "2024-01-16T11:30:00.000Z"
    }
  }
}
```

**Notifications:** None

---

### Tracking & Analytics

#### Track Shipment
**GET** `/api/v1/track/{trackId}`

**Description:** Track a shipment using its tracking ID.

**Path Parameters:**
- `trackId` (string) - Shipment tracking ID

**Response:**
```json
{
  "status": "200",
  "message": "Shipment tracking information",
  "data": {
    "tracking": {
      "trackId": "ZYP123456789",
      "status": "in_transit",
      "currentLocation": "London Hub",
      "estimatedDelivery": "2024-01-18",
      "events": [
        {
          "timestamp": "2024-01-15T10:30:00.000Z",
          "location": "Dhaka",
          "description": "Package picked up"
        },
        {
          "timestamp": "2024-01-16T08:45:00.000Z",
          "location": "London Hub",
          "description": "Package in transit"
        }
      ]
    }
  }
}
```

**Notifications:**
- Tracking update notifications sent to sender and receiver
- SMS notifications for major status changes

---

#### Get Analytics
**GET** `/api/v1/analytics`

**Description:** Get analytics data (admin only).

**Headers:**
- `Authorization: Bearer <admin-jwt-token>`

**Query Parameters:**
- `startDate` (string, optional) - Start date for analytics period
- `endDate` (string, optional) - End date for analytics period
- `type` (string, optional) - Type of analytics (orders, revenue, users)

**Response:**
```json
{
  "status": "200",
  "message": "Analytics data retrieved",
  "data": {
    "analytics": {
      "totalOrders": 1250,
      "totalRevenue": 125000,
      "totalUsers": 450,
      "conversionRate": 12.5,
      "averageOrderValue": 100
    }
  }
}
```

**Notifications:** None

---

## Security

### Authentication
- All protected endpoints require JWT authentication
- Tokens expire after 24 hours by default
- Use HTTPS in production environments
- Store tokens securely (not in localStorage for sensitive apps)

### Data Validation
- All input is validated and sanitized
- SQL injection protection through parameterized queries
- XSS prevention through output encoding
- File upload restrictions and validation

### Rate Limiting
- API endpoints are rate-limited to prevent abuse
- Default limits:
  - Authentication endpoints: 5 requests per minute
  - General endpoints: 100 requests per minute
  - Admin endpoints: 200 requests per minute

### CORS
- Cross-Origin Resource Sharing is configured
- Only allowed origins can access the API
- Preflight requests are handled properly

---

## Notifications System

The API automatically sends notifications for various user actions:

### Email Notifications
- Welcome email on registration
- Order confirmations and updates
- Pickup scheduling confirmations
- Shipping status updates
- Security alerts for account activities

### SMS Notifications
- Phone verification codes
- Order status updates
- Pickup reminders
- Delivery notifications

### In-App Notifications
- Real-time updates in the user dashboard
- System announcements
- Promotional offers
- Service updates

### Notification Preferences
Users can configure their notification preferences:
- Email notifications: ON/OFF
- SMS notifications: ON/OFF
- Push notifications: ON/OFF
- Marketing communications: ON/OFF

---

## Error Codes

### Authentication Errors
- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Token invalid
- `AUTH_004` - Insufficient permissions

### Validation Errors
- `VAL_001` - Missing required field
- `VAL_002` - Invalid email format
- `VAL_003` - Invalid phone number
- `VAL_004` - Password too weak

### Business Logic Errors
- `BUS_001` - Order not found
- `BUS_002` - Country not supported
- `BUS_003` - Service unavailable
- `BUS_004` - Payment failed

---

## Support

For API support and questions:
- **Email:** api-support@zypco.com
- **Documentation:** https://docs.zypco.com
- **Status Page:** https://status.zypco.com

---

**Last Updated:** January 15, 2024
**API Version:** v1.0.0