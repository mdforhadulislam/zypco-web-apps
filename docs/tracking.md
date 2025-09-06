# Tracking API

This document covers the shipment tracking system endpoints for monitoring package status and location updates.

## Base URL
`/api/v1/track`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/track/{trackId}` | Track shipment by ID | No |
| POST | `/track/{trackId}/update` | Update tracking status | Yes (Admin) |
| GET | `/track/{trackId}/history` | Get complete tracking history | No |

---

## Track Shipment

### **GET** `/api/v1/track/{trackId}`

Track a shipment using its tracking ID - public endpoint accessible without authentication.

#### Request Headers
```http
Content-Type: application/json
```

#### Path Parameters
- `trackId` (string, required) - Unique shipment tracking ID (e.g., "ZYP240115001")

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Tracking information retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "tracking": {
      "trackId": "ZYP240115001",
      "orderId": "6744b8c1234567890abcdef3",
      "currentStatus": "in_transit",
      "lastUpdate": "2024-01-16T14:30:00.000Z",
      "estimatedDelivery": "2024-01-22T10:30:00.000Z",
      "route": {
        "from": {
          "country": "Bangladesh",
          "city": "Dhaka"
        },
        "to": {
          "country": "United Kingdom", 
          "city": "London"
        }
      },
      "serviceInfo": {
        "carrier": "DHL Express",
        "serviceType": "Express Worldwide",
        "priority": "express"
      },
      "currentLocation": {
        "facility": "DHL London Gateway Hub",
        "city": "London",
        "country": "United Kingdom",
        "timestamp": "2024-01-16T14:30:00.000Z"
      },
      "events": [
        {
          "timestamp": "2024-01-15T10:30:00.000Z",
          "status": "created",
          "location": {
            "facility": "Zypco Processing Center",
            "city": "Dhaka",
            "country": "Bangladesh"
          },
          "description": "Order created and validated",
          "updatedBy": "System"
        },
        {
          "timestamp": "2024-01-15T14:15:00.000Z",
          "status": "picked-up",
          "location": {
            "address": "123 Sender Street, Dhanmondi",
            "city": "Dhaka",
            "country": "Bangladesh"
          },
          "description": "Package picked up from sender",
          "updatedBy": "Pickup Agent: Rahman"
        },
        {
          "timestamp": "2024-01-15T18:45:00.000Z",
          "status": "arrived-at-hub",
          "location": {
            "facility": "DHL Dhaka Hub",
            "city": "Dhaka", 
            "country": "Bangladesh"
          },
          "description": "Package arrived at origin hub for processing",
          "updatedBy": "DHL Bangladesh"
        },
        {
          "timestamp": "2024-01-16T02:20:00.000Z",
          "status": "in_transit",
          "location": {
            "facility": "Aircraft DHL001",
            "route": "DHK-LHR",
            "country": "International Airspace"
          },
          "description": "Package in transit to destination country",
          "updatedBy": "DHL International"
        },
        {
          "timestamp": "2024-01-16T14:30:00.000Z", 
          "status": "arrived-at-hub",
          "location": {
            "facility": "DHL London Gateway Hub",
            "city": "London",
            "country": "United Kingdom"
          },
          "description": "Package arrived at destination hub",
          "updatedBy": "DHL UK"
        }
      ],
      "deliveryProgress": {
        "percentage": 75,
        "nextMilestone": "customs-clearance",
        "expectedNextUpdate": "2024-01-17T09:00:00.000Z"
      }
    }
  }
}
```

#### Error Responses

**404 - Tracking ID Not Found**
```json
{
  "status": "404",
  "message": "Tracking ID not found",
  "error": "No shipment found with tracking ID: ZYP240115001"
}
```

**400 - Invalid Tracking ID Format**
```json
{
  "status": "400",
  "message": "Invalid tracking ID format",
  "error": "Tracking ID must be in format: ZYP + YYMMDD + sequence number"
}
```

#### Security Features
- Public endpoint - no authentication required
- Rate limiting: 60 requests per minute per IP
- Input validation and sanitization
- No sensitive customer data exposed in public tracking

#### Notifications Triggered
- None (read-only operation)

---

## Update Tracking Status

### **POST** `/api/v1/track/{trackId}/update`

Update the tracking status of a shipment (admin/staff only).

#### Request Headers
```http
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

#### Path Parameters
- `trackId` (string, required) - Unique shipment tracking ID

#### Request Body
```json
{
  "status": "customs-clearance",
  "location": {
    "facility": "UK Border Control - Heathrow",
    "city": "London",
    "country": "United Kingdom"
  },
  "description": "Package undergoing customs clearance process",
  "estimatedDelivery": "2024-01-22T10:30:00.000Z",
  "notes": "Standard customs procedure - no issues detected"
}
```

#### Validation Rules
- **status**: Must be valid tracking status from enum
- **location**: Facility name and city required
- **description**: 10-500 characters describing the update
- **estimatedDelivery**: Must be future date in ISO format
- **notes**: Optional internal notes (max 1000 characters)

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Tracking status updated successfully",
  "timestamp": "2024-01-17T09:15:00.000Z",
  "data": {
    "tracking": {
      "trackId": "ZYP240115001",
      "previousStatus": "arrived-at-hub",
      "currentStatus": "customs-clearance",
      "updatedAt": "2024-01-17T09:15:00.000Z",
      "updatedBy": "Admin User",
      "estimatedDelivery": "2024-01-22T10:30:00.000Z"
    }
  }
}
```

#### Security Features
- Admin/staff authentication required
- Role-based access control (tracking-update permission)
- Update history logged with user attribution
- Automatic notification triggers

#### Notifications Triggered
- **Status update email** to sender and receiver
- **SMS notification** for major status changes
- **Push notification** to mobile app users
- **Webhook** to integrated systems

---

## Tracking History

### **GET** `/api/v1/track/{trackId}/history`

Get complete detailed tracking history for a shipment.

#### Request Headers
```http
Content-Type: application/json
```

#### Query Parameters
- `format` (string, optional) - Response format (`detailed`, `summary`) - default: `detailed`
- `includeInternal` (boolean, optional) - Include internal notes (admin only) - default: `false`

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Tracking history retrieved successfully",
  "timestamp": "2024-01-17T10:30:00.000Z",
  "data": {
    "tracking": {
      "trackId": "ZYP240115001",
      "orderId": "6744b8c1234567890abcdef3",
      "totalEvents": 6,
      "timeInTransit": "2 days, 4 hours, 45 minutes",
      "route": {
        "from": "Dhaka, Bangladesh",
        "to": "London, United Kingdom", 
        "distance": "8,046 km",
        "transitHubs": ["Dhaka Hub", "London Gateway Hub"]
      },
      "history": [
        {
          "id": "event_001",
          "timestamp": "2024-01-15T10:30:00.000Z",
          "status": "created",
          "location": {
            "facility": "Zypco Processing Center",
            "address": "House 10, Road 5, Dhanmondi",
            "city": "Dhaka",
            "country": "Bangladesh",
            "coordinates": [90.3742, 23.7515]
          },
          "description": "Order created and payment verified",
          "details": "Package details verified, shipping label generated",
          "updatedBy": {
            "type": "system",
            "name": "Automated System"
          },
          "duration": null,
          "nextEvent": "pickup-scheduled"
        },
        {
          "id": "event_002", 
          "timestamp": "2024-01-15T14:15:00.000Z",
          "status": "picked-up",
          "location": {
            "address": "123 Sender Street, Dhanmondi-15",
            "city": "Dhaka",
            "country": "Bangladesh",
            "coordinates": [90.3742, 23.7515]
          },
          "description": "Package picked up from sender location",
          "details": "Package condition: Good, Weight verified: 2.5kg",
          "updatedBy": {
            "type": "staff",
            "name": "Rahman Ahmed",
            "id": "pickup_agent_001"
          },
          "duration": "3 hours 45 minutes from order creation",
          "nextEvent": "in-transit-to-hub"
        }
      ],
      "milestones": {
        "orderCreated": "2024-01-15T10:30:00.000Z",
        "pickedUp": "2024-01-15T14:15:00.000Z",
        "internationalTransit": "2024-01-16T02:20:00.000Z",
        "destinationHub": "2024-01-16T14:30:00.000Z",
        "customsClearance": "2024-01-17T09:15:00.000Z",
        "estimatedDelivery": "2024-01-22T10:30:00.000Z"
      },
      "performance": {
        "averageTransitTime": "4-5 days for this route",
        "onTimePerformance": "92%",
        "currentDelay": null
      }
    }
  }
}
```

---

## Tracking Status Definitions

### Standard Status Flow
1. **created** - Order placed and validated
2. **pickup-pending** - Awaiting pickup from sender
3. **picked-up** - Package collected from sender location
4. **in-transit** - Package in courier network transport
5. **arrived-at-hub** - Reached processing/sorting facility
6. **customs-clearance** - Undergoing customs procedures (international)
7. **out-for-delivery** - Package out for final delivery
8. **delivered** - Successfully delivered to recipient
9. **failed** - Delivery attempt failed
10. **cancelled** - Order cancelled before delivery

### Special Status Indicators
- **delayed** - Shipment experiencing delays
- **exception** - Requires special handling or attention
- **returned** - Package being returned to sender
- **damaged** - Package reported as damaged
- **lost** - Package cannot be located

---

## Integration Features

### Webhook Support
```json
{
  "event": "status_updated",
  "trackId": "ZYP240115001",
  "timestamp": "2024-01-17T09:15:00.000Z",
  "data": {
    "previousStatus": "arrived-at-hub",
    "newStatus": "customs-clearance",
    "location": "UK Border Control - Heathrow",
    "estimatedDelivery": "2024-01-22T10:30:00.000Z"
  }
}
```

### Tracking API Endpoints for Partners
- Real-time status updates via WebSocket
- Batch tracking queries for multiple shipments
- Historical data export capabilities
- Custom notification preferences

---

## Security & Privacy

### Data Protection
- Tracking queries logged for analytics
- Customer data anonymized in logs
- GDPR compliance for EU tracking requests
- Secure API endpoints with rate limiting

### Access Levels
- **Public**: Basic tracking status and location
- **Customer**: Full tracking details for their orders
- **Admin**: Complete history including internal notes
- **API Partners**: Bulk tracking with rate limits

---

**Last Updated:** January 15, 2024