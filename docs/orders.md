# Order Management API

This document covers all order-related endpoints for creating, managing, and tracking shipping orders in the Zypco courier system.

## Base URL
`/api/v1/order`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/order` | Create a new order | Yes |
| GET | `/order` | Get paginated orders list | Yes (Admin) |
| GET | `/order/{id}` | Get order details | Yes |
| PUT | `/order/{id}` | Update order details | Yes |
| DELETE | `/order/{id}` | Cancel/delete order | Yes |
| GET | `/auth/accounts/{phone}/order` | Get user's orders | Yes |
| GET | `/auth/accounts/{phone}/order/{id}` | Get specific user order | Yes |

---

## Create Order

### **POST** `/api/v1/order`

Create a new shipping order with parcel details and payment information.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "parcel": {
    "from": "6744b8c1234567890abcdef1",
    "to": "6744b8c1234567890abcdef2", 
    "sender": {
      "name": "John Sender",
      "phone": "+8801111111111",
      "email": "sender@example.com",
      "address": {
        "address": "123 Sender Street, Dhanmondi",
        "city": "Dhaka",
        "zipCode": "1205",
        "country": "6744b8c1234567890abcdef1"
      }
    },
    "receiver": {
      "name": "Jane Receiver", 
      "phone": "+44123456789",
      "email": "receiver@example.com",
      "address": {
        "address": "456 Receiver Avenue",
        "city": "London", 
        "zipCode": "SW1A 1AA",
        "country": "6744b8c1234567890abcdef2"
      }
    },
    "box": [
      {
        "length": 25.5,
        "width": 20.0,
        "height": 15.0,
        "fragile": true
      }
    ],
    "weight": "2.5kg",
    "serviceType": "DHL Express",
    "priority": "express",
    "orderType": "parcel",
    "item": [
      {
        "name": "Electronics - Smartphone",
        "quantity": 1,
        "unitPrice": 500.00,
        "totalPrice": 500.00
      },
      {
        "name": "Phone Case",
        "quantity": 2, 
        "unitPrice": 15.00,
        "totalPrice": 30.00
      }
    ],
    "customerNote": "Handle with extreme care - fragile electronics"
  },
  "payment": {
    "pType": "cash",
    "pAmount": 150.00,
    "pOfferDiscount": 10.00,
    "pExtraCharge": 5.00,
    "pDiscount": 0.00,
    "pReceived": 145.00,
    "pRefunded": 0.00
  }
}
```

#### Validation Rules
- **from/to countries**: Must be valid ObjectId references to supported countries
- **sender/receiver**: Name, phone, and email are required
- **box dimensions**: Must be positive numbers, length/width/height in cm
- **weight**: Must include unit (kg/g/lb), maximum 50kg per box
- **serviceType**: Must be from supported list (DHL, FedEx, UPS, Aramex)
- **priority**: `normal`, `express`, `super-express`, `tax-paid`
- **orderType**: `document`, `parcel`, `e-commerce`
- **items**: Each item must have name, quantity > 0, valid prices
- **payment**: All amounts must be non-negative numbers

#### Success Response (201)
```json
{
  "status": "201",
  "message": "Order created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "order": {
      "id": "6744b8c1234567890abcdef3",
      "trackId": "ZYP240115001",
      "orderDate": "2024-01-15T10:30:00.000Z",
      "status": "created",
      "parcel": {
        "from": "Bangladesh",
        "to": "United Kingdom",
        "serviceType": "DHL Express",
        "priority": "express",
        "weight": "2.5kg",
        "totalItems": 2
      },
      "payment": {
        "pType": "cash",
        "pAmount": 150.00,
        "finalAmount": 145.00,
        "status": "pending"
      },
      "estimatedDelivery": "2024-01-22T10:30:00.000Z"
    }
  }
}
```

#### Error Responses

**400 - Validation Error**
```json
{
  "status": "400",
  "message": "Invalid parcel dimensions",
  "error": {
    "field": "box.0.weight",
    "message": "Weight cannot exceed 50kg per box"
  }
}
```

**422 - Service Unavailable**
```json
{
  "status": "422",
  "message": "Service not available for this route",
  "error": "DHL Express is not available from Bangladesh to this destination"
}
```

#### Security Features
- User authentication required
- Input validation and sanitization
- Country service availability verification
- Automatic fraud detection for high-value orders
- Price calculation verification

#### Notifications Triggered
- **Order confirmation email** to sender with tracking ID
- **Order notification email** to receiver with expected delivery
- **SMS confirmation** to sender with tracking details
- **Admin notification** for orders above $1000 value
- **Pickup scheduling email** if pickup service requested

---

## Get Order Details

### **GET** `/api/v1/order/{id}`

Retrieve detailed information about a specific order.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- `id` (string, required) - Order ObjectId

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Order details retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "order": {
      "id": "6744b8c1234567890abcdef3",
      "trackId": "ZYP240115001",
      "orderDate": "2024-01-15T10:30:00.000Z",
      "status": "in_transit",
      "parcel": {
        "from": {
          "country": "Bangladesh",
          "id": "6744b8c1234567890abcdef1"
        },
        "to": {
          "country": "United Kingdom", 
          "id": "6744b8c1234567890abcdef2"
        },
        "sender": {
          "name": "John Sender",
          "phone": "+8801111111111",
          "email": "sender@example.com",
          "address": {
            "address": "123 Sender Street, Dhanmondi",
            "city": "Dhaka",
            "zipCode": "1205"
          }
        },
        "receiver": {
          "name": "Jane Receiver",
          "phone": "+44123456789", 
          "email": "receiver@example.com",
          "address": {
            "address": "456 Receiver Avenue",
            "city": "London",
            "zipCode": "SW1A 1AA"
          }
        },
        "box": [
          {
            "length": 25.5,
            "width": 20.0,
            "height": 15.0,
            "fragile": true,
            "volume": 7650
          }
        ],
        "weight": "2.5kg",
        "serviceType": "DHL Express",
        "priority": "express", 
        "orderType": "parcel",
        "item": [
          {
            "name": "Electronics - Smartphone",
            "quantity": 1,
            "unitPrice": 500.00,
            "totalPrice": 500.00
          }
        ],
        "customerNote": "Handle with extreme care - fragile electronics"
      },
      "payment": {
        "pType": "cash",
        "pAmount": 150.00,
        "pOfferDiscount": 10.00,
        "pExtraCharge": 5.00,
        "pDiscount": 0.00,
        "pReceived": 145.00,
        "pRefunded": 0.00,
        "status": "paid"
      },
      "handover_by": {
        "company": "DHL Bangladesh",
        "tracking": "DHL123456789",
        "payment": 145.00,
        "handoverDate": "2024-01-16T09:15:00.000Z"
      },
      "tracking": {
        "currentStatus": "in_transit",
        "lastUpdate": "2024-01-16T14:30:00.000Z",
        "estimatedDelivery": "2024-01-22T10:30:00.000Z"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T14:30:00.000Z"
    }
  }
}
```

#### Error Responses

**404 - Order Not Found**
```json
{
  "status": "404",
  "message": "Order not found",
  "error": "Order with ID 6744b8c1234567890abcdef3 does not exist"
}
```

**403 - Access Denied**
```json
{
  "status": "403",
  "message": "Access denied",
  "error": "You can only view your own orders"
}
```

---

## Get User Orders

### **GET** `/api/v1/auth/accounts/{phone}/order`

Retrieve all orders for a specific user account.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- `phone` (string, required) - User's phone number in international format

#### Query Parameters
- `status` (string, optional) - Filter by order status (`created`, `pickup-pending`, `picked-up`, `in-transit`, `delivered`, `cancelled`)
- `priority` (string, optional) - Filter by priority (`normal`, `express`, `super-express`, `tax-paid`)
- `serviceType` (string, optional) - Filter by service type (`DHL`, `FedEx`, `UPS`, `Aramex`)
- `startDate` (string, optional) - Filter orders from this date (ISO format)
- `endDate` (string, optional) - Filter orders until this date (ISO format)
- `limit` (number, optional) - Number of orders to return (default: 20, max: 100)
- `offset` (number, optional) - Number of orders to skip (default: 0)
- `sort` (string, optional) - Sort field (`orderDate`, `status`, `amount`) with direction (`asc`, `desc`)

#### Success Response (200)
```json
{
  "status": "200",
  "message": "User orders retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "orders": [
      {
        "id": "6744b8c1234567890abcdef3",
        "trackId": "ZYP240115001",
        "orderDate": "2024-01-15T10:30:00.000Z",
        "status": "delivered",
        "priority": "express",
        "serviceType": "DHL Express",
        "route": {
          "from": "Bangladesh",
          "to": "United Kingdom"
        },
        "payment": {
          "amount": 145.00,
          "status": "paid",
          "type": "cash"
        },
        "deliveryDate": "2024-01-22T15:45:00.000Z"
      },
      {
        "id": "6744b8c1234567890abcdef4", 
        "trackId": "ZYP240110002",
        "orderDate": "2024-01-10T08:15:00.000Z",
        "status": "in_transit",
        "priority": "normal",
        "serviceType": "Aramex",
        "route": {
          "from": "Bangladesh",
          "to": "Canada" 
        },
        "payment": {
          "amount": 95.00,
          "status": "paid",
          "type": "online"
        },
        "estimatedDelivery": "2024-01-18T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 20,
      "offset": 0,
      "totalPages": 2,
      "currentPage": 1,
      "hasNext": true,
      "hasPrevious": false
    },
    "summary": {
      "totalOrders": 25,
      "totalAmount": 2875.00,
      "statusCounts": {
        "delivered": 18,
        "in_transit": 4,
        "created": 2,
        "cancelled": 1
      }
    }
  }
}
```

---

## Update Order

### **PUT** `/api/v1/order/{id}`

Update order details (limited fields available for modification).

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Path Parameters
- `id` (string, required) - Order ObjectId

#### Request Body
```json
{
  "parcel": {
    "customerNote": "Updated handling instructions - very fragile",
    "priority": "super-express"
  },
  "payment": {
    "pExtraCharge": 15.00
  }
}
```

#### Updatable Fields
- `parcel.customerNote` - Customer instructions
- `parcel.priority` - Only if order not yet dispatched
- `payment.pExtraCharge` - Additional charges
- `sender.phone` - Only before pickup
- `receiver.phone` - Only before delivery

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Order updated successfully", 
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "order": {
      "id": "6744b8c1234567890abcdef3",
      "trackId": "ZYP240115001",
      "updatedFields": ["customerNote", "priority"],
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Security Features
- Only order owner or admin can update
- Restricted field updates based on order status
- Change history logging for audit trail
- Automatic recalculation of charges if applicable

#### Notifications Triggered
- **Order update email** to sender with change details
- **Update notification SMS** for priority changes
- **Admin alert** for significant modifications

---

## Cancel Order

### **DELETE** `/api/v1/order/{id}`

Cancel an order (soft delete with status change).

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "reason": "Customer requested cancellation",
  "refundRequested": true
}
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Order cancelled successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "order": {
      "id": "6744b8c1234567890abcdef3",
      "trackId": "ZYP240115001", 
      "status": "cancelled",
      "cancellationDate": "2024-01-15T10:30:00.000Z",
      "refund": {
        "eligible": true,
        "amount": 135.00,
        "processingTime": "3-5 business days"
      }
    }
  }
}
```

#### Cancellation Rules
- Orders can be cancelled before pickup
- Partial refunds available after pickup but before dispatch
- No refunds after international dispatch
- Cancellation fees may apply based on order status

#### Notifications Triggered
- **Cancellation confirmation email** with refund details
- **SMS notification** about cancellation status
- **Refund processing email** if eligible

---

## Order Status Workflow

### Status Progression
1. **created** - Order placed and validated
2. **pickup-pending** - Awaiting pickup scheduling  
3. **picked-up** - Package collected from sender
4. **in-transit** - Package in courier network
5. **arrived-at-hub** - Reached international hub
6. **customs-clearance** - Clearing customs procedures
7. **out-for-delivery** - Package out for final delivery
8. **delivered** - Successfully delivered
9. **failed** - Delivery attempt failed
10. **cancelled** - Order cancelled

### Priority Levels
- **normal** - Standard delivery (5-7 business days)
- **express** - Fast delivery (2-3 business days)
- **super-express** - Urgent delivery (1-2 business days)
- **tax-paid** - Pre-paid customs and duties

---

## Security & Compliance

### Data Protection
- Order details encrypted in database
- PII data access logging and monitoring
- Secure file upload for documentation
- GDPR compliance for EU destinations

### Access Control
- Users can only access their own orders
- Admin role required for order management
- Rate limiting on order creation (5 orders per hour per user)
- IP-based fraud detection

### Audit Trail  
- Complete order lifecycle logging
- Change history with user attribution
- Status update timestamps and reasons
- Payment transaction tracking

---

**Last Updated:** January 15, 2024