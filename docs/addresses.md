# Address Management API

This document covers address management endpoints for storing, validating, and managing user addresses in the Zypco system.

## Base URL
`/api/v1/auth/address`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/address` | Create new address | Yes |
| GET | `/auth/address` | Get user addresses | Yes |
| GET | `/auth/address/{id}` | Get specific address | Yes |
| PUT | `/auth/address/{id}` | Update address | Yes |
| DELETE | `/auth/address/{id}` | Delete address | Yes |
| GET | `/auth/accounts/{phone}/address` | Get user addresses by phone | Yes |

---

## Create Address

### **POST** `/api/v1/auth/address`

Create a new address for the authenticated user.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "John Doe",
  "label": "Home",
  "addressLine": "House 123, Road 5, Dhanmondi-15",
  "area": "Dhanmondi",
  "subCity": "Dhanmondi-15",
  "city": "Dhaka",
  "state": "Dhaka Division",
  "zipCode": "1205",
  "country": "6744b8c1234567890abcdef1",
  "phone": "+8801234567890",
  "isDefault": true,
  "location": {
    "type": "Point",
    "coordinates": [90.3742, 23.7515]
  }
}
```

#### Validation Rules
- **name**: Required, 2-100 characters, letters and spaces
- **label**: Optional, 2-50 characters (Home, Office, etc.)
- **addressLine**: Required, 5-200 characters
- **city**: Required, 2-100 characters
- **country**: Required, valid ObjectId reference
- **phone**: Optional, valid international format
- **coordinates**: [longitude, latitude] array, longitude: -180 to 180, latitude: -90 to 90
- **zipCode**: Optional, alphanumeric, 3-20 characters

#### Success Response (201)
```json
{
  "status": "201",
  "message": "Address created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "address": {
      "id": "6744b8c1234567890abcdef5",
      "name": "John Doe",
      "label": "Home",
      "addressLine": "House 123, Road 5, Dhanmondi-15",
      "area": "Dhanmondi",
      "subCity": "Dhanmondi-15", 
      "city": "Dhaka",
      "state": "Dhaka Division",
      "zipCode": "1205",
      "country": {
        "id": "6744b8c1234567890abcdef1",
        "name": "Bangladesh",
        "code": "BD"
      },
      "phone": "+8801234567890",
      "isDefault": true,
      "location": {
        "type": "Point",
        "coordinates": [90.3742, 23.7515]
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Error Responses

**400 - Validation Error**
```json
{
  "status": "400",
  "message": "Invalid coordinates",
  "error": {
    "field": "location.coordinates",
    "message": "Longitude must be between -180 and 180"
  }
}
```

**422 - Country Not Supported**
```json
{
  "status": "422",
  "message": "Country not supported for delivery",
  "error": "We currently don't provide services to this country"
}
```

#### Security Features
- User authentication required
- User can only create addresses for their own account
- Input validation and geocoding verification
- Automatic duplicate detection

#### Notifications Triggered
- **Address added confirmation email** with verification link
- **Location verification SMS** if phone provided
- **Default address change notification** if isDefault is true

---

## Get User Addresses

### **GET** `/api/v1/auth/address`

Retrieve all addresses for the authenticated user.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Query Parameters
- `includeInactive` (boolean, optional) - Include soft-deleted addresses - default: `false`
- `countryId` (string, optional) - Filter by country ObjectId
- `label` (string, optional) - Filter by address label
- `isDefault` (boolean, optional) - Filter by default status
- `sort` (string, optional) - Sort by field (`createdAt`, `name`, `isDefault`) - default: `createdAt desc`

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Addresses retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "addresses": [
      {
        "id": "6744b8c1234567890abcdef5",
        "name": "John Doe",
        "label": "Home",
        "addressLine": "House 123, Road 5, Dhanmondi-15",
        "area": "Dhanmondi",
        "city": "Dhaka",
        "state": "Dhaka Division",
        "zipCode": "1205",
        "country": {
          "id": "6744b8c1234567890abcdef1",
          "name": "Bangladesh",
          "code": "BD",
          "flagUrl": "/flags/bd.png"
        },
        "phone": "+8801234567890",
        "isDefault": true,
        "location": {
          "type": "Point",
          "coordinates": [90.3742, 23.7515]
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "6744b8c1234567890abcdef6",
        "name": "John Doe",
        "label": "Office",
        "addressLine": "Building 45, Gulshan Avenue",
        "area": "Gulshan-1",
        "city": "Dhaka",
        "zipCode": "1212",
        "country": {
          "id": "6744b8c1234567890abcdef1",
          "name": "Bangladesh",
          "code": "BD"
        },
        "phone": "+8801987654321",
        "isDefault": false,
        "location": {
          "type": "Point", 
          "coordinates": [90.4074, 23.7806]
        },
        "createdAt": "2024-01-10T08:15:00.000Z"
      }
    ],
    "total": 2,
    "defaultAddress": "6744b8c1234567890abcdef5"
  }
}
```

---

## Get Specific Address

### **GET** `/api/v1/auth/address/{id}`

Retrieve details of a specific address.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- `id` (string, required) - Address ObjectId

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Address retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "address": {
      "id": "6744b8c1234567890abcdef5",
      "name": "John Doe",
      "label": "Home",
      "addressLine": "House 123, Road 5, Dhanmondi-15",
      "area": "Dhanmondi",
      "subCity": "Dhanmondi-15",
      "city": "Dhaka",
      "state": "Dhaka Division",
      "zipCode": "1205",
      "country": {
        "id": "6744b8c1234567890abcdef1",
        "name": "Bangladesh",
        "code": "BD",
        "phoneCode": "+880"
      },
      "phone": "+8801234567890",
      "isDefault": true,
      "location": {
        "type": "Point",
        "coordinates": [90.3742, 23.7515],
        "address": "Dhanmondi, Dhaka, Bangladesh"
      },
      "verification": {
        "status": "verified",
        "verifiedAt": "2024-01-15T11:00:00.000Z",
        "method": "geocoding"
      },
      "usage": {
        "ordersCount": 5,
        "lastUsed": "2024-01-12T14:30:00.000Z"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Error Responses

**404 - Address Not Found**
```json
{
  "status": "404",
  "message": "Address not found",
  "error": "Address with ID 6744b8c1234567890abcdef5 does not exist"
}
```

**403 - Access Denied**
```json
{
  "status": "403",
  "message": "Access denied",
  "error": "You can only access your own addresses"
}
```

---

## Update Address

### **PUT** `/api/v1/auth/address/{id}`

Update an existing address.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Path Parameters
- `id` (string, required) - Address ObjectId

#### Request Body
```json
{
  "name": "John Smith Doe",
  "label": "Home - Updated", 
  "addressLine": "House 124, Road 5, Dhanmondi-15",
  "phone": "+8801234567899",
  "isDefault": false,
  "location": {
    "type": "Point",
    "coordinates": [90.3745, 23.7518]
  }
}
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Address updated successfully",
  "timestamp": "2024-01-15T11:45:00.000Z",
  "data": {
    "address": {
      "id": "6744b8c1234567890abcdef5",
      "name": "John Smith Doe",
      "label": "Home - Updated",
      "addressLine": "House 124, Road 5, Dhanmondi-15",
      "phone": "+8801234567899",
      "isDefault": false,
      "updatedFields": ["name", "label", "addressLine", "phone", "location"],
      "updatedAt": "2024-01-15T11:45:00.000Z"
    }
  }
}
```

#### Default Address Logic
- When setting `isDefault: true`, all other user addresses automatically become non-default
- Each user can have only one default address
- If user has no addresses and creates first one, it automatically becomes default

#### Security Features
- User can only update their own addresses
- Geocoding verification for coordinate changes
- Address usage validation (cannot delete address used in active orders)

#### Notifications Triggered
- **Address update confirmation email**
- **Default address change notification** if isDefault changed
- **Location verification SMS** if coordinates significantly changed

---

## Delete Address

### **DELETE** `/api/v1/auth/address/{id}`

Soft delete an address (marks as deleted, doesn't remove from database).

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- `id` (string, required) - Address ObjectId

#### Query Parameters
- `force` (boolean, optional) - Force delete even if used in orders - default: `false` (admin only)

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Address deleted successfully",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "data": {
    "address": {
      "id": "6744b8c1234567890abcdef5",
      "deletedAt": "2024-01-15T12:00:00.000Z",
      "isDeleted": true
    }
  }
}
```

#### Error Responses

**409 - Address In Use**
```json
{
  "status": "409",
  "message": "Cannot delete address in use",
  "error": "This address is used in 3 active orders. Complete or cancel orders first.",
  "data": {
    "activeOrders": ["ZYP240115001", "ZYP240112003", "ZYP240110005"]
  }
}
```

**400 - Cannot Delete Default**
```json
{
  "status": "400",
  "message": "Cannot delete default address",
  "error": "Please set another address as default before deleting this one"
}
```

#### Deletion Rules
- Cannot delete address used in active/pending orders
- Cannot delete the only address for user
- Cannot delete default address (must set another as default first)
- Soft delete preserves data for order history

#### Notifications Triggered
- **Address deletion confirmation email**
- **Default address reminder** if deleted address was default

---

## Address Validation & Geocoding

### Validation Features
- **Real-time geocoding** using Google Maps API
- **Address standardization** and formatting
- **Postal code verification** for supported countries
- **Delivery area verification** for service availability

### Geocoding Response
```json
{
  "coordinates": [90.3742, 23.7515],
  "formattedAddress": "House 123, Road 5, Dhanmondi-15, Dhaka 1205, Bangladesh",
  "components": {
    "streetNumber": "123",
    "route": "Road 5",
    "neighborhood": "Dhanmondi-15",
    "city": "Dhaka",
    "state": "Dhaka Division",
    "country": "Bangladesh",
    "postalCode": "1205"
  },
  "accuracy": "ROOFTOP",
  "deliverable": true
}
```

---

## Bulk Operations

### Import Addresses
**POST** `/api/v1/auth/address/bulk-import`

Import multiple addresses from CSV/JSON format.

#### Request Body (JSON)
```json
{
  "addresses": [
    {
      "name": "Address 1",
      "addressLine": "Location 1",
      "city": "City 1",
      "country": "6744b8c1234567890abcdef1"
    },
    {
      "name": "Address 2", 
      "addressLine": "Location 2",
      "city": "City 2",
      "country": "6744b8c1234567890abcdef1"
    }
  ]
}
```

### Export Addresses
**GET** `/api/v1/auth/address/export`

Export user addresses in various formats.

#### Query Parameters
- `format` (string) - Export format (`json`, `csv`, `xlsx`) - default: `json`
- `includeCoordinates` (boolean) - Include location data - default: `true`

---

## Security & Compliance

### Data Protection
- Address data encrypted at rest
- Coordinate precision limited for privacy
- Access logging for audit trail
- GDPR compliance for data deletion

### Rate Limiting
- **Address creation**: 10 per hour per user
- **Updates**: 50 per hour per user  
- **Geocoding**: 100 requests per day per user
- **Bulk import**: 1 per day per user (max 100 addresses)

### Privacy Features
- Optional coordinate obfuscation
- Selective field sharing for orders
- Address anonymization for completed orders
- User consent management for location tracking

---

**Last Updated:** January 15, 2024